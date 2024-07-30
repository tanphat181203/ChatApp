import { useState } from "react";

export default function ChatList() {
  const [addButtonMode, setAddButtonMode] = useState(false);

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
      <div className="flex items-center gap-5 p-5 cursor-pointer border-b border-gray-500">
        <img
          className="w-[50px] h-[50px] rounded-full object-cover"
          src="/avatar.png"
          alt=""
        />
        <div className="flex flex-col gap-[10px]">
          <span className="font-medium">Lorem Ipsum</span>
          <p className="text-sm font-light">Hello</p>
        </div>
      </div>
    </div>
  );
}
