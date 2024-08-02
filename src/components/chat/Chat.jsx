import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

export default function Chat() {
  const [openEmoji, setOpenEmoji] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState();
  const [img, setImg] = useState({ file: null, url: "" });

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) =>
      setChat(res.data())
    );
    return () => unSub();
  }, [chatId]);

  function handleEmoji(e) {
    setText((prev) => prev + e.emoji);
    setOpenEmoji(false);
  }

  function handleImg(e) {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  }

  async function handleSend() {
    if (text === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      const message = {
        senderId: currentUser.id,
        text,
        createAt: new Date(),
        ...(imgUrl && { img: imgUrl }),
      };

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(message),
      });

      const userIds = [currentUser.id, user.id];
      userIds.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
            userChatsData.chats[chatIndex].updateAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });

      setImg({ file: null, url: "" });
      setText("");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex-2 border-l border-r border-[#dddddd35] h-full flex flex-col">
      <div className="p-5 flex items-center justify-between border-b border-[#dddddd35]">
        <div className="flex items-center gap-5">
          <img
            className="w-[60px] h-[60px] rounded-full object-cover"
            src={user?.avatar || "/avatar.png"}
            alt=""
          />
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold">{user?.username}</span>
            <p className="text-sm font-light text-gray-400">
              Lorem ipsum dolor sit amet consectetur!
            </p>
          </div>
        </div>
        <div className="flex gap-5">
          <img className="w-5 h-5" src="/phone.png" alt="" />
          <img className="w-5 h-5" src="/video.png" alt="" />
          <img className="w-5 h-5" src="/info.png" alt="" />
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col gap-5 overflow-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-dark-blue-rgba scrollbar-track-transparent">
        {chat?.messages?.map((message) => (
          <div
            className={`max-w-7/10 flex gap-5 ${
              message.senderId === currentUser?.id ? "self-end" : ""
            }`}
            key={message.createAt}
          >
            <div className="lex-1 flex flex-col gap-2">
              {message.img && (
                <img
                  className="w-full h-[300px] rounded-lg object-cover"
                  src={message.img}
                  alt=""
                />
              )}
              <p
                className={`p-4 rounded-md ${
                  message.senderId === currentUser?.id
                    ? "bg-blue-400"
                    : "bg-dark-blue-rgba-2"
                }`}
              >
                {message.text}
              </p>
              {/* <span className="text-xs">{message}</span> */}
            </div>
          </div>
        ))}
        {img.url && (
          <div className="max-w-7/10 flex gap-5 self-end">
            <div className="lex-1 flex flex-col gap-2">
              <img
                className="w-full h-[300px] rounded-lg object-cover"
                src={img.url}
                alt=""
              />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>

      <div className="p-5 flex gap-5 mt-auto items-center justify-between border-t border-[#dddddd35]">
        <div className="flex gap-5">
          <label htmlFor="file">
            <img className="w-5 h-5 cursor-pointer" src="/img.png" alt="" />
          </label>
          <input
            className="hidden"
            type="file"
            id="file"
            onChange={handleImg}
          />
          <img className="w-5 h-5 cursor-pointer" src="/camera.png" alt="" />
          <img className="w-5 h-5 cursor-pointer" src="/mic.png" alt="" />
        </div>
        <input
          className="flex-1 bg-dark-blue-rgba-1 border-none outline-none text-white rounded-lg p-3 text-base disabled:cursor-not-allowed"
          type="text"
          value={text}
          placeholder={ (isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send a message" : "Type a message..."}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="relative">
          <img
            className="w-5 h-5 cursor-pointer"
            src="/emoji.png"
            alt=""
            onClick={() => setOpenEmoji((prev) => !prev)}
          />
          <div className="absolute left-0 bottom-12">
            <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="bg-blue-500 disabled:bg-blue-500/[.75] text-white px-5 py-2 border-none rounded-lg cursor-pointer disabled:cursor-not-allowed"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
}
