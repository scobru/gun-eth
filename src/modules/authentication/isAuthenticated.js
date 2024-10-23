// authenticationStatus.js
import { Subject } from "rxjs";

/**
 * Crea un oggetto per gestire lo stato di autenticazione.
 * @param {Object} gun - Istanza di Gun
 * @returns {Object} - Oggetto contenente isAuthenticated e checkAuth
 */
export const createAuthenticationStatus = (gun) => {
  /**
   * Contiene una funzione sottoscrivibile che restituirà un booleano 
   * che indica se l'utente è autenticato o meno.
   */
  const isAuthenticated = new Subject();

  /**
   * Questa funzione controlla se l'utente è autenticato o meno.
   */
  const checkAuth = () => {
    if (gun.user().is) {
      isAuthenticated.next(true);
    } else {
      isAuthenticated.next(false);
    }
  };

  // Ascolta l'evento di autenticazione di Gun
  gun.on("auth", () => isAuthenticated.next(true));

  return { isAuthenticated, checkAuth };
};