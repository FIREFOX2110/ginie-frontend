import { create } from 'zustand';
import { login as apiLogin, logout as apiLogout, getPerfil } from '../api/auth';

const useAuthStore = create((set, get) => ({
  usuario: null,
  cargando: true,
  error: null,

  inicializar: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ cargando: false });
      return;
    }
    try {
      const usuario = await getPerfil();
      set({ usuario, cargando: false });
    } catch {
      localStorage.clear();
      set({ usuario: null, cargando: false });
    }
  },

  login: async (username, password) => {
    set({ error: null });
    try {
      const usuario = await apiLogin(username, password);
      set({ usuario, cargando: false, error: null });
      return usuario;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Credenciales incorrectas.';
      set({ error: msg, cargando: false });
      throw err;
    }
  },

  logout: async () => {
    await apiLogout();
    set({ usuario: null, cargando: false });
  },

  esRol: (rol) => get().usuario?.rol === rol,
  esAdmin: () => ['SUPERADMIN', 'DIRECTOR'].includes(get().usuario?.rol),
  esPersonalInterno: () => get().usuario?.rol !== 'REPRESENTANTE',
}));

export default useAuthStore;
