export default function AddUser() {
  return (
    <div className="p-[30px] m-auto w-max h-max bg-dark-blue-rgba-3 rounded-xl absolute top-0 bottom-0 left-0 right-0">
      <form className="flex gap-5">
        <input
          className="px-5 py-2 rounded-lg border-none outline-none"
          type="text"
          placeholder="Username"
          name="username"
        />
        <button className="px-5 py-2 bg-blue-500 rounded-md text-white border-none cursor-pointer">
          Search
        </button>
      </form>
      <div className="mt-12 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <img
            className="w-12 h-12 rounded-full object-center"
            src="/avatar.png"
            alt=""
          />
          <span>Felix Kyun</span>
        </div>
        <button className="p-[10px] bg-blue-500 rounded-md text-white border-none cursor-pointer">
          Add User
        </button>
      </div>
    </div>
  );
}
