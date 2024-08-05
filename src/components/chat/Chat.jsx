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
import TakePhoto from "./TakePhoto";
import Loader from "./Loader";

export default function Chat() {
  const [openEmoji, setOpenEmoji] = useState(false);

  const [text, setText] = useState("");
  const [chat, setChat] = useState();

  const [img, setImg] = useState({ file: null, url: "" });
  const [takePhoto, setTakePhoto] = useState(false);

  const [openRecording, setOpenRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, img, openRecording]);

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

  async function handleImg(e) {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImg({ file, url });

      try {
        const imgUrl = await upload(file);

        const message = {
          senderId: currentUser.id,
          text: "",
          createAt: new Date(),
          img: imgUrl,
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
              userChatsData.chats[chatIndex].lastMessage = "Image";
              userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
              userChatsData.chats[chatIndex].updateAt = Date.now();

              await updateDoc(userChatsRef, {
                chats: userChatsData.chats,
              });
            }
          }
        });

        setImg({ file: null, url: "" });
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function handleSend() {
    if (text === "") return;

    try {
      const message = {
        senderId: currentUser.id,
        text,
        createAt: new Date(),
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

      setText("");
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setIsRecording(true);
      setAudioChunks([]);
      setAudioUrl("");

      recorder.ondataavailable = (event) => {
        setAudioChunks((prevAudioChunks) => [...prevAudioChunks, event.data]);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioChunks([]);
        setMediaRecorder(null);
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
    }
  }

  function stopRecording() {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setMediaRecorder(null);
      setIsRecording(false);
    }
  }

  function resetRecording() {
    setIsRecording(false);
    setTime(0);
    setAudioChunks([]);
    setAudioUrl("");
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

      <div className="flex-1 p-5 pb-0 flex flex-col gap-5 overflow-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-dark-blue-rgba scrollbar-track-transparent">
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
              {message.text && (
                <p
                  className={`p-4 rounded-md ${
                    message.senderId === currentUser?.id
                      ? "bg-blue-400"
                      : "bg-dark-blue-rgba-2"
                  }`}
                >
                  {message.text}
                </p>
              )}
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
        {openRecording && (
          <div className="self-end w-full md:w-[50%] bg-[#ededed] flex flex-col justify-center gap-2 p-2 rounded-md shadow-md">
            {audioUrl ? (
              <div className="w-full flex items-center justify-between">
                <audio src={audioUrl} controls className="w-full" />
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded-md ml-2"
                  onClick={resetRecording}
                >
                  Reset
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center w-full">
                  <p className="text-lg">{formatTime(time)}</p>
                  <div className="flex items-center gap-2">
                    {!isRecording ? (
                      <button
                        className="px-2 py-1 bg-blue-500 text-white rounded-md"
                        onClick={startRecording}
                      >
                        Start
                      </button>
                    ) : (
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded-md"
                        onClick={stopRecording}
                      >
                        Stop
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-5 flex flex-col md:flex-row items-end md:items-center justify-between gap-5 border-t border-[#dddddd35]">
        {isReceiverBlocked && (
          <p className="text-sm text-red-500">
            You cannot send message to this user.
          </p>
        )}
        {isCurrentUserBlocked && (
          <p className="text-sm text-red-500">You are blocked by this user.</p>
        )}
        <div className="flex flex-col gap-5 w-full md:w-[90%] relative">
          {takePhoto ? (
            <TakePhoto setTakePhoto={setTakePhoto} />
          ) : (
            <div className="relative flex items-center justify-between gap-3">
              <img
                className="w-7 h-7 cursor-pointer"
                src="/emoji.png"
                alt=""
                onClick={() => setOpenEmoji(!openEmoji)}
              />
              <input
                type="text"
                className="flex-1 p-3 rounded-md outline-none border border-gray-300"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isReceiverBlocked || isCurrentUserBlocked}
              />
              <div className="flex items-center gap-3">
                <label htmlFor="img">
                  <img
                    className="w-7 h-7 cursor-pointer"
                    src="/attach.png"
                    alt=""
                  />
                </label>
                <input
                  type="file"
                  id="img"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImg}
                  disabled={isReceiverBlocked || isCurrentUserBlocked}
                />
                <img
                  className="w-7 h-7 cursor-pointer"
                  src="/photo.png"
                  alt=""
                  onClick={() => setTakePhoto(true)}
                />
                <img
                  className="w-7 h-7 cursor-pointer"
                  src="/mic.png"
                  alt=""
                  onClick={() => setOpenRecording(!openRecording)}
                />
              </div>
            </div>
          )}
          {openEmoji && (
            <div className="absolute bottom-[60px] left-0 z-50">
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
        <button
          className="px-5 py-2 bg-blue-500 text-white rounded-md"
          onClick={handleSend}
          disabled={isReceiverBlocked || isCurrentUserBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
}
