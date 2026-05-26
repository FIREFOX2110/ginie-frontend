import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../api/axios";
import {
  DollarSign, TrendingUp, Clock, AlertTriangle,
  Search, Upload, CheckCircle, X, ChevronDown, Paperclip, Plus, User,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// ── Paleta Nova Valley ───────────────────────────────────────────────────────
const C = {
  verde: "#2D5A3D", verdeDark: "#1A3A27", verdeLight: "#E8F4ED",
  verdeMid: "#5A7A68", naranja: "#D4821A", naranjaLight: "#FEF3E2",
  border: "#D6E8DC", bg: "#F4F9F6", text: "#1A3A27", textMuted: "#6B8F78",
  danger: "#DC2626", dangerLight: "#FEE2E2",
  warning: "#CA8A04", warningLight: "#FEF9C3",
  success: "#16A34A", successLight: "#DCFCE7",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const iStyle = {
  width: "100%", border: `1px solid ${C.border}`, borderRadius: "8px",
  padding: "8px 12px", fontSize: "13px", outline: "none",
  background: "#fff", color: C.text, boxSizing: "border-box", fontFamily: "inherit",
};
const focusOn  = e => { e.target.style.borderColor = C.verde; e.target.style.boxShadow = `0 0 0 3px ${C.verdeLight}`; };
const focusOff = e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; };
const fmt = n => `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

const getApiPathFromNext = nextUrl => {
  if (!nextUrl) return null;
  try {
    const url = new URL(nextUrl);
    return url.pathname.replace("/api/v1", "") + url.search;
  } catch {
    return nextUrl;
  }
};

const fetchAllPages = async initialUrl => {
  let url = initialUrl;
  let items = [];

  while (url) {
    const { data } = await api.get(url);

    if (data.results) {
      items = [...items, ...data.results];
      url = getApiPathFromNext(data.next);
    } else {
      items = Array.isArray(data) ? data : [];
      url = null;
    }
  }

  return items;
};

function Inp(p)  { return <input    {...p} style={iStyle} onFocus={focusOn} onBlur={focusOff} />; }
function Sel({ children, ...p }) {
  return (
    <div style={{ position: "relative" }}>
      <select {...p} style={{ ...iStyle, appearance: "none", paddingRight: "30px", cursor: "pointer" }} onFocus={focusOn} onBlur={focusOff}>{children}</select>
      <ChevronDown size={13} style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: C.textMuted }} />
    </div>
  );
}
function Lbl({ children }) {
  return <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: C.verdeMid, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{children}</label>;
}
function Badge({ bg, color, children }) {
  return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: bg, color }}>{children}</span>;
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

// ── Tarjeta KPI ───────────────────────────────────────────────────────────────
function KPICard({ titulo, valor, sub, icono: Icon, iconColor, iconBg }) {
  return (
    <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "13px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={22} color={iconColor} strokeWidth={2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: "24px", fontWeight: "600", color: C.text, margin: 0, lineHeight: 1.1 }}>{valor}</p>
        <p style={{ fontSize: "11px", fontWeight: "700", color: C.verdeMid, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>{titulo}</p>
        {sub && <p style={{ fontSize: "11px", color: C.textMuted, margin: "2px 0 0" }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Estados de pago ───────────────────────────────────────────────────────────
const PAGO_STYLE = {
  PAGADO:   { bg: C.successLight, color: C.success, label: "Pagado" },
  PENDIENTE:{ bg: C.warningLight, color: C.warning,  label: "Pendiente" },
  ATRASADO: { bg: C.dangerLight,  color: C.danger,   label: "Atrasado" },
};

// ── PAGOS ─────────────────────────────────────────────────────────────────────
function ModalVerificar({ pago, onClose, onGuardado }) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const verificar = async () => {
    setCargando(true); setError(null);
    try {
      await api.patch(`/finanzas/pagos/${pago.id}/`, {
        estado: "PAGADO",
        fecha_pago: new Date().toISOString().slice(0, 10),
        metodo_pago: pago.metodo_pago || "Verificado por finanzas",
      });
      onGuardado();
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : "Error al verificar.");
    } finally { setCargando(false); }
  };

  const s = PAGO_STYLE[pago.estado] || PAGO_STYLE.PENDIENTE;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(26,58,39,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: C.successLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={18} color={C.success} />
            </div>
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>Verificar pago</h2>
              <p style={{ fontSize: "11px", color: C.textMuted, margin: 0 }}>{pago.estudiante_nombre}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted }}><X size={18} /></button>
        </div>
        <div style={{ padding: "20px 22px" }}>
          <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 16px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              ["Estudiante", pago.estudiante_nombre],
              ["Período",    `${pago.mes_display || pago.mes} ${pago.anio}`],
              ["Monto",      fmt(pago.monto)],
              ["Estado actual", <Badge bg={s.bg} color={s.color}>{s.label}</Badge>],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: C.textMuted }}>{k}</span>
                <span style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>{v}</span>
              </div>
            ))}
          </div>
          {pago.comprobante && (
            <a href={pago.comprobante} target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: C.verde, textDecoration: "none", marginBottom: "16px" }}>
              <Paperclip size={14} /> Ver comprobante adjunto
            </a>
          )}
          {error && <div style={{ background: C.dangerLight, color: C.danger, fontSize: "12px", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px" }}>{error}</div>}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose} style={{ flex: 1, border: `1px solid ${C.border}`, background: "#fff", color: C.textMuted, padding: "9px", borderRadius: "9px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            <button onClick={verificar} disabled={cargando}
              style={{ flex: 1, background: cargando ? C.verdeMid : C.success, color: "#fff", border: "none", padding: "9px", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: cargando ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <CheckCircle size={14} /> {cargando ? "Verificando…" : "Confirmar pago"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [modal, setModal] = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const params = filtroEstado ? `?estado=${filtroEstado}` : "";
      const data = await fetchAllPages(`/finanzas/pagos/${params}`);
      setPagos(data);
    } catch (err) {
      console.error("Error cargando pagos:", err.response?.data || err);
      setPagos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [filtroEstado]);

  const filtrados = pagos.filter(p =>
    `${p.estudiante_nombre || ""} ${p.mes_display || ""} ${p.anio || ""}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const conteos = Object.fromEntries(
    Object.keys(PAGO_STYLE).map(e => [e, pagos.filter(p => p.estado === e).length])
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>Gestión de pagos</h1>
          <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>{pagos.length} registros</p>
        </div>
      </div>

      {/* Filtros de estado */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "18px" }}>
        {Object.entries(conteos).map(([estado, count]) => {
          const s = PAGO_STYLE[estado];
          const activo = filtroEstado === estado;
          return (
            <button key={estado} onClick={() => setFiltroEstado(activo ? "" : estado)}
              style={{ padding: "14px", borderRadius: "12px", border: activo ? `2px solid ${C.verde}` : `1px solid ${C.border}`, background: activo ? C.verdeLight : "#fff", cursor: "pointer", textAlign: "center", fontFamily: "inherit", transition: "all 0.15s" }}>
              <p style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 4px" }}>{count}</p>
              <Badge bg={s.bg} color={s.color}>{s.label}</Badge>
            </button>
          );
        })}
      </div>

      {/* Buscador */}
      <div style={{ position: "relative", marginBottom: "14px" }}>
        <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por estudiante, mes o año…"
          style={{ ...iStyle, paddingLeft: "36px" }} onFocus={focusOn} onBlur={focusOff} />
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {cargando ? <Spinner /> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {["Estudiante", "Período", "Monto", "Estado", "Comprobante", "Acción"].map((h, i) => (
                  <th key={i} style={{ padding: "11px 16px", textAlign: i === 5 ? "right" : "left", fontSize: "11px", fontWeight: "600", color: C.verdeMid, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p, idx) => {
                const s = PAGO_STYLE[p.estado] || PAGO_STYLE.PENDIENTE;
                return (
                  <tr key={p.id} style={{ borderBottom: idx < filtrados.length - 1 ? `1px solid ${C.border}` : "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bg}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 16px", fontWeight: "600", color: C.text }}>{p.estudiante_nombre}</td>
                    <td style={{ padding: "12px 16px", color: C.textMuted }}>{p.mes_display || p.mes} {p.anio}</td>
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: C.text }}>{fmt(p.monto)}</td>
                    <td style={{ padding: "12px 16px" }}><Badge bg={s.bg} color={s.color}>{s.label}</Badge></td>
                    <td style={{ padding: "12px 16px" }}>
                      {p.comprobante
                        ? <a href={p.comprobante} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: C.verde, textDecoration: "none" }}><Paperclip size={13} /> Ver</a>
                        : <span style={{ fontSize: "12px", color: C.textMuted }}>Sin archivo</span>}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      {p.estado !== "PAGADO" && (
                        <button onClick={() => setModal(p)}
                          style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: C.successLight, color: C.success, border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#BBF7D0"}
                          onMouseLeave={e => e.currentTarget.style.background = C.successLight}>
                          <CheckCircle size={13} /> Verificar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: C.textMuted, fontSize: "13px" }}>
                  {busqueda ? `Sin resultados para "${busqueda}"` : "No hay pagos registrados."}
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ModalVerificar
          pago={modal}
          onClose={() => setModal(null)}
          onGuardado={() => { setModal(null); cargar(); }}
        />
      )}
    </div>
  );
}

