/**
 * Verifica se un username è già in uso.
 * @param {Object} gun - Istanza di Gun
 * @param {string} username
 * @returns {Promise<boolean>}
 */
export const checkUsernameInUse = async (gun, username) => {
  let user = await gun.get(`~@${username}`).then();
  return user !== undefined;
};

/**
 * Registra un nuovo utente.
 * @param {Object} gun - Istanza di Gun
 * @param {Object} credentials - Le credenziali dell'utente
 * @param {string} credentials.username - Il nome utente
 * @param {string} credentials.password - La password
 * @returns {Promise<Object>} - Un oggetto con il risultato della registrazione
 */
export const registerUser = async (gun, credentials) => {
  if (await checkUsernameInUse(gun, credentials.username)) {
    return {
      errMessage: "Username in use.",
      errCode: "username-inuse",
    };
  }

  console.log ("GunETH:registerUser:credentials", credentials);

  return new Promise((resolve) => {
    gun
      .user()
      .create(credentials.username, credentials.password, ({ err, pub }) => {
        if (err) {
          resolve({ errMessage: err, errCode: "gun-auth-error" });
        } else {
          resolve({
            errMessage: undefined,
            errCode: undefined,
            pub,
            message: "Successfully created user.",
          });
        }
      });
  });
};

/**
 * Converte una stringa in un ArrayBuffer.
 * @param {string} str - La stringa da convertire
 * @returns {ArrayBuffer} - L'ArrayBuffer risultante
 */
export const str2ab = (str) => {
  const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  const bufView = new Uint16Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

/**
 * Authenticates a registered user.
 * @param {Object} gun - Gun instance
 * @param {Object} credentials - User credentials
 * @param {string} credentials.username - The username
 * @param {string} credentials.password - The password
 * @returns {Promise<Object>} - An object with the authentication result
 */
export const loginUser = (gun, credentials) => {
  return new Promise((resolve) => {
    gun
      .user()
      .auth(credentials.username, credentials.password, ({ err, pub }) => {
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
