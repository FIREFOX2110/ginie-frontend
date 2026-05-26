import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function ProtectedRoute({ children, rolesPermitidos }) {
  const { usuario, cargando } = useAuthStore();

  if (cargando) return null;
  if (!usuario) return <Navigate to="/login" replace />;
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/sin-acceso" replace />;
  }
  return children;
}
