import { readFileAndResize } from "@/ui/common";

describe("readFileAndResize", () => {
  // jsdomが標準でcanvasに対応していないためモックが必要
  const context = {
    drawImage: vi.fn(),
  };
  const canvas = {
    getContext: vi.fn().mockReturnValue(context),
    toDataURL: vi.fn(),
  };
  // テスト時にonloadイベントが自動で発火しないためモックが必要
  const img = document.createElement("img");
  const documentCreateElementSpy = vi.spyOn(document, "createElement");

  // 関数内でcreateElementがimg, canvasのそれぞれで呼ばれるため、両方に対応したモック実装が必要
  // 以下の各テストでimgのイベント処理の場合分けが必要になるため、その部分だけ変更できるようにパラメータ化している
  function mockDocumentCreateElement(onImgCreate: () => void) {
    documentCreateElementSpy.mockImplementation((name) => {
      switch (name) {
        case "img": {
          onImgCreate();
          return img;
        }
        case "canvas": {
          return canvas as any;
        }
        default: {
          throw new Error("Unexpected argument");
        }
      }
    });
  }

  test("within maxSize", async () => {
    mockDocumentCreateElement(() => {
      setTimeout(() => {
        img.width = 100;
        img.height = 100;
        img.dispatchEvent(new Event("load"));
      });
    });

    await readFileAndResize(new File([], "name"), 100);
    // 出力画像はリサイズされていない
    expect(context.drawImage.mock.calls[0][3]).toBe(100);
    expect(context.drawImage.mock.calls[0][4]).toBe(100);
  });

  test("over maxSize and width > height", async () => {
    mockDocumentCreateElement(() => {
      img.width = 150;
      img.height = 100;
      setTimeout(() => {
        img.dispatchEvent(new Event("load"));
      });
    });

    await readFileAndResize(new File([], "name"), 120);
    // 出力画像はwidthを最大にしてリサイズされている
    expect(context.drawImage.mock.calls[0][3]).toBe(120);
    expect(context.drawImage.mock.calls[0][4]).toBe(80);
  });

  test("over maxSize and height > width", async () => {
    mockDocumentCreateElement(() => {
      img.width = 100;
      img.height = 150;
      setTimeout(() => {
        img.dispatchEvent(new Event("load"));
      });
    });

    await readFileAndResize(new File([], "name"), 120);
    // 出力画像はheightを最大にしてリサイズされている
    expect(context.drawImage.mock.calls[0][3]).toBe(80);
    expect(context.drawImage.mock.calls[0][4]).toBe(120);
  });

  test("with canvas error", async () => {
    mockDocumentCreateElement(() => {
      setTimeout(() => {
        img.dispatchEvent(new Event("load"));
      });
    });

    // エラーが発生した場合はそのエラーを使ってPromise.rejectする
    const error = new Error("Maybe browser does not support canvas");
    canvas.getContext.mockImplementation(() => {
      throw error;
    });
    await expect(readFileAndResize(new File([], "name"), 120)).rejects.toThrow(error);
  });
});
