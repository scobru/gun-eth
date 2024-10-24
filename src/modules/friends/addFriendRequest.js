import { generateAddFriendCertificate } from "../certificates/friendsCertificates";

/**
 * Invia una richiesta di amicizia a un altro utente.
 * @param {string} publicKey - Chiave pubblica dell'utente destinatario
 * @param {Function} callback - Funzione di callback opzionale
 * @returns {Promise<Object>} - Oggetto risultato con informazioni sul successo o errore
 */
export const addFriendRequest = async ( gun, publicKey, callback = () => {}) => {
  try {
    // Recupera il certificato di richiesta di amicizia dall'utente destinatario
    const addFriendRequestCertificate = await gun
      .user(publicKey)
      .get("certificates")
      .get("friendRequests")
      .then();

    // Invia la richiesta di amicizia all'utente destinatario
    await gun.user(publicKey).get("friendRequests").set(user.is.pub, {
      opt: { cert: addFriendRequestCertificate }
    });

    // Genera un certificato di aggiunta amico per l'utente destinatario
    await generateAddFriendCertificate(gun, gun.SEA, publicKey);

    const result = { success: "Friend request sent successfully." };
    callback(result);
    return result;
  } catch (err) {
    const result = { errMessage: err.message, errCode: "friend-request-error", success: undefined };
    callback(result);
    return result;
  }
};

