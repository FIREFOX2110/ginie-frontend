import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../api/axios";

import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Plus,
  X,
  Send,
  User,
  ClipboardList,
  Clock,
  Droplets,
  CreditCard,
  FileText,
  AlertTriangle,
  CalendarDays,
  Utensils,
  Moon,
  ShieldCheck,
  Activity,
  Bus,
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

const fmt = n =>
  `$${Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
  })}`;

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
        fontWeight: "600",
        background: bg,
        color,
      }}
    >
      {children}
    </span>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 0", color: C.textMuted }}>
      <Icon size={42} color={C.border} style={{ marginBottom: "12px" }} />
      <p style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: "0 0 4px" }}>
        {title}
      </p>
      <p style={{ fontSize: "13px", margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>
        {title}
      </h1>
      <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>{subtitle}</p>
    </div>
  );
}

const ALIM_MAP = {
  TODO: { label: "Comió todo", bg: C.successLight, color: C.success },
  MITAD: { label: "Comió la mitad", bg: C.warningLight, color: C.warning },
  NADA: { label: "No comió", bg: C.dangerLight, color: C.danger },
};

const PAGO_STYLE = {
  PAGADO: { bg: C.successLight, color: C.success, label: "Pagado" },
  PENDIENTE: { bg: C.warningLight, color: C.warning, label: "Pendiente" },
  ATRASADO: { bg: C.dangerLight, color: C.danger, label: "Atrasado" },
};

const GRAV_MAP = {
  LEVE: { bg: C.warningLight, color: C.warning },
  MODERADA: { bg: C.naranjaLight, color: "#8A4A0A" },
  GRAVE: { bg: C.dangerLight, color: C.danger },
};

function calcularEdad(fecha) {
  if (!fecha) return "—";
  const nacimiento = new Date(fecha);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1;
  return edad;
}

