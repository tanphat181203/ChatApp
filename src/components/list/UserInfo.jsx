export default function UserInfo() {
  return (
    <div className="">
      <div className="p-5 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <img
            className="w-[50px] h-[50px] rounded-full object-cover"
            src="./avatar.png"
            alt=""
          />
          <h2>User Name</h2>
        </div>
        <div className="flex gap-5">
          <img className="w-5 h-5 cursor-pointer" src="/more.png" alt="" />
          <img className="w-5 h-5 cursor-pointer" src="/video.png" alt="" />
          <img className="w-5 h-5 cursor-pointer" src="/edit.png" alt="" />
        </div>
      </div>
    </div>
  );
}
