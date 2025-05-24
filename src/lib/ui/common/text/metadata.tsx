import { config } from "@/application/config";

type Props = {
  appName?: string;
  title: string;
  description: string;
};
export function buildMetadata({ appName, title, description }: Props) {
  return {
    title: `${title}${appName ? ` - ${appName}` : ""} | トレカ専門取引所`,
    description: description,
    applicationName: appName || config.appName,
    openGraph: {
      type: "website",
      title: title,
      description: description,
      siteName: appName || config.appName,
    },
  };
}
