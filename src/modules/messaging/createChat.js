import { v4 as uuidv4 } from "uuid";

/**
 * Creates a chat with a friend.
 * @param {Object} gun - The Gun instance.
 * @returns {Function} An async function that takes a publicKey and creates a chat.
 */
export const createChat = (gun) => async (publicKey) => {
  // Get the current user's public key
  const userPub = await gun.user().pair().pub;
  // Get the friend's user data
  const friend = await gun.user(publicKey).once();
  // Get the certificate for creating chats with this friend
  const createChatsCertificate = await gun.user(publicKey).get("certificates").get(userPub).get("chats").then();

  // Check if the user's public key is available
  if (!userPub) {
    return { errMessage: "Could not find pub.", errCode: "failed-to-find-pub", success: undefined };
  }

  // Check if the friend's data is available
  if (!friend) {
    return { errMessage: "Could not find friend.", errCode: "failed-to-find-friend", success: undefined };
  }

  // Check if the chat creation certificate is available
  if (!createChatsCertificate) {
    return { errMessage: "Could not find friend certificate to create chat", errCode: "failed-to-find-friend-chats-certificate", success: undefined };
  }

  // Generate a unique room ID for the chat
  const roomId = uuidv4();
  // Prepare the chat data
  const chatData = JSON.stringify({ pub: userPub, roomId, latestMessage: {} });

  try {
    // Add the chat to the friend's chats list
    await gun.user(publicKey).get("chats").get(userPub).put(chatData, { opt: { cert: createChatsCertificate } });
    // Add the chat to the current user's chats list
    await gun.user().get("chats").get(publicKey).put(JSON.stringify({ pub: friend.pub, roomId, latestMessage: {} }));

    // Return success message and chat details
    return { errMessage: undefined, errCode: undefined, chat: { pub: friend.pub, roomId }, success: "Created a chat with friend." };
  } catch (err) {
    // Return error message if chat creation fails
    return { errMessage: err.message, errCode: "chat-creation-error", success: undefined };
  }
};