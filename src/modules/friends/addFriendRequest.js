/**
 * Creates a function to send a friend request to another user.
 * @param {Object} gun - Gun instance
 * @param {Object} user - Current user object
 * @param {Function} generateAddFriendCertificate - Function to generate an add friend certificate
 * @returns {Function} - Async function that sends a friend request
 */
export const addFriendRequest = (gun, user, generateAddFriendCertificate) => async (publicKey) => {
    try {
      // Retrieve the friend request certificate from the target user
      const addFriendRequestCertificate = await gun.user(publicKey).get("certificates").get("friendRequests").then();
      
      // Send the friend request to the target user
      await gun.user(publicKey).get("friendRequests").set(user.is.pub, { opt: { cert: addFriendRequestCertificate } });
      // Generate an add friend certificate for the target user
      await generateAddFriendCertificate(publicKey);
      
      return { success: "Friend request sent successfully." };
    } catch (err) {
      return { errMessage: err.message, errCode: "friend-request-error", success: undefined };
    }
  };