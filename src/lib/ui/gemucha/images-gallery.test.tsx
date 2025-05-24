import { render } from "@testing-library/react";
import ImageGallery from "./images-gallery";

test("ImageGallery", () => {
  // レンダリングでエラーがないことをテスト
  render(
    <ImageGallery
      items={[
        {
          original: "https://image.img",
        },
      ]}
    />,
  );
});
