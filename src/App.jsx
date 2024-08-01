import { useEffect } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Nontification from "./components/nontification/Nontification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });
    return () => unSub();
  }, [fetchUserInfo]);

  console.log(currentUser);

  if (isLoading)
    return (
      <div className="px-12 py-8 text-3xl rounded-xl bg-dark-blue-rgba-3">
        Loading...
      </div>
    );

  return (
    <div className="w-[80vw] h-[90vh] bg-dark-blue-rgba backdrop-blur-lg border border-white/[.125] rounded-xl flex">
      {currentUser ? (
        <>
          <List />
          <Chat />
          <Detail />
        </>
      ) : (
        <Login />
      )}
      <Nontification />
    </div>
  );
};

export default App;
