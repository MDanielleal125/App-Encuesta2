import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await api.auth.login(cedula, password);
      login(token, user);
      navigate(user.role === "ADMIN" ? "/admin" : "/", { replace: true });
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      {/* LEFT PANEL */}
      <div className="left-panel">
        <div className="grid-overlay"></div>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>

        <div className="logo">
          <div className="logo-icon">🧠</div>
          <div>
            <div className="logo-text">TechProfile</div>
            <div className="logo-sub">Evaluación de Talento</div>
          </div>
        </div>

        <div className="left-center">
          <div className="left-tagline">
            Descubre tu<br />
            <span>perfil único</span>
            <br />
            de resolución
          </div>
          <p className="left-desc">
            Una evaluación diseñada para identificar cómo abordas los desafíos.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <div className="form-container">
          <div className="form-header">
            <div className="form-title">Bienvenido a TechProfile</div>
            <div className="form-subtitle">
              Ingresa tus credenciales para continuar
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">Cédula</label>
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="field-input"
                placeholder="Ej: 12345678"
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="error-box">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? "Entrando..." : "Iniciar sesión →"}
            </button>
          </form>

          <div className="form-footer">
            ¿No tienes cuenta?{" "}
            <Link to="/register">Crear cuenta</Link>
          </div>
        </div>
      </div>
    </div>
  );
}