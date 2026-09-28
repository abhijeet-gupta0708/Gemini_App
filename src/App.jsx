import Sidebar from "./components/Sidebar/Sidebar";
import Main from "./components/Main/Main";

function App() {
  const handleNewChat = () => {
    window.dispatchEvent(new Event("new-chat"));
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar onNewChat={handleNewChat} />
      <Main />
    </div>
  );
}

export default App;