import { useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../api/axios";

import {
  CheckCircle,
  ChevronDown,
  FileCheck,
  Megaphone,
  Phone,
  Plus,
  Search,
  User,
  UserPlus,
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
  warning: "#CA8A04",
  warningLight: "#FEF9C3",
  success: "#16A34A",
  successLight: "#DCFCE7",
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
    <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
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
    </div>
  );
}

function Badge({ bg, color, children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
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

function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>
        {title}
      </h1>
      <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function Inp(p) {
  return <input {...p} style={iStyle} onFocus={focusOn} onBlur={focusOff} />;
}

function Textarea(p) {
  return (
    <textarea
      {...p}
      style={{ ...iStyle, resize: "vertical" }}
      onFocus={focusOn}
      onBlur={focusOff}
    />
  );
}

function Sel({ children, ...p }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        {...p}
        style={{ ...iStyle, appearance: "none", paddingRight: "30px", cursor: "pointer" }}
        onFocus={focusOn}
        onBlur={focusOff}
      >
        {children}
      </select>
      <ChevronDown
        size={13}
        style={{
          position: "absolute",
          right: "9px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: C.textMuted,
        }}
      />
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

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", padding: "54px 0", color: C.textMuted }}>
      <Icon size={42} color={C.border} style={{ marginBottom: "12px" }} />
      <p style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: "0 0 4px" }}>
        {title}
      </p>
      <p style={{ fontSize: "13px", margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function Modal({ titulo, subtitulo, icon: Icon, onClose, children, maxW = "500px" }) {
  return (
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
          maxWidth: maxW,
          maxHeight: "90vh",
          overflowY: "auto",
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
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: C.naranjaLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {Icon && <Icon size={18} color={C.naranja} />}
            </div>

            <div>
              <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>
                {titulo}
              </h2>
              {subtitulo && (
                <p style={{ fontSize: "11px", color: C.textMuted, margin: 0 }}>{subtitulo}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "20px 22px" }}>{children}</div>
      </div>
    </div>
  );
}

function BtnPrimary({ children, ...p }) {
  return (
    <button
      {...p}
      style={{
        flex: 1,
        background: p.disabled ? C.verdeMid : C.verde,
        color: "#fff",
        border: "none",
        padding: "9px",
        borderRadius: "9px",
        fontSize: "13px",
        fontWeight: "700",
        cursor: p.disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function BtnCancel({ children, ...p }) {
  return (
    <button
      {...p}
      type="button"
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
      {children}
    </button>
  );
}

const ESTADO_STYLE = {
  NUEVO: { bg: C.verdeLight, color: C.verde },
  CONTACTADO: { bg: C.warningLight, color: C.warning },
  MATRICULADO: { bg: C.successLight, color: C.success },
  PERDIDO: { bg: C.dangerLight, color: C.danger },
};

const ESTADO_LABELS = {
  NUEVO: "Nuevo interesado",
  CONTACTADO: "En seguimiento",
  MATRICULADO: "Matriculado",
  PERDIDO: "No interesado",
};

function ModalProspecto({ prospecto, onClose, onGuardado }) {
  const esNuevo = !prospecto?.id;

  const [form, setForm] = useState({
    nombre_padre: prospecto?.nombre_padre || "",
    telefono: prospecto?.telefono || "",
    nombre_nino: prospecto?.nombre_nino || "",
    edad_nino: prospecto?.edad_nino || "",
    estado: prospecto?.estado || "NUEVO",
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const guardar = async e => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const payload = { ...form };

      if (!payload.edad_nino && payload.edad_nino !== 0) {
        delete payload.edad_nino;
      } else {
        payload.edad_nino = Number(payload.edad_nino);
      }

      if (!payload.nombre_nino) delete payload.nombre_nino;

      if (esNuevo) {
        await api.post("/marketing/prospectos/", payload);
      } else {
        await api.patch(`/marketing/prospectos/${prospecto.id}/`, payload);
      }

      onGuardado();
    } catch (err) {
      console.error("Error guardando prospecto:", err.response?.data || err);
      setError("No se pudo guardar el prospecto.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      titulo={esNuevo ? "Nuevo prospecto" : "Editar prospecto"}
      subtitulo={esNuevo ? "Registra una familia interesada" : form.nombre_padre}
      icon={UserPlus}
      onClose={onClose}
    >
      <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <Lbl>Nombre del padre / tutor *</Lbl>
          <Inp required value={form.nombre_padre} onChange={set("nombre_padre")} />
        </div>

        <div>
          <Lbl>Teléfono *</Lbl>
          <Inp required type="tel" value={form.telefono} onChange={set("telefono")} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <Lbl>Nombre del niño</Lbl>
            <Inp value={form.nombre_nino} onChange={set("nombre_nino")} />
          </div>

          <div>
            <Lbl>Edad</Lbl>
            <Inp type="number" min="0" max="10" value={form.edad_nino} onChange={set("edad_nino")} />
          </div>
        </div>

        <div>
          <Lbl>Estado</Lbl>
          <Sel value={form.estado} onChange={set("estado")}>
            {Object.entries(ESTADO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Sel>
        </div>

        {error && (
          <div style={{ background: C.dangerLight, color: C.danger, fontSize: "12px", borderRadius: "8px", padding: "10px 12px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <BtnCancel onClick={onClose}>Cancelar</BtnCancel>
          <BtnPrimary type="submit" disabled={cargando}>
            {cargando ? "Guardando…" : "Guardar"}
          </BtnPrimary>
        </div>
      </form>
    </Modal>
  );
}

function Prospectos() {
  const [prospectos, setProspectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [modal, setModal] = useState(null);

  const cargar = async () => {
    setCargando(true);

    try {
      const params = filtroEstado ? `?estado=${filtroEstado}` : "";
      const data = await cargarTodo(`/marketing/prospectos/${params}`);
      setProspectos(data);
    } catch (err) {
      console.error("Error cargando prospectos:", err.response?.data || err);
      setProspectos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [filtroEstado]);

  const eliminar = async id => {
    if (!confirm("¿Eliminar este prospecto?")) return;

    try {
      await api.delete(`/marketing/prospectos/${id}/`);
      cargar();
    } catch (err) {
      console.error("Error eliminando prospecto:", err.response?.data || err);
    }
  };

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();

    if (!q) return prospectos;

    return prospectos.filter(p =>
      `${p.nombre_padre || ""} ${p.telefono || ""} ${p.nombre_nino || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [prospectos, busqueda]);

  const conteos = Object.fromEntries(
    Object.keys(ESTADO_STYLE).map(estado => [
      estado,
      prospectos.filter(p => p.estado === estado).length,
    ])
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "22px",
          gap: "16px",
        }}
      >
        <SectionTitle title="Prospectos" subtitle={`${prospectos.length} familias interesadas`} />

        <button
          onClick={() => setModal("nuevo")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: C.naranja,
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "9px 16px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#A05A0A")}
          onMouseLeave={e => (e.currentTarget.style.background = C.naranja)}
        >
          <Plus size={15} />
          Nuevo prospecto
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
          gap: "10px",
          marginBottom: "18px",
        }}
      >
        {Object.entries(conteos).map(([estado, count]) => {
          const s = ESTADO_STYLE[estado];
          const activo = filtroEstado === estado;

          return (
            <button
              key={estado}
              onClick={() => setFiltroEstado(activo ? "" : estado)}
              style={{
                padding: "14px",
                borderRadius: "12px",
                border: activo ? `2px solid ${C.naranja}` : `1px solid ${C.border}`,
                background: activo ? C.naranjaLight : "#fff",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.15s",
                fontFamily: "inherit",
              }}
            >
              <p style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 4px" }}>
                {count}
              </p>

              <Badge bg={s.bg} color={s.color}>
                {ESTADO_LABELS[estado]}
              </Badge>
            </button>
          );
        })}
      </div>

      <div style={{ position: "relative", marginBottom: "16px" }}>
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
          placeholder="Buscar por padre, teléfono o niño…"
          style={{ ...iStyle, paddingLeft: "36px" }}
          onFocus={focusOn}
          onBlur={focusOff}
        />
      </div>

      {cargando ? (
        <Spinner />
      ) : filtrados.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No hay prospectos"
          subtitle={busqueda ? `Sin resultados para "${busqueda}"` : "Registra familias interesadas para hacer seguimiento."}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
          {filtrados.map(p => {
            const s = ESTADO_STYLE[p.estado] || ESTADO_STYLE.NUEVO;

            return (
              <div
                key={p.id}
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  border: `1px solid ${C.border}`,
                  padding: "16px 18px",
                  boxShadow: "0 1px 3px rgba(26,58,39,0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        background: C.naranjaLight,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <User size={16} color={C.naranja} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: "700", color: C.text, fontSize: "14px", margin: 0 }}>
                        {p.nombre_padre}
                      </p>

                      <p
                        style={{
                          fontSize: "11px",
                          color: C.textMuted,
                          margin: "2px 0 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        <Phone size={10} />
                        {p.telefono}
                      </p>
                    </div>
                  </div>

                  <Badge bg={s.bg} color={s.color}>
                    {p.estado_display || ESTADO_LABELS[p.estado] || p.estado}
                  </Badge>
                </div>

                {p.nombre_nino && (
                  <p style={{ fontSize: "13px", color: C.verdeMid, margin: "0 0 6px" }}>
                    Niño/a: <strong>{p.nombre_nino}</strong>
                    {p.edad_nino ? ` · ${p.edad_nino} años` : ""}
                  </p>
                )}

                <p style={{ fontSize: "11px", color: C.textMuted, margin: "0 0 12px" }}>
                  Registrado: {p.fecha_registro || "—"}
                </p>

                <div style={{ display: "flex", gap: "8px", paddingTop: "10px", borderTop: `1px solid ${C.border}` }}>
                  <button
                    onClick={() => setModal(p)}
                    style={{
                      flex: 1,
                      fontSize: "12px",
                      fontWeight: "700",
                      color: C.verde,
                      background: C.verdeLight,
                      border: "none",
                      borderRadius: "8px",
                      padding: "7px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminar(p.id)}
                    style={{
                      flex: 1,
                      fontSize: "12px",
                      fontWeight: "700",
                      color: C.danger,
                      background: C.dangerLight,
                      border: "none",
                      borderRadius: "8px",
                      padding: "7px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <ModalProspecto
          prospecto={modal === "nuevo" ? null : modal}
          onClose={() => setModal(null)}
          onGuardado={() => {
            setModal(null);
            cargar();
          }}
        />
      )}
    </div>
  );
}

function ModalConsentimiento({ estudiantes, onClose, onGuardado }) {
  const hoy = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    estudiante: "",
    autoriza_redes_sociales: false,
    fecha_firma: hoy,
    observaciones: "",
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const set = k => e => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [k]: value });
  };

  const guardar = async e => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const payload = { ...form };

      if (!payload.observaciones) delete payload.observaciones;

      await api.post("/marketing/consentimientos/", payload);
      onGuardado();
    } catch (err) {
      console.error("Error guardando consentimiento:", err.response?.data || err);
      setError("No se pudo registrar el consentimiento. Revisa si el estudiante ya tiene uno.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      titulo="Nuevo consentimiento"
      subtitulo="Registra autorización de uso de imagen"
      icon={FileCheck}
      onClose={onClose}
    >
      <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <Lbl>Estudiante *</Lbl>
          <Sel required value={form.estudiante} onChange={set("estudiante")}>
            <option value="">Seleccionar estudiante…</option>
            {estudiantes.map(e => (
              <option key={e.id} value={e.id}>
                {e.nombre_completo || `${e.apellidos || ""} ${e.nombres || ""}`.trim()}
              </option>
            ))}
          </Sel>
        </div>

        <div>
          <Lbl>Fecha de firma *</Lbl>
          <Inp required type="date" value={form.fecha_firma} onChange={set("fecha_firma")} />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "13px", color: C.text }}>
          <input
            type="checkbox"
            checked={form.autoriza_redes_sociales}
            onChange={set("autoriza_redes_sociales")}
            style={{ width: "15px", height: "15px", accentColor: C.verde }}
          />
          Autoriza uso de imagen en redes o videos institucionales
        </label>

        <div>
          <Lbl>Observaciones</Lbl>
          <Textarea
            rows={3}
            value={form.observaciones}
            onChange={set("observaciones")}
            placeholder="Ej. Solo fotos grupales, solo de espalda, etc."
          />
        </div>

        {error && (
          <div style={{ background: C.dangerLight, color: C.danger, fontSize: "12px", borderRadius: "8px", padding: "10px 12px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <BtnCancel onClick={onClose}>Cancelar</BtnCancel>
          <BtnPrimary type="submit" disabled={cargando}>
            {cargando ? "Guardando…" : "Guardar"}
          </BtnPrimary>
        </div>
      </form>
    </Modal>
  );
}

function Consentimientos() {
  const [consentimientos, setConsentimientos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const cargar = async () => {
    setCargando(true);

    try {
      const [consentimientosData, estudiantesData] = await Promise.all([
        cargarTodo("/marketing/consentimientos/"),
        cargarTodo("/academico/estudiantes/resumen/"),
      ]);

      setConsentimientos(consentimientosData);
      setEstudiantes(estudiantesData);
    } catch (err) {
      console.error("Error cargando consentimientos:", err.response?.data || err);
      setConsentimientos([]);
      setEstudiantes([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();

    if (!q) return consentimientos;

    return consentimientos.filter(c =>
      `${c.estudiante_detalle?.nombre_completo || ""} ${c.estudiante_detalle?.nombres || ""} ${c.estudiante_detalle?.apellidos || ""} ${c.observaciones || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [consentimientos, busqueda]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px", gap: "16px" }}>
        <SectionTitle title="Consentimientos de imagen" subtitle={`${consentimientos.length} registros`} />

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
            fontWeight: "700",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = C.verdeDark)}
          onMouseLeave={e => (e.currentTarget.style.background = C.verde)}
        >
          <Plus size={15} />
          Nuevo consentimiento
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: "16px" }}>
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
          placeholder="Buscar por estudiante u observación…"
          style={{ ...iStyle, paddingLeft: "36px" }}
          onFocus={focusOn}
          onBlur={focusOff}
        />
      </div>

      {cargando ? (
        <Spinner />
      ) : filtrados.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No hay consentimientos"
          subtitle="Registra autorizaciones de imagen para los estudiantes."
        />
      ) : (
        <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "780px" }}>
              <thead>
                <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                  {["Estudiante", "Autoriza redes", "Fecha de firma", "Observaciones"].map(h => (
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
                {filtrados.map((c, idx) => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: idx < filtrados.length - 1 ? `1px solid ${C.border}` : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: C.text }}>
                      {c.estudiante_detalle?.nombre_completo ||
                        `${c.estudiante_detalle?.apellidos || ""} ${c.estudiante_detalle?.nombres || ""}`.trim() ||
                        "—"}
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <Badge
                        bg={c.autoriza_redes_sociales ? C.successLight : C.dangerLight}
                        color={c.autoriza_redes_sociales ? C.success : C.danger}
                      >
                        {c.autoriza_redes_sociales ? <CheckCircle size={11} /> : <XCircle size={11} />}
                        {c.autoriza_redes_sociales ? "Sí autoriza" : "No autoriza"}
                      </Badge>
                    </td>

                    <td style={{ padding: "12px 16px", color: C.textMuted, fontSize: "12px" }}>
                      {c.fecha_firma || "—"}
                    </td>

                    <td style={{ padding: "12px 16px", color: C.textMuted, fontSize: "12px" }}>
                      {c.observaciones || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <ModalConsentimiento
          estudiantes={estudiantes}
          onClose={() => setModal(false)}
          onGuardado={() => {
            setModal(false);
            cargar();
          }}
        />
      )}
    </div>
  );
}

export default function MarketingPage() {
  return (
    <MainLayout>
      <Routes>
        <Route index element={<Prospectos />} />
        <Route path="prospectos" element={<Prospectos />} />
        <Route path="consentimientos" element={<Consentimientos />} />
      </Routes>
    </MainLayout>
  );
}
