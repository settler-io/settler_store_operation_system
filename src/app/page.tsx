import { getServerContext } from "@/application/context";
import { PageUrl } from "@/application/url";
import { User } from "@/domain/entity";
import { Padding } from "@/ui/common";
import { HLine, Hero, HostListWrapper, HostRound, HostSquare, SectionTitle } from "@/ui/gemucha";
import { SectionContainer } from "@/ui/gemucha/section-container";
import type { SVGProps } from "react";

export default async function Page() {
  const { userSettingQuery, attractionQuery } = await getServerContext();
  const availableHosts = await attractionQuery.selectAllAvailableUsers();
  const users = await userSettingQuery.selectAllUsers();
  return (
    <div>
      <Hero>
        <img src="../images/gemucha/gemucha_mv.jpg" alt="gemucha" />
      </Hero>
      <div style={{ padding: "0 1em" }}>
        <SectionContainer>
          <div style={{ margin: "auto", paddingBottom: "0.3em" }}>
            <SectionTitle
              title="今すぐ遊べるホスト"
              icon={<GameIcon />}
              className={{
                color: "#0099ff",
              }}
            />
          </div>
          <HLine startColor="orange" endColor="yellow" />
          <Padding size="8px" />
          <HostListWrapper>
            {availableHosts.map((h, index) => {
              return (
                <HostRound
                  key={index}
                  imageUrl={h.userSetting?.imageUrl || User.defaultImageUrl}
                  name={h.nickname || ""}
                  url={PageUrl.host.detail(h.id)}
                  online
                />
              );
            })}
          </HostListWrapper>
        </SectionContainer>
      </div>
      <div style={{ padding: "0 1em" }}>
        <SectionContainer>
          <div style={{ margin: "auto", paddingBottom: "0.3em" }}>
            <SectionTitle
              title="ホスト一覧"
              icon={<HostIcon />}
              className={{
                color: "#914BEA",
              }}
            />
          </div>
          <HLine startColor="yellow" endColor="orange" />
          <Padding size="8px" />
          <HostListWrapper>
            {users.map((h, index) => {
              return (
                <HostSquare
                  key={index}
                  imageUrl={String(h.imageUrl || User.defaultImageUrl)}
                  name={String(h.user.nickname || "匿名")}
                  url={PageUrl.host.detail(h.userId)}
                  coin={h.price}
                />
              );
            })}
          </HostListWrapper>
        </SectionContainer>
      </div>
    </div>
  );
}

function GameIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="32px" height="32px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M467.51,248.83c-18.4-83.18-45.69-136.24-89.43-149.17A91.5,91.5,0,0,0,352,96c-26.89,0-48.11,16-96,16s-69.15-16-96-16a99.09,99.09,0,0,0-27.2,3.66C89,112.59,61.94,165.7,43.33,248.83c-19,84.91-15.56,152,21.58,164.88,26,9,49.25-9.61,71.27-37,25-31.2,55.79-40.8,119.82-40.8s93.62,9.6,118.66,40.8c22,27.41,46.11,45.79,71.42,37.16C487.1,399.86,486.52,334.74,467.51,248.83Z"
        style={{
          fill: "#0099ff",
          stroke: "#0099ff",
          strokeMiterlimit: 10,
          strokeWidth: "32px",
        }}
      />
      <circle cx="292" cy="224" r="20" fill="white" />
      <path d="M336,288a20,20,0,1,1,20-19.95A20,20,0,0,1,336,288Z" fill="white" />
      <circle cx="336" cy="180" r="20" fill="white" />
      <circle cx="380" cy="224" r="20" fill="white" />
      <line
        x1="160"
        y1="176"
        x2="160"
        y2="272"
        style={{
          fill: "none",
          stroke: "white",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "32px",
        }}
      />
      <line
        x1="208"
        y1="224"
        x2="112"
        y2="224"
        style={{
          fill: "none",
          stroke: "white",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "32px",
        }}
      />
    </svg>
  );
}

function HostIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -960 960 960" width="44" {...props}>
      <path
        d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113Z"
        style={{
          fill: "#914BEA",
          // stroke: "#914BEA",
          // strokeMiterlimit: 10,
          strokeWidth: "44px",
        }}
      />
    </svg>
  );
}
