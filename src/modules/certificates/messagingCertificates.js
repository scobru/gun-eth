// messagingCertificates.js

/**
 * Creates a certificate for chats.
 * @param {Object} gun - Gun instance
 * @param {Object} SEA - Gun's SEA object
 * @param {string} publicKey - Public key of the user for whom to create the certificate
 * @returns {Promise<Object>} - Object containing the result of the operation
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
   * Creates a certificate for messages.
   * @param {Object} gun - Gun instance
   * @param {Object} SEA - Gun's SEA object
   * @param {string} publicKey - Public key of the user for whom to create the certificate
   * @returns {Promise<Object>} - Object containing the result of the operation
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