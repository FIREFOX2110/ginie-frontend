import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { getRutaInicial } from '../../utils/roles';

export default function RedireccionarInicio() {
  const { usuario, cargando } = useAuthStore();
  if (cargando) return null;
  if (!usuario) return <Navigate to="/login" replace />;
  return <Navigate to={getRutaInicial(usuario.rol)} replace />;
}