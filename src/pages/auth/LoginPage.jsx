import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { getRutaInicial } from "../../utils/roles";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      const usuario = await login(form.username, form.password);
      navigate(getRutaInicial(usuario.rol), { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Credenciales incorrectas.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", width: "100%",
      background: "#2D5A3D",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1.5rem"
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px",
        padding: "2.5rem 2rem", width: "100%", maxWidth: "400px"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{
            width: "56px", height: "56px", background: "#2D5A3D",
            borderRadius: "14px", display: "inline-flex",
            alignItems: "center", justifyContent: "center", marginBottom: "0.75rem"
          }}>
            <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
              <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="#D4821A" strokeWidth="2"/>
              <path d="M16 4L16 28M4 10L28 22M28 10L4 22" stroke="#D4821A" strokeWidth="1.5" opacity="0.5"/>
              <circle cx="16" cy="16" r="3" fill="#D4821A"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#1A3A27", letterSpacing: "3px", margin: 0 }}>
            GINNIE
          </h1>
          <p style={{ fontSize: "13px", color: "#5A7A68", marginTop: "4px" }}>
            Sistema de Gestión Institucional
          </p>
          <div style={{ width: "40px", height: "3px", background: "#D4821A", borderRadius: "2px", margin: "1rem auto 0" }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#3A6B4A", marginBottom: "6px" }}>
              Correo 
            </label>
            <input
              type="text" required value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="correo@ejemplo.com"
              style={{
                width: "100%", border: "1.5px solid #C8D8CE", borderRadius: "10px",
                padding: "10px 14px", fontSize: "14px", color: "#1A3A27",
                background: "#F4F9F6", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#3A6B4A", marginBottom: "6px" }}>
              Contraseña
            </label>
            <input
              type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              style={{
                width: "100%", border: "1.5px solid #C8D8CE", borderRadius: "10px",
                padding: "10px 14px", fontSize: "14px", color: "#1A3A27",
                background: "#F4F9F6", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              color: "#991B1B", fontSize: "13px", borderRadius: "8px",
              padding: "10px 14px", marginBottom: "1rem"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={cargando}
            style={{
              width: "100%", background: cargando ? "#5A7A68" : "#2D5A3D",
              color: "#fff", border: "none", borderRadius: "10px",
              padding: "12px", fontSize: "15px", fontWeight: "500",
              cursor: cargando ? "not-allowed" : "pointer", transition: "background 0.2s"
            }}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#5A7A68", marginTop: "1.25rem" }}>
          <span style={{ color: "#D4821A", fontWeight: "500" }}>Nova Valley</span> · Educación con propósito
        </p>
      </div>
    </div>
  );
}