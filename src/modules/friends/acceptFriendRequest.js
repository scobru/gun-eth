/**
 * Accepts a friend request and adds the friend to the user's friend list.
 * @param {Object} gun - Gun instance
 * @param {Object} user - Current user object
 * @returns {Function} - Async function that accepts the friend request
 * @param {Object} params - Parameters for accepting the friend request
 * @param {string} params.key - Key of the friend request
 * @param {string} params.publicKey - Public key of the friend
 */
export const acceptFriendRequest = (gun, user) => async ({ key, publicKey }) => {
    try {
      await gun.user().get("friendRequests").get(key).put(null);
      const addFriendCertificate = await gun.user(publicKey).get("certificates").get(user.is.pub).get("addFriend").then();
      
      await gun.user(publicKey).get("friends").set(user.is.pub, { opt: { cert: addFriendCertificate } });
      await gun.user().get("friends").set(publicKey);
      
      return { success: "Added friend successfully." };
    } catch (err) {
      return { errMessage: err.message, errCode: "accept-friend-request-failed", success: undefined };
    }
  };