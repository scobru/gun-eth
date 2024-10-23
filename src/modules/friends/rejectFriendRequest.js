export const rejectFriendRequest = (gun) => async (key) => {
    try {
      await gun.user().get("friendRequests").get(key).put(null);
      return { success: "Friend request removed successfully." };
    } catch (err) {
      return { errMessage: err.message, errCode: "reject-friend-request-failed", success: undefined };
    }
  };