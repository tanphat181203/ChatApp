import { useEffect, useState } from "react";
import AddUser from "./AddUser";
import { useUserStore } from "../../lib/userStore";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function ChatList() {
  const [addButtonMode, setAddButtonMode] = useState(false);
  const [chats, setChats] = useState([]);

  const { currentUser } = useUserStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();
          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updateAt - a.updateAt));
      }
    );
    return () => unSub();
  }, [currentUser.id]);

  return (
    <div className="flex-1 overflow-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-dark-blue-rgba scrollbar-track-transparent">
      <div className="flex items-center gap-5 p-5">
        <div className="flex-1 flex items-center gap-5 p-2 bg-dark-blue-rgba-1 rounded-xl">
          <img className="w-5 h-5" src="/search.png" alt="" />
          <input
            className="flex-1 bg-transparent border-none outline-none text-white"
            type="text"
            placeholder="Search"
          />
        </div>
        <img
          className="w-9 h-9 bg-dark-blue-rgba-1 p-2 rounded-lg cursor-pointer"
          src={addButtonMode ? "/minus.png" : "/plus.png"}
          alt=""
          onClick={() => setAddButtonMode((prev) => !prev)}
        />
      </div>
      {chats.map((chat) => (
        <div
          className="flex items-center gap-5 p-5 cursor-pointer border-b border-[#dddddd35]"
          key={chat.chatId}
        >
          <img
            className="w-[50px] h-[50px] rounded-full object-cover"
            src={chat.user.avatar ||"/avatar.png"}
            alt=""
          />
          <div className="flex flex-col gap-[10px]">
            <span className="font-medium">{chat.user.username}</span>
            <p className="text-sm font-light">{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      {addButtonMode && <AddUser />}
    </div>
  );
}
