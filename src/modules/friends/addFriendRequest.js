import { generateAddFriendCertificate } from "../certificates/friendsCertificates";

/**
 * Invia una richiesta di amicizia a un altro utente.
 * @param {string} publicKey - Chiave pubblica dell'utente destinatario
 * @param {Function} callback - Funzione di callback opzionale
 * @returns {Promise<Object>} - Oggetto risultato con informazioni sul successo o errore
 */
export const addFriendRequest = async (gun, publicKey, callback = () => {}) => {
  try {
    // Verifica se l'utente esiste prima di procedere
    const userExists = await gun.user(publicKey).once();
    if (!userExists) {
      throw new Error("L'utente specificato non esiste.");
    }

    // Recupera il certificato di richiesta di amicizia dall'utente destinatario
    const addFriendRequestCertificate = await gun
      .user(publicKey)
      .get("certificates")
      .get("friendRequests")
      .then();

    if (!addFriendRequestCertificate) {
      throw new Error(
        "Il certificato di richiesta di amicizia non è disponibile."
      );
    }

    // Invia la richiesta di amicizia all'utente destinatario
    await gun
      .user(publicKey)
      .get("friendRequests")
      .set(gun.user().is.pub, {
        opt: { cert: addFriendRequestCertificate },
      });

    // Genera un certificato di aggiunta amico per l'utente destinatario
    await generateAddFriendCertificate(gun, gun.SEA, publicKey);

    const result = { success: "Richiesta di amicizia inviata con successo." };
    callback(result);
    return result;
  } catch (err) {
    const result = {
      errMessage: err.message,
      errCode: "errore-richiesta-amicizia",
      success: undefined,
    };
    callback(result);
    return result;
  }
};
