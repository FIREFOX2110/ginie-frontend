export const ROLES = {
  SUPERADMIN: 'SUPERADMIN', DIRECTOR: 'DIRECTOR', SECRETARIA: 'SECRETARIA',
  FINANZAS: 'FINANZAS', VENTAS: 'VENTAS', MARKETING: 'MARKETING',
  MAESTRO: 'MAESTRO', ENFERMERIA: 'ENFERMERIA', CHOFER: 'CHOFER', REPRESENTANTE: 'REPRESENTANTE',
};
export const RUTA_POR_ROL = {
  SUPERADMIN: '/superadmin', DIRECTOR: '/director', SECRETARIA: '/secretaria',
  FINANZAS: '/finanzas', VENTAS: '/marketing/prospectos', MARKETING: '/marketing',
  MAESTRO: '/operativo/bitacoras', ENFERMERIA: '/operativo/enfermeria',
  CHOFER: '/logistica/mi-ruta', REPRESENTANTE: '/padre',
};
export const getRutaInicial = (rol) => RUTA_POR_ROL[rol] || '/';
