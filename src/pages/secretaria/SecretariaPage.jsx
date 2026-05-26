import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../api/axios";
import {
  Plus, Search, X, Edit, ChevronDown, ChevronRight, Phone,
} from "lucide-react";

const C = {
  verde: "#2D5A3D", verdeDark: "#1A3A27", verdeLight: "#E8F4ED",
  verdeMid: "#5A7A68", naranja: "#D4821A", naranjaLight: "#FEF3E2",
  border: "#D6E8DC", bg: "#F4F9F6", text: "#1A3A27", textMuted: "#6B8F78",
  danger: "#DC2626", dangerLight: "#FEE2E2",
};

const card = {
  background: "#fff", borderRadius: "12px",
  border: `1px solid ${C.border}`, overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const iStyle = {
  width: "100%", border: `1px solid ${C.border}`, borderRadius: "8px",
  padding: "8px 12px", fontSize: "13px", outline: "none",
  background: "#fff", color: C.text, boxSizing: "border-box", fontFamily: "inherit",
};
const fOn  = e => { e.target.style.borderColor = C.verde; e.target.style.boxShadow = `0 0 0 3px ${C.verdeLight}`; };
const fOff = e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; };

function Inp(p) { return <input {...p} style={iStyle} onFocus={fOn} onBlur={fOff} />; }
function Sel({ children, ...p }) {
  return (
    <div style={{ position: "relative" }}>
      <select {...p} style={{ ...iStyle, appearance: "none", paddingRight: "30px", cursor: "pointer" }} onFocus={fOn} onBlur={fOff}>{children}</select>
      <ChevronDown size={13} style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: C.textMuted }} />
    </div>
  );
}
function Lbl({ children }) {
  return <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: C.verdeMid, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{children}</label>;
}
function SecTitle({ children }) {
  return <p style={{ fontSize: "11px", fontWeight: "700", color: C.verdeMid, textTransform: "uppercase", letterSpacing: "0.06em", margin: "4px 0 0" }}>{children}</p>;
}
function ErrBox({ msg }) {
  if (!msg) return null;
  return <div style={{ background: C.dangerLight, border: `1px solid ${C.danger}55`, color: C.danger, fontSize: "12px", borderRadius: "8px", padding: "10px 12px" }}>{msg}</div>;
}
function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px", gap: "12px" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: "26px", height: "26px", border: `3px solid ${C.verdeLight}`, borderTop: `3px solid ${C.verde}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}

const SANGRES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const PARENTESCOS = [
  { value: "PADRE",  label: "Padre" },
  { value: "MADRE",  label: "Madre" },
  { value: "ABUELO", label: "Abuelo" },
  { value: "ABUELA", label: "Abuela" },
  { value: "TUTOR",  label: "Tutor Legal" },
];
const MESES = [
  { value: "SEP", label: "Septiembre" }, { value: "OCT", label: "Octubre" },
  { value: "NOV", label: "Noviembre" },  { value: "DIC", label: "Diciembre" },
  { value: "ENE", label: "Enero" },      { value: "FEB", label: "Febrero" },
  { value: "MAR", label: "Marzo" },      { value: "ABR", label: "Abril" },
  { value: "MAY", label: "Mayo" },       { value: "JUN", label: "Junio" },
];
const TARIFAS = [
  { minEdad: 1, maxEdad: 2, matricula: "150.00", mensualidad: "120.00", label: "1 - 2 años" },
  { minEdad: 3, maxEdad: 3, matricula: "180.00", mensualidad: "140.00", label: "3 años" },
  { minEdad: 4, maxEdad: 5, matricula: "200.00", mensualidad: "160.00", label: "4 - 5 años" },
];

function calcEdadAnios(fechaNac) {
  if (!fechaNac) return null;
  return Math.floor((new Date() - new Date(fechaNac)) / (1000 * 60 * 60 * 24 * 365.25));
}
function getTarifa(fechaNac) {
  const edad = calcEdadAnios(fechaNac);
  if (edad === null) return null;
  return TARIFAS.find(t => edad >= t.minEdad && edad <= t.maxEdad) || null;
}

