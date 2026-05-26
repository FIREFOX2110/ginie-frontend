import { useState, useEffect } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../api/axios";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  Users, GraduationCap, DollarSign, AlertTriangle,
  CheckCircle, Clock, XCircle, Search,
  ShieldCheck, BookOpen, Bus, MapPin,
  Calendar, Phone, CreditCard, Megaphone, Send, ChevronDown,
} from "lucide-react";

const BRAND = {
  primary: "#2D5A3D", accent: "#D4821A", success: "#16A34A",
  warning: "#CA8A04", danger: "#DC2626", blue: "#2563EB",
};

const C = {
  verde: "#2D5A3D", verdeDark: "#1A3A27", verdeLight: "#E8F4ED",
  verdeMid: "#5A8A6A", border: "#E2EDE6", bg: "#F4F9F6",
  text: "#1A3A27", textMuted: "#5A7A68",
  danger: "#DC2626", dangerLight: "#FEE2E2",
  success: "#16A34A", successLight: "#DCFCE7",
};

// ── Estilos inline base ───────────────────────────────────────────────────────
const card = {
  background: "#fff", borderRadius: "12px",
  border: `1px solid ${C.border}`, padding: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: "28px", height: "28px", border: `3px solid ${C.verdeLight}`, borderTop: `3px solid ${C.verde}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}

function KPICard({ titulo, valor, subtitulo, icono: Icon, color = C.verde }) {
  return (
    <div style={{ ...card, display: "flex", alignItems: "center", gap: "16px" }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={22} color={color} strokeWidth={2} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: "24px", fontWeight: "700", color: C.text, margin: "0 0 4px", lineHeight: 1 }}>{valor}</p>
        <p style={{ fontSize: "11px", fontWeight: "700", color: C.textMuted, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{titulo}</p>
        {subtitulo && <p style={{ fontSize: "11px", color: C.textMuted, margin: "2px 0 0", opacity: 0.7 }}>{subtitulo}</p>}
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard() {
  const [finanzas, setFinanzas]     = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [incidentes, setIncidentes] = useState([]);
  const [usuarios, setUsuarios]     = useState([]);
  const [cargando, setCargando]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/finanzas/resumen/").catch(() => ({ data: { cantidad_pagados: 0, cantidad_pendientes: 0, cantidad_atrasados: 0, total_cobrado: 0, total_pendiente: 0, total_atrasado: 0 } })),
      api.get("/academico/estudiantes/").catch(() => ({ data: [] })),
      api.get("/operativo/incidentes/").catch(() => ({ data: [] })),
      api.get("/usuarios/").catch(() => ({ data: [] })),
    ]).then(([finRes, estRes, incRes, usrRes]) => {
      setFinanzas(finRes.data);
      setEstudiantes(estRes.data.results || estRes.data);
      setIncidentes(incRes.data.results || incRes.data);
      setUsuarios(usrRes.data.results || usrRes.data);
      setCargando(false);
    });
  }, []);

  if (cargando) return <Spinner />;

  const datosPagos = finanzas ? [
    { name: "Al Día",     value: finanzas.cantidad_pagados    || 0, fill: BRAND.success },
    { name: "Pendientes", value: finanzas.cantidad_pendientes || 0, fill: BRAND.warning },
    { name: "En Mora",    value: finanzas.cantidad_atrasados  || 0, fill: BRAND.danger  },
  ] : [];

  const datosIncidentes = [
    { name: "Leves",     cantidad: incidentes.filter(i => i.gravedad === "LEVE").length,     fill: BRAND.blue    },
    { name: "Moderados", cantidad: incidentes.filter(i => i.gravedad === "MODERADA").length, fill: BRAND.warning },
    { name: "Graves",    cantidad: incidentes.filter(i => i.gravedad === "GRAVE").length,    fill: BRAND.danger  },
  ];

  const rolCount = {};
  usuarios.filter(u => u.rol !== "REPRESENTANTE").forEach(u => {
    const r = u.rol_display || u.rol || "Sin Rol";
    rolCount[r] = (rolCount[r] || 0) + 1;
  });
  const datosPersonal = Object.entries(rolCount).map(([name, value]) => ({ name, value }));

  const totalEsperado = (finanzas?.total_cobrado || 0) + (finanzas?.total_pendiente || 0) + (finanzas?.total_atrasado || 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingBottom: "32px" }}>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
        <KPICard titulo="Estudiantes Activos"  valor={estudiantes.filter(e => e.activo !== false).length} subtitulo="Matriculados este ciclo" icono={GraduationCap} />
        <KPICard titulo="Recaudación"           valor={`$${((finanzas?.total_cobrado || 0) / 1000).toFixed(1)}k`} subtitulo="Pagos procesados" icono={DollarSign} color={BRAND.success} />
        <KPICard titulo="Personal Operativo"    valor={usuarios.filter(u => u.rol !== "REPRESENTANTE").length} subtitulo="Docentes y administrativos" icono={Users} />
        <KPICard titulo="Alertas Críticas"      valor={incidentes.filter(i => i.gravedad === "GRAVE").length} subtitulo="Incidentes graves" icono={AlertTriangle} color={BRAND.danger} />
      </div>

      {/* Gráficos fila 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {/* Cartera */}
        <div style={card}>
          <p style={{ fontSize: "11px", fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px" }}>Distribución de Cartera</p>
          <div style={{ height: "220px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={datosPagos} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5}>
                  {datosPagos.map((e, i) => <Cell key={i} fill={e.fill} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: `1px solid ${C.border}`, fontSize: "12px" }} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: "11px", color: C.textMuted }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "20px", fontWeight: "600", color: C.text, margin: 0 }}>{finanzas?.cantidad_pagados || 0}</p>
              <p style={{ fontSize: "11px", fontWeight: "700", color: BRAND.success, margin: 0, textTransform: "uppercase" }}>Al Día</p>
            </div>
            <div style={{ textAlign: "center", borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }}>
              <p style={{ fontSize: "20px", fontWeight: "600", color: C.text, margin: 0 }}>{finanzas?.cantidad_pendientes || 0}</p>
              <p style={{ fontSize: "11px", fontWeight: "700", color: BRAND.warning, margin: 0, textTransform: "uppercase" }}>Pendientes</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "20px", fontWeight: "600", color: BRAND.danger, margin: 0 }}>{finanzas?.cantidad_atrasados || 0}</p>
              <p style={{ fontSize: "11px", fontWeight: "700", color: BRAND.danger, margin: 0, textTransform: "uppercase" }}>En Mora</p>
            </div>
          </div>
        </div>

        {/* Proyección */}
        <div style={{ ...card, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px" }}>Proyección Financiera</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { label: "Total Recaudado", valor: finanzas?.total_cobrado || 0, color: BRAND.success, bg: "#F0FDF4", icon: CheckCircle },
              { label: "Por Cobrar",      valor: finanzas?.total_pendiente || 0, color: BRAND.warning, bg: "#FEFCE8", icon: Clock },
              { label: "Cartera Vencida", valor: finanzas?.total_atrasado || 0, color: BRAND.danger,  bg: "#FFF1F2", icon: XCircle },
            ].map(({ label, valor, color, bg, icon: Icon }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: bg, borderRadius: "10px", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={16} color={color} />
                  </div>
                  <p style={{ fontSize: "11px", fontWeight: "700", color, textTransform: "uppercase", margin: 0 }}>{label}</p>
                </div>
                <p style={{ fontSize: "18px", fontWeight: "600", color, margin: 0 }}>${valor.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: C.textMuted, textTransform: "uppercase" }}>Total Esperado</span>
            <span style={{ fontSize: "22px", fontWeight: "700", color: C.verde }}>${totalEsperado.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Gráficos fila 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {/* Incidentes */}
        <div style={{ ...card, minHeight: "280px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px" }}>Incidentes Operativos</p>
          <div style={{ height: "220px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosIncidentes} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.textMuted }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.textMuted }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: `1px solid ${C.border}`, fontSize: "12px" }} />
                <Bar dataKey="cantidad" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {datosIncidentes.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Personal */}
        <div style={{ ...card, minHeight: "280px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px" }}>Distribución de Personal</p>
          <div style={{ height: "220px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosPersonal} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={C.border} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.textMuted }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.text, fontWeight: 500 }} width={90} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: `1px solid ${C.border}`, fontSize: "12px" }} />
                <Bar dataKey="value" fill={C.verde} radius={[0, 4, 4, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PERSONAL ──────────────────────────────────────────────────────────────────
function PersonalView() {
  const [personal, setPersonal] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    api.get("/usuarios/")
      .then(r => {
        const data = (r.data.results || r.data).map(u => {
          const rol = (u.rol || "").toUpperCase();
          let detalles = {};
          if (rol === "MAESTRO")       detalles = { tipo: "academico",       aula: u.aula || "Sin asignar", horario: "07:00 - 13:30" };
          else if (rol === "CHOFER")   detalles = { tipo: "logistica",       ruta: u.ruta || "Sin asignar", vehiculo: u.vehiculo || "—" };
          else                         detalles = { tipo: "administrativo",  area: u.area_nombre || "Administración" };
          return { ...u, detalles };
        });
        setPersonal(data);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  const filtrado = personal.filter(u => {
    const rol = (u.rol || "").toUpperCase();
    if (rol === "REPRESENTANTE") return false;
    const q = busqueda.toLowerCase();
    return `${u.first_name} ${u.last_name} ${u.rol}`.toLowerCase().includes(q);
  });

  if (cargando) return <Spinner />;

  return (
    <div style={{ ...card, marginTop: "20px", overflow: "hidden", padding: 0 }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <p style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>Directorio de Personal</p>
          <p style={{ fontSize: "12px", color: C.textMuted, margin: "2px 0 0" }}>Docentes, operativos y administrativos</p>
        </div>
        <div style={{ position: "relative", width: "260px", flexShrink: 0 }}>
          <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o rol..."
            style={{ width: "100%", padding: "8px 10px 8px 32px", border: `1px solid ${C.border}`, borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
              {["Empleado", "Rol y Asignación", "Contacto", "Estado"].map(h => (
                <th key={h} style={{ padding: "10px 18px", fontSize: "11px", fontWeight: "700", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrado.map((u, i) => {
              const nombre = `${u.first_name || ""} ${u.last_name || ""}`.trim();
              const ini = nombre[0]?.toUpperCase() || "?";
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: C.verdeLight, color: C.verde, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", flexShrink: 0 }}>{ini}</div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: "700", color: C.text, margin: 0 }}>{nombre.toUpperCase()}</p>
                        <p style={{ fontSize: "11px", color: C.textMuted, margin: "2px 0 0" }}>@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                      <ShieldCheck size={13} color={C.verde} />
                      <span style={{ fontSize: "12px", fontWeight: "700", color: C.text }}>{u.rol_display || u.rol}</span>
                    </div>
                    {u.detalles.tipo === "academico" && (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", color: C.textMuted, background: "#EFF6FF", padding: "4px 8px", borderRadius: "6px", width: "fit-content" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><BookOpen size={11} color={BRAND.blue} /> {u.detalles.aula}</span>
                        <span>|</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={11} color={BRAND.blue} /> {u.detalles.horario}</span>
                      </div>
                    )}
                    {u.detalles.tipo === "logistica" && (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", color: C.textMuted, background: "#FFF7ED", padding: "4px 8px", borderRadius: "6px", width: "fit-content" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Bus size={11} color={BRAND.accent} /> {u.detalles.vehiculo}</span>
                        <span>|</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={11} color={BRAND.accent} /> {u.detalles.ruta}</span>
                      </div>
                    )}
                    {u.detalles.tipo === "administrativo" && (
                      <div style={{ fontSize: "11px", color: C.textMuted, background: C.bg, padding: "4px 8px", borderRadius: "6px", width: "fit-content" }}>
                        {u.detalles.area}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>{u.email}</p>
                    {u.telefono && <p style={{ fontSize: "11px", color: C.textMuted, margin: "2px 0 0", display: "flex", alignItems: "center", gap: "4px" }}><Phone size={10} /> {u.telefono}</p>}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    {u.is_active
                      ? <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "6px", background: "#F0FDF4", color: BRAND.success, fontSize: "11px", fontWeight: "700", border: "1px solid #BBF7D0" }}><CheckCircle size={10} /> ACTIVO</span>
                      : <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "6px", background: "#F9FAFB", color: "#6B7280", fontSize: "11px", fontWeight: "700", border: "1px solid #E5E7EB" }}><XCircle size={10} /> INACTIVO</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── FAMILIAS ──────────────────────────────────────────────────────────────────
function FamiliasView() {
  const [padres, setPadres]   = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/familias/padres/")
      .then(r => { setPadres(r.data.results || r.data); setCargando(false); })
      .catch(() => setCargando(false));
  }, []);

  if (cargando) return <Spinner />;

  return (
    <div style={{ ...card, marginTop: "20px", overflow: "hidden", padding: 0 }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>Directorio de Familias</p>
        <p style={{ fontSize: "12px", color: C.textMuted, margin: "2px 0 0" }}>Representantes legales y estudiantes vinculados</p>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
              {["Representante Legal", "Estudiantes a Cargo", "Estado Cuenta"].map(h => (
                <th key={h} style={{ padding: "10px 18px", fontSize: "11px", fontWeight: "700", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {padres.map((p, i) => {
              const ini = (p.nombres || "?")[0].toUpperCase();
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: C.verde, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", flexShrink: 0 }}>{ini}</div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: "700", color: C.text, margin: 0 }}>{p.nombres} {p.apellidos}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px" }}>
                          <Phone size={10} color={C.textMuted} />
                          <span style={{ fontSize: "11px", color: C.textMuted }}>{p.telefono}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {(p.hijos || []).map((hijo, j) => (
                        <div key={j} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "6px 10px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                          <div style={{ background: C.bg, padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "700", color: C.verde, border: `1px solid ${C.border}` }}>
                            <GraduationCap size={10} />
                          </div>
                          <div>
                            <p style={{ fontSize: "12px", fontWeight: "700", color: C.text, margin: 0 }}>{hijo.nombres} {hijo.apellidos}</p>
                            <p style={{ fontSize: "10px", color: C.textMuted, margin: "1px 0 0" }}>{hijo.activo ? "Activo" : "Inactivo"}</p>
                          </div>
                        </div>
                      ))}
                      {(!p.hijos || p.hijos.length === 0) && <span style={{ fontSize: "12px", color: C.textMuted }}>Sin estudiantes registrados</span>}
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "6px", background: "#F0FDF4", color: BRAND.success, fontSize: "11px", fontWeight: "700", border: "1px solid #BBF7D0" }}>
                      <CreditCard size={11} /> AL DÍA
                    </span>
                  </td>
                </tr>
              );
            })}
            {padres.length === 0 && (
              <tr><td colSpan={3} style={{ padding: "40px", textAlign: "center", color: C.textMuted, fontSize: "13px" }}>No hay familias registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function ComunicadosView() {
  const [form, setForm] = useState({ grupo: "TODOS", asunto: "", cuerpo: "" });
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const grupos = [
    { value: "TODOS", label: "Todos los usuarios" },
    { value: "INTERNOS", label: "Personal interno" },
    { value: "PADRES", label: "Padres / Representantes" },
    { value: "DIRECTIVOS", label: "Directivos" },
    { value: "SECRETARIA", label: "Secretaría" },
    { value: "FINANZAS", label: "Finanzas" },
    { value: "MAESTROS", label: "Maestros" },
    { value: "ENFERMERIA", label: "Enfermería" },
    { value: "CHOFERES", label: "Choferes" },
    { value: "MARKETING", label: "Marketing" },
  ];

  const set = key => e => setForm({ ...form, [key]: e.target.value });

  const enviar = async e => {
    e.preventDefault();
    setEnviando(true);
    setResultado(null);
    setError(null);

    try {
      const { data } = await api.post("/comunicacion/mensajes/masivo/", form);
      setResultado(data);
      setForm({ grupo: "TODOS", asunto: "", cuerpo: "" });
    } catch (err) {
      console.error("Error enviando comunicado:", err.response?.data || err);
      setError("No se pudo enviar el comunicado. Verifica permisos o contenido.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ ...card, marginTop: "20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "18px" }}>
        <div>
          <p style={{ fontSize: "17px", fontWeight: "700", color: C.text, margin: "0 0 4px" }}>Comunicados institucionales</p>
          <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>Envía mensajes masivos a todos los usuarios o a grupos específicos.</p>
        </div>
        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: C.verdeLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Megaphone size={20} color={C.verde} />
        </div>
      </div>

      {resultado && (
        <div style={{ background: C.successLight, color: C.success, borderRadius: "10px", padding: "12px 14px", fontSize: "13px", fontWeight: "700", marginBottom: "14px" }}>
          Comunicado enviado correctamente a {resultado.total_destinatarios} destinatario(s).
        </div>
      )}

      {error && (
        <div style={{ background: C.dangerLight, color: C.danger, borderRadius: "10px", padding: "12px 14px", fontSize: "13px", fontWeight: "700", marginBottom: "14px" }}>
          {error}
        </div>
      )}

      <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Destinatarios</label>
          <div style={{ position: "relative" }}>
            <select required value={form.grupo} onChange={set("grupo")} style={{ width: "100%", padding: "9px 32px 9px 12px", border: `1px solid ${C.border}`, borderRadius: "9px", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", appearance: "none", background: "#fff", cursor: "pointer" }}>
              {grupos.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: C.textMuted, pointerEvents: "none" }} />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Asunto</label>
          <input required value={form.asunto} onChange={set("asunto")} placeholder="Ej. Comunicado institucional" style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: "9px", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Mensaje</label>
          <textarea required rows={6} value={form.cuerpo} onChange={set("cuerpo")} placeholder="Escribe el comunicado que recibirán los destinatarios seleccionados." style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: "9px", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }} />
        </div>

        <button type="submit" disabled={enviando} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", width: "fit-content", background: enviando ? C.verdeMid : C.verde, color: "#fff", border: "none", borderRadius: "10px", padding: "10px 16px", fontSize: "13px", fontWeight: "700", cursor: enviando ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          <Send size={15} />
          {enviando ? "Enviando..." : "Enviar comunicado"}
        </button>
      </form>
    </div>
  );
}

// ── DIRECTOR PAGE ─────────────────────────────────────────────────────────────
const tabStyle = (isActive) => ({
  paddingBottom: "12px", fontSize: "13px", fontWeight: isActive ? "700" : "600",
  color: isActive ? C.text : C.textMuted, textDecoration: "none",
  borderBottom: isActive ? `2px solid ${C.verde}` : "2px solid transparent",
  transition: "color 0.15s", letterSpacing: "0.05em", textTransform: "uppercase",
});

export default function DirectorPage() {
  return (
    <MainLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ borderBottom: `1px solid ${C.border}`, marginBottom: "0" }}>
          <nav style={{ display: "flex", gap: "28px", padding: "0 4px" }}>
            <NavLink to="" end style={({ isActive }) => tabStyle(isActive)}>Resumen General</NavLink>
            <NavLink to="personal" style={({ isActive }) => tabStyle(isActive)}>Personal y Docentes</NavLink>
            <NavLink to="familias" style={({ isActive }) => tabStyle(isActive)}>Familias y Alumnos</NavLink>
            <NavLink to="comunicados" style={({ isActive }) => tabStyle(isActive)}>Comunicados</NavLink>
          </nav>
        </div>
        <div style={{ paddingTop: "20px" }}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="personal" element={<PersonalView />} />
            <Route path="familias" element={<FamiliasView />} />
            <Route path="comunicados" element={<ComunicadosView />} />
          </Routes>
        </div>
      </div>
    </MainLayout>
  );
}