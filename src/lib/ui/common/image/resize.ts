/**
 * 選択した画像を指定の最大サイズに合わせてリサイズする処理
 *
 * File -> string (DataURL) への変換
 */
export async function readFileAndResize(file: File, maxSize: number): Promise<string> {
  return await resizeImage(await readFileAsDataURL(file), maxSize);
}

/**
 * Fileの読み込み処理
 *
 * File -> string (DataURL) への変換
 */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("error", reject, { once: true });
    reader.addEventListener(
      "load",
      (ev) => {
        resolve(String(ev.target!.result));
      },
      { once: true },
    );
    reader.readAsDataURL(file);
  });
}

/**
 * 画像のリサイズ処理
 *
 * string (DataURL) -> string (DataURL) への変換
 */
export function resizeImage(dataurl: string, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.addEventListener("error", reject, { once: true });
    img.addEventListener(
      "load",
      () => {
        try {
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxSize) {
              height = height * (maxSize / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = width * (maxSize / height);
              height = maxSize;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/webp"));
        } catch (e) {
          reject(e);
        }
      },
      { once: true },
    );
    img.crossOrigin = "anonymous"; // http形式のURLを読み込む場合はこの設定が必須。DataURLだけで使うのであれば不要。
    img.src = dataurl;
  });
}
