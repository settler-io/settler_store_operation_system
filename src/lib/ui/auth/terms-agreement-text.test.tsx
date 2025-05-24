import { render } from "@testing-library/react";
import { TermsAgreementText } from "./terms-agreement-text";

test("TermsAgreementText", () => {
  // レンダリングでエラーがないことだけをテスト
  render(<TermsAgreementText />);
});
