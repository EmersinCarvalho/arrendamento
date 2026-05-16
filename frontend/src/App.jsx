import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Imoveis from "./pages/Imoveis";
import DetalheImovel from "./pages/DetalheImovel";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import PerfilSetup from "./pages/PerfilSetup";
import SetupProcura from "./pages/SetupProcura";
import SwipeImoveis from "./pages/SwipeImoveis";
import Perfil from "./pages/Perfil";

export default function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/imoveis" element={<Imoveis />} />
            <Route path="/imoveis/:id" element={<DetalheImovel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/perfil/setup" element={<PerfilSetup />} />
            <Route path="/setup-procura" element={<SetupProcura />} />
            <Route path="/descobrir" element={<SwipeImoveis />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}



