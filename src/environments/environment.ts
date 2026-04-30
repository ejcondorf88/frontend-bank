/**
 * Entorno de desarrollo
 * Angular reemplaza este archivo por environment.prod.ts en build de producción
 * mediante fileReplacements en angular.json
 */
export const environment = {
  production: false,

  /** URL base del backend API */
  apiUrl: 'https://api-pichincha-backend-production.up.railway.app',

  /** Nombre de la aplicación */
  appName: 'Frontend Bank',

  /** Versión de la aplicación */
  version: '1.0.0',

  /** Idioma por defecto */
  defaultLanguage: 'es',

  /** Prefijo de ruta de la API (ej: /bp) */
  apiPrefix: '/bp',

  /** Tiempo máximo de espera para peticiones HTTP (ms) */
  httpTimeout: 30000,
};