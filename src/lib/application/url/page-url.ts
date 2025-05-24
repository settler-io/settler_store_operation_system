/**
 * アプリのURLに関する仕様
 */
export const PageUrl = {
  home: "/",
  auth: {
    signinTop: "/auth/signin",
    signupTop: "/auth/signup",
    signinEmail: "/auth/signin/email",
    signupEmail: "/auth/signup/email",
    signupEmailVerify: (token: string) => `/auth/signup/email/verify?token=${token}`,
    passwordReset: "/auth/password/reset/request",
    passwordResetVerify: (token: string) => `/auth/password/reset/verify?token=${token}`,
    passwordResetComplete: "/auth/password/reset/complete",
    passwordResetError: "/auth/password/reset/error",
    emailUpdateVerify: (token: string) => `/auth/email/update/verify?token=${token}`,
    emailUpdateComplete: "/auth/email/update/complete",
    emailUpdateError: "/auth/email/update/error",
    emailRegister: "/auth/email/register",
  },
  top: "/",
  attraction: {
    top: "/attraction",
    search: (startAt: string, endAt: string) => `/attraction?start=${startAt}&end=${endAt}`,
  },
  settings: "/settings",
  mypage: {
    top: "/mypage",
    attraction: {
      top: "/mypage/attraction",
      post: "/mypage/attraction/post",
      edit: (id: string) => `/mypage/attraction/${id}/edit`,
      delete: (id: string) => `/mypage/attraction/${id}/delete`,
    },
    chat: {
      top: "/mypage/chat",
      detail: (targetId: string) => `/mypage/chat?targetId=${targetId}`,
      reserve: (targetId: string) => `/mypage/reservation/add?targetId=${targetId}`,
    },
    evaluation: {
      top: "/mypage/evaluation",
      post: (hostUserId: string, guestUserId: string, reservationId: string) =>
        `/mypage/evaluation/post?hostUserId=${hostUserId}&guestUserId=${guestUserId}&reservationId=${reservationId}`,
    },
    footprint: "/mypage/footprint",
    reservation: "/mypage/reservation",
  },
  host: {
    detail: (id: string) => `/host/${id}`,
  },
  account: {
    email: "/account/email",
    password: "/account/password",
  },
  corporate: {
    top: "https://settler.cc/",
  },
  support: {
    zendesk: "https://support.settler.cc/hc/ja",
  },
  // 規約などのURLは後に更新される
  docs: {
    termsOfService: "https://docs.settler.cc/gemucha/terms_of_service.pdf",
    privacyPolicy: "https://docs.settler.cc/gemucha/privacy_policy",
    tokushoho: "https://docs.settler.cc/gemucha/specified_commercial_transactions_act",
  },
} as const;
