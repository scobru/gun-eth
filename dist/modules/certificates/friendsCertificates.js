// friendsCertificates.js
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
 * Generates a certificate for friend requests.
 * @param {Object} gun - Gun instance
 * @param {Object} SEA - Gun's SEA object
 * @returns {Promise<Object>} - Object containing the result of the operation
 */
export const generateFriendRequestsCertificate = (gun, SEA) => __awaiter(void 0, void 0, void 0, function* () {
    const certificateExists = yield gun
        .user()
        .get("certificates")
        .get("friendRequests")
        .once();
    if (certificateExists)
        return { success: "Certificate already exists." };
    const certificate = yield SEA.certify(["*"], [{ "*": "friendRequests" }], yield gun.user().pair(), null);
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
            }
            else {
                resolve({
                    errMessage: undefined,
                    errCode: undefined,
                    certificate,
                    success: "Generated new friend requests certificate.",
                });
            }
        });
    });
});
/**
 * Generates a certificate to add a friend.
 * @param {Object} gun - Gun instance
 * @param {Object} SEA - Gun's SEA object
 * @param {string} publicKey - Public key of the friend to add
 * @returns {Promise<Object>} - Object containing the result of the operation
 */
export const generateAddFriendCertificate = (gun, SEA, publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    const certificateExists = yield gun
        .user()
        .get("certificates")
        .get(publicKey)
        .get("addFriend")
        .once();
    if (certificateExists)
        return { success: "Certificate already exists." };
    const certificate = yield SEA.certify([publicKey], [{ "*": "friends" }], yield gun.user().pair(), null);
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
            }
            else {
                resolve({
                    errMessage: undefined,
                    errCode: undefined,
                    certificate,
                    success: "Generated certificate for requested friend to add user back.",
                });
            }
        });
    });
});
