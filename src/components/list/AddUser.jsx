import { useState } from "react";
import { db } from "../../lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useUserStore } from "../../lib/userStore";

export default function AddUser() {
  const [user, setUser] = useState(null);

  const { currentUser } = useUserStore();

  async function handleSearch(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleAddUser() {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        creatAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(db, "userchats", user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updateAt: Date.now(),
        }),
      });

      await updateDoc(doc(db, "userchats", currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updateAt: Date.now(),
        }),
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="p-[30px] m-auto w-max h-max bg-dark-blue-rgba-3 rounded-xl absolute top-0 bottom-0 left-0 right-0">
      <form className="flex gap-5" onSubmit={handleSearch}>
        <input
          className="px-5 py-2 rounded-lg border-none outline-none text-black"
          type="text"
          placeholder="Username"
          name="username"
        />
        <button className="px-5 py-2 bg-blue-500 rounded-md text-white border-none cursor-pointer">
          Search
        </button>
      </form>
      {user && (
        <div className="mt-12 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <img
              className="w-12 h-12 rounded-full object-center"
              src={user.avatar || "/avatar.png"}
              alt=""
            />
            <span>{user.username}</span>
          </div>
          <button
            className="p-[10px] bg-blue-500 rounded-md text-white border-none cursor-pointer"
            onClick={handleAddUser}
          >
            Add User
          </button>
        </div>
      )}
    </div>
  );
}
