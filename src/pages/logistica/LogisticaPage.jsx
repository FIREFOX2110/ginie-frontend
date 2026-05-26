import { useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

import {
  Bus,
  CheckCircle,
  ChevronDown,
  ExternalLink,
  MapPin,
  Plus,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";

const C = {
  verde: "#2D5A3D",
  verdeDark: "#1A3A27",
  verdeLight: "#E8F4ED",
  verdeMid: "#5A7A68",
  naranja: "#D4821A",
  naranjaLight: "#FEF3E2",
  border: "#D6E8DC",
  bg: "#F4F9F6",
  text: "#1A3A27",
  textMuted: "#6B8F78",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  success: "#16A34A",
  successLight: "#DCFCE7",
  warning: "#CA8A04",
  warningLight: "#FEF9C3",
};

const iStyle = {
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
};

const focusOn = e => {
  e.target.style.borderColor = C.verde;
  e.target.style.boxShadow = `0 0 0 3px ${C.verdeLight}`;
};

const focusOff = e => {
  e.target.style.borderColor = C.border;
  e.target.style.boxShadow = "none";
};

async function cargarTodo(endpoint) {
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
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px", gap: "12px" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div
        style={{
          width: "26px",
          height: "26px",
          border: `3px solid ${C.verdeLight}`,
          borderTop: `3px solid ${C.verde}`,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span style={{ fontSize: "13px", color: C.textMuted }}>Cargando…</span>
    </div>
  );
}

function Badge({ bg, color, children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "700",
        background: bg,
        color,
      }}
    >
      {children}
    </span>
  );
}

function PageHeader({ titulo, subtitulo, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", marginBottom: "22px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>
          {titulo}
        </h1>
        {subtitulo && <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>{subtitulo}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 0", color: C.textMuted }}>
      <Icon size={48} color={C.border} style={{ marginBottom: "16px" }} />
      <p style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: "0 0 4px" }}>{title}</p>
      <p style={{ fontSize: "13px", margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function Modal({ titulo, onClose, children, maxW = "520px" }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 60,
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
          maxWidth: maxW,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(26,58,39,0.18)",
        }}
      >
        <div
          style={{
            padding: "18px 22px 16px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 1,
          }}
        >
          <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>{titulo}</h2>

          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "20px 22px" }}>{children}</div>
      </div>
    </div>
  );
}

function Lbl({ children }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "11px",
        fontWeight: "700",
        color: C.verdeMid,
        marginBottom: "5px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </label>
  );
}

function Inp(props) {
  return <input {...props} style={iStyle} onFocus={focusOn} onBlur={focusOff} />;
}

function Textarea(props) {
  return <textarea {...props} style={{ ...iStyle, resize: "vertical" }} onFocus={focusOn} onBlur={focusOff} />;
}

