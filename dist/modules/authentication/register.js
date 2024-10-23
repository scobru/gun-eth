var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Verifica se un username è già in uso.
 * @param {Object} gun - Istanza di Gun
 * @param {string} username
 * @returns {Promise<boolean>}
 */
export const checkUsernameInUse = (gun, username) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield gun.get(`~@${username}`).then();
    return user !== undefined;
});
/**
 * Registra un nuovo utente.
 * @param {Object} gun - Istanza di Gun
 * @param {Object} credentials - Le credenziali dell'utente
 * @param {string} credentials.username - Il nome utente
 * @param {string} credentials.password - La password
 * @returns {Promise<Object>} - Un oggetto con il risultato della registrazione
 */
export const registerUser = (gun, credentials) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield checkUsernameInUse(gun, credentials.username)) {
        return {
            errMessage: "Username in use.",
            errCode: "username-inuse",
        };
    }
    return new Promise((resolve) => {
        gun.user().create(credentials.username, credentials.password, ({ err, pub }) => {
            if (err) {
                resolve({ errMessage: err, errCode: "gun-auth-error" });
            }
            else {
                resolve({
                    errMessage: undefined,
                    errCode: undefined,
                    pub,
                    message: "Successfully created user.",
                });
            }
        });
    });
});
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
        gun.user().auth(credentials.username, credentials.password, ({ err, pub }) => {
            if (err) {
                resolve({ errMessage: err, errCode: "gun-auth-error" });
            }
            else {
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
