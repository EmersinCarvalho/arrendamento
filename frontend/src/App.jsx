import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./context/ThemeContext";
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
import Perfil from "./pages/Perfil";
import PublicarImovel from "./pages/PublicarImovel";
import MeusImoveis from "./pages/MeusImoveis";
import Favoritos from "./pages/Favoritos";
import PerfilAnunciante from "./pages/PerfilAnunciante";
import CurriculoInquilino from "./pages/CurriculoInquilino";
import CandidaturasRecebidas from "./pages/CandidaturasRecebidas";

export default function App() {
  return (
    <HelmetProvider>
    <ThemeProvider>
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/imoveis" element={<Imoveis />} />
            {/* /imoveis/publicar deve vir ANTES de /imoveis/:id */}
            <Route path="/imoveis/publicar" element={<PublicarImovel />} />
            <Route path="/imoveis/:id" element={<DetalheImovel />} />
            <Route path="/editar-imovel/:id" element={<PublicarImovel />} />
            <Route path="/meus-imoveis" element={<MeusImoveis />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/anunciante/:id" element={<PerfilAnunciante />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/perfil/setup" element={<PerfilSetup />} />
            <Route path="/perfil/procura" element={<SetupProcura />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/curriculo" element={<CurriculoInquilino />} />
            <Route path="/candidaturas" element={<CandidaturasRecebidas />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
    </ThemeProvider>
    </HelmetProvider>
  );
}




