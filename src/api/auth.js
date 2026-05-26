import api from './axios';

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login/', {email, password });
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  return data.usuario;
};

export const logout = async () => {
  const refresh = localStorage.getItem('refresh_token');
  try { await api.post('/auth/logout/', { refresh }); } catch {}
  localStorage.clear();
};

export const getPerfil = async () => {
  const { data } = await api.get('/auth/perfil/');
  return data;
};

export const cambiarPassword = async (password_actual, password_nuevo) => {
  const { data } = await api.post('/auth/cambiar-password/', { password_actual, password_nuevo });
  return data;
};