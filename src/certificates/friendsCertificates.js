// friendsCertificates.js

/**
 * Genera un certificato per le richieste di amicizia.
 * @param {Object} gun - Istanza di Gun
 * @param {Object} SEA - Oggetto SEA di Gun
 * @returns {Promise<Object>} - Oggetto contenente il risultato dell'operazione
 */
export const generateFriendRequestsCertificate = async (gun, SEA) => {
  const certificateExists = await gun
    .user()
    .get("certificates")
    .get("friendRequests")
    .once();

  if (certificateExists) return { success: "Certificate already exists." };

  const certificate = await SEA.certify(
    ["*"],
    [{ "*": "friendRequests" }],
    await gun.user().pair(),
    null
  );
  
  return new Promise((resolve) => {
    gun
      .user()
      .get("certificates")
      .get("friendRequests")
      .put(certificate, ({ err }) => {
        if (err) {
          resolve({
            errMessage: err,
            errCode: "gun-put-error",
            success: undefined,
          });
        } else {
          resolve({
            errMessage: undefined,
            errCode: undefined,
            certificate,
            success: "Generated new friend requests certificate.",
          });
        }
      });
  });
};

/**
 * Genera un certificato per aggiungere un amico.
 * @param {Object} gun - Istanza di Gun
 * @param {Object} SEA - Oggetto SEA di Gun
 * @param {string} publicKey - Chiave pubblica dell'amico da aggiungere
 * @returns {Promise<Object>} - Oggetto contenente il risultato dell'operazione
 */
export const generateAddFriendCertificate = async (gun, SEA, publicKey) => {
  const certificateExists = await gun
    .user()
    .get("certificates")
    .get(publicKey)
    .get("addFriend")
    .once();

  if (certificateExists) return { success: "Certificate already exists." };

  const certificate = await SEA.certify(
    [publicKey],
    [{ "*": "friends" }],
    await gun.user().pair(),
    null
  );

  return new Promise((resolve) => {
    gun
      .user()
      .get("certificates")
      .get(publicKey)
      .get("addFriend")
      .put(certificate, ({ err }) => {
        if (err) {
          resolve({
            errMessage: err,
            errCode: "gun-put-error",
            success: undefined,
          });
        } else {
          resolve({
            errMessage: undefined,
            errCode: undefined,
            certificate,
            success: "Generated certificate for requested friend to add user back.",
          });
        }
      });
  });
};