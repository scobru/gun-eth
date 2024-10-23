// groupMessaging.js
import { v4 as uuidv4 } from "uuid";

export const createGroupMessaging = (gun, SEA) => {
  const createGroup = async (groupName, members) => {
    const groupId = uuidv4();
    return await updateGroupKey(groupId, groupName, members);
  };

  const updateGroupKey = async (groupId, groupName, members) => {
    const groupKey = await SEA.random(32).toString('base64');
    const encryptedGroupKey = {};

    for (let member of members) {
      const pub = member.pub;
      const epub = member.epub;
      const sharedSecret = await SEA.secret(epub, gun.user()._.sea);
      encryptedGroupKey[pub] = await SEA.encrypt(groupKey, sharedSecret);
    }

    await gun.user().get('groups').get(groupId).put({
      name: groupName,
      members: members.map(m => m.pub),
      encryptedKeys: encryptedGroupKey
    });

    return { groupId, groupKey };
  };

  const sendGroupMessage = async (groupId, message) => {
    const group = await gun.user().get('groups').get(groupId).then();
    if (!group) {
      throw new Error("Group not found");
    }

    const groupKey = await getGroupKey(groupId);
    const encryptedMessage = await SEA.encrypt(JSON.stringify({
      sender: gun.user().is.pub,
      content: message,
      timestamp: Date.now()
    }), groupKey);

    await gun.get(`groups/${groupId}/messages`).set(encryptedMessage);
  };

  const getGroupMessages = (groupId) => {
    return new Promise((resolve, reject) => {
      gun.get(`groups/${groupId}/messages`).map().once(async (encryptedMessage) => {
        try {
          const groupKey = await getGroupKey(groupId);
          const decryptedMessage = await SEA.decrypt(encryptedMessage, groupKey);
          if (decryptedMessage) {
            resolve(JSON.parse(decryptedMessage));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const getGroupKey = async (groupId) => {
    const group = await gun.user().get('groups').get(groupId).then();
    if (!group || !group.encryptedKeys[gun.user().is.pub]) {
      throw new Error("Group key not found for this user");
    }
    const encryptedGroupKey = group.encryptedKeys[gun.user().is.pub];
    const sharedSecret = await SEA.secret(gun.user().is.epub, gun.user()._.sea);
    return await SEA.decrypt(encryptedGroupKey, sharedSecret);
  };

  const addMemberToGroup = async (groupId, newMember) => {
    const group = await gun.user().get('groups').get(groupId).then();
    if (!group) {
      throw new Error("Group not found");
    }

    const currentMembers = group.members || [];
    const updatedMembers = [...currentMembers, newMember.pub];
    const memberDetails = [...currentMembers.map(pub => ({ pub })), newMember];

    await updateGroupKey(groupId, group.name, memberDetails);
  };

  const removeMemberFromGroup = async (groupId, memberPubToRemove) => {
    const group = await gun.user().get('groups').get(groupId).then();
    if (!group) {
      throw new Error("Group not found");
    }

    const currentMembers = group.members || [];
    const updatedMembers = currentMembers.filter(pub => pub !== memberPubToRemove);
    const memberDetails = await Promise.all(updatedMembers.map(async pub => {
      const user = await gun.user(pub).once();
      return { pub, epub: user.epub };
    }));

    await updateGroupKey(groupId, group.name, memberDetails);

    // Rimuovi i messaggi vecchi e ricrittografa con la nuova chiave
    const oldMessages = await gun.get(`groups/${groupId}/messages`).then();
    const newGroupKey = await getGroupKey(groupId);

    for (let msgId in oldMessages) {
      if (msgId !== '_') {
        const oldEncryptedMsg = oldMessages[msgId];
        const oldGroupKey = await getGroupKey(groupId);
        const decryptedMsg = await SEA.decrypt(oldEncryptedMsg, oldGroupKey);
        const newEncryptedMsg = await SEA.encrypt(decryptedMsg, newGroupKey);
        await gun.get(`groups/${groupId}/messages`).get(msgId).put(newEncryptedMsg);
      }
    }
  };

  return {
    createGroup,
    sendGroupMessage,
    getGroupMessages,
    addMemberToGroup,
    removeMemberFromGroup
  };
};
