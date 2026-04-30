/**
 * Entorno de producción
 * Angular reemplaza environment.ts por este archivo en build de producción
 * mediante fileReplacements en angular.json
 *
 * ⚠️ Las variables se reemplazan en build-time, no en runtime.
 * Para variables en runtime, usar mecanismo de server-side o config API.
 */
export const environment = {
  production: true,

  /** URL base del backend API en producción */
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