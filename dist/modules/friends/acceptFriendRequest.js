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
 * Accepts a friend request and adds the friend to the user's friend list.
 * @param {Object} gun - Gun instance
 * @param {Object} user - Current user object
 * @returns {Function} - Async function that accepts the friend request
 * @param {Object} params - Parameters for accepting the friend request
 * @param {string} params.key - Key of the friend request
 * @param {string} params.publicKey - Public key of the friend
 */
export const acceptFriendRequest = (gun, user) => (_a) => __awaiter(void 0, [_a], void 0, function* ({ key, publicKey }) {
    try {
        yield gun.user().get("friendRequests").get(key).put(null);
        const addFriendCertificate = yield gun.user(publicKey).get("certificates").get(user.is.pub).get("addFriend").then();
        yield gun.user(publicKey).get("friends").set(user.is.pub, { opt: { cert: addFriendCertificate } });
        yield gun.user().get("friends").set(publicKey);
        return { success: "Added friend successfully." };
    }
    catch (err) {
        return { errMessage: err.message, errCode: "accept-friend-request-failed", success: undefined };
    }
});
