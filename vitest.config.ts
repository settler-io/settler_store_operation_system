/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  // https://github.com/vitest-dev/vitest/issues/4048#issuecomment-1855141674
  plugins: [react(), tsconfigPaths()] as any,
  test: {
    globals: true,
    clearMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    testTimeout: 30000,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts?(x)", "prisma/**/*.test.ts"],
    reporters: ["verbose"],
    coverage: {
      provider: "v8",
      include: ["src/**/*"],
      exclude: [
        "**/index.ts",
        "**/types.ts",
        // 型定義しかないため
        "src/lib/domain/repository/**/*",
        // 現状RSCをユニットテストできないため除外
        "src/app/**/layout.tsx",
        "src/app/**/page.tsx",
        "src/app/**/loading.tsx",
        "src/app/**/error.tsx",
        "src/middleware.ts",
      ],
      reporter: ["text", "json", "html"],
    },
    // アプリケーションで必ず設定が必要な環境変数の設定
    // 安全のためこの値が設定されていないとアプリケーションが起動できないようにしている
    env: {
      MASTER_PASSWORD: "password",
    },
  },
});