function TarjetaHijo({ hijo }) {
  const [bitacoras, setBitacoras] = useState([]);
  const [incidentes, setIncidentes] = useState([]);
  const [expandido, setExpandido] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    if (!expandido || bitacoras.length > 0 || incidentes.length > 0) return;

    const cargarDetalle = async () => {
      setCargandoDetalle(true);
      try {
        const [bitacorasData, incidentesData] = await Promise.all([
          cargarTodo(`/operativo/bitacoras/mis-hijos/?estudiante=${hijo.id}`),
          cargarTodo(`/operativo/incidentes/mis-hijos/?estudiante=${hijo.id}`),
        ]);
        setBitacoras(bitacorasData.slice(0, 5));
        setIncidentes(incidentesData.slice(0, 5));
      } catch (err) {
        console.error("Error cargando detalle del hijo:", err.response?.data || err);
      } finally {
        setCargandoDetalle(false);
      }
    };

    cargarDetalle();
  }, [expandido, hijo.id, bitacoras.length, incidentes.length]);

  const edad = calcularEdad(hijo.fecha_nacimiento);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(26,58,39,0.06)",
      }}
    >
      <div style={{ background: C.verde, padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: C.naranja,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: "700",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {(hijo.nombres || "?").charAt(0).toUpperCase()}
        </div>

        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: "17px",
              fontWeight: "700",
              color: "#fff",
              margin: "0 0 2px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {hijo.apellidos} {hijo.nombres}
          </p>
          <p style={{ fontSize: "12px", color: "#8FB89F", margin: 0 }}>
            {edad !== "—" ? `${edad} años` : "Edad no registrada"}
          </p>
        </div>
      </div>

      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {hijo.tipo_sangre && (
          <Badge bg={C.dangerLight} color="#991B1B">
            <ShieldCheck size={12} />
            Tipo de sangre: {hijo.tipo_sangre}
          </Badge>
        )}
        {hijo.alergias_conocidas && (
          <Badge bg={C.naranjaLight} color="#8A4A0A">
            <AlertTriangle size={12} />
            Alergias: {hijo.alergias_conocidas}
          </Badge>
        )}
        {!hijo.tipo_sangre && !hijo.alergias_conocidas && (
          <span style={{ fontSize: "12px", color: C.textMuted }}>Sin datos médicos registrados</span>
        )}
      </div>

      <div style={{ padding: "14px 20px" }}>
        <button
          onClick={() => setExpandido(!expandido)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontFamily: "inherit",
            marginBottom: expandido ? "12px" : 0,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700", color: C.text }}>
            <ClipboardList size={15} />
            Seguimiento diario
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: C.naranja, fontWeight: "600" }}>
            {expandido ? (
              <>
                <ChevronUp size={14} /> Ocultar
              </>
            ) : (
              <>
                <ChevronDown size={14} /> Ver detalle
              </>
            )}
          </span>
        </button>

        {expandido && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {cargandoDetalle ? (
              <Spinner />
            ) : (
              <>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: "700", color: C.verdeMid, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>
                    Últimas bitácoras
                  </p>

                  {bitacoras.length === 0 ? (
                    <div style={{ background: C.bg, borderRadius: "10px", padding: "14px", fontSize: "13px", color: C.textMuted, textAlign: "center" }}>
                      No hay bitácoras recientes.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {bitacoras.map(b => {
                        const alim = ALIM_MAP[b.alimentacion] || ALIM_MAP.MITAD;
                        return (
                          <div key={b.id} style={{ background: C.bg, borderRadius: "10px", padding: "12px 14px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", gap: "10px" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: "600", color: C.textMuted }}>
                                <CalendarDays size={12} />
                                {b.fecha}
                              </span>
                              <Badge bg={alim.bg} color={alim.color}>
                                <Utensils size={12} />
                                {alim.label}
                              </Badge>
                            </div>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12px", color: C.verdeMid }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <Moon size={13} />
                                Siesta: {b.siesta_minutos} min
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <Droplets size={13} />
                                {b.esfinteres_display || b.control_esfinteres}
                              </span>
                            </div>

                            {b.estado_animo_display && (
                              <div style={{ marginTop: "8px", fontSize: "12px", color: C.textMuted }}>
                                Estado de ánimo: <strong style={{ color: C.text }}>{b.estado_animo_display}</strong>
                              </div>
                            )}
                            {b.actividad_realizada && (
                              <div style={{ marginTop: "8px", fontSize: "12px", color: C.textMuted }}>
                                Actividad: <strong style={{ color: C.text }}>{b.actividad_realizada}</strong>
                              </div>
                            )}
                            {b.manualidades_materiales && (
                              <div style={{ marginTop: "8px", fontSize: "12px", color: C.textMuted }}>
                                Manualidades: <strong style={{ color: C.text }}>{b.manualidades_materiales}</strong>
                              </div>
                            )}
                            {b.observaciones_profesora && (
                              <div style={{ marginTop: "8px", background: "#fff", borderRadius: "8px", padding: "8px 12px", border: `1px solid ${C.border}`, fontSize: "12px", color: C.text }}>
                                <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                                  <MessageSquare size={13} style={{ marginTop: "2px", flexShrink: 0 }} />
                                  <span>{b.observaciones_profesora}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <p style={{ fontSize: "12px", fontWeight: "700", color: C.verdeMid, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>
                    Incidentes recientes
                  </p>

                  {incidentes.length === 0 ? (
                    <div style={{ background: C.bg, borderRadius: "10px", padding: "14px", fontSize: "13px", color: C.textMuted, textAlign: "center" }}>
                      No hay incidentes recientes.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {incidentes.map(i => {
                        const g = GRAV_MAP[i.gravedad] || GRAV_MAP.LEVE;
                        return (
                          <div key={i.id} style={{ background: C.bg, borderRadius: "10px", padding: "12px 14px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "6px" }}>
                              <span style={{ fontSize: "11px", color: C.textMuted, fontWeight: "600" }}>
                                {i.fecha_hora ? new Date(i.fecha_hora).toLocaleString("es-EC") : "—"}
                              </span>
                              <Badge bg={g.bg} color={g.color}>
                                <AlertTriangle size={12} />
                                {i.gravedad_display || i.gravedad}
                              </Badge>
                            </div>
                            <p style={{ fontSize: "12px", color: C.text, margin: "0 0 4px" }}>{i.descripcion}</p>
                            <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>
                              Acción tomada: <strong style={{ color: C.text }}>{i.accion_tomada}</strong>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MisHijos() {
  const [hijos, setHijos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarTodo("/academico/mis-hijos/")
      .then(setHijos)
      .catch(err => console.error("Error cargando hijos:", err.response?.data || err))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Spinner />;

  return (
    <div>
      <SectionTitle title="Mis hijos" subtitle={`${hijos.length} estudiante(s) a cargo`} />
      {hijos.length === 0 ? (
        <EmptyState icon={User} title="No hay estudiantes registrados" subtitle="Cuando secretaría vincule un estudiante a tu cuenta, aparecerá aquí." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          {hijos.map(h => <TarjetaHijo key={h.id} hijo={h} />)}
        </div>
      )}
    </div>
  );
}

function MisPagos() {
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalComprobante, setModalComprobante] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorComprobante, setErrorComprobante] = useState(null);

  useEffect(() => {
    cargarTodo("/finanzas/mis-pagos/")
      .then(setPagos)
      .catch(err => console.error("Error cargando pagos:", err.response?.data || err))
      .finally(() => setCargando(false));
  }, []);

  const pendientes = pagos.filter(p => p.estado !== "PAGADO");
  const total = pendientes.reduce((a, p) => a + Number(p.monto || 0), 0);
  const subirComprobante = async e => {
  e.preventDefault();

  if (!modalComprobante || !archivo) return;

  setSubiendo(true);
  setErrorComprobante(null);

  try {
    const formData = new FormData();
    formData.append("pago", modalComprobante.id);
    formData.append("archivo", archivo);

    await api.post("/finanzas/comprobantes/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setModalComprobante(null);
    setArchivo(null);
    cargar();
  } catch (err) {
    console.error("Error subiendo comprobante:", err.response?.data || err);
    setErrorComprobante("No se pudo subir el comprobante.");
  } finally {
    setSubiendo(false);
  }
};
const cargar = async () => {
  setCargando(true);

  try {
    const data = await cargarTodo("/finanzas/mis-pagos/");
    setPagos(data);
  } catch (err) {
    console.error("Error cargando pagos:", err.response?.data || err);
    setPagos([]);
  } finally {
    setCargando(false);
  }
};

useEffect(() => {
  cargar();
}, []);

  return (
  <div>
    <SectionTitle title="Mis pagos" subtitle={`${pagos.length} registros`} />

    {total > 0 && (
      <div
        style={{
          background: C.naranjaLight,
          border: `1px solid ${C.naranja}55`,
          borderRadius: "12px",
          padding: "14px 18px",
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <CreditCard size={22} color="#8A4A0A" />

        <div>
          <p
            style={{
              fontWeight: "700",
              color: "#8A4A0A",
              margin: "0 0 2px",
            }}
          >
            Pagos pendientes
          </p>

          <p
            style={{
              fontSize: "13px",
              color: "#8A4A0A",
              margin: 0,
            }}
          >
            Total por pagar: <strong>{fmt(total)}</strong>
          </p>
        </div>
      </div>
    )}

    <div
      style={{
        background: "#fff",
        borderRadius: "14px",
        border: `1px solid ${C.border}`,
        overflow: "hidden",
      }}
    >
      {cargando ? (
        <Spinner />
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr
              style={{
                background: C.bg,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              {["Tipo", "Estudiante", "Período", "Monto", "Estado", "Acción"].map(h => (
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
            {pagos.map((p, idx) => {
              const s = PAGO_STYLE[p.estado] || {
                bg: C.bg,
                color: C.textMuted,
                label: p.estado,
              };

              return (
                <tr
                  key={`${p.tipo}-${p.id}`}
                  style={{
                    borderBottom:
                      idx < pagos.length - 1 ? `1px solid ${C.border}` : "none",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      color: C.textMuted,
                    }}
                  >
                    {p.tipo_display || p.tipo || "Pago"}
                  </td>

                  <td
                    style={{
                      padding: "12px 16px",
                      fontWeight: "700",
                      color: C.text,
                    }}
                  >
                    {p.estudiante_nombre}
                  </td>

                  <td
                    style={{
                      padding: "12px 16px",
                      color: C.textMuted,
                    }}
                  >
                    {p.periodo || `${p.mes_display || ""} ${p.anio || ""}`}
                  </td>

                  <td
                    style={{
                      padding: "12px 16px",
                      fontWeight: "700",
                      color: C.text,
                    }}
                  >
                    {fmt(p.monto)}
                  </td>

                  <td style={{ padding: "12px 16px" }}>
                    <Badge bg={s.bg} color={s.color}>
                      {s.label || p.estado}
                    </Badge>
                  </td>

                  <td style={{ padding: "12px 16px" }}>
                    {p.estado !== "PAGADO" && p.tipo !== "MATRICULA" ? (
                      <button
                        onClick={() => setModalComprobante(p)}
                        style={{
                          border: `1px solid ${C.border}`,
                          background: "#fff",
                          color: C.verde,
                          padding: "7px 10px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <FileText size={13} />
                        Subir
                      </button>
                    ) : (
                      <span
                        style={{
                          fontSize: "12px",
                          color: C.textMuted,
                        }}
                      >
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {pagos.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: C.textMuted,
                    fontSize: "13px",
                  }}
                >
                  No hay pagos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>

    {modalComprobante && (
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
            maxWidth: "460px",
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FileText size={18} color={C.verde} />

              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: C.text,
                  margin: 0,
                }}
              >
                Subir comprobante
              </h2>
            </div>

            <button
              onClick={() => {
                setModalComprobante(null);
                setArchivo(null);
                setErrorComprobante(null);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: C.textMuted,
              }}
            >
              <X size={18} />
            </button>
          </div>

          <form
            onSubmit={subirComprobante}
            style={{
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: "10px",
                padding: "12px 14px",
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: C.text,
                }}
              >
                {modalComprobante.estudiante_nombre}
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: C.textMuted,
                }}
              >
                {modalComprobante.periodo} · {fmt(modalComprobante.monto)}
              </p>
            </div>

            <div>
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
                Archivo del comprobante
              </label>

              <input
                required
                type="file"
                accept="image/*,.pdf"
                onChange={e => setArchivo(e.target.files?.[0] || null)}
                style={iStyle}
              />

              <p
                style={{
                  fontSize: "11px",
                  color: C.textMuted,
                  margin: "6px 0 0",
                }}
              >
                Puedes subir imagen o PDF.
              </p>
            </div>

            {errorComprobante && (
              <div
                style={{
                  background: C.dangerLight,
                  color: C.danger,
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "12px",
                }}
              >
                {errorComprobante}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setModalComprobante(null);
                  setArchivo(null);
                  setErrorComprobante(null);
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
                disabled={subiendo}
                style={{
                  flex: 1,
                  background: subiendo ? C.verdeMid : C.verde,
                  color: "#fff",
                  border: "none",
                  padding: "9px",
                  borderRadius: "9px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: subiendo ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {subiendo ? "Subiendo…" : "Enviar comprobante"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
}

function Mensajes() {
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

  const set = k => e => {
    setForm({
      ...form,
      [k]: e.target.value,
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
      console.error("Error cargando mensajes/destinatarios:", err.response?.data || err);
      setError("No se pudieron cargar los mensajes o destinatarios.");
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
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "22px",
        }}
      >
        <SectionTitle
          title="Mensajes"
          subtitle={`${mensajes.filter(m => !m.leido).length} sin leer`}
        />

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
          onMouseEnter={e => e.currentTarget.style.background = C.verdeDark}
          onMouseLeave={e => e.currentTarget.style.background = C.verde}
        >
          <Plus size={15} />
          Nuevo mensaje
        </button>
      </div>

      {error && (
        <div
          style={{
            background: C.dangerLight,
            color: C.danger,
            borderRadius: "10px",
            padding: "10px 14px",
            fontSize: "13px",
            marginBottom: "14px",
          }}
        >
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <MessageSquare size={18} color={C.verde} />
                <h2
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: C.text,
                    margin: 0,
                  }}
                >
                  Nuevo mensaje
                </h2>
              </div>

              <button
                onClick={() => setModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: C.textMuted,
                }}
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
                  Para
                </label>

                <div style={{ position: "relative" }}>
                  <select
                    required
                    value={form.destinatario}
                    onChange={set("destinatario")}
                    style={{
                      ...iStyle,
                      appearance: "none",
                      paddingRight: "30px",
                      cursor: "pointer",
                    }}
                    onFocus={focusOn}
                    onBlur={focusOff}
                  >
                    <option value="">Seleccionar destinatario…</option>

                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>
                        {nombreUsuario(u)} ({u.rol_display || u.rol})
                      </option>
                    ))}
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

                {usuarios.length === 0 && (
                  <p
                    style={{
                      fontSize: "11px",
                      color: C.textMuted,
                      margin: "6px 0 0",
                    }}
                  >
                    No hay destinatarios disponibles.
                  </p>
                )}
              </div>

              <div>
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
                  Asunto
                </label>

                <input
                  required
                  value={form.asunto}
                  onChange={set("asunto")}
                  style={iStyle}
                  onFocus={focusOn}
                  onBlur={focusOff}
                />
              </div>

              <div>
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
                  Mensaje
                </label>

                <textarea
                  required
                  rows={4}
                  value={form.cuerpo}
                  onChange={set("cuerpo")}
                  style={{
                    ...iStyle,
                    resize: "vertical",
                  }}
                  onFocus={focusOn}
                  onBlur={focusOff}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
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
                    fontWeight: "700",
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

      {cargando ? (
        <Spinner />
      ) : mensajes.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No tienes mensajes"
          subtitle="Los mensajes enviados por la institución aparecerán aquí."
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {mensajes.map(m => (
            <div
              key={m.id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: `1px solid ${C.border}`,
                borderLeft: !m.leido
                  ? `4px solid ${C.naranja}`
                  : `1px solid ${C.border}`,
                padding: "14px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "4px",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: m.leido ? "500" : "700",
                    color: C.text,
                    margin: 0,
                  }}
                >
                  {m.asunto}
                </p>

                {!m.leido && (
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: C.naranja,
                      flexShrink: 0,
                      marginTop: "5px",
                    }}
                  />
                )}
              </div>

              <p
                style={{
                  fontSize: "11px",
                  color: C.textMuted,
                  margin: "0 0 8px",
                }}
              >
                De: {m.remitente_nombre || "—"} ·{" "}
                {m.fecha ? new Date(m.fecha).toLocaleDateString("es-EC") : "—"}
              </p>

              <p
                style={{
                  fontSize: "13px",
                  color: C.verdeMid,
                  margin: 0,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {m.cuerpo}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function TransporteHijos() {
  const [rutas, setRutas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const estadoStyle = estado => {
    if (estado === "SUBIO") {
      return {
        bg: C.successLight,
        color: C.success,
        label: "Subió al bus",
      };
    }

    if (estado === "NO_SUBIO") {
      return {
        bg: C.dangerLight,
        color: C.danger,
        label: "No subió",
      };
    }

    return {
      bg: C.warningLight,
      color: C.warning,
      label: "Pendiente de registro",
    };
  };

  useEffect(() => {
    cargarTodo("/logistica/mis-hijos-rutas/")
      .then(data => {
        setRutas(data);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error cargando rutas de hijos:", err.response?.data || err);
        setCargando(false);
      });
  }, []);

  return (
    <div>
      <SectionTitle
        title="Transporte"
        subtitle={`${rutas.length} asignaciones de ruta`}
      />

      {cargando ? (
        <Spinner />
      ) : rutas.length === 0 ? (
        <EmptyState
          icon={Bus}
          title="Sin ruta asignada"
          subtitle="Tus hijos aún no tienen una ruta de transporte asignada."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "14px",
          }}
        >
          {rutas.map(r => {
            const asistencia = r.asistencia_hoy;
            const estado = estadoStyle(asistencia?.estado);

            return (
              <div
                key={r.id}
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  border: `1px solid ${C.border}`,
                  padding: "16px 18px",
                  boxShadow: "0 1px 3px rgba(26,58,39,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "11px",
                      background: C.verde,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Bus size={20} color="#fff" />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: C.text,
                        margin: 0,
                      }}
                    >
                      {r.ruta_nombre}
                    </p>

                    <p
                      style={{
                        fontSize: "12px",
                        color: C.textMuted,
                        margin: "2px 0 0",
                      }}
                    >
                      Parada #{r.orden_parada}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    fontSize: "13px",
                    color: C.textMuted,
                  }}
                >
                  <p style={{ margin: 0 }}>
                    Estudiante:{" "}
                    <strong style={{ color: C.text }}>
                      {r.estudiante_detalle?.nombre_completo ||
                        `${r.estudiante_detalle?.apellidos || ""} ${r.estudiante_detalle?.nombres || ""}`.trim()}
                    </strong>
                  </p>

                  <p style={{ margin: 0 }}>
                    Chofer:{" "}
                    <strong style={{ color: C.text }}>
                      {r.chofer_nombre || "Sin asignar"}
                    </strong>
                  </p>

                  <p style={{ margin: 0 }}>
                    Dirección:{" "}
                    <strong style={{ color: C.text }}>
                      {r.direccion_casa || "No registrada"}
                    </strong>
                  </p>

                  <div
                    style={{
                      marginTop: "8px",
                      paddingTop: "10px",
                      borderTop: `1px solid ${C.border}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: "7px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: C.verdeMid }}>
                        Estado de hoy
                      </span>

                      <Badge bg={estado.bg} color={estado.color}>
                        <Clock size={12} />
                        {estado.label}
                      </Badge>
                    </div>

                    {asistencia && (
                      <>
                        <p style={{ margin: 0, fontSize: "12px", color: C.textMuted }}>
                          Fecha:{" "}
                          <strong style={{ color: C.text }}>
                            {asistencia.fecha || "—"}
                          </strong>
                        </p>

                        <p style={{ margin: 0, fontSize: "12px", color: C.textMuted }}>
                          Entregado en casa:{" "}
                          <strong style={{ color: C.text }}>
                            {asistencia.entregado_en_casa ? "Sí" : "No"}
                          </strong>
                        </p>

                        {asistencia.observaciones && (
                          <p style={{ margin: 0, fontSize: "12px", color: C.textMuted }}>
                            Observación:{" "}
                            <strong style={{ color: C.text }}>
                              {asistencia.observaciones}
                            </strong>
                          </p>
                        )}
                      </>
                    )}

                    {!asistencia && (
                      <p style={{ margin: 0, fontSize: "12px", color: C.textMuted }}>
                        El chofer aún no registra la asistencia de transporte de hoy.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PadrePage() {
  return (
    <MainLayout>
      <Routes>
        <Route index element={<MisHijos />} />
        <Route path="pagos" element={<MisPagos />} />
        <Route path="mensajes" element={<Mensajes />} />
        <Route path="transporte" element={<TransporteHijos />} />

      </Routes>
    </MainLayout>
  );
}
