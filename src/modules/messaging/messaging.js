// messaging.js
import { chatsList } from './chatsList.js';
import { createChat } from './createChat.js';
import { messageList } from './messageList.js';
import { sendMessage } from './sendMessage.js';
import { sendVoiceMessage } from './sendVoiceMessage.js';
import { createGroupMessaging } from './groupMessaging.js';

/**
 * Creates a messaging module with various messaging functionalities.
 * @param {Object} gun - The Gun instance.
 * @param {Object} SEA - The SEA (Security, Encryption, Authorization) object.
 * @returns {Object} An object containing messaging functions.
 */
export const createMessagingModule = (gun, SEA) => {
  const groupMessaging = createGroupMessaging(gun, SEA);

  return {
    chatsList: chatsList(gun),
    createChat: createChat(gun),
    messageList: messageList(gun, SEA),
    sendMessage: sendMessage(gun, SEA),
    sendVoiceMessage: sendVoiceMessage(gun),
    createGroup: groupMessaging.createGroup,
    sendGroupMessage: groupMessaging.sendGroupMessage,
    getGroupMessages: groupMessaging.getGroupMessages,
    addMemberToGroup: groupMessaging.addMemberToGroup,
    removeMemberFromGroup: groupMessaging.removeMemberFromGroup  // Added this line
  };
};

/**
 * Creates a group messaging module.
 * @param {Object} gun - The Gun instance.
 * @param {Object} SEA - The SEA (Security, Encryption, Authorization) object.
 * @returns {Object} An object containing group messaging functions.
 */
export const createGroupMessagingModule = (gun, SEA) => {
  return createGroupMessaging(gun, SEA);
};
