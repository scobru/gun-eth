// messaging.js
import { chatsList } from './chatsList.js';
import { createChat } from './createChat.js';
import { messageList } from './messageList.js';
import { sendMessage } from './sendMessage.js';
import { sendVoiceMessage } from './sendVoiceMessage.js';
import { createGroupMessaging } from './groupMessaging.js';

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
    removeMemberFromGroup: groupMessaging.removeMemberFromGroup  // Aggiunta questa linea
  };
};

export const createGroupMessagingModule = (gun, SEA) => {
  return createGroupMessaging(gun, SEA);
};

