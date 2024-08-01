import { useState } from "react";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";

export default function Login() {
  const [avatar, setAvatar] = useState({ file: null, url: "" });
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  function handleAvatar(e) {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoadingRegister(true);

    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(avatar.file);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can login now!");
    } catch (error) {
      console.log(error);
      toast.error(error);
    } finally {
      setLoadingRegister(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoadingLogin(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log(error);
      toast.error(error);
    } finally {
      setLoadingLogin(false);
    }
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
            type="password"
            placeholder="Password"
            name="password"
          />
          <button
            className="w-full px-5 py-2 bg-blue-500 rounded-md cursor-pointer disabled:bg-blue-500/[.75] disabled:cursor-not-allowed"
            disabled={loadingLogin || loadingRegister}
          >
            {loadingLogin ? "Loading" : "Sign In"}
          </button>
        </form>
      </div>

      <div className="h-[80%] w-[2px] bg-[#dddddd35]"></div>

      <div className="flex-1 flex flex-col items-center gap-5">
        <h2 className="text-[28px] font-medium mb-2">Create an Account</h2>
        <form
          action=""
          onSubmit={handleRegister}
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
            type="password"
            placeholder="Password"
            name="password"
          />
          <button
            className="w-full px-5 py-2 bg-blue-500 rounded-md cursor-pointer disabled:bg-blue-500/[.75] disabled:cursor-not-allowed"
            disabled={loadingLogin || loadingRegister}
          >
            {loadingRegister ? "Loading" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
