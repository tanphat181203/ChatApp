import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";

export default function Detail() {
  const {
    chatId,
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeChat,
    changeBlock,
  } = useChatStore();
  const { currentUser } = useUserStore();

  async function handleBlock() {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex-1">
      <div className="px-5 py-7 flex flex-col items-center gap-3 border-b border-[#dddddd35]">
        <img
          className="w-24 h-24 rounded-full object-cover"
          src={user?.avatar || "/avatar.png"}
          alt=""
        />
        <h2>{user?.username}</h2>
        <p>Lorem ipsum dolor sit amet.</p>
      </div>
      <div className="p-5 flex flex-col gap-6">
        <div className="">
          <div className="flex items-center justify-between">
            <span>Chat Settings</span>
            <img
              className="w-8 h-8 bg-dark-blue-rgba-2 p-2 rounded-full cursor-pointer"
              src="/arrowUp.png"
              alt=""
            />
          </div>
        </div>
        <div className="">
          <div className="flex items-center justify-between">
            <span>Privacy & help</span>
            <img
              className="w-8 h-8 bg-dark-blue-rgba-2 p-2 rounded-full cursor-pointer"
              src="/arrowDown.png"
              alt=""
            />
          </div>
        </div>
        <div className="">
          <div className="flex items-center justify-between">
            <span>Shared photos</span>
            <img
              className="w-8 h-8 bg-dark-blue-rgba-2 p-2 rounded-full cursor-pointer"
              src="/arrowUp.png"
              alt=""
            />
          </div>
          <div className="flex flex-col gap-5 mt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <img
                  className="w-10 h-10 rounded object-cover"
                  src="https://pbs.twimg.com/media/GTxuivxWkAAooPa?format=jpg&name=4096x4096"
                  alt=""
                />
                <span className="text-sm text-gray-100 font-light">
                  photo_2024_2_png
                </span>
              </div>
              <img
                className="w-8 h-8 p-2 rounded-full object-cover bg-dark-blue-rgba-2 cursor-pointer"
                src="/download.png"
                alt=""
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <img
                  className="w-10 h-10 rounded object-cover"
                  src="https://pbs.twimg.com/media/GTxuivxWkAAooPa?format=jpg&name=4096x4096"
                  alt=""
                />
                <span className="text-sm text-gray-100 font-light">
                  photo_2024_2_png
                </span>
              </div>
              <img
                className="w-8 h-8 p-2 rounded-full object-cover bg-dark-blue-rgba-2 cursor-pointer"
                src="/download.png"
                alt=""
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <img
                  className="w-10 h-10 rounded object-cover"
                  src="https://pbs.twimg.com/media/GTxuivxWkAAooPa?format=jpg&name=4096x4096"
                  alt=""
                />
                <span className="text-sm text-gray-100 font-light">
                  photo_2024_2_png
                </span>
              </div>
              <img
                className="w-8 h-8 p-2 rounded-full object-cover bg-dark-blue-rgba-2 cursor-pointer"
                src="/download.png"
                alt=""
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <img
                  className="w-10 h-10 rounded object-cover"
                  src="https://pbs.twimg.com/media/GTxuivxWkAAooPa?format=jpg&name=4096x4096"
                  alt=""
                />
                <span className="text-sm text-gray-100 font-light">
                  photo_2024_2_png
                </span>
              </div>
              <img
                className="w-8 h-8 p-2 rounded-full object-cover bg-dark-blue-rgba-2 cursor-pointer"
                src="/download.png"
                alt=""
              />
            </div>
          </div>
        </div>
        <div className="">
          <div className="flex items-center justify-between">
            <span>Shared Files</span>
            <img
              className="w-8 h-8 bg-dark-blue-rgba-2 p-2 rounded-full cursor-pointer"
              src="/arrowUp.png"
              alt=""
            />
          </div>
        </div>
        <button
          className="px-5 py-2 bg-red-500/[.80] hover:bg-red-700/[.90] text-white border-none rounded-md cursor-pointer"
          onClick={handleBlock}
        >
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
            ? "User Blocked"
            : "Block User"}
        </button>
        <button
          className="px-5 py-2 bg-blue-500 hover:bg-blue-500/[.75] rounded-md cursor-pointer"
          onClick={() => auth.signOut()}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
