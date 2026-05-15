import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setToken, getUtilizador } from "../services/auth";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setToken(token);
    const utilizador = getUtilizador();

    if (utilizador?.isNew) {
      navigate("/perfil/setup");
    } else {
      navigate("/");
    }
  }, []);

  return (
    <div
      style={{ minHeight: "100vh", background: "#1a1a1a" }}
      className="d-flex align-items-center justify-content-center"
    >
      <div className="text-center text-white">
        <div
          className="spinner-border mb-3"
          style={{ color: "#FFC300" }}
          role="status"
        />
        <p className="mb-0">A autenticar, aguarde...</p>
      </div>
    </div>
  );
}
