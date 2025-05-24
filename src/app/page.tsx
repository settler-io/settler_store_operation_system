import { getServerContext } from "@/application/context";
import { PageUrl } from "@/application/url";
import TextInput from "./textinput";


export default async function Page() {
  const { userSettingQuery, attractionQuery } = await getServerContext();
  const availableHosts = await attractionQuery.selectAllAvailableUsers();
  const users = await userSettingQuery.selectAllUsers();
  return (
    <div>
      <TextInput/>
    </div>
  );
}


