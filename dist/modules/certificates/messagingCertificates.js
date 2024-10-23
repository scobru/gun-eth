// messagingCertificates.js
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
 * Creates a certificate for chats.
 * @param {Object} gun - Gun instance
 * @param {Object} SEA - Gun's SEA object
 * @param {string} publicKey - Public key of the user for whom to create the certificate
 * @returns {Promise<Object>} - Object containing the result of the operation
 */
export const createChatsCertificate = (gun, SEA, publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    const certificateExists = yield gun
        .user()
        .get("certificates")
        .get(publicKey)
        .get("chats")
        .once();
    if (certificateExists)
        return { success: "Certificate already exists." };
    const certificate = yield SEA.certify([publicKey], [{ "*": "chats" }], yield gun.user().pair(), null);
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
            }
            else {
                resolve({
                    errMessage: undefined,
                    errCode: undefined,
                    certificate,
                    success: "Generated new chats certificate.",
                });
            }
        });
    });
});
/**
 * Creates a certificate for messages.
 * @param {Object} gun - Gun instance
 * @param {Object} SEA - Gun's SEA object
 * @param {string} publicKey - Public key of the user for whom to create the certificate
 * @returns {Promise<Object>} - Object containing the result of the operation
 */
export const createMessagesCertificate = (gun, SEA, publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    const certificateExists = yield gun
        .user()
        .get("certificates")
        .get(publicKey)
        .get("messages")
        .once();
    if (certificateExists)
        return { success: "Certificate already exists." };
    const certificate = yield SEA.certify([publicKey], [{ "*": "messages" }], yield gun.user().pair(), null);
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
            }
            else {
                resolve({
                    errMessage: undefined,
                    errCode: undefined,
                    certificate,
                    success: "Generated new messages certificate.",
                });
            }
        });
    });
});
