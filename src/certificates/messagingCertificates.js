// messagingCertificates.js

/**
 * Crea un certificato per le chat.
 * @param {Object} gun - Istanza di Gun
 * @param {Object} SEA - Oggetto SEA di Gun
 * @param {string} publicKey - Chiave pubblica dell'utente per cui creare il certificato
 * @returns {Promise<Object>} - Oggetto contenente il risultato dell'operazione
 */
export const createChatsCertificate = async (gun, SEA, publicKey) => {
    const certificateExists = await gun
      .user()
      .get("certificates")
      .get(publicKey)
      .get("chats")
      .once();
  
    if (certificateExists) return { success: "Certificate already exists." };
  
    const certificate = await SEA.certify(
      [publicKey],
      [{ "*": "chats" }],
      await gun.user().pair(),
      null
    );
  
    return new Promise((resolve) => {
      gun
        .user()
        .get("certificates")
        .get(publicKey)
        .get("chats")
        .put(certificate, ({ err }) => {
          if (err) {
            resolve({
              errMessage: err,
              errCode: "chats-certificate-creation-error",
              success: undefined,
            });
          } else {
            resolve({
              errMessage: undefined,
              errCode: undefined,
              certificate,
              success: "Generated new chats certificate.",
            });
          }
        });
    });
  };
  
  /**
   * Crea un certificato per i messaggi.
   * @param {Object} gun - Istanza di Gun
   * @param {Object} SEA - Oggetto SEA di Gun
   * @param {string} publicKey - Chiave pubblica dell'utente per cui creare il certificato
   * @returns {Promise<Object>} - Oggetto contenente il risultato dell'operazione
   */
  export const createMessagesCertificate = async (gun, SEA, publicKey) => {
    const certificateExists = await gun
      .user()
      .get("certificates")
      .get(publicKey)
      .get("messages")
      .once();
  
    if (certificateExists) return { success: "Certificate already exists." };
  
    const certificate = await SEA.certify(
      [publicKey],
      [{ "*": "messages" }],
      await gun.user().pair(),
      null
    );
  
    return new Promise((resolve) => {
      gun
        .user()
        .get("certificates")
        .get(publicKey)
        .get("messages")
        .put(certificate, ({ err }) => {
          if (err) {
            resolve({
              errMessage: err,
              errCode: "messages-certificate-creation-error",
              success: undefined,
            });
          } else {
            resolve({
              errMessage: undefined,
              errCode: undefined,
              certificate,
              success: "Generated new messages certificate.",
            });
          }
        });
    });
  };