function Sel({ children, ...props }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        {...props}
        style={{ ...iStyle, appearance: "none", paddingRight: "32px", cursor: "pointer" }}
        onFocus={focusOn}
        onBlur={focusOff}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        style={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          color: C.textMuted,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function BtnPrimary({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        background: props.disabled ? C.verdeMid : C.verde,
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        padding: "9px 14px",
        fontSize: "13px",
        fontWeight: "700",
        cursor: props.disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function BtnCancel({ children, ...props }) {
  return (
    <button
      {...props}
      type="button"
      style={{
        border: `1px solid ${C.border}`,
        background: "#fff",
        color: C.textMuted,
        padding: "9px 14px",
        borderRadius: "10px",
        fontSize: "13px",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function nombreUsuario(u) {
  return (
    u.nombre_completo ||
    `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
    u.username ||
    u.email ||
    "Usuario"
  );
}

function MiRuta() {
  const [ruta, setRuta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState({});
  const [registrados, setRegistrados] = useState({});
  const [recorrido, setRecorrido] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);

    try {
      const rutaData = await api.get("/logistica/mi-ruta/");
      setRuta(rutaData.data);

      const recorridoData = await api.get("/logistica/mi-ruta/recorrido/");
      setRecorrido(recorridoData.data);

      const hoy = new Date().toISOString().slice(0, 10);
      const asistencias = await cargarTodo(`/logistica/asistencias/?ruta=${rutaData.data.id}&fecha=${hoy}`);

      const mapa = {};
      asistencias.forEach(a => {
        mapa[a.estudiante] = a.subio_al_bus;
      });

      setRegistrados(mapa);
    } catch (err) {
      console.error("Error cargando mi ruta:", err.response?.data || err);
      setError("No tienes una ruta activa asignada.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const registrarAsistencia = async (estudianteId, subio) => {
    setGuardando(prev => ({ ...prev, [estudianteId]: true }));

    try {
      await api.post("/logistica/asistencias/", {
        ruta: ruta.id,
        estudiante: estudianteId,
        subio_al_bus: subio,
        entregado_en_casa: subio,
      });

      setRegistrados(prev => ({ ...prev, [estudianteId]: subio }));
    } catch (err) {
      console.error("Error registrando asistencia:", err.response?.data || err);

      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "No se pudo registrar la asistencia.";

      alert(msg);
    } finally {
      setGuardando(prev => ({ ...prev, [estudianteId]: false }));
    }
  };

  if (cargando) return <Spinner />;

  if (error) {
    return (
      <EmptyState
        icon={Bus}
        title="Ruta no asignada"
        subtitle={error}
      />
    );
  }

  const hoy = new Date().toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div
        style={{
          background: C.verde,
          borderRadius: "14px",
          padding: "20px 24px",
          marginBottom: "22px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Bus size={24} color="#fff" />
        </div>

        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#fff", margin: "0 0 4px" }}>
            {ruta.nombre}
          </h1>

          <p style={{ fontSize: "12px", color: "#8FB89F", margin: 0 }}>
            Capacidad: {ruta.capacidad} · {ruta.estudiantes?.length || 0} estudiantes asignados
          </p>
        </div>
      </div>

      {recorrido && (
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            border: `1px solid ${C.border}`,
            padding: "16px 18px",
            marginBottom: "22px",
            boxShadow: "0 1px 3px rgba(26,58,39,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "14px",
              marginBottom: "14px",
            }}
          >
            <div>
              <p style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>
                Recorrido del bus
              </p>

              <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>
                {recorrido.total_paradas} paradas ordenadas por recorrido
              </p>
            </div>

            {recorrido.google_maps_url && (
              <a
                href={recorrido.google_maps_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: C.verde,
                  color: "#fff",
                  borderRadius: "9px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  fontWeight: "700",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <ExternalLink size={14} />
                Abrir Maps
              </a>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recorrido.paradas.map(p => (
              <div
                key={`${p.estudiante_id}-${p.orden}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    background: C.naranjaLight,
                    color: "#8A4A0A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "700",
                    marginTop: "2px",
                  }}
                >
                  {p.orden}
                </div>

                <div
                  style={{
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: "10px",
                    padding: "10px 12px",
                  }}
                >
                  <p style={{ fontSize: "13px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>
                    {p.estudiante}
                  </p>

                  <p
                    style={{
                      fontSize: "12px",
                      color: C.textMuted,
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <MapPin size={12} />
                    {p.direccion}
                  </p>
                </div>
              </div>
            ))}

            {recorrido.paradas.length === 0 && (
              <p style={{ fontSize: "13px", color: C.textMuted, margin: 0, textAlign: "center", padding: "18px 0" }}>
                No hay paradas registradas para esta ruta.
              </p>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <Users size={16} color={C.verdeMid} />
        <p
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: C.verdeMid,
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Lista de hoy — {hoy}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {ruta.estudiantes?.map(asig => {
          const reg = registrados[asig.estudiante];
          const yaRegistrado = reg !== undefined;

          return (
            <div
              key={asig.id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: `1px solid ${C.border}`,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                borderLeft: yaRegistrado
                  ? `4px solid ${reg ? C.verde : C.danger}`
                  : `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    background: C.verdeLight,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: C.verde,
                    flexShrink: 0,
                  }}
                >
                  {asig.estudiante_detalle?.nombres?.[0] || "?"}
                </div>

                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: "700", color: C.text, margin: 0, fontSize: "14px" }}>
                    {asig.estudiante_detalle?.apellidos} {asig.estudiante_detalle?.nombres}
                  </p>

                  <p
                    style={{
                      fontSize: "11px",
                      color: C.textMuted,
                      margin: "2px 0 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <MapPin size={10} />
                    Parada #{asig.orden_parada}
                    {asig.direccion_casa && ` — ${asig.direccion_casa}`}
                  </p>
                </div>
              </div>

              {yaRegistrado ? (
                <Badge bg={reg ? C.successLight : C.dangerLight} color={reg ? C.success : C.danger}>
                  {reg ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {reg ? "Subió" : "No subió"}
                </Badge>
              ) : (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => registrarAsistencia(asig.estudiante, true)}
                    disabled={guardando[asig.estudiante]}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      background: C.successLight,
                      color: C.success,
                      border: "none",
                      borderRadius: "9px",
                      padding: "7px 12px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: guardando[asig.estudiante] ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      opacity: guardando[asig.estudiante] ? 0.5 : 1,
                    }}
                  >
                    <CheckCircle size={13} />
                    Subió
                  </button>

                  <button
                    onClick={() => registrarAsistencia(asig.estudiante, false)}
                    disabled={guardando[asig.estudiante]}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      background: C.dangerLight,
                      color: C.danger,
                      border: "none",
                      borderRadius: "9px",
                      padding: "7px 12px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: guardando[asig.estudiante] ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      opacity: guardando[asig.estudiante] ? 0.5 : 1,
                    }}
                  >
                    <XCircle size={13} />
                    No subió
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {(!ruta.estudiantes || ruta.estudiantes.length === 0) && (
          <div style={{ textAlign: "center", padding: "40px", color: C.textMuted, fontSize: "13px" }}>
            No hay estudiantes asignados a esta ruta.
          </div>
        )}
      </div>
    </div>
  );
}

function ModalRuta({ choferes, onClose, onGuardado }) {
  const [form, setForm] = useState({
    nombre: "",
    chofer: "",
    capacidad: 15,
    activa: true,
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const set = key => e => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const guardar = async e => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const payload = {
        nombre: form.nombre,
        chofer: form.chofer || null,
        capacidad: Number(form.capacidad || 15),
        activa: form.activa,
      };

      await api.post("/logistica/rutas/", payload);
      onGuardado();
    } catch (err) {
      console.error("Error creando ruta:", err.response?.data || err);
      setError("No se pudo crear la ruta. Revisa permisos y datos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal titulo="Nueva ruta de transporte" onClose={onClose}>
      <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <Lbl>Nombre de ruta *</Lbl>
          <Inp required value={form.nombre} onChange={set("nombre")} placeholder="Ej. Ruta Norte" />
        </div>

        <div>
          <Lbl>Chofer asignado</Lbl>
          <Sel value={form.chofer} onChange={set("chofer")}>
            <option value="">Sin asignar</option>
            {choferes.map(ch => (
              <option key={ch.id} value={ch.id}>
                {nombreUsuario(ch)} · {ch.email}
              </option>
            ))}
          </Sel>
        </div>

        <div>
          <Lbl>Capacidad *</Lbl>
          <Inp required type="number" min="1" value={form.capacidad} onChange={set("capacidad")} />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: C.text }}>
          <input
            type="checkbox"
            checked={form.activa}
            onChange={set("activa")}
            style={{ width: "15px", height: "15px", accentColor: C.verde }}
          />
          Ruta activa
        </label>

        {error && (
          <div style={{ background: C.dangerLight, color: C.danger, borderRadius: "8px", padding: "10px 12px", fontSize: "12px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <BtnCancel onClick={onClose}>Cancelar</BtnCancel>
          <BtnPrimary type="submit" disabled={cargando}>
            {cargando ? "Guardando..." : "Guardar ruta"}
          </BtnPrimary>
        </div>
      </form>
    </Modal>
  );
}

function ModalAsignacion({ ruta, estudiantes, asignaciones, onClose, onGuardado }) {
  const [form, setForm] = useState({
    estudiante: "",
    direccion_casa: "",
    orden_parada: (asignaciones.length || 0) + 1,
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const estudiantesAsignadosIds = new Set(asignaciones.map(a => String(a.estudiante)));

  const disponibles = estudiantes.filter(e => !estudiantesAsignadosIds.has(String(e.id)));

  const set = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const guardar = async e => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      await api.post("/logistica/asignaciones/", {
        estudiante: form.estudiante,
        ruta: ruta.id,
        direccion_casa: form.direccion_casa,
        orden_parada: Number(form.orden_parada || 1),
      });

      onGuardado();
    } catch (err) {
      console.error("Error asignando estudiante:", err.response?.data || err);
      setError("No se pudo asignar el estudiante. Puede que ya tenga una ruta asignada.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal titulo={`Asignar estudiante a ${ruta.nombre}`} onClose={onClose} maxW="620px">
      <div style={{ marginBottom: "16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "12px 14px" }}>
        <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: C.text }}>
          Estudiantes actuales: {asignaciones.length} / {ruta.capacidad}
        </p>
        <p style={{ margin: 0, fontSize: "12px", color: C.textMuted }}>
          Define dirección y orden de parada para el recorrido del bus.
        </p>
      </div>

      <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <Lbl>Estudiante *</Lbl>
          <Sel required value={form.estudiante} onChange={set("estudiante")}>
            <option value="">Seleccionar estudiante...</option>
            {disponibles.map(e => (
              <option key={e.id} value={e.id}>
                {e.nombre_completo || `${e.apellidos || ""} ${e.nombres || ""}`.trim()}
              </option>
            ))}
          </Sel>
          {disponibles.length === 0 && (
            <p style={{ fontSize: "11px", color: C.textMuted, margin: "6px 0 0" }}>
              No hay estudiantes disponibles para asignar.
            </p>
          )}
        </div>

        <div>
          <Lbl>Dirección de casa *</Lbl>
          <Textarea
            required
            rows={3}
            value={form.direccion_casa}
            onChange={set("direccion_casa")}
            placeholder="Ej. Av. Galo Plaza Lasso, Quito"
          />
        </div>

        <div>
          <Lbl>Orden de parada *</Lbl>
          <Inp required type="number" min="1" value={form.orden_parada} onChange={set("orden_parada")} />
        </div>

        {error && (
          <div style={{ background: C.dangerLight, color: C.danger, borderRadius: "8px", padding: "10px 12px", fontSize: "12px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <BtnCancel onClick={onClose}>Cancelar</BtnCancel>
          <BtnPrimary type="submit" disabled={cargando || disponibles.length === 0}>
            {cargando ? "Asignando..." : "Asignar estudiante"}
          </BtnPrimary>
        </div>
      </form>
    </Modal>
  );
}

function ListaRutas() {
  const [rutas, setRutas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalRuta, setModalRuta] = useState(false);
  const [modalAsignacion, setModalAsignacion] = useState(null);
  const [cargandoAsignaciones, setCargandoAsignaciones] = useState(false);

  const cargar = async () => {
    setCargando(true);

    try {
      const [rutasData, usuariosData, estudiantesData] = await Promise.all([
        cargarTodo("/logistica/rutas/"),
        cargarTodo("/usuarios/"),
        cargarTodo("/academico/estudiantes/resumen/"),
      ]);

      setRutas(rutasData);
      setUsuarios(usuariosData);
      setEstudiantes(estudiantesData);
    } catch (err) {
      console.error("Error cargando logística:", err.response?.data || err);
      setRutas([]);
      setUsuarios([]);
      setEstudiantes([]);
    } finally {
      setCargando(false);
    }
  };

  const abrirAsignacion = async ruta => {
    setModalAsignacion(ruta);
    setCargandoAsignaciones(true);

    try {
      const data = await cargarTodo(`/logistica/asignaciones/?ruta=${ruta.id}`);
      setAsignaciones(data);
    } catch (err) {
      console.error("Error cargando asignaciones:", err.response?.data || err);
      setAsignaciones([]);
    } finally {
      setCargandoAsignaciones(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const choferes = usuarios.filter(u => u.rol === "CHOFER");

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();

    if (!q) return rutas;

    return rutas.filter(r =>
      `${r.nombre || ""} ${r.chofer_nombre || ""}`.toLowerCase().includes(q)
    );
  }, [rutas, busqueda]);

  return (
    <div>
      <PageHeader
        titulo="Rutas de transporte"
        subtitulo={`${rutas.length} rutas registradas`}
        action={
          <BtnPrimary onClick={() => setModalRuta(true)}>
            <Plus size={15} />
            Nueva ruta
          </BtnPrimary>
        }
      />

      <div style={{ position: "relative", marginBottom: "16px", width: "min(100%, 340px)" }}>
        <Search
          size={15}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: C.textMuted,
          }}
        />

        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar ruta o chofer..."
          style={{ ...iStyle, paddingLeft: "36px" }}
          onFocus={focusOn}
          onBlur={focusOff}
        />
      </div>

      {cargando ? (
        <Spinner />
      ) : filtradas.length === 0 ? (
        <EmptyState icon={Bus} title="No hay rutas registradas" subtitle="Crea rutas y asigna estudiantes desde este panel." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {filtradas.map(r => {
            const porcentaje = r.capacidad > 0
              ? Math.min((r.total_estudiantes / r.capacidad) * 100, 100)
              : 0;

            return (
              <div
                key={r.id}
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  border: `1px solid ${C.border}`,
                  padding: "18px 20px",
                  boxShadow: "0 1px 3px rgba(26,58,39,0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "11px",
                      background: r.activa ? C.verde : C.border,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Bus size={20} color="#fff" />
                  </div>

                  <div>
                    <p style={{ fontWeight: "700", color: C.text, margin: "0 0 4px" }}>
                      {r.nombre}
                    </p>

                    <Badge bg={r.activa ? C.successLight : C.dangerLight} color={r.activa ? C.success : C.danger}>
                      {r.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "7px", fontSize: "13px", color: C.textMuted }}>
                  <p style={{ margin: 0 }}>
                    Chofer:{" "}
                    <span style={{ color: C.text, fontWeight: "700" }}>
                      {r.chofer_nombre || "Sin asignar"}
                    </span>
                  </p>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                      <p style={{ margin: 0 }}>
                        Estudiantes:{" "}
                        <span style={{ color: C.text, fontWeight: "700" }}>
                          {r.total_estudiantes}
                        </span>{" "}
                        / {r.capacidad}
                      </p>

                      <span style={{ fontSize: "11px", color: C.textMuted }}>
                        {r.cupos_disponibles ?? Math.max(r.capacidad - r.total_estudiantes, 0)} cupos
                      </span>
                    </div>

                    <div style={{ height: "6px", width: "100%", background: C.verdeLight, borderRadius: "3px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${porcentaje}%`,
                          background: C.verde,
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "14px", paddingTop: "12px", borderTop: `1px solid ${C.border}` }}>
                  <button
                    onClick={() => abrirAsignacion(r)}
                    style={{
                      flex: 1,
                      border: "none",
                      background: C.verdeLight,
                      color: C.verde,
                      borderRadius: "9px",
                      padding: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Asignar estudiante
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalRuta && (
        <ModalRuta
          choferes={choferes}
          onClose={() => setModalRuta(false)}
          onGuardado={() => {
            setModalRuta(false);
            cargar();
          }}
        />
      )}

      {modalAsignacion && (
        cargandoAsignaciones ? (
          <Modal titulo="Cargando asignaciones..." onClose={() => setModalAsignacion(null)}>
            <Spinner />
          </Modal>
        ) : (
          <ModalAsignacion
            ruta={modalAsignacion}
            estudiantes={estudiantes}
            asignaciones={asignaciones}
            onClose={() => setModalAsignacion(null)}
            onGuardado={async () => {
              await abrirAsignacion(modalAsignacion);
              cargar();
            }}
          />
        )
      )}
    </div>
  );
}

function ListaAsistencias() {
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const cargar = async () => {
    setCargando(true);

    try {
      const data = await cargarTodo("/logistica/asistencias/");
      setAsistencias(data);
    } catch (err) {
      console.error("Error cargando asistencias:", err.response?.data || err);
      setAsistencias([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();

    if (!q) return asistencias;

    return asistencias.filter(a =>
      `${a.estudiante_detalle?.nombre_completo || ""} ${a.estudiante_detalle?.nombres || ""} ${a.estudiante_detalle?.apellidos || ""} ${a.ruta_nombre || ""} ${a.observaciones || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [asistencias, busqueda]);

  return (
    <div>
      <PageHeader titulo="Historial de asistencias" subtitulo={`${asistencias.length} registros`} />

      <div style={{ position: "relative", marginBottom: "16px", width: "min(100%, 340px)" }}>
        <Search
          size={15}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: C.textMuted,
          }}
        />

        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar estudiante o ruta..."
          style={{ ...iStyle, paddingLeft: "36px" }}
          onFocus={focusOn}
          onBlur={focusOff}
        />
      </div>

      <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {cargando ? (
          <Spinner />
        ) : filtradas.length === 0 ? (
          <EmptyState icon={CheckCircle} title="Sin asistencias" subtitle="Las asistencias registradas por el chofer aparecerán aquí." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "820px" }}>
              <thead>
                <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                  {["Estudiante", "Ruta", "Fecha", "Subió al bus", "Entregado en casa", "Observaciones"].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: C.verdeMid,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtradas.map((a, idx) => (
                  <tr
                    key={a.id}
                    style={{ borderBottom: idx < filtradas.length - 1 ? `1px solid ${C.border}` : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: C.text }}>
                      {a.estudiante_detalle?.nombre_completo ||
                        `${a.estudiante_detalle?.apellidos || ""} ${a.estudiante_detalle?.nombres || ""}`.trim() ||
                        "—"}
                    </td>

                    <td style={{ padding: "12px 16px", color: C.textMuted }}>
                      {a.ruta_nombre || "—"}
                    </td>

                    <td style={{ padding: "12px 16px", color: C.textMuted, fontSize: "12px" }}>
                      {a.fecha || "—"}
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <Badge bg={a.subio_al_bus ? C.successLight : C.dangerLight} color={a.subio_al_bus ? C.success : C.danger}>
                        {a.subio_al_bus ? <CheckCircle size={11} /> : <XCircle size={11} />}
                        {a.subio_al_bus ? "Sí" : "No"}
                      </Badge>
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <Badge bg={a.entregado_en_casa ? C.successLight : C.bg} color={a.entregado_en_casa ? C.success : C.textMuted}>
                        {a.entregado_en_casa ? "Sí" : "No"}
                      </Badge>
                    </td>

                    <td style={{ padding: "12px 16px", color: C.textMuted, fontSize: "12px" }}>
                      {a.observaciones || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LogisticaPage() {
  const { usuario } = useAuthStore();
  const esChofer = usuario?.rol === "CHOFER";

  return (
    <MainLayout>
      <Routes>
        <Route index element={esChofer ? <MiRuta /> : <ListaRutas />} />
        <Route path="mi-ruta" element={<MiRuta />} />
        <Route path="asistencias" element={<ListaAsistencias />} />
        <Route path="rutas" element={<ListaRutas />} />
      </Routes>
    </MainLayout>
  );
}
