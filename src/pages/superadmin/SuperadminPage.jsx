import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../api/axios";

import {
  Users, Plus, Edit, UserX, UserCheck,
  Search, X, ChevronDown,
} from "lucide-react";

// ── Paleta Nova Valley ───────────────────────────────────────────────────────
const C = {
  verde:      "#2D5A3D",
  verdeDark:  "#1A3A27",
  verdeLight: "#E8F4ED",
  verdeMid:   "#5A8A6A",
  naranja:    "#D4821A",
  naranjaLight:"#FDF0E0",
  border:     "#D6E8DC",
  bg:         "#F4F9F6",
  text:       "#1A3A27",
  textMuted:  "#6B8F78",
};

// ── Constantes ───────────────────────────────────────────────────────────────
const ROLES = [
  { value: "SUPERADMIN",   label: "Super Admin (TI)" },
  { value: "DIRECTOR",     label: "Director" },
  { value: "SECRETARIA",   label: "Secretaria" },
  { value: "FINANZAS",     label: "Finanzas / Contabilidad" },
  { value: "MARKETING",    label: "Marketing" },
  { value: "MAESTRO",      label: "Maestro / Cuidador" },
  { value: "ENFERMERIA",   label: "Enfermería" },
  { value: "CHOFER",       label: "Chofer" },
  { value: "REPRESENTANTE",label: "Padre / Representante" },
];

const AREAS = [
  { value: 1, label: "Administrativa" },
  { value: 2, label: "Operativa" },
  { value: 3, label: "Padres de Familia" },
];

// Color de badge por rol — todos en tono verde/naranja Nova Valley
const ROL_BADGE = {
  SUPERADMIN:    { bg: "#1A3A27", color: "#fff" },
  DIRECTOR:      { bg: "#2D5A3D", color: "#fff" },
  SECRETARIA:    { bg: "#3D7A52", color: "#fff" },
  FINANZAS:      { bg: "#E8F4ED", color: "#2D5A3D" },
  VENTAS:        { bg: "#FDF0E0", color: "#A05A0A" },
  MARKETING:     { bg: "#FAE5C8", color: "#8A4A0A" },
  MAESTRO:       { bg: "#D6E8DC", color: "#2D5A3D" },
  ENFERMERIA:    { bg: "#F9EAD6", color: "#A05A0A" },
  CHOFER:        { bg: "#EEF5F0", color: "#3D7A52" },
  REPRESENTANTE: { bg: "#FFF8EE", color: "#A05A0A" },
};

// ── Estilos de input/select reutilizables ────────────────────────────────────
const inputStyle = {
  width: "100%",
  border: `1px solid ${C.border}`,
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "13px",
  outline: "none",
  background: "#fff",
  color: C.text,
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function Input(props) {
  return (
    <input
      {...props}
      style={inputStyle}
      onFocus={e => {
        e.target.style.borderColor = C.verde;
        e.target.style.boxShadow = `0 0 0 3px ${C.verdeLight}`;
      }}
      onBlur={e => {
        e.target.style.borderColor = C.border;
        e.target.style.boxShadow = "none";
      }}
    />
  );
}

function Select({ children, ...props }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        {...props}
        style={{ ...inputStyle, appearance: "none", paddingRight: "32px", cursor: "pointer" }}
        onFocus={e => {
          e.target.style.borderColor = C.verde;
          e.target.style.boxShadow = `0 0 0 3px ${C.verdeLight}`;
        }}
        onBlur={e => {
          e.target.style.borderColor = C.border;
          e.target.style.boxShadow = "none";
        }}
      >
        {children}
      </select>
      <ChevronDown size={14} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: C.textMuted }} />
    </div>
  );
}

function Label({ children }) {
  return (
    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: C.verdeMid, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {children}
    </label>
  );
}

