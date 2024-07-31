import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Nontification from "./components/nontification/Nontification";

const App = () => {
  const user = false;

  return (
    <div className="w-[80vw] h-[90vh] bg-dark-blue-rgba backdrop-blur-lg border border-white/[.125] rounded-xl flex">
      {user ? (
        <>
          <List />
          <Chat />
          <Detail />
        </>
      ) : (
        <Login />
      )}
      <Nontification/>
    </div>
  );
};

export default App;
