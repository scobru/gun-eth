import { v4 as uuidv4 } from "uuid";

/**
 * Creates a function to send encrypted messages between users.
 * 
 * @param {Object} gun - The Gun instance
 * @param {Object} SEA - The SEA (Security, Encryption, Authorization) object
 * @returns {Function} An async function to send messages
 */
export const sendMessage = (gun, SEA) => async (roomId, publicKey, message) => {
  // Get the current user's public key and key pair
  const userPub = await gun.user().pair().pub;
  const userPair = await gun.user()._.sea;
  // Get the recipient's user data
  const friend = await gun.user(publicKey);

  // Check if the user's public key is available
  if (!userPub) {
    return { errMessage: "Could not find pub.", errCode: "failed-to-find-pub", success: undefined };
  }

  // Get the certificates for creating messages and updating chat metadata
  const createMessagesCertificate = await gun.user(publicKey).get("certificates").get(userPub).get("messages").then();
  const updateMetaCertificate = await gun.user(publicKey).get("certificates").get(userPub).get("chats").then();

  // Check if the message creation certificate is available
  if (!createMessagesCertificate) {
    return { errMessage: "Could not find friend certificate to create message", errCode: "failed-to-find-friend-messages-certificate", success: undefined };
  }

  // Check if the chat metadata update certificate is available
  if (!updateMetaCertificate) {
    return { errMessage: "Could not find friend certificate to add meta to chat", errCode: "failed-to-find-friend-chats-certificate", success: undefined };
  }

  // Generate a unique message ID and timestamp
  const messageId = uuidv4();
  const timeSent = Date.now();

  // Encrypt the message
  const secret = await SEA.secret(friend.epub, userPair);
  const encryptedMessage = await SEA.encrypt(JSON.stringify({ id: messageId, content: message, timeSent, sender: userPub, type: "text" }), secret);

  try {
    // Update the latest message in the user's chat
    await gun.user().get("chats").get(roomId).get("latestMessage").put(encryptedMessage);
    // Update the latest message in the recipient's chat
    await gun.user(publicKey).get("chats").get(roomId).get("latestMessage").put(encryptedMessage, null, { opt: { cert: updateMetaCertificate } });
    // Add the message to the user's message list
    await gun.user().get("messages").get(roomId).set(encryptedMessage);
    // Add the message to the recipient's message list
    await gun.user(publicKey).get("messages").get(roomId).set(encryptedMessage, null, { opt: { cert: createMessagesCertificate } });

    return { errMessage: undefined, errCode: undefined, success: "Created a message with friend." };
  } catch (err) {
    return { errMessage: err.message, errCode: "message-creation-error", success: undefined };
  }
};