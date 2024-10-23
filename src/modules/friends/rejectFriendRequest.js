/**
 * Rejects a friend request by removing it from the user's friend requests.
 * 
 * @param {Object} gun - The Gun instance.
 * @returns {Function} An async function that takes a key and rejects the corresponding friend request.
 */
export const rejectFriendRequest = (gun) => async (key) => {
  try {
    // Remove the friend request from the user's friendRequests
    await gun.user().get("friendRequests").get(key).put(null);
    return { success: "Friend request removed successfully." };
  } catch (err) {
    // If an error occurs, return an object with error details
    return { errMessage: err.message, errCode: "reject-friend-request-failed", success: undefined };
  }
};