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
 * Rejects a friend request by removing it from the user's friend requests.
 *
 * @param {Object} gun - The Gun instance.
 * @returns {Function} An async function that takes a key and rejects the corresponding friend request.
 */
export const rejectFriendRequest = (gun) => (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Remove the friend request from the user's friendRequests
        yield gun.user().get("friendRequests").get(key).put(null);
        return { success: "Friend request removed successfully." };
    }
    catch (err) {
        // If an error occurs, return an object with error details
        return { errMessage: err.message, errCode: "reject-friend-request-failed", success: undefined };
    }
});
