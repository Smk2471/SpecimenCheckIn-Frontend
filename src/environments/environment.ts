// Local development default. `ng serve` proxies /api to the backend per
// proxy.conf.json, so apiBaseUrl is left empty (relative URLs).
export const environment = {
  production: false,
  apiBaseUrl: 'https://specimencheckin-backend-production.up.railway.app'
};
