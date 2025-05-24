/**
 * createServerActionをテストする時の共通処理
 *
 * テスト時に各テストで必要になるモックをcontextに設定して使う
 */
export function doMockCreateServerAction<Dependencies extends Record<string, any>>(dependencies: Dependencies) {
  const context = { ...dependencies };

  const createServerAction = vi.fn().mockImplementation((fn: any) => {
    return async (data: any) => ({ result: await fn(context, data) });
  });

  vi.doMock("@/application/server-action", async () => {
    const actual = await vi.importActual("@/application/server-action");

    return {
      ...(actual as any),
      createServerAction: createServerAction,
    };
  });

  vi.doMock("@/application/context", async () => {
    const actual = await vi.importActual("@/application/context");

    return {
      ...(actual as any),
      getServerContext: async () => {
        return {
          ...context,
          $transaction: async (fn: any) => {
            return fn(context);
          },
        };
      },
    };
  });

  return context;
}
