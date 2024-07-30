import Chat from "./components/chat/Chat"
import Detail from "./components/detail/Detail"
import List from "./components/list/List"

const App = () => {
  return (
    <div className='w-[90vw] h-[90vh] bg-dark-blue-rgba backdrop-blur-lg border border-white/[.125] rounded-xl flex'>
      <List />
      <Chat/>
      <Detail />
    </div>
  )
}

export default App