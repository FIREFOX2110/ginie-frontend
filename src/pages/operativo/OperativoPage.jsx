import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";
import {
  Plus, X, AlertTriangle, ChevronDown, Search,
  BookOpen, Clock, Utensils,
} from "lucide-react";

const C = {
  verde: "#2D5A3D", verdeDark: "#1A3A27", verdeLight: "#E8F4ED",
  verdeMid: "#5A7A68", naranja: "#D4821A", naranjaLight: "#FEF3E2",
  border: "#D6E8DC", bg: "#F4F9F6", text: "#1A3A27", textMuted: "#6B8F78",
  danger: "#DC2626", dangerLight: "#FEE2E2",
  warning: "#CA8A04", warningLight: "#FEF9C3",
  success: "#16A34A", successLight: "#DCFCE7",
};

const iStyle = {
  width: "100%", border: `1px solid ${C.border}`, borderRadius: "8px",
  padding: "8px 12px", fontSize: "13px", outline: "none",
  background: "#fff", color: C.text, boxSizing: "border-box", fontFamily: "inherit",
};

const focusOn = e => { e.target.style.borderColor = C.verde; e.target.style.boxShadow = `0 0 0 3px ${C.verdeLight}`; };
const focusOff = e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; };

function Inp(p) { return <input {...p} style={iStyle} onFocus={focusOn} onBlur={focusOff} />; }
function Textarea(p) { return <textarea {...p} style={{ ...iStyle, resize: "vertical" }} onFocus={focusOn} onBlur={focusOff} />; }

function Sel({ children, ...p }) {
  return (
    <div style={{ position: "relative" }}>
      <select {...p} style={{ ...iStyle, appearance: "none", paddingRight: "30px", cursor: "pointer" }} onFocus={focusOn} onBlur={focusOff}>
        {children}
      </select>
      <ChevronDown size={13} style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: C.textMuted }} />
    </div>
  );
}

function Lbl({ children }) {
  return <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: C.verdeMid, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{children}</label>;
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px", gap: "12px" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: "26px", height: "26px", border: `3px solid ${C.verdeLight}`, borderTop: `3px solid ${C.verde}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <span style={{ fontSize: "13px", color: C.textMuted }}>Cargando…</span>
    </div>
  );
}

function Modal({ titulo, onClose, children, maxW = "620px" }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: maxW, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(26,58,39,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 16px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>{titulo}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted }}><X size={18} /></button>
        </div>
        <div style={{ padding: "20px 22px" }}>{children}</div>
      </div>
    </div>
  );
}

