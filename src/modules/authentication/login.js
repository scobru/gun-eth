// authentication.js

/**
 * Autentica un utente registrato.
 * @param {Object} gun - Istanza di Gun
 * @param {Object} credentials - Le credenziali dell'utente
 * @param {string} credentials.username - Il nome utente
 * @param {string} credentials.password - La password
 * @returns {Promise<Object>} - Un oggetto con il risultato dell'autenticazione
 */
export const loginUser = (gun, credentials) => {
    return new Promise((resolve) => {
      gun.user().auth(credentials.username, credentials.password, ({ err, pub }) => {
        if (err) {
          resolve({ errMessage: err, errCode: "gun-auth-error" });
        } else {
          resolve({
            errMessage: undefined,
            errCode: undefined,
            pub,
            message: "Successfully authenticated user.",
          });
        }
      });
    });
  };