import Script from "next/script";

type Props = {
  gtmId: string;
  userId: string; // 非ログインの場合は""
};

/**
 * Google Tag Manager を設定するコンポーネント
 *
 * GTMにはログイン中のユーザを識別するために、user_idの変数を連携している。
 * このアプリはログイン前提で、全ページをSSRしているため、user_idもSSR時にdata_layerに設定している。
 * SSR時にuser_idを設定している理由は、GTMからGAに初回ページロードのイベントを送る際にもuser_idが連携できるため。
 * GTM読み込み後にuser_idを設定すると、初回ページロードのイベント送信からuser_idが設定されない。
 */
export function GoogleTagManagerScript(props: Props) {
  return (
    <>
      <Script
        id="gtm-datalayer-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `dataLayer=[{'user_id':'${props.userId}'}]`,
        }}
      />
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer', '${props.gtmId}');`,
        }}
      />
    </>
  );
}
