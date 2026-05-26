import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import {
  LayoutGrid, Users, BarChart2, GraduationCap, DollarSign,
  Paperclip, TrendingUp, BookOpen, AlertTriangle, HeartPulse,
  Pill, Bus, CheckSquare, Megaphone, ClipboardList,
  Baby, MessageSquare, LogOut, Wifi, ChevronRight,
} from "lucide-react";

const NAV_POR_ROL = {
  SUPERADMIN: [
    { label: "Panel", icon: LayoutGrid, to: "/superadmin" },
    {
      label: "Usuarios", icon: Users, key: "usuarios",
      to: "/superadmin/usuarios",
      sub: [
        { label: "Todos",          to: "/superadmin/usuarios" },
        { label: "Administrativa", to: "/superadmin/usuarios?roles=DIRECTOR,SECRETARIA,FINANZAS" },
        { label: "Operativa",      to: "/superadmin/usuarios?roles=MAESTRO,ENFERMERIA,CHOFER,MARKETING" },
        { label: "Familias",       to: "/superadmin/usuarios?roles=REPRESENTANTE" },
    ],
    },
  ],
  DIRECTOR:    [{ label: "Dashboard",   icon: BarChart2,     to: "/director" },{
  label: "Logística",
  icon: Bus,
  to: "/logistica/rutas",
},],

  SECRETARIA:  [{ label: "Estudiantes", icon: GraduationCap, to: "/secretaria/estudiantes" }],
  FINANZAS: [
  { label: "Dashboard",     icon: LayoutGrid,    to: "/finanzas" },
  { label: "Mensualidades", icon: DollarSign,    to: "/finanzas/pagos" },
  { label: "Matrículas",    icon: GraduationCap, to: "/finanzas/matriculas" },
  { label: "Sueldos",       icon: Users,         to: "/finanzas/sueldos" },
  { label: "Egresos",       icon: BarChart2,     to: "/finanzas/egresos" },
  { label: "Comprobantes",  icon: Paperclip,     to: "/finanzas/comprobantes" },
  { label: "Resumen",       icon: TrendingUp,    to: "/finanzas/resumen" },
],
  MAESTRO: [
  { label: "Estudiantes", icon: Users, to: "/operativo/estudiantes" },
  { label: "Bitácoras", icon: BookOpen, to: "/operativo/bitacoras" },
  { label: "Incidentes", icon: AlertTriangle, to: "/operativo/incidentes" },
],
  ENFERMERIA: [
  {
    label: "Atenciones",
    icon: HeartPulse,
    to: "/operativo/enfermeria",
  },
  {
    label: "Medicamentos",
    icon: Pill,
    to: "/operativo/medicamentos",
  },
],
  CHOFER: [
  {
    label: "Mi Ruta",
    icon: Bus,
    to: "/logistica/mi-ruta",
  },
  {
    label: "Asistencias",
    icon: CheckSquare,
    to: "/logistica/asistencias",
  },
],
  MARKETING: [
    { label: "Prospectos",      icon: Megaphone,     to: "/marketing/prospectos" },
    { label: "Consentimientos", icon: ClipboardList, to: "/marketing/consentimientos" },
  ],
  VENTAS:       [{ label: "Prospectos", icon: Megaphone,     to: "/marketing/prospectos" }],
  REPRESENTANTE: [
  {
    label: "Mis Hijos",
    icon: Baby,
    to: "/padre",
  },
  {
    label: "Pagos",
    icon: DollarSign,
    to: "/padre/pagos",
  },
  {
    label: "Transporte",
    icon: Bus,
    to: "/padre/transporte",
  },
  {
    label: "Mensajes",
    icon: MessageSquare,
    to: "/padre/mensajes",
  },
],
  
};

const C = {
  verde:       "#2D5A3D",
  verdeDark:   "#1A3A27",
  verdeLight:  "#3D7A52",
  naranja:     "#D4821A",
  naranjaLight:"#F0A040",
  textMuted:   "#8FB89F",
  activeBg:    "rgba(255,255,255,0.12)",
  hoverBg:     "rgba(255,255,255,0.07)",
  divider:     "rgba(255,255,255,0.1)",
};

