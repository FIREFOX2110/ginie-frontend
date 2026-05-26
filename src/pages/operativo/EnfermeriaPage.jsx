import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../api/axios";
import {
  AlertTriangle,
  ChevronDown,
  HeartPulse,
  PackagePlus,
  Pill,
  Plus,
  Search,
  Stethoscope,
  X,
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

function Modal({ titulo, icon: Icon, onClose, children, maxW = "520px" }) {
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {Icon && <Icon size={18} color={C.verde} />}
            <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>
              {titulo}
            </h2>
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

function BtnPrimary({ children, danger, ...p }) {
  const bg = danger ? C.danger : C.verde;

  return (
    <button
      {...p}
      style={{
        flex: 1,
        background: p.disabled ? C.verdeMid : bg,
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

function Inp(p) {
  return <input {...p} style={iStyle} onFocus={focusOn} onBlur={focusOff} />;
}

function Textarea(p) {
  return <textarea {...p} style={{ ...iStyle, resize: "vertical" }} onFocus={focusOn} onBlur={focusOff} />;
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

function Tabla({ headers, children, vacio, colSpan }) {
  return (
    <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "780px" }}>
          <thead>
            <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
              {headers.map(h => (
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
            {children}
            {vacio && (
              <tr>
                <td colSpan={colSpan} style={{ textAlign: "center", padding: "42px", color: C.textMuted }}>
                  {vacio}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tabs() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { label: "Atenciones", path: "/operativo/enfermeria", icon: HeartPulse },
    { label: "Medicamentos", path: "/operativo/medicamentos", icon: Pill },
  ];

  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {tabs.map(t => {
        const active = location.pathname === t.path;
        const Icon = t.icon;

        return (
          <button
            key={t.path}
            onClick={() => navigate(t.path)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              border: active ? "none" : `1px solid ${C.border}`,
              background: active ? C.verde : "#fff",
              color: active ? "#fff" : C.textMuted,
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Icon size={15} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function ModalAtencion({ incidentes, onClose, onGuardado }) {
  const [form, setForm] = useState({
    incidente: "",
    medicamentos_usados: "",
    procedimiento: "",
    requiere_seguimiento: false,
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
      await api.post("/operativo/enfermeria/", form);
      onGuardado();
    } catch (err) {
      console.error("Error creando atención:", err.response?.data || err);
      setError("No se pudo registrar la atención.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal titulo="Registrar atención de enfermería" icon={Stethoscope} onClose={onClose}>
      <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <Lbl>Incidente *</Lbl>
          <Sel required value={form.incidente} onChange={set("incidente")}>
            <option value="">Seleccionar incidente…</option>
            {incidentes.map(i => (
              <option key={i.id} value={i.id}>
                {(i.estudiante_detalle?.nombre_completo ||
                  `${i.estudiante_detalle?.apellidos || ""} ${i.estudiante_detalle?.nombres || ""}`.trim() ||
                  "Estudiante")} · {i.gravedad_display || i.gravedad} · {i.fecha_hora ? new Date(i.fecha_hora).toLocaleDateString("es-EC") : ""}
              </option>
            ))}
          </Sel>
          {incidentes.length === 0 && (
            <p style={{ fontSize: "11px", color: C.textMuted, margin: "6px 0 0" }}>
              No hay incidentes pendientes de atención.
            </p>
          )}
        </div>

        <div>
          <Lbl>Medicamentos o insumos usados</Lbl>
          <Textarea
            rows={3}
            value={form.medicamentos_usados}
            onChange={set("medicamentos_usados")}
            placeholder="Ej. Alcohol, algodón, curita, suero oral"
          />
        </div>

        <div>
          <Lbl>Procedimiento realizado *</Lbl>
          <Textarea
            required
            rows={4}
            value={form.procedimiento}
            onChange={set("procedimiento")}
            placeholder="Describe la atención brindada al estudiante."
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "13px", color: C.text }}>
          <input
            type="checkbox"
            checked={form.requiere_seguimiento}
            onChange={set("requiere_seguimiento")}
            style={{ width: "15px", height: "15px", accentColor: C.verde }}
          />
          Requiere seguimiento
        </label>

        {error && (
          <div style={{ background: C.dangerLight, color: C.danger, borderRadius: "8px", padding: "10px 12px", fontSize: "12px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <BtnCancel onClick={onClose}>Cancelar</BtnCancel>
          <BtnPrimary type="submit" disabled={cargando || incidentes.length === 0}>
            {cargando ? "Guardando…" : "Guardar atención"}
          </BtnPrimary>
        </div>
      </form>
    </Modal>
  );
}

function ModalMedicamento({ onClose, onGuardado }) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    stock: 0,
    unidad: "",
    fecha_vencimiento: "",
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const guardar = async e => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const payload = { ...form, stock: Number(form.stock || 0) };
      if (!payload.fecha_vencimiento) delete payload.fecha_vencimiento;
      if (!payload.descripcion) delete payload.descripcion;

      await api.post("/operativo/medicamentos/", payload);
      onGuardado();
    } catch (err) {
      console.error("Error creando medicamento:", err.response?.data || err);
      setError("No se pudo registrar el medicamento.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal titulo="Registrar medicamento o insumo" icon={PackagePlus} onClose={onClose}>
      <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <Lbl>Nombre *</Lbl>
          <Inp required value={form.nombre} onChange={set("nombre")} placeholder="Ej. Alcohol antiséptico" />
        </div>

        <div>
          <Lbl>Descripción</Lbl>
          <Textarea rows={3} value={form.descripcion} onChange={set("descripcion")} placeholder="Detalle del medicamento o insumo." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <Lbl>Stock *</Lbl>
            <Inp required type="number" min="0" value={form.stock} onChange={set("stock")} />
          </div>

          <div>
            <Lbl>Unidad *</Lbl>
            <Inp required value={form.unidad} onChange={set("unidad")} placeholder="Ej. unidades, ml, cajas" />
          </div>
        </div>

        <div>
          <Lbl>Fecha de vencimiento</Lbl>
          <Inp type="date" value={form.fecha_vencimiento} onChange={set("fecha_vencimiento")} />
        </div>

        {error && (
          <div style={{ background: C.dangerLight, color: C.danger, borderRadius: "8px", padding: "10px 12px", fontSize: "12px" }}>
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

function EnfermeriaAtenciones() {
  const [atenciones, setAtenciones] = useState([]);
  const [incidentes, setIncidentes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);

  const cargar = async () => {
    setCargando(true);

    try {
      const [atencionesData, incidentesData] = await Promise.all([
        cargarTodo("/operativo/enfermeria/"),
        cargarTodo("/operativo/incidentes/"),
      ]);

      setAtenciones(atencionesData);

      const pendientes = incidentesData.filter(i => !i.tiene_atencion_enfermeria);
      setIncidentes(pendientes);
    } catch (err) {
      console.error("Error cargando enfermería:", err.response?.data || err);
      setAtenciones([]);
      setIncidentes([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();

    if (!q) return atenciones;

    return atenciones.filter(a =>
      `${a.incidente || ""} ${a.atendido_por_nombre || ""} ${a.medicamentos_usados || ""} ${a.procedimiento || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [atenciones, busqueda]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", marginBottom: "22px" }}>
        <SectionTitle title="Enfermería" subtitle={`${atenciones.length} atenciones registradas`} />

        <button
          onClick={() => setModal(true)}
          style={{
            display: "inline-flex",
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
          Nueva atención
        </button>
      </div>

      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
        <Tabs />

        <div style={{ position: "relative", width: "min(100%, 320px)" }}>
          <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar atención…"
            style={{ ...iStyle, paddingLeft: "32px" }}
            onFocus={focusOn}
            onBlur={focusOff}
          />
        </div>
      </div>

      {incidentes.length > 0 && (
        <div
          style={{
            background: C.naranjaLight,
            border: `1px solid ${C.naranja}44`,
            borderRadius: "12px",
            padding: "12px 14px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertTriangle size={18} color="#8A4A0A" />
          <p style={{ margin: 0, fontSize: "13px", color: "#8A4A0A" }}>
            Hay <strong>{incidentes.length}</strong> incidente(s) pendiente(s) de atención.
          </p>
        </div>
      )}

      {cargando ? (
        <Spinner />
      ) : atenciones.length === 0 ? (
        <EmptyState icon={HeartPulse} title="No hay atenciones registradas" subtitle="Registra una atención cuando un incidente requiera seguimiento de enfermería." />
      ) : (
        <Tabla headers={["Incidente", "Atendido por", "Medicamentos", "Procedimiento", "Seguimiento", "Fecha"]} colSpan={6}>
          {filtradas.map(a => (
            <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }}>
              <td style={{ padding: "12px 16px", fontWeight: "700", color: C.text }}>Incidente #{String(a.incidente).slice(0, 8)}</td>
              <td style={{ padding: "12px 16px", color: C.textMuted }}>{a.atendido_por_nombre || "—"}</td>
              <td style={{ padding: "12px 16px", color: C.textMuted, maxWidth: "220px" }}>
                <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {a.medicamentos_usados || "—"}
                </span>
              </td>
              <td style={{ padding: "12px 16px", color: C.textMuted, maxWidth: "260px" }}>
                <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {a.procedimiento || "—"}
                </span>
              </td>
              <td style={{ padding: "12px 16px" }}>
                <Badge
                  bg={a.requiere_seguimiento ? C.naranjaLight : C.successLight}
                  color={a.requiere_seguimiento ? "#8A4A0A" : C.success}
                >
                  {a.requiere_seguimiento ? "Requiere seguimiento" : "Sin seguimiento"}
                </Badge>
              </td>
              <td style={{ padding: "12px 16px", color: C.textMuted }}>
                {a.fecha_hora ? new Date(a.fecha_hora).toLocaleDateString("es-EC") : "—"}
              </td>
            </tr>
          ))}
        </Tabla>
      )}

      {modal && (
        <ModalAtencion
          incidentes={incidentes}
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

function Medicamentos() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);

  const cargar = async () => {
    setCargando(true);

    try {
      const data = await cargarTodo("/operativo/medicamentos/");
      setMedicamentos(data);
    } catch (err) {
      console.error("Error cargando medicamentos:", err.response?.data || err);
      setMedicamentos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();

    if (!q) return medicamentos;

    return medicamentos.filter(m =>
      `${m.nombre || ""} ${m.descripcion || ""} ${m.unidad || ""}`.toLowerCase().includes(q)
    );
  }, [medicamentos, busqueda]);

  const stockColor = stock => {
    if (Number(stock) <= 0) return { bg: C.dangerLight, color: C.danger, label: "Sin stock" };
    if (Number(stock) <= 5) return { bg: C.warningLight, color: C.warning, label: "Stock bajo" };
    return { bg: C.successLight, color: C.success, label: "Disponible" };
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", marginBottom: "22px" }}>
        <SectionTitle title="Medicamentos e insumos" subtitle={`${medicamentos.length} registros`} />

        <button
          onClick={() => setModal(true)}
          style={{
            display: "inline-flex",
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
          Nuevo insumo
        </button>
      </div>

      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
        <Tabs />

        <div style={{ position: "relative", width: "min(100%, 320px)" }}>
          <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar medicamento…"
            style={{ ...iStyle, paddingLeft: "32px" }}
            onFocus={focusOn}
            onBlur={focusOff}
          />
        </div>
      </div>

      {cargando ? (
        <Spinner />
      ) : medicamentos.length === 0 ? (
        <EmptyState icon={Pill} title="No hay medicamentos registrados" subtitle="Registra medicamentos o insumos disponibles para enfermería." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
          {filtrados.map(m => {
            const sc = stockColor(m.stock);

            return (
              <div
                key={m.id}
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  border: `1px solid ${C.border}`,
                  padding: "16px 18px",
                  boxShadow: "0 1px 3px rgba(26,58,39,0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
                  <div>
                    <p style={{ fontWeight: "700", color: C.text, margin: "0 0 3px" }}>{m.nombre}</p>
                    <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>
                      {m.descripcion || "Sin descripción"}
                    </p>
                  </div>

                  <Badge bg={sc.bg} color={sc.color}>
                    {sc.label}
                  </Badge>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "8px 10px", flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "11px", color: C.textMuted }}>Stock</p>
                    <p style={{ margin: 0, fontSize: "15px", color: C.text, fontWeight: "700" }}>
                      {m.stock} {m.unidad}
                    </p>
                  </div>

                  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "8px 10px", flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "11px", color: C.textMuted }}>Vencimiento</p>
                    <p style={{ margin: 0, fontSize: "13px", color: C.text, fontWeight: "700" }}>
                      {m.fecha_vencimiento || "—"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <ModalMedicamento
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

export default function EnfermeriaPage() {
  const location = useLocation();

  const esMedicamentos = location.pathname.includes("/medicamentos");

  return (
    <MainLayout>
      {esMedicamentos ? <Medicamentos /> : <EnfermeriaAtenciones />}
    </MainLayout>
  );
}