// ── MODAL PADRE ───────────────────────────────────────────────────────────────
function ModalPadre({ padre, onClose, onGuardado }) {
  const esNuevo = !padre?.id;
  const [form, setForm] = useState({
    email: "", username: "", password: "",
    cedula:     padre?.cedula     || "",
    nombres:    padre?.nombres    || "",
    apellidos:  padre?.apellidos  || "",
    telefono:   padre?.telefono   || "",
    direccion:  padre?.direccion  || "",
    parentesco: padre?.parentesco || "PADRE",
    principal:  padre?.principal  ?? true,
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState(null);
  const set    = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setChk = k => e => setForm(f => ({ ...f, [k]: e.target.checked }));

  const handleSubmit = async e => {
    e.preventDefault(); setCargando(true); setError(null);
    try {
      if (esNuevo) {
        await api.post("/familias/padres/crear/", form);
      } else {
        const { cedula, nombres, apellidos, telefono, direccion, parentesco, principal } = form;
        await api.patch(`/familias/padres/${padre.id}/`, { cedula, nombres, apellidos, telefono, direccion, parentesco, principal });
      }
      onGuardado();
    } catch (err) {
      const d = err.response?.data;
      setError(d && typeof d === "object"
        ? Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")
        : "Error al guardar.");
    } finally { setCargando(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "580px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(26,58,39,0.18)" }}>
        {/* Cabecera modal */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 16px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: C.verdeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "700", color: C.verdeMid }}>
              {esNuevo ? "+" : (form.nombres?.[0] || "?").toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>
                {esNuevo ? "Nuevo representante" : "Editar representante"}
              </h2>
              <p style={{ fontSize: "11px", color: C.textMuted, margin: 0 }}>
                {esNuevo ? "Se creará un usuario con rol REPRESENTANTE" : `${form.apellidos} ${form.nombres}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {esNuevo && (
            <>
              <SecTitle>Acceso al sistema</SecTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div><Lbl>Email *</Lbl><Inp type="email" required value={form.email} onChange={set("email")} /></div>
                <div><Lbl>Username *</Lbl><Inp required value={form.username} onChange={set("username")} /></div>
              </div>
              <div><Lbl>Contraseña *</Lbl><Inp type="password" required minLength={8} value={form.password} onChange={set("password")} /></div>
              <div style={{ height: "1px", background: C.border }} />
            </>
          )}

          <SecTitle>Datos personales</SecTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><Lbl>Nombres *</Lbl><Inp required value={form.nombres} onChange={set("nombres")} /></div>
            <div><Lbl>Apellidos *</Lbl><Inp required value={form.apellidos} onChange={set("apellidos")} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><Lbl>Cédula *</Lbl><Inp required maxLength={10} value={form.cedula} onChange={set("cedula")} /></div>
            <div><Lbl>Teléfono *</Lbl><Inp required value={form.telefono} onChange={set("telefono")} /></div>
          </div>
          <div><Lbl>Dirección *</Lbl><Inp required value={form.direccion} onChange={set("direccion")} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <Lbl>Parentesco *</Lbl>
              <Sel required value={form.parentesco} onChange={set("parentesco")}>
                {PARENTESCOS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Sel>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "2px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: C.text }}>
                <input type="checkbox" checked={form.principal} onChange={setChk("principal")} style={{ width: "15px", height: "15px", accentColor: C.verde }} />
                Representante principal
              </label>
            </div>
          </div>

          <ErrBox msg={error} />

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, border: `1px solid ${C.border}`, background: "#fff", color: C.textMuted, padding: "9px", borderRadius: "9px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
              Cancelar
            </button>
            {/* Guardar representante */}
            <button type="submit" disabled={cargando}
              style={{ flex: 1, background: cargando ? C.verdeMid : C.verdeMid, color: "#fff", border: "none", padding: "9px", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: cargando ? "not-allowed" : "pointer", fontFamily: "inherit" }}
              title="Guardar datos del representante">
              {cargando ? "Guardando…" : "Guardar representante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── MODAL ESTUDIANTE ──────────────────────────────────────────────────────────
function ModalEstudiante({ estudiante, padres, padreIdFijo, onClose, onGuardado }) {
  const esNuevo    = !estudiante?.id;
  const anioActual = new Date().getFullYear();

  const [form, setForm] = useState({
    cedula:                     estudiante?.cedula                     || "",
    nombres:                    estudiante?.nombres                    || "",
    apellidos:                  estudiante?.apellidos                  || "",
    fecha_nacimiento:           estudiante?.fecha_nacimiento           || "",
    genero:                     estudiante?.genero                     || "M",
    padre:                      estudiante?.padre                      || padreIdFijo || "",
    tipo_sangre:                estudiante?.tipo_sangre                || "",
    alergias_conocidas:         estudiante?.alergias_conocidas         || "",
    autoriza_imagen_redes:      estudiante?.autoriza_imagen_redes      || false,
    fecha_firma_consentimiento: estudiante?.fecha_firma_consentimiento || "",
    restricciones_imagen:       estudiante?.restricciones_imagen       || "",
  });

  const [finanzas, setFinanzas] = useState({
    matricula: "", mensualidad: "",
    mes_inicio: "SEP", anio: String(anioActual),
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState(null);

  const set    = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setChk = k => e => setForm(f => ({ ...f, [k]: e.target.checked }));
  const setFin = k => e => setFinanzas(f => ({ ...f, [k]: e.target.value }));

  // Auto-completa tarifas según fecha de nacimiento
  const handleFechaNac = e => {
    const fecha = e.target.value;
    setForm(f => ({ ...f, fecha_nacimiento: fecha }));
    const tarifa = getTarifa(fecha);
    if (tarifa) {
      setFinanzas(f => ({ ...f, matricula: tarifa.matricula, mensualidad: tarifa.mensualidad }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault(); setCargando(true); setError(null);
    try {
      const payload = { ...form };
      if (!payload.tipo_sangre)                delete payload.tipo_sangre;
      if (!payload.fecha_firma_consentimiento)  delete payload.fecha_firma_consentimiento;
      if (!payload.padre)                       delete payload.padre;

      let estId;
      if (esNuevo) {
        const res = await api.post("/academico/estudiantes/", payload);
        estId = res.data.id;
      } else {
        await api.patch(`/academico/estudiantes/${estudiante.id}/`, payload);
      }

      // Crear pagos en finanzas al matricular nuevo estudiante
      if (esNuevo && estId) {
        const pagosPromesas = [];

        // Pago de matrícula
        const matriculaRes = await api.post("/academico/matriculas/", {
          estudiante: estId,
          periodo: periodoId,
          nivel: nivelId,
        });

        await api.post("/finanzas/pagos-matricula/", {
          matricula: matriculaRes.data.id,
          monto: Number(finanzas.matricula),
          estado: "PENDIENTE",
        });

        // Pagos de mensualidades desde mes_inicio hasta Junio
        if (finanzas.mensualidad) {
          const idxInicio = MESES.findIndex(m => m.value === finanzas.mes_inicio);
          const anioBase = Number(finanzas.anio);

          MESES.slice(idxInicio).forEach(({ value: mes }) => {
            const anioPago = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN"].includes(mes)
              ? anioBase + 1
              : anioBase;
              console.log("Creando pago:", mes, anioPago);

            pagosPromesas.push(api.post("/finanzas/pagos/", {
              estudiante: estId,
              mes,
              anio: anioPago,
              monto: Number(finanzas.mensualidad),
              estado: "PENDIENTE",
            }).catch(err => {
              console.error("Error creando pago:", err.response?.data || err);
            }));
          });
        }

        await Promise.all(pagosPromesas);
      }

      onGuardado();
    } catch (err) {
      const d = err.response?.data;
      setError(d && typeof d === "object"
        ? Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")
        : "Error al guardar.");
    } finally { setCargando(false); }
  };

  const tarifaActual = getTarifa(form.fecha_nacimiento);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "580px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(26,58,39,0.18)" }}>
        {/* Cabecera modal */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 16px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: C.verdeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "700", color: C.verde }}>
              {esNuevo ? "+" : (form.nombres?.[0] || "?").toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>
                {esNuevo ? "Nuevo estudiante" : "Editar estudiante"}
              </h2>
              <p style={{ fontSize: "11px", color: C.textMuted, margin: 0 }}>
                {esNuevo ? "Datos del niño/niña" : `${form.apellidos} ${form.nombres}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <SecTitle>Datos personales</SecTitle>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <Lbl>Cédula *</Lbl>
                  <Inp
      required
      maxLength={10}
      value={form.cedula}
      onChange={set("cedula")}
      placeholder="Ingrese la cédula"
    />
  </div>
  <div>
    <Lbl>Fecha nacimiento *</Lbl>
    <Inp
      type="date"
      required
      value={form.fecha_nacimiento}
      onChange={handleFechaNac}
    />
  </div>
</div>

<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
  <div><Lbl>Nombres *</Lbl><Inp required value={form.nombres} onChange={set("nombres")} /></div>
  <div><Lbl>Apellidos *</Lbl><Inp required value={form.apellidos} onChange={set("apellidos")} /></div>
</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
  <div>
    <Lbl>Género *</Lbl>
    <Sel required value={form.genero} onChange={set("genero")}>
      <option value="M">Masculino</option>
      <option value="F">Femenino</option>
    </Sel>
  </div>
  <div>
    <Lbl>Representante *</Lbl>
    <Sel required value={form.padre} onChange={set("padre")} disabled={!!padreIdFijo}>
      <option value="">Seleccionar…</option>
      {padres.map(p => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos}</option>)}
    </Sel>
  </div>
</div>

          <div style={{ height: "1px", background: C.border }} />
          <SecTitle>Datos médicos</SecTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <Lbl>Tipo de sangre</Lbl>
              <Sel value={form.tipo_sangre} onChange={set("tipo_sangre")}>
                <option value="">No especificado</option>
                {SANGRES.map(s => <option key={s} value={s}>{s}</option>)}
              </Sel>
            </div>
          </div>
          <div>
            <Lbl>Alergias conocidas</Lbl>
            <textarea rows={2} value={form.alergias_conocidas} onChange={set("alergias_conocidas")}
              placeholder="Ej. Polen, mariscos…"
              style={{ ...iStyle, resize: "vertical" }} onFocus={fOn} onBlur={fOff} />
          </div>

          <div style={{ height: "1px", background: C.border }} />
          <SecTitle>Consentimiento de imagen</SecTitle>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: C.text }}>
            <input type="checkbox" checked={form.autoriza_imagen_redes} onChange={setChk("autoriza_imagen_redes")} style={{ width: "15px", height: "15px", accentColor: C.verde }} />
            Autoriza uso de imagen en redes y videos
          </label>
          {form.autoriza_imagen_redes && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div><Lbl>Fecha de firma</Lbl><Inp type="date" value={form.fecha_firma_consentimiento} onChange={set("fecha_firma_consentimiento")} /></div>
              <div><Lbl>Restricciones</Lbl><Inp value={form.restricciones_imagen} onChange={set("restricciones_imagen")} placeholder="Ej. Solo fotos grupales" /></div>
            </div>
          )}

          {/* Sección de finanzas solo al crear */}
          {esNuevo && (
            <>
              <div style={{ height: "1px", background: C.border }} />
              <SecTitle>Finanzas — Matrícula y mensualidades</SecTitle>
              <div style={{ background: C.bg, borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>

                {/* Indicador de tarifa auto-calculada por edad */}
                {tarifaActual && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: C.verdeLight, borderRadius: "8px", padding: "8px 12px" }}>
                    <span style={{ fontSize: "12px", color: C.verde, fontWeight: "600" }}>
                      Tarifa aplicada: {tarifaActual.label} — Matrícula ${tarifaActual.matricula} · Mensualidad ${tarifaActual.mensualidad}
                    </span>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <Lbl>Valor matrícula ($)</Lbl>
                    <Inp type="number" min="0" step="0.01" value={finanzas.matricula} onChange={setFin("matricula")} placeholder="0.00" />
                  </div>
                  <div>
                    <Lbl>Mensualidad ($)</Lbl>
                    <Inp type="number" min="0" step="0.01" value={finanzas.mensualidad} onChange={setFin("mensualidad")} placeholder="0.00" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <Lbl>Mes de inicio</Lbl>
                    <Sel value={finanzas.mes_inicio} onChange={setFin("mes_inicio")}>
                      {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </Sel>
                  </div>
                  <div>
                    <Lbl>Año de inicio del periodo</Lbl>
                    <Inp type="number" value={finanzas.anio} onChange={setFin("anio")} min="2024" max="2030" />
                  </div>
                </div>
                <p style={{ fontSize: "11px", color: C.textMuted, margin: 0 }}>
                  Se crearán pagos PENDIENTES desde el mes de inicio hasta Junio.
                </p>
              </div>
            </>
          )}

          <ErrBox msg={error} />

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, border: `1px solid ${C.border}`, background: "#fff", color: C.textMuted, padding: "9px", borderRadius: "9px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
              Cancelar
            </button>
            {/* Guardar estudiante y generar pagos */}
            <button type="submit" disabled={cargando}
              style={{ flex: 1, background: cargando ? C.verdeMid : C.verde, color: "#fff", border: "none", padding: "9px", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: cargando ? "not-allowed" : "pointer", fontFamily: "inherit" }}
              title="Guardar estudiante y generar pagos en finanzas">
              {cargando ? "Guardando…" : "Guardar estudiante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── FILA PADRE EXPANDIBLE ─────────────────────────────────────────────────────
function FilaPadre({ padre, padres, onEditarPadre, onNuevoHijo, onEditarHijo }) {
  const [expandido, setExpandido]       = useState(false);
  const [hijos, setHijos]               = useState(padre.hijos || []);
  const [cargandoHijos, setCargandoHijos] = useState(false);

  const toggle = async () => {
    if (!expandido && hijos.length === 0) {
      setCargandoHijos(true);
      try {
        const res = await api.get(`/familias/padres/${padre.id}/hijos/`);
        setHijos(res.data.results || res.data);
      } catch { } finally { setCargandoHijos(false); }
    }
    setExpandido(a => !a);
  };

  const calcEdad = f => {
    if (!f) return "—";
    const y = Math.floor((new Date() - new Date(f)) / (1000 * 60 * 60 * 24 * 365.25));
    return y === 0 ? "< 1 año" : `${y} año${y !== 1 ? "s" : ""}`;
  };

  const parentLabel = PARENTESCOS.find(p => p.value === padre.parentesco)?.label || padre.parentesco;

  return (
    <>
      <tr style={{ borderBottom: `1px solid ${C.border}` }}
        onMouseEnter={e => e.currentTarget.style.background = C.bg}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

        {/* Botón expandir fila */}
        <td style={{ padding: "12px 8px 12px 16px", width: "32px" }}>
          <button onClick={toggle} title="Ver hijos"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: C.textMuted, display: "flex" }}>
            <ChevronRight size={15} style={{ transform: expandido ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
          </button>
        </td>

        <td style={{ padding: "12px 16px", cursor: "pointer" }} onClick={toggle}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: C.verde, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", flexShrink: 0 }}>
              {(padre.nombres?.[0] || "?").toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: "700", color: C.text, margin: 0, fontSize: "13px" }}>{padre.apellidos} {padre.nombres}</p>
              <p style={{ fontSize: "11px", color: C.textMuted, margin: "2px 0 0" }}>{padre.cedula} · {padre.email}</p>
            </div>
          </div>
        </td>
        <td style={{ padding: "12px 16px", fontSize: "13px", color: C.textMuted }}>{parentLabel}</td>
        <td style={{ padding: "12px 16px", fontSize: "13px", color: C.textMuted }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Phone size={12} /> {padre.telefono}
          </div>
        </td>
        <td style={{ padding: "12px 16px" }}>
          {padre.principal
            ? <span style={{ background: C.verdeLight, color: C.verde, fontSize: "11px", fontWeight: "600", padding: "3px 9px", borderRadius: "20px" }}>Principal</span>
            : <span style={{ fontSize: "11px", color: C.textMuted }}>Secundario</span>}
        </td>
        <td style={{ padding: "12px 16px", textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
            {/* Agregar hijo a este representante */}
            <button
              onClick={e => { e.stopPropagation(); onNuevoHijo(padre); }}
              title="Agregar hijo"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "7px", color: C.textMuted, display: "flex" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.verdeLight; e.currentTarget.style.color = C.verde; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.textMuted; }}>
              <Plus size={15} />
            </button>
            {/* Editar representante */}
            <button
              onClick={e => { e.stopPropagation(); onEditarPadre(padre); }}
              title="Editar representante"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "7px", color: C.textMuted, display: "flex" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.verdeLight; e.currentTarget.style.color = C.verde; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.textMuted; }}>
              <Edit size={15} />
            </button>
          </div>
        </td>
      </tr>

      {expandido && cargandoHijos && (
        <tr><td colSpan={6} style={{ padding: "12px 24px", background: C.bg }}>
          <span style={{ fontSize: "12px", color: C.textMuted }}>Cargando hijos…</span>
        </td></tr>
      )}

      {expandido && !cargandoHijos && hijos.length === 0 && (
        <tr><td colSpan={6} style={{ padding: "10px 24px 10px 72px", background: C.bg }}>
          <span style={{ fontSize: "12px", color: C.textMuted, fontStyle: "italic" }}>Sin hijos registrados.</span>
        </td></tr>
      )}

      {expandido && !cargandoHijos && hijos.map(hijo => (
        <tr key={hijo.id} style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
          <td style={{ padding: "8px 8px 8px 16px" }} />
          <td style={{ padding: "8px 16px 8px 56px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: C.verdeLight, color: C.verde, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", flexShrink: 0 }}>
                {(hijo.nombres?.[0] || "?").toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: "600", color: C.text, margin: 0, fontSize: "13px" }}>{hijo.apellidos} {hijo.nombres}</p>
                <p style={{ fontSize: "11px", color: C.textMuted, margin: "1px 0 0" }}>{hijo.fecha_nacimiento}</p>
              </div>
            </div>
          </td>
          <td style={{ padding: "8px 16px", fontSize: "12px", color: C.textMuted }}>{calcEdad(hijo.fecha_nacimiento)}</td>
          <td style={{ padding: "8px 16px" }}>
            {hijo.tipo_sangre
              ? <span style={{ background: "#FEE2E2", color: "#991B1B", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px" }}>{hijo.tipo_sangre}</span>
              : <span style={{ fontSize: "11px", color: C.textMuted }}>—</span>}
          </td>
          <td style={{ padding: "8px 16px" }}>
            <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: hijo.activo ? "#E8F5EA" : C.dangerLight, color: hijo.activo ? "#2A7A3A" : C.danger }}>
              {hijo.activo ? "Activo" : "Inactivo"}
            </span>
          </td>
          <td style={{ padding: "8px 16px", textAlign: "right" }}>
            {/* Editar datos del hijo */}
            <button
              onClick={e => { e.stopPropagation(); onEditarHijo(hijo, padre.id); }}
              title="Editar hijo"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "5px", borderRadius: "7px", color: C.textMuted, display: "inline-flex" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.verdeLight; e.currentTarget.style.color = C.verde; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.textMuted; }}>
              <Edit size={13} />
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}

// ── GESTIÓN PRINCIPAL ─────────────────────────────────────────────────────────
function GestionFamilias() {
  const [padres, setPadres]         = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [busqueda, setBusqueda]     = useState("");
  const [modalPadre, setModalPadre] = useState(null);
  const [modalHijo, setModalHijo]   = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await api.get("/familias/padres/");
      setPadres(res.data.results || res.data);
    } catch { } finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = padres.filter(p =>
    `${p.nombres} ${p.apellidos} ${p.cedula}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      {/* Cabecera principal */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>Representantes y Estudiantes</h1>
          <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>{padres.length} representantes registrados</p>
        </div>
        {/* Crear nuevo representante */}
        <button onClick={() => setModalPadre("nuevo")}
          title="Registrar nuevo representante"
          style={{ display: "flex", alignItems: "center", gap: "6px", background: C.verdeMid, color: "#fff", border: "none", borderRadius: "10px", padding: "9px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
          <Plus size={15} /> Nuevo representante
        </button>
      </div>

      {/* Buscador */}
      <div style={{ position: "relative", marginBottom: "14px" }}>
        <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, apellido o cédula…"
          style={{ ...iStyle, paddingLeft: "36px" }} onFocus={fOn} onBlur={fOff} />
      </div>

      {/* Tabla principal */}
      <div style={card}>
        {cargando ? <Spinner /> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                <th style={{ width: "32px" }} />
                {["Representante", "Parentesco", "Teléfono", "Tipo", "Acciones"].map((h, i) => (
                  <th key={i} style={{ padding: "11px 16px", textAlign: i === 4 ? "right" : "left", fontSize: "11px", fontWeight: "600", color: C.verdeMid, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map(padre => (
                <FilaPadre
                  key={padre.id}
                  padre={padre}
                  padres={padres}
                  onEditarPadre={p => setModalPadre(p)}
                  onNuevoHijo={p => setModalHijo({ estudiante: null, padreId: p.id })}
                  onEditarHijo={(h, padreId) => setModalHijo({ estudiante: h, padreId })}
                />
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: C.textMuted, fontSize: "13px" }}>
                  {busqueda ? `Sin resultados para "${busqueda}"` : "No hay representantes registrados."}
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {!cargando && filtrados.length > 0 && (
        <p style={{ fontSize: "11px", color: C.textMuted, textAlign: "center", marginTop: "10px" }}>
          Clic en ▶ para ver los hijos · Usa + para agregar un hijo
        </p>
      )}

      {/* Modal representante */}
      {modalPadre && (
        <ModalPadre
          padre={modalPadre === "nuevo" ? null : modalPadre}
          onClose={() => setModalPadre(null)}
          onGuardado={() => { setModalPadre(null); cargar(); }}
        />
      )}

      {/* Modal estudiante */}
      {modalHijo && (
        <ModalEstudiante
          estudiante={modalHijo.estudiante}
          padres={padres}
          padreIdFijo={modalHijo.padreId}
          onClose={() => setModalHijo(null)}
          onGuardado={() => { setModalHijo(null); cargar(); }}
        />
      )}
    </div>
  );
}

export default function SecretariaPage() {
  return (
    <MainLayout>
      <Routes>
        <Route index element={<GestionFamilias />} />
        <Route path="familias" element={<GestionFamilias />} />
      </Routes>
    </MainLayout>
  );
}