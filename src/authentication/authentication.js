
import { createAuthenticationStatus } from './isAuthenticated.js';
import { loginUser } from './login.js';
import { registerUser } from './register.js';

/**
 * Crea un oggetto che contiene tutte le funzionalità di autenticazione.
 * @param {Object} gun - Istanza di Gun
 * @returns {Object} - Oggetto contenente tutte le funzionalità di autenticazione
 */
export const createAuthenticationModule = (gun) => {
  const { isAuthenticated, checkAuth } = createAuthenticationStatus(gun);

  const logout = () => {
    gun.user().leave();
    isAuthenticated.next(false);
  };

  return {
    checkAuth,
    isAuthenticated,
    loginUser: (credentials) => loginUser(gun, credentials),
    registerUser: (credentials) => registerUser(gun, credentials),
    logout
  };
};