// ── COMPROBANTES ──────────────────────────────────────────────────────────────
function Comprobantes() {
  const [comprobantes, setComprobantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchAllPages("/finanzas/comprobantes/lista/")
      .then(data => setComprobantes(data))
      .catch(err => {
        console.error("Error cargando comprobantes:", err.response?.data || err);
        setComprobantes([]);
      })
      .finally(() => setCargando(false));
  }, []);

  const filtrados = comprobantes.filter(c =>
    `${c.estudiante_nombre || ""} ${c.descripcion || ""}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>Comprobantes</h1>
        <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>{comprobantes.length} archivos subidos</p>
      </div>

      <div style={{ position: "relative", marginBottom: "14px" }}>
        <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar comprobante…"
          style={{ ...iStyle, paddingLeft: "36px" }} onFocus={focusOn} onBlur={focusOff} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
        {cargando ? <Spinner /> : filtrados.map(c => (
          <div key={c.id} style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: C.naranjaLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Paperclip size={18} color={C.naranja} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: "600", color: C.text, margin: 0, fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.estudiante_nombre || "Estudiante"}</p>
                <p style={{ fontSize: "11px", color: C.textMuted, margin: "2px 0 0" }}>{c.fecha_subida ? new Date(c.fecha_subida).toLocaleDateString("es-EC") : "—"}</p>
              </div>
            </div>
            {c.descripcion && <p style={{ fontSize: "12px", color: C.verdeMid, margin: "0 0 10px" }}>{c.descripcion}</p>}
            {c.archivo && (
              <a href={c.archivo} target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: C.verdeLight, color: C.verde, fontSize: "12px", fontWeight: "600", padding: "8px", borderRadius: "8px", textDecoration: "none" }}>
                <Upload size={13} /> Descargar comprobante
              </a>
            )}
          </div>
        ))}
        {!cargando && filtrados.length === 0 && (
          <p style={{ color: C.textMuted, fontSize: "13px", gridColumn: "1/-1", textAlign: "center", padding: "40px 0" }}>
            {busqueda ? `Sin resultados para "${busqueda}"` : "No hay comprobantes subidos."}
          </p>
        )}
      </div>
    </div>
  );
}

// ── RESUMEN ───────────────────────────────────────────────────────────────────
function Resumen() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/finanzas/resumen/")
      .then(r => { setDatos(r.data); setCargando(false); })
      .catch(() => setCargando(false));
  }, []);

  if (cargando) return <Spinner />;

  const totalEsperado = (datos?.total_cobrado || 0) + (datos?.total_pendiente || 0) + (datos?.total_atrasado || 0);
  const pctCobrado = totalEsperado > 0 ? ((datos?.total_cobrado || 0) / totalEsperado) * 100 : 0;

  const barData = [
    { name: "Cobrado",   valor: datos?.total_cobrado   || 0, fill: C.success },
    { name: "Pendiente", valor: datos?.total_pendiente || 0, fill: C.warning },
    { name: "Atrasado",  valor: datos?.total_atrasado  || 0, fill: C.danger  },
  ];

  const tooltipStyle = { borderRadius: "8px", border: `0.5px solid ${C.border}`, fontSize: "12px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: "16px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 2px" }}>Resumen financiero</h1>
        <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>Vista consolidada del ciclo actual</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        <KPICard titulo="Total cobrado"   valor={fmt(datos?.total_cobrado)}   sub={`${datos?.cantidad_pagados || 0} estudiantes al día`}       icono={CheckCircle}   iconColor={C.success} iconBg={C.successLight} />
        <KPICard titulo="Por cobrar"      valor={fmt(datos?.total_pendiente)} sub={`${datos?.cantidad_pendientes || 0} pagos pendientes`}         icono={Clock}         iconColor={C.warning} iconBg={C.warningLight} />
        <KPICard titulo="Cartera vencida" valor={fmt(datos?.total_atrasado)}  sub={`${datos?.cantidad_atrasados || 0} en mora`}                   icono={AlertTriangle}  iconColor={C.danger}  iconBg={C.dangerLight} />
        <KPICard titulo="Total esperado"  valor={fmt(totalEsperado)}          sub="Proyección del ciclo"                                           icono={TrendingUp}    iconColor={C.verde}   iconBg={C.verdeLight} />
      </div>

      {/* Barra de progreso de recaudación */}
      <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, padding: "20px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <p style={{ fontSize: "13px", fontWeight: "700", color: C.text, margin: 0 }}>Progreso de recaudación</p>
          <span style={{ fontSize: "16px", fontWeight: "700", color: C.verde }}>{pctCobrado.toFixed(1)}%</span>
        </div>
        <div style={{ height: "10px", background: C.verdeLight, borderRadius: "5px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pctCobrado}%`, background: C.verde, borderRadius: "5px", transition: "width 1s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
          <span style={{ fontSize: "11px", color: C.textMuted }}>0</span>
          <span style={{ fontSize: "11px", color: C.textMuted }}>{fmt(totalEsperado)}</span>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, padding: "20px 22px" }}>
        <p style={{ fontSize: "11px", fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 16px" }}>Desglose financiero</p>
        <div style={{ height: "220px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: C.verdeMid, fontWeight: 500 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.verdeMid }}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [fmt(v), "Monto"]} cursor={{ fill: C.bg }} />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={64}>
                {barData.map((e, i) => (
                  <rect key={i} fill={e.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tarjetas de detalle */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
        {[
          { label: "Total recaudado",  sub: "Ingresos confirmados",  val: fmt(datos?.total_cobrado),   bg: C.successLight, color: C.success, icon: CheckCircle },
          { label: "Por cobrar",       sub: "Facturas vigentes",      val: fmt(datos?.total_pendiente), bg: C.warningLight, color: C.warning, icon: Clock       },
          { label: "Cartera vencida",  sub: "Pagos atrasados",        val: fmt(datos?.total_atrasado),  bg: C.dangerLight,  color: C.danger,  icon: AlertTriangle},
        ].map(({ label, sub, val, bg, color, icon: Icon }) => (
          <div key={label} style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={17} color={color} />
              </div>
              <div>
                <p style={{ fontSize: "11px", fontWeight: "700", color, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>{label}</p>
                <p style={{ fontSize: "10px", color: C.textMuted, margin: "2px 0 0" }}>{sub}</p>
              </div>
            </div>
            <span style={{ fontSize: "18px", fontWeight: "700", color }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function DashboardFinanzas() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/finanzas/resumen/")
      .then(r => setDatos(r.data))
      .catch(() => setDatos(null))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Spinner />;

  const ingresos = Number(datos?.ingresos || datos?.total_cobrado || 0);
  const egresos = Number(datos?.egresos || 0);
  const balance = Number(datos?.balance || ingresos - egresos);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>
          Dashboard financiero
        </h1>
        <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>
          Vista general de ingresos, egresos y cartera
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px" }}>
        <KPICard titulo="Ingresos" valor={fmt(ingresos)} sub="Cobros registrados" icono={TrendingUp} iconColor={C.success} iconBg={C.successLight} />

        <KPICard titulo="Egresos" valor={fmt(egresos)} sub="Sueldos y gastos" icono={AlertTriangle} iconColor={C.danger} iconBg={C.dangerLight} />

        <KPICard titulo="Balance" valor={fmt(balance)} sub={balance >= 0 ? "Resultado positivo" : "Resultado negativo"} icono={DollarSign} iconColor={balance >= 0 ? C.verde : C.danger} iconBg={balance >= 0 ? C.verdeLight : C.dangerLight} />

        <KPICard titulo="Pendiente" valor={fmt(datos?.total_pendiente)} sub={`${datos?.cantidad_pendientes || 0} pagos pendientes`} icono={Clock} iconColor={C.warning} iconBg={C.warningLight} />
      </div>

      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "14px", padding: "18px 20px" }}>
        <h2 style={{ fontSize: "15px", color: C.text, margin: "0 0 12px" }}>
          Accesos rápidos
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
          {[
            ["Mensualidades", "/finanzas/pagos"],
            ["Matrículas", "/finanzas/matriculas"],
            ["Sueldos", "/finanzas/sueldos"],
            ["Egresos", "/finanzas/egresos"],
            ["Comprobantes", "/finanzas/comprobantes"],
          ].map(([label, path]) => (
            <a
              key={path}
              href={path}
              style={{
                display: "block",
                background: C.bg,
                color: C.verde,
                border: `1px solid ${C.border}`,
                borderRadius: "10px",
                padding: "12px",
                fontSize: "13px",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
function ModalVerificarMatricula({ pago, onClose, onGuardado }) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const verificar = async () => {
    setCargando(true);
    setError(null);

    try {
      await api.patch(`/finanzas/pagos-matricula/${pago.id}/`, {
        estado: "PAGADO",
        fecha_pago: new Date().toISOString().slice(0, 10),
        metodo_pago: pago.metodo_pago || "Verificado por finanzas",
      });

      onGuardado();
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : "Error al verificar matrícula.");
    } finally {
      setCargando(false);
    }
  };

  const s = PAGO_STYLE[pago.estado] || PAGO_STYLE.PENDIENTE;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(26,58,39,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: C.successLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={18} color={C.success} />
            </div>
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>Verificar matrícula</h2>
              <p style={{ fontSize: "11px", color: C.textMuted, margin: 0 }}>{pago.estudiante_nombre}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted }}><X size={18} /></button>
        </div>

        <div style={{ padding: "20px 22px" }}>
          <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 16px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              ["Estudiante", pago.estudiante_nombre],
              ["Período", pago.periodo_nombre || "—"],
              ["Nivel", pago.nivel_nombre || "—"],
              ["Monto", fmt(pago.monto)],
              ["Estado actual", <Badge bg={s.bg} color={s.color}>{s.label}</Badge>],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "12px", color: C.textMuted }}>{k}</span>
                <span style={{ fontSize: "13px", fontWeight: "600", color: C.text, textAlign: "right" }}>{v}</span>
              </div>
            ))}
          </div>

          {error && <div style={{ background: C.dangerLight, color: C.danger, fontSize: "12px", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px" }}>{error}</div>}

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose} style={{ flex: 1, border: `1px solid ${C.border}`, background: "#fff", color: C.textMuted, padding: "9px", borderRadius: "9px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
              Cancelar
            </button>
            <button onClick={verificar} disabled={cargando}
              style={{ flex: 1, background: cargando ? C.verdeMid : C.success, color: "#fff", border: "none", padding: "9px", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: cargando ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <CheckCircle size={14} /> {cargando ? "Verificando…" : "Confirmar matrícula"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Matriculas() {
  const [matriculas, setMatriculas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(null);

  const cargar = async () => {
    setCargando(true);

    try {
      const data = await fetchAllPages("/finanzas/pagos-matricula/");
      setMatriculas(data);
    } catch (err) {
      console.error("Error cargando pagos de matrícula:", err.response?.data || err);
      setMatriculas([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const filtradas = matriculas.filter(m =>
    `${m.estudiante_nombre || ""} ${m.periodo_nombre || ""} ${m.nivel_nombre || ""} ${m.estado || ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>Matrículas</h1>
          <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>{matriculas.length} pagos de matrícula</p>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: "14px" }}>
        <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por estudiante, período, nivel o estado…"
          style={{ ...iStyle, paddingLeft: "36px" }}
          onFocus={focusOn}
          onBlur={focusOff}
        />
      </div>

      <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {cargando ? <Spinner /> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {["Estudiante", "Período", "Nivel", "Monto", "Estado", "Fecha", "Acción"].map((h, i) => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: i === 6 ? "right" : "left", fontSize: "11px", fontWeight: "700", color: C.verdeMid, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((m, idx) => {
                const s = PAGO_STYLE[m.estado] || PAGO_STYLE.PENDIENTE;

                return (
                  <tr key={m.id} style={{ borderBottom: idx < filtradas.length - 1 ? `1px solid ${C.border}` : "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bg}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 16px", fontWeight: "600", color: C.text }}>{m.estudiante_nombre || "—"}</td>
                    <td style={{ padding: "12px 16px", color: C.textMuted }}>{m.periodo_nombre || "—"}</td>
                    <td style={{ padding: "12px 16px", color: C.textMuted }}>{m.nivel_nombre || "—"}</td>
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: C.text }}>{fmt(m.monto)}</td>
                    <td style={{ padding: "12px 16px" }}><Badge bg={s.bg} color={s.color}>{m.estado_display || s.label}</Badge></td>
                    <td style={{ padding: "12px 16px", color: C.textMuted }}>{m.fecha_pago || m.created_at?.slice(0, 10) || "—"}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      {m.estado !== "PAGADO" && (
                        <button onClick={() => setModal(m)}
                          style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: C.successLight, color: C.success, border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#BBF7D0"}
                          onMouseLeave={e => e.currentTarget.style.background = C.successLight}>
                          <CheckCircle size={13} /> Verificar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtradas.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "38px", color: C.textMuted }}>
                    {busqueda ? `Sin resultados para "${busqueda}"` : "No hay pagos de matrícula registrados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ModalVerificarMatricula
          pago={modal}
          onClose={() => setModal(null)}
          onGuardado={() => { setModal(null); cargar(); }}
        />
      )}
    </div>
  );
}
function Sueldos() {
  const [sueldos, setSueldos] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const meses = [
    ["ENERO", "Enero"],
    ["FEBRERO", "Febrero"],
    ["MARZO", "Marzo"],
    ["ABRIL", "Abril"],
    ["MAYO", "Mayo"],
    ["JUNIO", "Junio"],
    ["JULIO", "Julio"],
    ["AGOSTO", "Agosto"],
    ["SEPTIEMBRE", "Septiembre"],
    ["OCTUBRE", "Octubre"],
    ["NOVIEMBRE", "Noviembre"],
    ["DICIEMBRE", "Diciembre"],
  ];

  const [form, setForm] = useState({
    empleado: "",
    periodo: "",
    mes: "ENERO",
    anio: new Date().getFullYear(),
    sueldo_base: "",
    bono: 0,
    descuento: 0,
    estado: "PENDIENTE",
    fecha_pago: "",
    observaciones: "",
  });

  const set = key => e => setForm({ ...form, [key]: e.target.value });

  const nombrePersonal = u => {
    const nombre = `${u.first_name || ""} ${u.last_name || ""}`.trim();
    return nombre || u.username || u.email || "Usuario";
  };

  const cargar = async () => {
    setCargando(true);

    try {
      const [sueldosData, usuariosData, periodosData] = await Promise.all([
        fetchAllPages("/finanzas/sueldos/"),
        fetchAllPages("/usuarios/"),
        fetchAllPages("/finanzas/periodos/").catch(() => []),
      ]);

      setSueldos(sueldosData);

      setPersonal(
        usuariosData.filter(u =>
          u.is_active !== false &&
          u.rol !== "REPRESENTANTE"
        )
      );

      setPeriodos(periodosData);
    } catch (err) {
      console.error("Error cargando sueldos:", err.response?.data || err);
      setSueldos([]);
      setPersonal([]);
      setPeriodos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const guardarSueldo = async e => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      const payload = {
        ...form,
        periodo: form.periodo || null,
        sueldo_base: Number(form.sueldo_base || 0),
        bono: Number(form.bono || 0),
        descuento: Number(form.descuento || 0),
        anio: Number(form.anio || new Date().getFullYear()),
        fecha_pago: form.estado === "PAGADO"
          ? (form.fecha_pago || new Date().toISOString().slice(0, 10))
          : null,
      };

      await api.post("/finanzas/sueldos/", payload);

      setModal(false);
      setForm({
        empleado: "",
        periodo: "",
        mes: "ENERO",
        anio: new Date().getFullYear(),
        sueldo_base: "",
        bono: 0,
        descuento: 0,
        estado: "PENDIENTE",
        fecha_pago: "",
        observaciones: "",
      });

      cargar();
    } catch (err) {
      console.error("Error guardando sueldo:", err.response?.data || err);
      setError(err.response?.data ? JSON.stringify(err.response.data) : "No se pudo guardar el sueldo.");
    } finally {
      setGuardando(false);
    }
  };

  const marcarPagado = async sueldo => {
    try {
      await api.patch(`/finanzas/sueldos/${sueldo.id}/`, {
        estado: "PAGADO",
        fecha_pago: new Date().toISOString().slice(0, 10),
      });

      cargar();
    } catch (err) {
      console.error("Error marcando sueldo:", err.response?.data || err);
      alert("No se pudo marcar como pagado.");
    }
  };

  const filtrados = sueldos.filter(s =>
    `${s.empleado_nombre || ""} ${s.mes_display || s.mes || ""} ${s.anio || ""} ${s.estado || ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const totalPendiente = sueldos
    .filter(s => s.estado === "PENDIENTE")
    .reduce((acc, s) => acc + Number(s.total || s.sueldo_base || 0), 0);

  const totalPagado = sueldos
    .filter(s => s.estado === "PAGADO")
    .reduce((acc, s) => acc + Number(s.total || s.sueldo_base || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>
            Sueldos del personal
          </h1>
          <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>
            {sueldos.length} registros · Pendiente: {fmt(totalPendiente)} · Pagado: {fmt(totalPagado)}
          </p>
        </div>

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
            padding: "9px 14px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          <Plus size={15} />
          Asignar sueldo
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: "14px" }}>
        <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por empleado, mes, año o estado..."
          style={{ ...iStyle, paddingLeft: "36px" }}
          onFocus={focusOn}
          onBlur={focusOff}
        />
      </div>

      <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {cargando ? (
          <Spinner />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {["Empleado", "Mes", "Sueldo base", "Bono", "Descuento", "Total", "Estado", "Acción"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 16px",
                      textAlign: i === 7 ? "right" : "left",
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
              {filtrados.map((s, idx) => {
                const st = s.estado === "PAGADO"
                  ? { bg: C.successLight, color: C.success, label: "Pagado" }
                  : { bg: C.warningLight, color: C.warning, label: "Pendiente" };

                return (
                  <tr key={s.id} style={{ borderBottom: idx < filtrados.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <td style={{ padding: "12px 16px", color: C.text, fontWeight: "700" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: C.verdeLight, color: C.verde, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <User size={14} />
                        </div>
                        {s.empleado_nombre || "—"}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: C.textMuted }}>
                      {s.mes_display || s.mes || "—"} {s.anio || ""}
                    </td>
                    <td style={{ padding: "12px 16px", color: C.text, fontWeight: "700" }}>{fmt(s.sueldo_base)}</td>
                    <td style={{ padding: "12px 16px", color: C.textMuted }}>{fmt(s.bono)}</td>
                    <td style={{ padding: "12px 16px", color: C.textMuted }}>{fmt(s.descuento)}</td>
                    <td style={{ padding: "12px 16px", color: C.verde, fontWeight: "700" }}>{fmt(s.total)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge bg={st.bg} color={st.color}>{s.estado_display || st.label}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      {s.estado !== "PAGADO" ? (
                        <button
                          onClick={() => marcarPagado(s)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            background: C.successLight,
                            color: C.success,
                            border: "none",
                            borderRadius: "8px",
                            padding: "6px 10px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          <CheckCircle size={13} />
                          Pagar
                        </button>
                      ) : (
                        <span style={{ fontSize: "12px", color: C.textMuted }}>
                          {s.fecha_pago || "Pagado"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "38px", color: C.textMuted }}>
                    {busqueda ? `Sin resultados para "${busqueda}"` : "No hay sueldos registrados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "560px", boxShadow: "0 20px 60px rgba(26,58,39,0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 16px", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>
                  Asignar sueldo mensual
                </h2>
                <p style={{ fontSize: "11px", color: C.textMuted, margin: "2px 0 0" }}>
                  Registra el sueldo de un empleado para un mes específico.
                </p>
              </div>

              <button
                onClick={() => {
                  setModal(false);
                  setError(null);
                }}
                style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={guardarSueldo} style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <Lbl>Empleado *</Lbl>
                <Sel required value={form.empleado} onChange={set("empleado")}>
                  <option value="">Seleccionar empleado...</option>
                  {personal.map(u => (
                    <option key={u.id} value={u.id}>
                      {nombrePersonal(u)} ({u.rol_display || u.rol})
                    </option>
                  ))}
                </Sel>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <Lbl>Mes *</Lbl>
                  <Sel required value={form.mes} onChange={set("mes")}>
                    {meses.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Sel>
                </div>

                <div>
                  <Lbl>Año *</Lbl>
                  <Inp required type="number" min="2020" value={form.anio} onChange={set("anio")} />
                </div>
              </div>

              <div>
                <Lbl>Período escolar</Lbl>
                <Sel value={form.periodo} onChange={set("periodo")}>
                  <option value="">Sin período</option>
                  {periodos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </Sel>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <Lbl>Sueldo base *</Lbl>
                  <Inp required type="number" step="0.01" min="0" value={form.sueldo_base} onChange={set("sueldo_base")} />
                </div>

                <div>
                  <Lbl>Bono</Lbl>
                  <Inp type="number" step="0.01" min="0" value={form.bono} onChange={set("bono")} />
                </div>

                <div>
                  <Lbl>Descuento</Lbl>
                  <Inp type="number" step="0.01" min="0" value={form.descuento} onChange={set("descuento")} />
                </div>
              </div>

              <div>
                <Lbl>Estado</Lbl>
                <Sel value={form.estado} onChange={set("estado")}>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="PAGADO">Pagado</option>
                </Sel>
              </div>

              {form.estado === "PAGADO" && (
                <div>
                  <Lbl>Fecha de pago</Lbl>
                  <Inp type="date" value={form.fecha_pago} onChange={set("fecha_pago")} />
                </div>
              )}

              <div>
                <Lbl>Observaciones</Lbl>
                <textarea
                  rows={3}
                  value={form.observaciones}
                  onChange={set("observaciones")}
                  style={{ ...iStyle, resize: "vertical" }}
                  onFocus={focusOn}
                  onBlur={focusOff}
                />
              </div>

              {error && (
                <div style={{ background: C.dangerLight, color: C.danger, borderRadius: "8px", padding: "10px 12px", fontSize: "12px" }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setModal(false);
                    setError(null);
                  }}
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
                  disabled={guardando}
                  style={{
                    flex: 1,
                    background: guardando ? C.verdeMid : C.verde,
                    color: "#fff",
                    border: "none",
                    padding: "9px",
                    borderRadius: "9px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: guardando ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {guardando ? "Guardando..." : "Guardar sueldo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
function Egresos() {
  const [egresos, setEgresos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchAllPages("/finanzas/egresos/")
      .then(data => setEgresos(data))
      .catch(err => {
        console.error("Error cargando egresos:", err.response?.data || err);
        setEgresos([]);
      })
      .finally(() => setCargando(false));
  }, []);

  const filtrados = egresos.filter(e =>
    `${e.descripcion || ""} ${e.categoria_display || e.categoria || ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <TablaSimple
      titulo="Egresos"
      subtitulo={`${egresos.length} gastos registrados`}
      busqueda={busqueda}
      setBusqueda={setBusqueda}
      placeholder="Buscar egreso…"
      cargando={cargando}
      headers={["Descripción", "Categoría", "Monto", "Fecha", "Comprobante"]}
      colSpan={5}
      vacio="No hay egresos registrados."
      rows={filtrados.map(e => [
        e.descripcion || "—",
        e.categoria_display || e.categoria || "—",
        fmt(e.monto),
        e.fecha || "—",
        e.comprobante ? "Ver archivo" : "Sin archivo",
      ])}
    />
  );
}
function TablaSimple({
  titulo,
  subtitulo,
  busqueda,
  setBusqueda,
  placeholder,
  cargando,
  headers,
  rows,
  colSpan,
  vacio,
}) {
  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>
          {titulo}
        </h1>
        <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>
          {subtitulo}
        </p>
      </div>

      <div style={{ position: "relative", marginBottom: "14px" }}>
        <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder={placeholder}
          style={{ ...iStyle, paddingLeft: "36px" }}
          onFocus={focusOn}
          onBlur={focusOff}
        />
      </div>

      <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {cargando ? <Spinner /> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
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
              {rows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: `1px solid ${C.border}` }}>
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      style={{
                        padding: "12px 16px",
                        color: i === 0 ? C.text : C.textMuted,
                        fontWeight: i === 0 || String(cell).startsWith("$") ? "700" : "400",
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={colSpan} style={{ textAlign: "center", padding: "38px", color: C.textMuted }}>
                    {vacio}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
// ── PÁGINA ────────────────────────────────────────────────────────────────────
export default function FinanzasPage() {
  return (
    <MainLayout>
      <Routes>
        <Route index element={<DashboardFinanzas />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="matriculas" element={<Matriculas />} />
        <Route path="sueldos" element={<Sueldos />} />
        <Route path="egresos" element={<Egresos />} />
        <Route path="comprobantes" element={<Comprobantes />} />
        <Route path="resumen" element={<Resumen />} />
      </Routes>
    </MainLayout>
  );
}