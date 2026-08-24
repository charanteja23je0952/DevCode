import { Outlet } from "react-router";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <ToastContainer position="top-right" autoClose={2500} />
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
