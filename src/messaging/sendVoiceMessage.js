export const sendVoiceMessage = (gun) => async (roomId, publicKey, voiceRecording) => {
    const userPub = await gun.user().pair().pub;
  
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
  
    try {
      await gun.user().get("chats").get(roomId).get("latestMessage").put(voiceRecording);
      await gun.user(publicKey).get("chats").get(roomId).get("latestMessage").put(voiceRecording, null, { opt: { cert: updateMetaCertificate } });
      await gun.user().get("messages").get(roomId).set(voiceRecording);
      await gun.user(publicKey).get("messages").get(roomId).set(voiceRecording, null, { opt: { cert: createMessagesCertificate } });
  
      return { errMessage: undefined, errCode: undefined, success: "Created a voice message with friend." };
    } catch (err) {
      return { errMessage: err.message, errCode: "message-creation-error", success: undefined };
    }
  };