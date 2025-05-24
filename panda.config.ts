import { defineConfig, defineLayerStyles, defineTextStyles } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // emitPackageをtrueにすることでnode_modulesにビルド結果が出力される
  // outdirの設定がstyled-systemなので、最終的にnode_modules/styled-systemに出力される
  // アプリ側では"styled-system/css"のようなpathでimportして使う
  emitPackage: true,
  outdir: "styled-system",

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          textDefault: {
            value: "#333333",
          },
          textDisabled: {
            value: "#9d9d9d",
          },
          textLight: {
            value: "#666666",
          },
          borderBase: {
            value: "#cccccc",
          },
          borderLight: {
            value: "#e5e5e5",
          },
          borderDark: {
            value: "rgba(0,0,0,0.64)",
          },
          error: {
            value: "#ff333f",
          },
          alert: {
            value: "#f57a3f",
          },
          info: {
            value: "#0073cc",
          },
          primary: {
            value: "#6096e9",
          },
          disabled: {
            value: "#cccccc",
          },
          gemcha: {
            value: "#50B0F9",
          },
        },
        fonts: {
          body: {
            value: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
          },
        },
        zIndex: {
          headerAndFooter: {
            description: "グローバルのheaderとfooterを必ず一番上に表示する位置",
            value: 2, // swiperよりも大きい
          },
          fixedFooterMenu: {
            description: "グローバルのfooterに重ねて表示するfooterメニュー",
            value: 3,
          },
        },
      },
      textStyles: defineTextStyles({
        base: {
          description: "アプリの基準値",
          value: {
            fontSize: "15px",
            fontWeight: "400",
            lineHeight: "21px",
          },
        },
        formLabel: {
          value: {
            fontSize: "14px",
            fontWeight: "700",
            lineHeight: "21px",
          },
        },
        formError: {
          description: "フォームのエラーメッセージ用",
          value: {
            fontSize: "13px",
            fontWeight: "600",
            lineHeight: "26px",
          },
        },
        userNickname: {
          value: {
            fontSize: "16px",
            fontWeight: "700",
            lineHeight: "23.8px",
          },
        },
        termsNavigation: {
          description: "規約の案内などの文言",
          value: {
            fontSize: "12px",
            fontWeight: "400",
            lineHeight: "15px",
          },
        },
        pageTitle: {
          description: "各ページの先頭に表示するページ名の見出し",
          value: {
            fontSize: "18px",
            fontWeight: "700",
            lineHeight: "1.4em",
          },
        },
        pageSubTitle: {
          description: "商品ページの各見出しのために追加",
          value: {
            fontSize: "15px",
            fontWeight: "700",
            lineHeight: "1.4em",
          },
        },
        pageSubTitleLarge: {
          description: "商品ページの各見出しのために追加",
          value: {
            fontSize: "16px",
            fontWeight: "700",
            lineHeight: "1.4em",
            fontFamily: "'M PLUS 1p'",
          },
        },
        footerMenu: {
          description: "footerのメニュー文字",
          value: {
            fontSize: "12px",
            fontWeight: "100",
            lineHeight: "12px",
            letterSpacing: "-0.1px",
          },
        },
        buttonLabel: {
          description: "共通ボタンの文字",
          value: {
            fontSize: "15px",
            fontWeight: "700",
            lineHeight: "15px",
          },
        },
      }),
      layerStyles: defineLayerStyles({
        formContainer: {
          description: "フォーム内の子要素のレイアウトを統一するためのレイヤー",
          // TODO: 型エラーがあるため暫定any
          value: {
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            alignItems: "start",
            justifyContent: "start",
          } as any,
        },
        formInput: {
          description: "フォームのinput要素",
          value: {
            color: "inherit",
            width: "100%",
            border: "1px solid #777",
            borderRadius: "4px",
            padding: "16px",
            outline: "none",
            appearance: "none",
            fontSize: "16px",
            fontWeight: "400",
            marginTop: "6px",
          } as any,
        },
        formSmallInput: {
          description: "フォームのinput要素",
          value: {
            color: "inherit",
            width: "100%",
            border: "1px solid #cccccc",
            borderRadius: "4px",
            padding: "4px",
            outline: "none",
            appearance: "none",
            fontSize: "12px",
            fontWeight: "400",
            marginTop: "4px",
          } as any,
        },

        formSmallInputTop: {
          description: "フォームのinput要素",
          value: {
            color: "inherit",
            width: "100%",
            border: "1px solid #cccccc",
            borderRadius: "4px",
            padding: "4px",
            fontSize: "12px",
            fontWeight: "400",
          } as any,
        },

        sortFormInput: {
          description: "sortフォームのinput要素",
          value: {
            color: "#6096e9",
            border: "1px solid #6096e9",
            padding: "8px",
            outline: "none",
            appearance: "none",
            fontSize: "15px",
            fontWeight: "400",
            textAlign: "left",
          } as any,
        },
        iconWrapper: {
          description: "Icon wrapper",
          value: {
            w: "1.5rem",
            h: "1.5rem",
            marginLeft: "0.5rem",
            display: "flex",
            alignItems: "center",
            padding: "4px",
            border: "solid 1px #888",
            borderRadius: "50%",
          } as any,
        },
      }),
    },
  },
});
