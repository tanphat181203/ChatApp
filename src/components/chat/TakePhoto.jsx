import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import upload from "../../lib/upload";

export default function TakePhoto({
  setImg,
  setTakePhoto,
  currentUser,
  chatId,
  user,
}) {
  const [webcamLoaded, setWebcamLoaded] = useState(false);
  const webcamRef = useRef(null);

  useEffect(() => {
    setWebcamLoaded(false);
  }, []);

  const handleClick = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      const file = dataURLtoFile(imageSrc, "photo.png");
      setImg({ file, url: imageSrc });
      setTakePhoto((prev) => !prev);

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
  }, [setImg, setTakePhoto, currentUser, chatId, user, db]);

  // Helper function to convert dataURL to File object
  const dataURLtoFile = (dataURL, filename) => {
    const [header, data] = dataURL.split(",");
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new File([new Uint8Array(array)], filename, { type: mime });
  };

  return (
    <div className="p-[30px] m-auto w-full h-full bg-dark-blue-rgba rounded-xl absolute top-0 left-0 flex flex-col items-center gap-8">
      <div className="w-full flex justify-end">
        <svg
          className="fill-gray-200 hover:fill-white hover:scale-105 w-8 h-8 cursor-pointer"
          viewBox="0 0 512 512"
          onClick={() => setTakePhoto((prev) => !prev)}
        >
          <path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z" />
        </svg>
      </div>

      <Webcam
        ref={webcamRef}
        className="w-7/12 h-auto rounded-lg"
        onUserMedia={() => setWebcamLoaded(true)}
      />

      {webcamLoaded ? (
        <button
          className="inline-flex items-center px-5 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 cursor-pointer"
          onClick={() => webcamLoaded && handleClick()}
          disabled={!webcamLoaded}
        >
          Take Photo
        </button>
      ) : (
        <button class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </button>
      )}
    </div>
  );
}