function BtnPrimary({ children, danger, ...p }) {
  const bg = danger ? C.danger : C.verde;
  return <button {...p} style={{ flex: 1, background: p.disabled ? C.verdeMid : bg, color: "#fff", border: "none", padding: "9px", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: p.disabled ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{children}</button>;
}

function BtnCancel({ children, ...p }) {
  return <button type="button" {...p} style={{ flex: 1, border: `1px solid ${C.border}`, background: "#fff", color: C.textMuted, padding: "9px", borderRadius: "9px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>{children}</button>;
}

function Badge({ bg, color, children }) {
  return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: bg, color }}>{children}</span>;
}

function Tabla({ cols, children, vacia }) {
  return (
    <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
            {cols.map((c, i) => (
              <th key={i} style={{ padding: "11px 16px", textAlign: i === cols.length - 1 ? "right" : "left", fontSize: "11px", fontWeight: "600", color: C.verdeMid, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {vacia && <div style={{ textAlign: "center", padding: "40px", color: C.textMuted, fontSize: "13px" }}>{vacia}</div>}
    </div>
  );
}

function Tr({ children }) {
  return (
    <tr style={{ borderBottom: `1px solid ${C.border}` }} onMouseEnter={e => e.currentTarget.style.background = C.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      {children}
    </tr>
  );
}

function Td({ children, muted, right }) {
  return <td style={{ padding: "12px 16px", color: muted ? C.textMuted : C.text, fontSize: muted ? "12px" : "13px", textAlign: right ? "right" : "left" }}>{children}</td>;
}

async function cargarTodos(url) {
  let actual = url;
  let todos = [];
  while (actual) {
    const { data } = await api.get(actual);
    if (data.results) {
      todos = [...todos, ...data.results];
      if (data.next) {
        const nextUrl = new URL(data.next);
        actual = nextUrl.pathname.replace("/api/v1", "") + nextUrl.search;
      } else actual = null;
    } else {
      todos = data;
      actual = null;
    }
  }
  return todos;
}

function calcEdad(fecha) {
  if (!fecha) return "—";
  const y = Math.floor((new Date() - new Date(fecha)) / (1000 * 60 * 60 * 24 * 365.25));
  return y === 0 ? "< 1 año" : `${y} año${y !== 1 ? "s" : ""}`;
}

function nombreEstudiante(e) {
  return `${e.apellidos || ""} ${e.nombres || ""}`.trim() || e.estudiante_nombre || "Estudiante";
}

function HeaderModulo({ titulo, subtitulo, accion }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>{titulo}</h1>
        <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>{subtitulo}</p>
      </div>
      {accion}
    </div>
  );
}

// ── ESTUDIANTES ───────────────────────────────────────────────────────────────
function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await cargarTodos("/academico/estudiantes/resumen/");
      setEstudiantes(data);
    } catch (err) {
      console.error("Error cargando estudiantes:", err.response?.data || err);
      setEstudiantes([]);
    } finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = estudiantes.filter(e =>
    `${e.nombres || ""} ${e.apellidos || ""} ${e.cedula || ""} ${e.padre_nombre || ""}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <HeaderModulo titulo="Mis estudiantes" subtitulo={`${estudiantes.length} estudiantes registrados`} />

      <div style={{ position: "relative", marginBottom: "14px" }}>
        <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar estudiante por nombre o cédula…" style={{ ...iStyle, paddingLeft: "36px" }} onFocus={focusOn} onBlur={focusOff} />
      </div>

      {cargando ? <Spinner /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
          {filtrados.map(e => (
            <div key={e.id} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "14px", padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: C.verde, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                  {(e.nombres?.[0] || "?").toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: C.text }}>{nombreEstudiante(e)}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: C.textMuted }}>C.I. {e.cedula || "—"}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                <div style={{ background: C.bg, borderRadius: "9px", padding: "8px" }}>
                  <p style={{ margin: 0, fontSize: "10px", color: C.textMuted, textTransform: "uppercase", fontWeight: "700" }}>Edad</p>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: C.text, fontWeight: "700" }}>{calcEdad(e.fecha_nacimiento)}</p>
                </div>
                <div style={{ background: C.bg, borderRadius: "9px", padding: "8px" }}>
                  <p style={{ margin: 0, fontSize: "10px", color: C.textMuted, textTransform: "uppercase", fontWeight: "700" }}>Sangre</p>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: C.text, fontWeight: "700" }}>{e.tipo_sangre || "—"}</p>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: "12px", color: C.textMuted }}>Representante: {e.padre_nombre || e.representante_nombre || e.padre_detalle?.nombre || "—"}</p>
              <div style={{ marginTop: "10px" }}>
                <Badge bg={e.activo === false ? C.dangerLight : C.successLight} color={e.activo === false ? C.danger : C.success}>{e.activo === false ? "Inactivo" : "Activo"}</Badge>
              </div>
            </div>
          ))}
          {filtrados.length === 0 && <p style={{ gridColumn: "1/-1", textAlign: "center", color: C.textMuted, padding: "40px 0" }}>No hay estudiantes para mostrar.</p>}
        </div>
      )}
    </div>
  );
}

// ── BITÁCORAS ─────────────────────────────────────────────────────────────────
const ALIM_MAP = {
  TODO: { label: "Comió todo", bg: "#E8F5EA", color: "#2A7A3A" },
  MITAD: { label: "Comió la mitad", bg: C.warningLight, color: "#7A5A04" },
  NADA: { label: "No comió", bg: C.dangerLight, color: C.danger },
};

function ModalBitacora({ bitacora, onClose, onGuardado }) {
  const esNuevo = !bitacora?.id;
  const [estudiantes, setEstudiantes] = useState([]);
  const [form, setForm] = useState({
    estudiante: bitacora?.estudiante || "",
    alimentacion: bitacora?.alimentacion || "TODO",
    siesta_minutos: bitacora?.siesta_minutos || 0,
    control_esfinteres: bitacora?.control_esfinteres || "NORMAL",
    estado_animo: "",
    actividad_realizada: "",
    manualidades_materiales: "",
    observaciones_profesora: bitacora?.observaciones_profesora || "",
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    cargarTodos("/academico/estudiantes/resumen/")
      .then(setEstudiantes)
      .catch(err => console.error("Error cargando estudiantes:", err.response?.data || err));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      const observacionesCompuestas = [
        form.estado_animo ? `Estado de ánimo: ${form.estado_animo}` : "",
        form.actividad_realizada ? `Actividad realizada: ${form.actividad_realizada}` : "",
        form.manualidades_materiales ? `Manualidades/materiales: ${form.manualidades_materiales}` : "",
        form.observaciones_profesora ? `Observaciones: ${form.observaciones_profesora}` : "",
      ].filter(Boolean).join("\n");

      const payload = {
        estudiante: form.estudiante,
        alimentacion: form.alimentacion,
        siesta_minutos: Number(form.siesta_minutos || 0),
        control_esfinteres: form.control_esfinteres,
        observaciones_profesora: observacionesCompuestas,
      };

      if (esNuevo) await api.post("/operativo/bitacoras/", payload);
      else await api.patch(`/operativo/bitacoras/${bitacora.id}/`, payload);
      onGuardado();
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : "Error al guardar.");
    } finally { setCargando(false); }
  };

  return (
    <Modal titulo={esNuevo ? "Nueva bitácora diaria" : "Editar bitácora"} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <Lbl>Estudiante *</Lbl>
          <Sel required value={form.estudiante} onChange={set("estudiante")}>
            <option value="">Seleccionar…</option>
            {estudiantes.map(e => <option key={e.id} value={e.id}>{e.apellidos} {e.nombres}</option>)}
          </Sel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <Lbl>Alimentación</Lbl>
            <Sel value={form.alimentacion} onChange={set("alimentacion")}>
              <option value="TODO">Comió todo</option>
              <option value="MITAD">Comió la mitad</option>
              <option value="NADA">No comió</option>
            </Sel>
          </div>
          <div><Lbl>Tiempo de sueño / siesta</Lbl><Inp type="number" min="0" value={form.siesta_minutos} onChange={set("siesta_minutos")} placeholder="Minutos" /></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <Lbl>Control de esfínteres</Lbl>
            <Sel value={form.control_esfinteres} onChange={set("control_esfinteres")}>
              <option value="NORMAL">Normal</option>
              <option value="ACCIDENTE">Tuvo un accidente</option>
              <option value="ESTRENIMIENTO">Estreñimiento</option>
            </Sel>
          </div>
          <div>
            <Lbl>Estado de ánimo</Lbl>
            <Sel value={form.estado_animo} onChange={set("estado_animo")}>
              <option value="">No especificado</option>
              <option value="Feliz">Feliz</option>
              <option value="Tranquilo/a">Tranquilo/a</option>
              <option value="Inquieto/a">Inquieto/a</option>
              <option value="Cansado/a">Cansado/a</option>
              <option value="Irritable">Irritable</option>
            </Sel>
          </div>
        </div>

        <div><Lbl>Actividad realizada</Lbl><Inp value={form.actividad_realizada} onChange={set("actividad_realizada")} placeholder="Ej. canciones, cuentos, pintura, juegos dirigidos" /></div>
        <div><Lbl>Manualidades / materiales usados</Lbl><Inp value={form.manualidades_materiales} onChange={set("manualidades_materiales")} placeholder="Ej. cartulina, témperas, goma, hojas de colores" /></div>
        <div><Lbl>Observaciones para padres</Lbl><Textarea rows={3} value={form.observaciones_profesora} onChange={set("observaciones_profesora")} /></div>

        {error && <div style={{ background: C.dangerLight, color: C.danger, fontSize: "12px", borderRadius: "8px", padding: "10px 12px" }}>{error}</div>}
        <div style={{ display: "flex", gap: "10px" }}>
          <BtnCancel onClick={onClose}>Cancelar</BtnCancel>
          <BtnPrimary type="submit" disabled={cargando}>{cargando ? "Guardando…" : "Guardar bitácora"}</BtnPrimary>
        </div>
      </form>
    </Modal>
  );
}

function Bitacoras() {
  const [bitacoras, setBitacoras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(null);
  const { usuario } = useAuthStore();
  const esMaestro = usuario?.rol === "MAESTRO";

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await cargarTodos("/operativo/bitacoras/");
      setBitacoras(data);
    } catch (err) {
      console.error("Error cargando bitácoras:", err.response?.data || err);
      setBitacoras([]);
    } finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  return (
    <div>
      <HeaderModulo
        titulo="Bitácoras diarias"
        subtitulo={`${bitacoras.length} registros`}
        accion={esMaestro && (
          <button onClick={() => setModal("nuevo")} style={{ display: "flex", alignItems: "center", gap: "6px", background: C.verde, color: "#fff", border: "none", borderRadius: "10px", padding: "9px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }} onMouseEnter={e => e.currentTarget.style.background = C.verdeDark} onMouseLeave={e => e.currentTarget.style.background = C.verde}>
            <Plus size={15} /> Nueva bitácora
          </button>
        )}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px", marginBottom: "16px" }}>
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "12px", padding: "14px" }}><BookOpen size={18} color={C.verde} /><p style={{ margin: "8px 0 0", fontSize: "20px", fontWeight: "700", color: C.text }}>{bitacoras.length}</p><p style={{ margin: 0, fontSize: "11px", color: C.textMuted, textTransform: "uppercase", fontWeight: "700" }}>Bitácoras</p></div>
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "12px", padding: "14px" }}><Clock size={18} color={C.warning} /><p style={{ margin: "8px 0 0", fontSize: "20px", fontWeight: "700", color: C.text }}>{bitacoras.reduce((acc, b) => acc + Number(b.siesta_minutos || 0), 0)} min</p><p style={{ margin: 0, fontSize: "11px", color: C.textMuted, textTransform: "uppercase", fontWeight: "700" }}>Sueño registrado</p></div>
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "12px", padding: "14px" }}><Utensils size={18} color={C.success} /><p style={{ margin: "8px 0 0", fontSize: "20px", fontWeight: "700", color: C.text }}>{bitacoras.filter(b => b.alimentacion === "TODO").length}</p><p style={{ margin: 0, fontSize: "11px", color: C.textMuted, textTransform: "uppercase", fontWeight: "700" }}>Comió todo</p></div>
      </div>

      {cargando ? <Spinner /> : (
        <Tabla cols={["Estudiante", "Fecha", "Alimentación", "Siesta", "Esfínteres", "Observaciones", "Registrado por"]} vacia={bitacoras.length === 0 ? "No hay bitácoras registradas." : null}>
          {bitacoras.map(b => {
            const alim = ALIM_MAP[b.alimentacion] || ALIM_MAP.MITAD;
            return (
              <Tr key={b.id}>
                <Td><span style={{ fontWeight: "600" }}>{b.estudiante_detalle?.apellidos} {b.estudiante_detalle?.nombres}</span></Td>
                <Td muted>{b.fecha}</Td>
                <Td><Badge bg={alim.bg} color={alim.color}>{alim.label}</Badge></Td>
                <Td muted>{b.siesta_minutos} min</Td>
                <Td muted>{b.esfinteres_display || b.control_esfinteres}</Td>
                <Td muted><span style={{ display: "block", maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.observaciones_profesora || "—"}</span></Td>
                <Td muted>{b.registrado_por_nombre || "—"}</Td>
              </Tr>
            );
          })}
        </Tabla>
      )}

      {modal && <ModalBitacora bitacora={modal === "nuevo" ? null : modal} onClose={() => setModal(null)} onGuardado={() => { setModal(null); cargar(); }} />}
    </div>
  );
}

// ── INCIDENTES ────────────────────────────────────────────────────────────────
const GRAV_MAP = {
  LEVE: { bg: C.warningLight, color: "#7A5A04" },
  MODERADA: { bg: "#FEE8D6", color: "#7A3A04" },
  GRAVE: { bg: C.dangerLight, color: C.danger },
};

function ModalIncidente({ onClose, onGuardado }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [form, setForm] = useState({ estudiante: "", gravedad: "LEVE", descripcion: "", accion_tomada: "", padres_notificados: false });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    cargarTodos("/academico/estudiantes/resumen/").then(setEstudiantes).catch(err => console.error("Error cargando estudiantes:", err.response?.data || err));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try { await api.post("/operativo/incidentes/", form); onGuardado(); }
    catch (err) { setError(err.response?.data ? JSON.stringify(err.response.data) : "Error."); }
    finally { setCargando(false); }
  };

  return (
    <Modal titulo="Reportar incidente o accidente" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div><Lbl>Estudiante *</Lbl><Sel required value={form.estudiante} onChange={set("estudiante")}><option value="">Seleccionar</option>{estudiantes.map(e => <option key={e.id} value={e.id}>{e.apellidos} {e.nombres}</option>)}</Sel></div>
          <div><Lbl>Gravedad *</Lbl><Sel value={form.gravedad} onChange={set("gravedad")}><option value="LEVE">Leve: raspón, llanto, caída suave</option><option value="MODERADA">Moderada: golpe fuerte, inflamación</option><option value="GRAVE">Grave: requiere atención médica</option></Sel></div>
        </div>
        <div><Lbl>¿Qué pasó? *</Lbl><Textarea required rows={3} value={form.descripcion} onChange={set("descripcion")} placeholder="Describe el accidente o incidente" /></div>
        <div><Lbl>¿Qué hizo el personal? *</Lbl><Textarea required rows={3} value={form.accion_tomada} onChange={set("accion_tomada")} placeholder="Ej. se limpió la herida, se aplicó hielo, se notificó al representante" /></div>
        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: C.text }}>
          <input type="checkbox" checked={form.padres_notificados} onChange={e => setForm(f => ({ ...f, padres_notificados: e.target.checked }))} style={{ width: "15px", height: "15px", accentColor: C.verde }} />
          Se notificó a los padres
        </label>
        {error && <div style={{ background: C.dangerLight, color: C.danger, fontSize: "12px", borderRadius: "8px", padding: "10px 12px" }}>{error}</div>}
        <div style={{ display: "flex", gap: "10px" }}><BtnCancel onClick={onClose}>Cancelar</BtnCancel><BtnPrimary type="submit" disabled={cargando} danger>{cargando ? "Guardando…" : "Reportar incidente"}</BtnPrimary></div>
      </form>
    </Modal>
  );
}

function Incidentes() {
  const [incidentes, setIncidentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const { usuario } = useAuthStore();
  const esMaestro = usuario?.rol === "MAESTRO";

  const cargar = async () => {
    setCargando(true);
    try { const data = await cargarTodos("/operativo/incidentes/"); setIncidentes(data); }
    catch (err) { console.error("Error cargando incidentes:", err.response?.data || err); setIncidentes([]); }
    finally { setCargando(false); }
  };
  useEffect(() => { cargar(); }, []);

  return (
    <div>
      <HeaderModulo titulo="Reportes de incidentes" subtitulo={`${incidentes.length} registros`} accion={esMaestro && <button onClick={() => setModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: C.danger, color: "#fff", border: "none", borderRadius: "10px", padding: "9px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}><AlertTriangle size={15} /> Reportar incidente</button>} />
      {cargando ? <Spinner /> : (
        <Tabla cols={["Estudiante", "Fecha y hora", "Gravedad", "Descripción", "Padres notificados"]} vacia={incidentes.length === 0 ? "No hay incidentes registrados." : null}>
          {incidentes.map(i => { const g = GRAV_MAP[i.gravedad] || GRAV_MAP.LEVE; return (
            <Tr key={i.id}>
              <Td><span style={{ fontWeight: "600" }}>{i.estudiante_detalle?.apellidos} {i.estudiante_detalle?.nombres}</span></Td>
              <Td muted>{i.fecha_hora ? new Date(i.fecha_hora).toLocaleString("es-EC") : "—"}</Td>
              <Td><Badge bg={g.bg} color={g.color}>{i.gravedad_display || i.gravedad}</Badge></Td>
              <Td muted><span style={{ display: "block", maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.descripcion}</span></Td>
              <Td><Badge bg={i.padres_notificados ? "#E8F5EA" : C.bg} color={i.padres_notificados ? "#2A7A3A" : C.textMuted}>{i.padres_notificados ? "Sí" : "No"}</Badge></Td>
            </Tr>
          ); })}
        </Tabla>
      )}
      {modal && <ModalIncidente onClose={() => setModal(false)} onGuardado={() => { setModal(false); cargar(); }} />}
    </div>
  );
}

// ── ENFERMERÍA ────────────────────────────────────────────────────────────────
function Enfermeria() {
  const [atenciones, setAtenciones] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [tab, setTab] = useState("atenciones");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/operativo/enfermeria/"), api.get("/operativo/medicamentos/")])
      .then(([aRes, mRes]) => { setAtenciones(aRes.data.results || aRes.data); setMedicamentos(mRes.data.results || mRes.data); setCargando(false); })
      .catch(err => { console.error("Error cargando enfermería:", err.response?.data || err); setCargando(false); });
  }, []);

  const tabStyle = active => ({ padding: "8px 16px", borderRadius: "9px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "inherit", background: active ? C.verde : "#fff", color: active ? "#fff" : C.textMuted, border: active ? "none" : `1px solid ${C.border}` });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
        <div><h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>Enfermería</h1><p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>Atenciones y medicamentos</p></div>
        <div style={{ display: "flex", gap: "8px" }}><button onClick={() => setTab("atenciones")} style={tabStyle(tab === "atenciones")}>Atenciones</button><button onClick={() => setTab("medicamentos")} style={tabStyle(tab === "medicamentos")}>Medicamentos</button></div>
      </div>
      {cargando ? <Spinner /> : tab === "atenciones" ? (
        <Tabla cols={["Incidente", "Atendido por", "Medicamentos", "Seguimiento", "Fecha"]} vacia={atenciones.length === 0 ? "No hay atenciones registradas." : null}>
          {atenciones.map(a => <Tr key={a.id}><Td>Incidente #{a.incidente}</Td><Td muted>{a.atendido_por_nombre || "—"}</Td><Td muted><span style={{ display: "block", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.medicamentos_usados || "—"}</span></Td><Td><Badge bg={a.requiere_seguimiento ? "#FEE8D6" : C.verdeLight} color={a.requiere_seguimiento ? "#7A3A04" : C.verdeMid}>{a.requiere_seguimiento ? "Requiere seguimiento" : "Sin seguimiento"}</Badge></Td><Td muted>{a.fecha_hora ? new Date(a.fecha_hora).toLocaleDateString("es-EC") : "—"}</Td></Tr>)}
        </Tabla>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px" }}>
          {medicamentos.map(m => { const stockColor = m.stock > 5 ? { bg: "#E8F5EA", color: "#2A7A3A" } : m.stock > 0 ? { bg: C.warningLight, color: "#7A5A04" } : { bg: C.dangerLight, color: C.danger }; return <div key={m.id} style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, padding: "16px 18px" }}><div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}><div><p style={{ fontWeight: "600", color: C.text, margin: 0 }}>{m.nombre}</p><p style={{ fontSize: "12px", color: C.textMuted, margin: "2px 0 0" }}>{m.descripcion || "Sin descripción"}</p></div><Badge bg={stockColor.bg} color={stockColor.color}>{m.stock} {m.unidad}</Badge></div>{m.fecha_vencimiento && <p style={{ fontSize: "11px", color: C.textMuted, margin: 0 }}>Vence: {m.fecha_vencimiento}</p>}</div>; })}
          {medicamentos.length === 0 && <p style={{ color: C.textMuted, fontSize: "13px", gridColumn: "1/-1", textAlign: "center", padding: "40px 0" }}>No hay medicamentos registrados.</p>}
        </div>
      )}
    </div>
  );
}

export default function OperativoPage() {
  return (
    <MainLayout>
      <Routes>
        <Route index element={<Estudiantes />} />
        <Route path="estudiantes" element={<Estudiantes />} />
        <Route path="bitacoras" element={<Bitacoras />} />
        <Route path="incidentes" element={<Incidentes />} />
        <Route path="enfermeria" element={<Enfermeria />} />
        <Route path="medicamentos" element={<Enfermeria />} />
      </Routes>
    </MainLayout>
  );
}
