/**
 * Creates a function to send voice messages between users.
 * 
 * @param {Object} gun - The Gun instance
 * @returns {Function} An async function to send voice messages
 */
export const sendVoiceMessage = (gun) => async (roomId, publicKey, voiceRecording) => {
    // Get the current user's public key
    const userPub = await gun.user().pair().pub;
  
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
  
    try {
      // Update the latest message in the user's chat
      await gun.user().get("chats").get(roomId).get("latestMessage").put(voiceRecording);
      // Update the latest message in the recipient's chat
      await gun.user(publicKey).get("chats").get(roomId).get("latestMessage").put(voiceRecording, null, { opt: { cert: updateMetaCertificate } });
      // Add the voice message to the user's message list
      await gun.user().get("messages").get(roomId).set(voiceRecording);
      // Add the voice message to the recipient's message list
      await gun.user(publicKey).get("messages").get(roomId).set(voiceRecording, null, { opt: { cert: createMessagesCertificate } });
  
      return { errMessage: undefined, errCode: undefined, success: "Created a voice message with friend." };
    } catch (err) {
      return { errMessage: err.message, errCode: "message-creation-error", success: undefined };
    }
  };