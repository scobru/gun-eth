// groupMessaging.js
import { v4 as uuidv4 } from "uuid";

/**
 * Creates a group messaging module with encryption capabilities.
 * @param {Object} gun - The Gun instance.
 * @param {Object} SEA - The SEA (Security, Encryption, Authorization) object.
 * @returns {Object} An object with group messaging functions.
 */
export const createGroupMessaging = (gun, SEA) => {
  /**
   * Creates a new group with the given name and members.
   * @param {string} groupName - The name of the group.
   * @param {Array} members - An array of member objects containing pub and epub keys.
   * @returns {Promise<Object>} A promise that resolves to an object containing groupId and groupKey.
   */
  const createGroup = async (groupName, members) => {
    const groupId = uuidv4();
    return await updateGroupKey(groupId, groupName, members);
  };

  /**
   * Updates the group key for a given group.
   * @param {string} groupId - The ID of the group.
   * @param {string} groupName - The name of the group.
   * @param {Array} members - An array of member objects containing pub and epub keys.
   * @returns {Promise<Object>} A promise that resolves to an object containing groupId and groupKey.
   */
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

  /**
   * Sends a message to a group.
   * @param {string} groupId - The ID of the group.
   * @param {string} message - The message to send.
   * @returns {Promise<void>}
   */
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

  /**
   * Retrieves messages from a group.
   * @param {string} groupId - The ID of the group.
   * @returns {Promise<Object>} A promise that resolves to a decrypted message object.
   */
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

  /**
   * Retrieves the group key for a given group.
   * @param {string} groupId - The ID of the group.
   * @returns {Promise<string>} A promise that resolves to the decrypted group key.
   */
  const getGroupKey = async (groupId) => {
    const group = await gun.user().get('groups').get(groupId).then();
    if (!group || !group.encryptedKeys[gun.user().is.pub]) {
      throw new Error("Group key not found for this user");
    }
    const encryptedGroupKey = group.encryptedKeys[gun.user().is.pub];
    const sharedSecret = await SEA.secret(gun.user().is.epub, gun.user()._.sea);
    return await SEA.decrypt(encryptedGroupKey, sharedSecret);
  };

  /**
   * Adds a new member to an existing group.
   * @param {string} groupId - The ID of the group.
   * @param {Object} newMember - An object containing the new member's pub and epub keys.
   * @returns {Promise<void>}
   */
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

  /**
   * Removes a member from an existing group and re-encrypts messages.
   * @param {string} groupId - The ID of the group.
   * @param {string} memberPubToRemove - The public key of the member to remove.
   * @returns {Promise<void>}
   */
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

    // Remove old messages and re-encrypt with the new key
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
