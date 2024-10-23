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
 * Creates a function to send a friend request to another user.
 * @param {Object} gun - Gun instance
 * @param {Object} user - Current user object
 * @param {Function} generateAddFriendCertificate - Function to generate an add friend certificate
 * @returns {Function} - Async function that sends a friend request
 */
export const addFriendRequest = (gun, user, generateAddFriendCertificate) => (publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Retrieve the friend request certificate from the target user
        const addFriendRequestCertificate = yield gun.user(publicKey).get("certificates").get("friendRequests").then();
        // Send the friend request to the target user
        yield gun.user(publicKey).get("friendRequests").set(user.is.pub, { opt: { cert: addFriendRequestCertificate } });
        // Generate an add friend certificate for the target user
        yield generateAddFriendCertificate(publicKey);
        return { success: "Friend request sent successfully." };
    }
    catch (err) {
        return { errMessage: err.message, errCode: "friend-request-error", success: undefined };
    }
});
