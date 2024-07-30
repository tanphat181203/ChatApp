export default function Chat() {
  return (
    <div className="flex-2 border-l border-r border-gray-500 h-full">
      <div className="p-5 flex items-center justify-between border-b border-gray-500">
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
      <div className="center"></div>
      <div className="bottom"></div>
    </div>
  );
};
