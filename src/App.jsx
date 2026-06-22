import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import "./App.css";

function App() {
  return (
    <main className="page">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar-cuenta" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Footer />
    </main>
  );
}

export default App;