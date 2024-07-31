import EmojiPicker from "emoji-picker-react";
import { useState } from "react";

export default function Chat() {
  const [openEmoji, setOpenEmoji] = useState(false);
  const [text, setText] = useState("");

  function handleEmoji(e) {
    setText((prev) => prev + e.emoji);
    setOpenEmoji(false);
  }

  console.log(text);

  return (
    <div className="flex-2 border-l border-r border-[#dddddd35] h-full flex flex-col">
      <div className="p-5 flex items-center justify-between border-b border-[#dddddd35]">
        <div className="flex items-center gap-5">
          <img
            className="w-[60px] h-[60px] rounded-full object-cover"
            src="/avatar.png"
            alt=""
          />
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold">Felix Kyun</span>
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

      <div className="flex-1 p-5"></div>

      <div className="p-5 flex gap-5 mt-auto items-center justify-between border-t border-[#dddddd35]">
        <div className="flex gap-5">
          <img className="w-5 h-5 cursor-pointer" src="/img.png" alt="" />
          <img className="w-5 h-5 cursor-pointer" src="/camera.png" alt="" />
          <img className="w-5 h-5 cursor-pointer" src="/mic.png" alt="" />
        </div>
        <input
          className="flex-1 bg-dark-blue-rgba-1 border-none outline-none text-white rounded-lg p-3 text-base"
          type="text"
          value={text}
          placeholder="Type a message..."
          onChange={(e) => setText(e.target.value)}
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
        <button className="bg-blue-500 text-white px-5 py-2 border-none rounded-lg cursor-pointer">
          Send
        </button>
      </div>
    </div>
  );
}
