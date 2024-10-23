export const addFriendRequest = (gun, user, generateAddFriendCertificate) => async (publicKey) => {
    try {
      const addFriendRequestCertificate = await gun.user(publicKey).get("certificates").get("friendRequests").then();
      
      await gun.user(publicKey).get("friendRequests").set(user.is.pub, { opt: { cert: addFriendRequestCertificate } });
      await generateAddFriendCertificate(publicKey);
      
      return { success: "Friend request sent successfully." };
    } catch (err) {
      return { errMessage: err.message, errCode: "friend-request-error", success: undefined };
    }
  };