// ── Modal de Usuario ─────────────────────────────────────────────────────────
function ModalUsuario({ usuario, onClose, onGuardado }) {
  const esNuevo = !usuario?.id;
  const [form, setForm] = useState({
    username:            usuario?.username            || "",
    first_name:          usuario?.first_name          || "",
    last_name:           usuario?.last_name           || "",
    email:               usuario?.email               || "",
    rol:                 usuario?.rol                 || "SECRETARIA",
    area:                usuario?.area                || "",
    cedula_identidad:    usuario?.cedula_identidad    || "",
    telefono_emergencia: usuario?.telefono_emergencia || "",
    password: "",
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      const payload = { ...form };
      if (!esNuevo && !payload.password) delete payload.password;
      if (!payload.area) delete payload.area;
      if (esNuevo) await api.post("/usuarios/", payload);
      else         await api.patch(`/usuarios/${usuario.id}/`, payload);
      onGuardado();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : "Error al guardar.");
    } finally {
      setCargando(false);
    }
  };

  const inicial = form.username?.[0] || form.last_name?.[0] || "?";

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
    }}>
      <div style={{
        background: "#fff", borderRadius: "16px",
        width: "100%", maxWidth: "500px",
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(26,58,39,0.18)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px 16px",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "50%",
              background: esNuevo ? C.verdeLight : C.naranjaLight,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "15px", fontWeight: "700",
              color: esNuevo ? C.verde : C.naranja,
            }}>
              {esNuevo ? <Plus size={18} /> : inicial}
            </div>
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>
                {esNuevo ? "Nuevo usuario" : `Editar — ${form.first_name || form.username}`}
              </h2>
              <p style={{ fontSize: "11px", color: C.textMuted, margin: 0 }}>
                {esNuevo ? "Completa los datos del nuevo miembro" : "Modifica los datos del usuario"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: C.textMuted, padding: "4px",
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><Label>Nombres</Label><Input value={form.first_name} onChange={set("first_name")} /></div>
            <div><Label>Apellidos</Label><Input value={form.last_name} onChange={set("last_name")} /></div>
          </div>
          <div><Label>Usuario *</Label><Input required value={form.username} onChange={set("username")} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={set("email")} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <Label>Rol *</Label>
              <Select required value={form.rol} onChange={set("rol")}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Select>
            </div>
            <div>
              <Label>Área</Label>
              <Select value={form.area} onChange={set("area")}>
                <option value="">Sin área</option>
                {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </Select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><Label>Cédula</Label><Input value={form.cedula_identidad} onChange={set("cedula_identidad")} /></div>
            <div><Label>Teléfono</Label><Input value={form.telefono_emergencia} onChange={set("telefono_emergencia")} /></div>
          </div>
          <div>
            <Label>{esNuevo ? "Contraseña *" : "Nueva contraseña (vacío = sin cambio)"}</Label>
            <Input type="password" required={esNuevo} value={form.password} onChange={set("password")} />
          </div>

          {error && (
            <div style={{
              background: "#FEF2F0", border: "1px solid #FBBFB7",
              color: "#C0392B", fontSize: "12px", borderRadius: "8px",
              padding: "10px 12px",
            }}>
              {error}
            </div>
          )}

          {/* Acciones */}
          <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, border: `1px solid ${C.border}`,
              background: "#fff", color: C.textMuted,
              padding: "9px", borderRadius: "9px",
              fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
              transition: "background 0.15s",
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={cargando} style={{
              flex: 1, background: cargando ? C.verdeMid : C.verde,
              color: "#fff", border: "none",
              padding: "9px", borderRadius: "9px",
              fontSize: "13px", fontWeight: "600",
              cursor: cargando ? "not-allowed" : "pointer",
              fontFamily: "inherit", transition: "background 0.15s",
            }}>
              {cargando ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Tabla de usuarios ────────────────────────────────────────────────────────
function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal]       = useState(null);
  const [searchParams]          = useSearchParams();

  const rolesParam = searchParams.get("roles");

  const cargar = async () => {
    setCargando(true);
    try {
      const { data } = await api.get("/usuarios/");
      const lista = data.results || data;
      lista.forEach(u => console.log(u.first_name, "|", u.username)); // ← agrega esto
      setUsuarios(lista);
    } catch {}
    setCargando(false);
  };
  

  useEffect(() => { cargar(); }, []);

  const desactivar = async (id) => {
    if (!confirm("¿Desactivar este usuario?")) return;
    await api.delete(`/usuarios/${id}/`);
    cargar();
  };

  const filtrados = usuarios.filter(u => {
    const matchBusqueda = `${u.first_name} ${u.last_name} ${u.username} ${u.rol}`
      .toLowerCase().includes(busqueda.toLowerCase());
    if (!matchBusqueda) return false;
    if (!rolesParam) return true;
    return rolesParam.split(",").includes(u.rol);
  });

  const tituloArea = rolesParam
    ? rolesParam.includes("REPRESENTANTE") ? "Familias"
      : rolesParam.includes("MAESTRO")     ? "Operativa"
      : "Administrativa"
    : "Todos los usuarios";

  const badge = (rol) => ROL_BADGE[rol] || { bg: C.verdeLight, color: C.verde };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>
            {tituloArea}
          </h1>
          <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>
            {filtrados.length} {filtrados.length === 1 ? "usuario registrado" : "usuarios registrados"}
          </p>
        </div>
        <button
          onClick={() => setModal("nuevo")}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: C.verde, color: "#fff", border: "none", borderRadius: "10px", padding: "9px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}
          onMouseEnter={e => e.currentTarget.style.background = C.verdeDark}
          onMouseLeave={e => e.currentTarget.style.background = C.verde}
        >
          <Plus size={15} />
          Nuevo usuario
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: "14px" }}>
        <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, usuario o rol…"
          style={{ ...inputStyle, paddingLeft: "36px" }}
          onFocus={e => { e.target.style.borderColor = C.verde; e.target.style.boxShadow = `0 0 0 3px ${C.verdeLight}`; }}
          onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
        />
      </div>

      <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {cargando ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px", gap: "12px" }}>
            <div style={{ width: "28px", height: "28px", border: `3px solid ${C.verdeLight}`, borderTop: `3px solid ${C.verde}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ fontSize: "13px", color: C.textMuted }}>Cargando usuarios…</span>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {["Usuario", "Rol", "Estado", ""].map((h, i) => (
                  <th key={i} style={{ padding: "11px 16px", textAlign: i === 3 ? "right" : "left", fontSize: "11px", fontWeight: "600", color: C.verdeMid, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u, idx) => {
                const b = badge(u.rol);
                
                // ==========================================
                // CONTROL DE INICIALES CORREGIDO
                // ==========================================
                const obtenerLetraLimpia = (valor) => {
                  if (!valor) return "";
                  const stringBase = Array.isArray(valor) ? valor[0] : valor;
                  return String(stringBase).trim().charAt(0).toUpperCase();
                };

                const ini = obtenerLetraLimpia(u.first_name) || obtenerLetraLimpia(u.username) || "?";
                // ==========================================

                return (
                  <tr key={u.id}
                    style={{ borderBottom: idx < filtrados.length - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bg}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: C.verdeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: C.verde, flexShrink: 0, overflow: "hidden" }}>
                          {ini}
                        </div>
                        <div>
                          <p style={{ fontWeight: "600", color: C.text, margin: 0 }}>{u.first_name} {u.last_name}</p>
                          <p style={{ fontSize: "11px", color: C.textMuted, margin: 0 }}>@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: b.bg, color: b.color, whiteSpace: "nowrap" }}>
                        {u.rol_display || u.rol}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: u.is_active ? "#E8F5EA" : "#FDECEC", color: u.is_active ? "#2A7A3A" : "#C0392B" }}>
                        {u.is_active ? <><UserCheck size={11} /> Activo</> : <><UserX size={11} /> Inactivo</>}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                        <button onClick={() => setModal(u)} title="Editar"
                          style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "7px", color: C.textMuted, display: "flex" }}
                          onMouseEnter={e => { e.currentTarget.style.background = C.verdeLight; e.currentTarget.style.color = C.verde; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.textMuted; }}
                        >
                          <Edit size={15} />
                        </button>
                        {u.is_active && (
                          <button onClick={() => desactivar(u.id)} title="Desactivar"
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "7px", color: C.textMuted, display: "flex" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#FDECEC"; e.currentTarget.style.color = "#C0392B"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.textMuted; }}
                          >
                            <UserX size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: C.textMuted, fontSize: "13px" }}>
                    {busqueda ? `Sin resultados para "${busqueda}"` : "No hay usuarios en esta sección."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ModalUsuario
          usuario={modal === "nuevo" ? null : modal}
          onClose={() => setModal(null)}
          onGuardado={() => { setModal(null); cargar(); }}
        />
      )}
    </div>
  );
}
function MensajesSuperadmin() {
  const [mensajes, setMensajes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    destinatario: "",
    asunto: "",
    cuerpo: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const set = key => e => {
    setForm({
      ...form,
      [key]: e.target.value,
    });
  };

  const nombreUsuario = u => {
    return (
      u.nombre_completo ||
      `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
      u.username ||
      u.email ||
      "Usuario"
    );
  };

  const cargarTodo = async endpoint => {
    let url = endpoint;
    let todos = [];

    while (url) {
      const { data } = await api.get(url);

      if (data.results) {
        todos = [...todos, ...data.results];

        if (data.next) {
          const nextUrl = new URL(data.next);
          url = nextUrl.pathname.replace("/api/v1", "") + nextUrl.search;
        } else {
          url = null;
        }
      } else {
        todos = Array.isArray(data) ? data : [];
        url = null;
      }
    }

    return todos;
  };

  const cargar = async () => {
    setCargando(true);
    setError(null);

    try {
      const [mensajesData, usuariosData] = await Promise.all([
        cargarTodo("/comunicacion/mensajes/"),
        cargarTodo("/comunicacion/destinatarios/"),
      ]);

      setMensajes(mensajesData);
      setUsuarios(usuariosData);
    } catch (err) {
      console.error("Error cargando mensajes:", err.response?.data || err);
      setError("No se pudieron cargar los mensajes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const enviar = async e => {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    try {
      await api.post("/comunicacion/mensajes/", form);

      setModal(false);
      setForm({
        destinatario: "",
        asunto: "",
        cuerpo: "",
      });

      cargar();
    } catch (err) {
      console.error("Error enviando mensaje:", err.response?.data || err);
      setError("No se pudo enviar el mensaje.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>
            Mensajes
          </h1>
          <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>
            {mensajes.filter(m => !m.leido).length} mensajes sin leer
          </p>
        </div>

        <button
          onClick={() => setModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: C.verde,
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "9px 16px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <Plus size={15} />
          Nuevo mensaje
        </button>
      </div>

      {error && (
        <div style={{ background: "#FDECEC", color: "#C0392B", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", marginBottom: "14px" }}>
          {error}
        </div>
      )}

      {modal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 20px 60px rgba(26,58,39,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 22px 16px",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MessageSquare size={18} color={C.verde} />
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>
                  Nuevo mensaje
                </h2>
              </div>

              <button
                onClick={() => setModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={enviar}
              style={{
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div>
                <Label>Para</Label>
                <Select required value={form.destinatario} onChange={set("destinatario")}>
                  <option value="">Seleccionar destinatario…</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>
                      {nombreUsuario(u)} ({u.rol_display || u.rol})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Asunto</Label>
                <Input required value={form.asunto} onChange={set("asunto")} />
              </div>

              <div>
                <Label>Mensaje</Label>
                <textarea
                  required
                  rows={4}
                  value={form.cuerpo}
                  onChange={set("cuerpo")}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  style={{
                    flex: 1,
                    border: `1px solid ${C.border}`,
                    background: "#fff",
                    color: C.textMuted,
                    padding: "9px",
                    borderRadius: "9px",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={enviando || usuarios.length === 0}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    background: enviando || usuarios.length === 0 ? C.verdeMid : C.verde,
                    color: "#fff",
                    border: "none",
                    padding: "9px",
                    borderRadius: "9px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: enviando || usuarios.length === 0 ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <Send size={14} />
                  {enviando ? "Enviando…" : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {cargando ? (
          <div style={{ padding: "48px", textAlign: "center", color: C.textMuted, fontSize: "13px" }}>
            Cargando mensajes…
          </div>
        ) : mensajes.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: C.textMuted, fontSize: "13px" }}>
            No tienes mensajes.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {mensajes.map(m => (
              <div
                key={m.id}
                style={{
                  borderBottom: `1px solid ${C.border}`,
                  borderLeft: !m.leido ? `4px solid ${C.naranja}` : "4px solid transparent",
                  padding: "14px 18px",
                }}
              >
                <p style={{ fontSize: "14px", fontWeight: !m.leido ? "700" : "600", color: C.text, margin: "0 0 4px" }}>
                  {m.asunto}
                </p>

                <p style={{ fontSize: "11px", color: C.textMuted, margin: "0 0 8px" }}>
                  De: {m.remitente_nombre || "—"} · {m.fecha ? new Date(m.fecha).toLocaleDateString("es-EC") : "—"}
                </p>

                <p style={{ fontSize: "13px", color: C.verdeMid, margin: 0 }}>
                  {m.cuerpo}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// ── Página principal ─────────────────────────────────────────────────────────
export default function SuperadminPage() {
  return (
    <MainLayout>
      <Routes>
        <Route index element={<GestionUsuarios />} />
        <Route path="usuarios" element={<GestionUsuarios />} />
        <Route path="mensajes" element={<MensajesSuperadmin />} />
      </Routes>
    </MainLayout>
  );
}