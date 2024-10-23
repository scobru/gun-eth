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