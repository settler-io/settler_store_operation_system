import { render } from "@testing-library/react";
import { EmailSigninButton } from "./email-signin-button";

test("EmailSigninButton", () => {
  // レンダリングでエラーがないことだけをテスト
  render(<EmailSigninButton label="hello" />);
});
