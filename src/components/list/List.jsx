import ChatList from "./ChatList";
import UserInfo from "./UserInfo";

export default function List() {
  return <div className="flex-1 flex flex-col">
    <UserInfo/>
    <ChatList/>
  </div>
};
