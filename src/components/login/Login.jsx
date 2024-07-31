import { useState } from "react";
import { toast } from "react-toastify";

export default function Login() {
  const [avatar, setAvatar] = useState({ file: null, url: "" });

  function handleAvatar(e) {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    toast.success("hello");
  }

  return (
    <div className="w-full h-full flex items-center gap-24">
      <div className="flex-1 flex flex-col items-center gap-5">
        <h2 className="text-[28px] font-medium mb-2">Welcome back,</h2>
        <form
          action=""
          onSubmit={handleLogin}
          className="flex flex-col items-center justify-center gap-5"
        >
          <input
            className="px-5 py-2 border-none outline-none bg-dark-blue-rgba-1 text-white rounded-md"
            type="text"
            placeholder="Email"
            name="email"
          />
          <input
            className="px-5 py-2 border-none outline-none bg-dark-blue-rgba-1 text-white rounded-md"
            type="text"
            placeholder="Password"
            name="password"
          />
          <button className="w-full px-5 py-2 bg-blue-500 rounded-md cursor-pointer">
            Sign In
          </button>
        </form>
      </div>

      <div className="h-[80%] w-[2px] bg-[#dddddd35]"></div>

      <div className="flex-1 flex flex-col items-center gap-5">
        <h2 className="text-[28px] font-medium mb-2">Create an Account</h2>
        <form
          action=""
          className="flex flex-col items-center justify-center gap-5"
        >
          <label
            className="w-full px-5 flex items-center justify-between cursor-pointer underline"
            htmlFor="file"
          >
            <img
              className="w-12 h-12 rounded-lg object-cover opacity-80"
              src={avatar.url || "/avatar.png"}
              alt=""
            />
            Upload an image
          </label>
          <input
            className="hidden"
            type="file"
            id="file"
            onChange={handleAvatar}
          />
          <input
            className="px-5 py-2 border-none outline-none bg-dark-blue-rgba-1 text-white rounded-md"
            type="text"
            placeholder="Username"
            name="username"
          />
          <input
            className="px-5 py-2 border-none outline-none bg-dark-blue-rgba-1 text-white rounded-md"
            type="text"
            placeholder="Email"
            name="email"
          />
          <input
            className="px-5 py-2 border-none outline-none bg-dark-blue-rgba-1 text-white rounded-md"
            type="text"
            placeholder="Password"
            name="password"
          />
          <button className="w-full px-5 py-2 bg-blue-500 rounded-md cursor-pointer">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