function NavItem({ item, collapsed, expandido, onToggle }) {
  const Icon = item.icon;
  const location = useLocation();
  const isParentActive = location.pathname.startsWith(item.to || "__");
  const open = expandido[item.key];

  if (item.sub && !collapsed) {
    return (
      <div>
        <button
          onClick={() => onToggle(item.key)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", padding: "9px 12px", borderRadius: "10px",
            border: "none", background: isParentActive ? C.activeBg : "transparent",
            color: isParentActive ? "#fff" : C.textMuted,
            fontSize: "13px", fontWeight: isParentActive ? "500" : "400",
            cursor: "pointer", marginBottom: "2px",
            borderLeft: isParentActive ? `2px solid ${C.naranja}` : "2px solid transparent",
            transition: "background 0.15s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Icon size={18} strokeWidth={isParentActive ? 2 : 1.6}
              style={{ color: isParentActive ? C.naranjaLight : "inherit", flexShrink: 0 }} />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
          </div>
          <ChevronRight size={13} strokeWidth={2}
            style={{ flexShrink: 0, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {open && (
          <div style={{ marginLeft: "28px", marginBottom: "4px", display: "flex", flexDirection: "column", gap: "1px" }}>
            {item.sub.map(s => (
              <NavLink
                key={s.to}
                to={s.to}
                end
                style={({ isActive }) => ({
                  display: "block", padding: "7px 12px", borderRadius: "8px",
                  textDecoration: "none", fontSize: "12px",
                  fontWeight: isActive ? "600" : "400",
                  color: isActive ? "#fff" : C.textMuted,
                  background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                  borderLeft: isActive ? `2px solid ${C.naranjaLight}` : "2px solid transparent",
                  transition: "background 0.15s",
                })}
              >
                {s.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Item colapsado con submenú → solo icono, sin submenú
  if (item.sub && collapsed) {
    return (
      <NavLink
        to={item.to}
        title={item.label}
        style={({ isActive }) => ({
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "10px 0", borderRadius: "10px", textDecoration: "none",
          background: isActive ? C.activeBg : "transparent",
          color: isActive ? "#fff" : C.textMuted,
          marginBottom: "2px", borderLeft: isActive ? `2px solid ${C.naranja}` : "2px solid transparent",
        })}
      >
        {({ isActive }) => (
          <Icon size={18} strokeWidth={isActive ? 2 : 1.6}
            style={{ color: isActive ? C.naranjaLight : "inherit" }} />
        )}
      </NavLink>
    );
  }

  return (
    <NavLink
      to={item.to}
      end
      title={collapsed ? item.label : undefined}
      style={({ isActive }) => ({
        display: "flex", alignItems: "center",
        gap: collapsed ? 0 : "10px",
        padding: collapsed ? "10px 0" : "9px 12px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: "10px", textDecoration: "none",
        transition: "background 0.15s, color 0.15s",
        background: isActive ? C.activeBg : "transparent",
        color: isActive ? "#fff" : C.textMuted,
        marginBottom: "2px", fontSize: "13px",
        fontWeight: isActive ? "500" : "400",
        borderLeft: isActive ? `2px solid ${C.naranja}` : "2px solid transparent",
      })}
    >
      {({ isActive }) => (
        <>
          <Icon size={18} strokeWidth={isActive ? 2 : 1.6}
            style={{ flexShrink: 0, color: isActive ? C.naranjaLight : "inherit" }} />
          {!collapsed && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

export default function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandido, setExpandido] = useState({ usuarios: true });
  const { usuario, logout } = useAuthStore();
  const navigate = useNavigate();

  const toggleSub = (key) => setExpandido(prev => ({ ...prev, [key]: !prev[key] }));

  const navItems = NAV_POR_ROL[usuario?.rol] || [];
  const rutasMensajes = {
  SUPERADMIN: "/superadmin/mensajes",
  DIRECTOR: "/director/comunicados",
  SECRETARIA: "/secretaria/mensajes",
  FINANZAS: "/finanzas/mensajes",
  MAESTRO: "/operativo/mensajes",
  ENFERMERIA: "/operativo/mensajes",
  CHOFER: "/logistica/mensajes",
  MARKETING: "/marketing/mensajes",
  REPRESENTANTE: "/padre/mensajes",
};

  const rutaMensajes = rutasMensajes[usuario?.rol] || "/";
  const valorCrudo = usuario?.first_name || usuario?.username || "Usuario";
  const textoLimpio = Array.isArray(valorCrudo) ? valorCrudo[0] : valorCrudo;
  const inicial = String(textoLimpio).trim().charAt(0).toUpperCase();
  const nombre = textoLimpio;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const sidebarW = collapsed ? "64px" : "220px";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter', system-ui, sans-serif" }}>

      <aside style={{
        width: sidebarW, flexShrink: 0, background: C.verde,
        display: "flex", flexDirection: "column",
        transition: "width 0.22s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden", position: "relative", zIndex: 30,
      }}>

        {/* Logo + toggle */}
        <div style={{
          padding: collapsed ? "18px 0" : "16px 14px",
          borderBottom: `1px solid ${C.divider}`,
          display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: "8px", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", overflow: "hidden" }}>
            <div style={{
              width: "34px", height: "34px", background: C.verdeDark,
              borderRadius: "9px", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M12 3L21 7.5V16.5L12 21L3 16.5V7.5L12 3Z" stroke={C.naranja} strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="2.5" fill={C.naranja}/>
              </svg>
            </div>
            {!collapsed && (
              <div style={{ overflow: "hidden" }}>
                <p style={{ fontSize: "15px", fontWeight: "700", letterSpacing: "3px", margin: 0, color: "#fff", lineHeight: 1.2 }}>GINNIE</p>
                <p style={{ fontSize: "10px", color: C.textMuted, margin: 0, whiteSpace: "nowrap" }}>
                  {usuario?.rol_display || usuario?.rol}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} title="Compactar sidebar"
              style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: "4px", borderRadius: "6px", display: "flex", alignItems: "center", flexShrink: 0 }}>
              <ChevronRight size={15} strokeWidth={2} style={{ transform: "rotate(180deg)" }} />
            </button>
          )}
        </div>

        {collapsed && (
          <button onClick={() => setCollapsed(false)} title="Expandir sidebar"
            style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: "10px 0", display: "flex", justifyContent: "center" }}>
            <ChevronRight size={15} strokeWidth={2} />
          </button>
        )}

        <nav style={{ flex: 1, padding: collapsed ? "8px 8px" : "8px 10px", overflowY: "auto", overflowX: "hidden" }}>
          {navItems.map((item) => (
            <NavItem key={item.key || item.to} item={item} collapsed={collapsed} expandido={expandido} onToggle={toggleSub} />
          ))}
          <div style={{ borderTop: `1px solid ${C.divider}`, marginTop: "8px", paddingTop: "8px" }}>
            <NavItem
              item={{ label: "Mensajes", icon: MessageSquare, to: rutaMensajes }}
              collapsed={collapsed}
              expandido={expandido}
              onToggle={toggleSub}
            />
          </div>
        </nav>

        {/* Usuario + logout */}
        <div style={{ padding: collapsed ? "12px 8px" : "12px 10px", borderTop: `1px solid ${C.divider}`, flexShrink: 0 }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "8px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%", background: C.naranja,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: "700", color: "#fff", flexShrink: 0,
              }}>{inicial}</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "12px", fontWeight: "500", margin: 0, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nombre}</p>
                <p style={{ fontSize: "10px", color: C.textMuted, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{usuario?.email || "—"}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout} title="Cerrar sesión"
            style={{
              display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
              gap: "7px", background: "none", border: "none", color: C.textMuted,
              fontSize: "12px", cursor: "pointer", padding: collapsed ? "8px 0" : "6px 4px",
              borderRadius: "8px", width: "100%", transition: "color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
          >
            <LogOut size={15} strokeWidth={1.8} />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <header style={{
          background: "#fff", borderBottom: "1px solid #E2EDE6",
          padding: "0 1.5rem", height: "52px",
          display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "12px", color: "#7A9A88", margin: 0 }}>
              {new Date().toLocaleDateString("es-EC", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <button style={{ background: "none", border: "1px solid #E2EDE6", borderRadius: "8px", padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center", color: "#7A9A88" }}>
            <MessageSquare size={15} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Wifi size={13} color={C.verde} />
            <span style={{ fontSize: "11px", color: "#7A9A88" }}>En línea</span>
          </div>
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%", background: C.verde,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: "700", color: "#fff",
          }}>{inicial}</div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "1.5rem", background: "#F4F9F6" }}>
          {children}
        </main>
      </div>
    </div>
  );
}