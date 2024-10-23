import { v4 as uuidv4 } from "uuid";

export const sendMessage = (gun, SEA) => async (roomId, publicKey, message) => {
  const userPub = await gun.user().pair().pub;
  const userPair = await gun.user()._.sea;
  const friend = await gun.user(publicKey);

  if (!userPub) {
    return { errMessage: "Could not find pub.", errCode: "failed-to-find-pub", success: undefined };
  }

  const createMessagesCertificate = await gun.user(publicKey).get("certificates").get(userPub).get("messages").then();
  const updateMetaCertificate = await gun.user(publicKey).get("certificates").get(userPub).get("chats").then();

  if (!createMessagesCertificate) {
    return { errMessage: "Could not find friend certificate to create message", errCode: "failed-to-find-friend-messages-certificate", success: undefined };
  }

  if (!updateMetaCertificate) {
    return { errMessage: "Could not find friend certificate to add meta to chat", errCode: "failed-to-find-friend-chats-certificate", success: undefined };
  }

  const messageId = uuidv4();
  const timeSent = Date.now();

  const secret = await SEA.secret(friend.epub, userPair);
  const encryptedMessage = await SEA.encrypt(JSON.stringify({ id: messageId, content: message, timeSent, sender: userPub, type: "text" }), secret);

  try {
    await gun.user().get("chats").get(roomId).get("latestMessage").put(encryptedMessage);
    await gun.user(publicKey).get("chats").get(roomId).get("latestMessage").put(encryptedMessage, null, { opt: { cert: updateMetaCertificate } });
    await gun.user().get("messages").get(roomId).set(encryptedMessage);
    await gun.user(publicKey).get("messages").get(roomId).set(encryptedMessage, null, { opt: { cert: createMessagesCertificate } });

    return { errMessage: undefined, errCode: undefined, success: "Created a message with friend." };
  } catch (err) {
    return { errMessage: err.message, errCode: "message-creation-error", success: undefined };
  }
};