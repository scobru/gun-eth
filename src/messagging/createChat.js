import { v4 as uuidv4 } from "uuid";

export const createChat = (gun) => async (publicKey) => {
  const userPub = await gun.user().pair().pub;
  const friend = await gun.user(publicKey).once();
  const createChatsCertificate = await gun.user(publicKey).get("certificates").get(userPub).get("chats").then();

  if (!userPub) {
    return { errMessage: "Could not find pub.", errCode: "failed-to-find-pub", success: undefined };
  }

  if (!friend) {
    return { errMessage: "Could not find friend.", errCode: "failed-to-find-friend", success: undefined };
  }

  if (!createChatsCertificate) {
    return { errMessage: "Could not find friend certificate to create chat", errCode: "failed-to-find-friend-chats-certificate", success: undefined };
  }

  const roomId = uuidv4();
  const chatData = JSON.stringify({ pub: userPub, roomId, latestMessage: {} });

  try {
    await gun.user(publicKey).get("chats").get(userPub).put(chatData, { opt: { cert: createChatsCertificate } });
    await gun.user().get("chats").get(publicKey).put(JSON.stringify({ pub: friend.pub, roomId, latestMessage: {} }));

    return { errMessage: undefined, errCode: undefined, chat: { pub: friend.pub, roomId }, success: "Created a chat with friend." };
  } catch (err) {
    return { errMessage: err.message, errCode: "chat-creation-error", success: undefined };
  }
};