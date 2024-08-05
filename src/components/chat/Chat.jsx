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
  const [isRecordind, setIsRecording] = useState(false);
  const [isUploadingRecord, setIsUploadingRecord] = useState(false);

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");
  const audioPlaybackRef = useRef(null);

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, img, openRecording, isUploadingRecord]);

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
    if (isRecordind) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecordind]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setIsRecording(true);
    // setAudioChunks([]);
    // setAudioUrl("");

    recorder.ondataavailable = (event) => {
      setAudioChunks((prevAudioChunks) => [...prevAudioChunks, event.data]);
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      await uploadRecording(audioBlob);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setAudioChunks([]);
      setMediaRecorder(null);
      setIsUploadingRecord(false);
    };

    recorder.start();
    setMediaRecorder(recorder);
  }

  function stopRecording() {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setMediaRecorder(null);
      setIsRecording(false);
      setIsUploadingRecord(true);
      setOpenRecording(false);
      setTime(0);
    }
  }

  function resetRecording() {
    setIsRecording(false);
    setTime(0);
  }

  async function uploadRecording(audioBlob) {
    try {
      // Convert audioBlob to a File object
      const audioFile = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
      });

      // Upload the file
      const audioUrl = await upload(audioFile);

      const message = {
        senderId: currentUser.id,
        text: "",
        createAt: new Date(),
        audio: audioUrl,
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
            userChatsData.chats[chatIndex].lastMessage = "Audio";
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
            userChatsData.chats[chatIndex].updateAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });

      setIsUploadingRecord(false);
      setAudioUrl("");
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

      <div className="flex-1 p-5 pb-0 flex flex-col gap-5 overflow-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-dark-blue-rgba scrollbar-track-transparent">
        {chat?.messages?.map((message) => (
          <div
            className={`max-w-7/10 flex gap-5 ${
              message.senderId === currentUser?.id ? "self-end" : ""
            }`}
            key={message.createAt}
          >
            <div className="flex-1 flex flex-col gap-2">
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
              {message.audio && (
                <audio ref={audioPlaybackRef} src={message.audio} controls />
              )}
              {/* <span className="text-xs">{message}</span> */}
            </div>
          </div>
        ))}

        {img.url && (
          <div className="max-w-7/10 flex gap-5 self-end">
            <div className="lex-1 flex flex-col gap-2">
              <img
                className="w-full h-[300px] rounded-lg object-cover filter blur-[1px] animate-pulse"
                src={img.url}
                alt=""
              />
            </div>
          </div>
        )}

        {isUploadingRecord && (
          <div className="max-w-7/10 flex gap-5 self-end">
            <audio ref={audioPlaybackRef} src={audioUrl} controls />
          </div>
        )}

        <div ref={endRef}></div>
      </div>

      <div className="p-5 pt-1 flex gap-5 mt-auto items-center justify-between">
        {openRecording ? (
          <div className="flex-1 flex flex-row items-center gap-3">
            <svg
              className="fill-white w-5 h-5 cursor-pointer transition duration-200 ease-in-out hover:scale-105 hover:fill-red-500"
              viewBox="0 0 448 512"
              onClick={() => {
                setOpenRecording((prev) => !prev);
                stopRecording();
                resetRecording();
              }}
            >
              <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z" />
            </svg>
            <div className="w-full px-[2px] flex items-center justify-between bg-blue-500 rounded-full">
              <div className="p-2 cursor-pointer">
                <svg
                  className="fill-white w-6 h-6"
                  viewBox="0 0 478.125 478.125"
                  onClick={stopRecording}
                >
                  <g>
                    <g>
                      <g>
                        <path d="M201.654,127.525h-31.9c-10.557,0-19.125,8.645-19.125,19.125v184.9c0,10.558,8.645,19.125,19.125,19.125h31.9     c10.557,0,19.125-8.645,19.125-19.125v-184.9C220.779,136.094,212.211,127.525,201.654,127.525z" />
                        <path d="M308.448,127.525h-31.9c-10.558,0-19.125,8.645-19.125,19.125v184.9c0,10.558,8.645,19.125,19.125,19.125h31.9     c10.557,0,19.125-8.645,19.125-19.125v-184.9C327.573,136.094,318.929,127.525,308.448,127.525z" />
                        <path d="M239.062,0C107.023,0,0,107.023,0,239.062s107.023,239.062,239.062,239.062s239.062-107.023,239.062-239.062     S371.102,0,239.062,0z M239.292,409.811c-94.171,0-170.519-76.424-170.519-170.519S145.197,68.773,239.292,68.773     c94.095,0,170.519,76.424,170.519,170.519S333.54,409.811,239.292,409.811z" />
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
              <div className="flex-1 flex justify-center items-center h-6">
                <Loader />
              </div>
              <div className="mr-4 text-sm text-white">{formatTime(time)}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-5">
              <label htmlFor="file">
                <img
                  className="w-5 h-5 cursor-pointer transition duration-200 ease-in-out hover:scale-105"
                  src="/img.png"
                  alt=""
                />
              </label>
              <input
                className="hidden"
                type="file"
                id="file"
                onChange={handleImg}
              />
              <img
                className="w-5 h-5 cursor-pointer transition duration-200 ease-in-out hover:scale-105"
                src="/camera.png"
                alt=""
                onClick={() => setTakePhoto((prev) => !prev)}
              />
              <img
                className="w-5 h-5 cursor-pointer transition duration-200 ease-in-out hover:scale-105"
                src="/mic.png"
                alt=""
                onClick={() => {
                  setOpenRecording((prev) => !prev);
                  startRecording();
                }}
              />
            </div>
            <input
              className="flex-1 bg-dark-blue-rgba-1 border-none outline-none text-white rounded-full p-2 pl-[18px] text-base disabled:cursor-not-allowed"
              type="text"
              value={text}
              placeholder={
                isCurrentUserBlocked || isReceiverBlocked
                  ? "You cannot send a message"
                  : "Type a message..."
              }
              onChange={(e) => setText(e.target.value)}
              disabled={isCurrentUserBlocked || isReceiverBlocked}
            />
            <div className="relative">
              <img
                className="w-5 h-5 cursor-pointer transition duration-200 ease-in-out hover:scale-105"
                src="/emoji.png"
                alt=""
                onClick={() => setOpenEmoji((prev) => !prev)}
              />
              <div className="absolute left-0 bottom-12">
                <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji} />
              </div>
            </div>
          </>
        )}
        <svg
          className="w-6 h-6 fill-blue-500 cursor-pointer transition duration-200 ease-in-out hover:fill-blue-400 hover:scale-105 disabled:cursor-not-allowed"
          viewBox="0 0 64 64"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          <defs>
            <clipPath id="a">
              <rect width="64" height="64" />
            </clipPath>
          </defs>
          <g clip-path="url(#a)">
            <path d=" M 8.216 36.338 L 26.885 32.604 C 28.552 32.271 28.552 31.729 26.885 31.396 L 8.216 27.662 C 7.104 27.44 6.021 26.356 5.799 25.245 L 2.065 6.576 C 1.731 4.908 2.714 4.133 4.259 4.846 L 61.228 31.139 C 62.257 31.614 62.257 32.386 61.228 32.861 L 4.259 59.154 C 2.714 59.867 1.731 59.092 2.065 57.424 L 5.799 38.755 C 6.021 37.644 7.104 36.56 8.216 36.338 Z " />
          </g>
        </svg>
      </div>

      {takePhoto && (
        <TakePhoto
          setImg={setImg}
          setTakePhoto={setTakePhoto}
          currentUser={currentUser}
          chatId={chatId}
          user={user}
        />
      )}
    </div>
  );
}
