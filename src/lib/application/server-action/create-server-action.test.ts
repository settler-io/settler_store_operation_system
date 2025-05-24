import { getServerContext } from "@/application/context";
import { PageUrl } from "@/application/url";
import { createId } from "@/domain/entity";
import type { Mock } from "vitest";
import { createServerAction } from "./create-server-action";

// 入力をテストしたいためredirectをmockしている
vi.mock("next/navigation", async () => {
  const actual = (await vi.importActual("next/navigation")) as any;
  return {
    redirect: vi.fn().mockImplementation((args) => {
      actual.redirect(args);
    }),
  };
});

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/infra/repository", async () => {
  const actual = (await vi.importActual("@/infra/repository")) as any;
  const UserRepository = vi.fn();
  UserRepository.prototype.find = vi.fn();
  return { ...actual, UserRepository };
});

// transaction処理など重要な実装があるため、DB接続はモックせずに実動作に近い形でテストする
describe("createServerAction", () => {
  // redirect関数がthrowするエラーメッセージ
  const redirectError = "NEXT_REDIRECT";
  const getMock = async () => {
    const { redirect } = await import("next/navigation");
    const { getServerSession } = await import("next-auth");
    const { userRepository } = await getServerContext();
    return {
      redirect: redirect as any as Mock,
      getServerSession: getServerSession as any as Mock,
      userRepository: userRepository as any as { find: Mock },
    };
  };

  test("auth=trueをした場合にsessionUserIdがnullの場合はredirectが呼ばれる", async () => {
    const { getServerSession, redirect } = await getMock();

    getServerSession.mockResolvedValue({
      userId: null,
    });

    const fn = createServerAction(async () => {}, {
      name: "test",
      auth: true,
      throw: false,
    });

    await expect(fn()).rejects.toThrow(redirectError);
    expect(redirect).toHaveBeenCalledWith(PageUrl.auth.signinTop);
  });

  test("auth=trueをした場合にsessionUserIdがある場合はuserを取得する", async () => {
    const { getServerSession, userRepository } = await getMock();

    const userId = "userid1234567890";
    userRepository.find.mockResolvedValue({});
    getServerSession.mockResolvedValue({ userId });

    const fn = createServerAction(async () => {}, {
      name: "test",
      auth: true,
      throw: false,
    });

    await fn();
    expect(userRepository.find).toHaveBeenCalledWith(userId);
  });

  test("auth=trueをした場合にsessionUserIdがある場合はuserを取得する（結果がnullの場合）", async () => {
    const { getServerSession, userRepository, redirect } = await getMock();

    const userId = "userid1234567890";
    userRepository.find.mockResolvedValue(null);
    getServerSession.mockResolvedValue({ userId });

    const fn = createServerAction(async () => {}, {
      name: "test",
      auth: true,
      throw: false,
    });

    await expect(fn()).rejects.toThrow(redirectError);
    expect(userRepository.find).toHaveBeenCalledWith(userId);
    expect(redirect).toHaveBeenCalledWith(PageUrl.auth.signinTop);
  });

  test("redirectOnSuccessを指定した場合は処理完了後にredirectが呼ばれる", async () => {
    const { redirect } = await getMock();

    const fn = createServerAction(async () => {}, {
      name: "test",
      auth: false,
      throw: false,
      redirectOnSuccess: "url to complete page",
    });

    await expect(fn()).rejects.toThrow(redirectError);
    expect(redirect).toHaveBeenCalledWith("url to complete page");
  });

  test("redirectOnSuccessを指定しない場合は処理完了後にredirectが呼ばれない", async () => {
    const { redirect } = await getMock();

    const fn = createServerAction(async () => {}, {
      name: "test",
      auth: false,
      throw: false,
    });

    await fn();
    expect(redirect).not.toHaveBeenCalled();
  });

  test("redirectOnErrorを指定した場合は処理エラー時にredirectが呼ばれる", async () => {
    const { redirect } = await getMock();

    const fn = createServerAction(
      async () => {
        throw new Error();
      },
      {
        name: "test",
        auth: false,
        throw: false,
        redirectOnError: "url to error page",
      },
    );

    await expect(fn()).rejects.toThrow(redirectError);
    expect(redirect).toHaveBeenCalledWith("url to error page");
  });

  test("redirectOnErrorを指定しない場合は処理エラー時にredirectが呼ばれない", async () => {
    const { redirect } = await getMock();

    const fn = createServerAction(
      async () => {
        throw new Error("CustomError");
      },
      {
        name: "test",
        auth: false,
        throw: false,
      },
    );

    const { error } = await fn();
    expect(error?.code).toBe("UnknownError");
    expect(redirect).not.toHaveBeenCalled();
  });

  test("useTransactionを指定した場合はデータベースのtransactionが適用される", async () => {
    let userId: string | null = null;
    const fn = createServerAction(
      async ({ database }) => {
        // トランザクションのテストとして、ユーザを作成してから別の処理で失敗させる
        // トランザクションが適用されているため、処理が失敗するとユーザ作成も無かったことになる
        const user = await database.user.create({
          data: {
            id: createId(),
            email: `${createId()}@example.com`,
            status: "email_registered",
          },
        });
        // この時点ではユーザが作成されているのでidはtruthy
        userId = user.id;
        // この処理で失敗するため、ユーザ作成は無かったことになる
        await database.user.update({
          where: {
            id: "not found user id to cause error",
          },
          data: {
            email: "updated-email@example.com",
          },
        });
      },
      {
        name: "test",
        auth: false,
        throw: false,
        useTransaction: true,
      },
    );

    const { error } = await fn();
    expect(error).toBeTruthy();
    expect(userId).toBeTruthy();
    const { database } = await getServerContext();
    expect(await database.user.findUnique({ where: { id: userId! } })).toBeNull();
  });

  test("useTransactionを指定した場合でredirectが呼ばれた場合でもロールバックしない", async () => {
    const { redirect } = await getMock();

    let userId: string | null = null;
    const fn = createServerAction(
      async ({ database }) => {
        // トランザクションのテストとして、ユーザを作成してから別の処理で失敗させる
        // トランザクションが適用されているため、処理が失敗するとユーザ作成も無かったことになる
        const user = await database.user.create({
          data: {
            id: createId(),
            email: `${createId()}@example.com`,
            status: "email_registered",
          },
        });
        // この時点ではユーザが作成されているのでidはtruthy
        userId = user.id;
        // redirectを実行することでErrorがthrowされる
        redirect("url to complete");
      },
      {
        name: "test",
        auth: false,
        throw: false,
        useTransaction: true,
      },
    );

    await expect(fn()).rejects.toThrow(redirectError);
    expect(redirect).toHaveBeenCalledWith("url to complete");
    expect(userId).toBeTruthy();
    const { database } = await getServerContext();
    expect(await database.user.findUnique({ where: { id: userId! } })).toBeTruthy();
  });
});
