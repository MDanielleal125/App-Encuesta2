import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.auth.register(name, cedula, password);
      const { token, user } = await api.auth.login(cedula, password);
      login(token, user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      {/* LEFT PANEL */}
      <div className="left-panel">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="grid-overlay"></div>

        <div className="logo">
          <div className="logo-icon">⚡</div>
          <div>
            <div className="logo-text">PerfilTech</div>
            <div className="logo-sub">Sistema de Encuestas</div>
          </div>
        </div>

        <div className="left-center">
          <h1 className="left-tagline">
            Únete y <span>descubre</span><br />
            tu perfil técnico
          </h1>
          <p className="left-desc">
            Crea tu cuenta y accede a la encuesta de perfiles técnicos
            para conocer tus fortalezas y oportunidades de mejora.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <div className="form-container">
          <h2 className="form-title">Crear Cuenta</h2>
          <p className="form-subtitle">
            Completa los datos para registrarte
          </p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">Nombre completo</label>
              <input
                type="text"
                className="field-input"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Cédula</label>
              <input
                type="text"
                className="field-input"
                placeholder="Ej: 12345678"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Contraseña</label>
              <input
                type="password"
                className="field-input"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="form-footer">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}