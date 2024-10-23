var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    const createGroup = (groupName, members) => __awaiter(void 0, void 0, void 0, function* () {
        const groupId = uuidv4();
        return yield updateGroupKey(groupId, groupName, members);
    });
    /**
     * Updates the group key for a given group.
     * @param {string} groupId - The ID of the group.
     * @param {string} groupName - The name of the group.
     * @param {Array} members - An array of member objects containing pub and epub keys.
     * @returns {Promise<Object>} A promise that resolves to an object containing groupId and groupKey.
     */
    const updateGroupKey = (groupId, groupName, members) => __awaiter(void 0, void 0, void 0, function* () {
        const groupKey = yield SEA.random(32).toString('base64');
        const encryptedGroupKey = {};
        for (let member of members) {
            const pub = member.pub;
            const epub = member.epub;
            const sharedSecret = yield SEA.secret(epub, gun.user()._.sea);
            encryptedGroupKey[pub] = yield SEA.encrypt(groupKey, sharedSecret);
        }
        yield gun.user().get('groups').get(groupId).put({
            name: groupName,
            members: members.map(m => m.pub),
            encryptedKeys: encryptedGroupKey
        });
        return { groupId, groupKey };
    });
    /**
     * Sends a message to a group.
     * @param {string} groupId - The ID of the group.
     * @param {string} message - The message to send.
     * @returns {Promise<void>}
     */
    const sendGroupMessage = (groupId, message) => __awaiter(void 0, void 0, void 0, function* () {
        const group = yield gun.user().get('groups').get(groupId).then();
        if (!group) {
            throw new Error("Group not found");
        }
        const groupKey = yield getGroupKey(groupId);
        const encryptedMessage = yield SEA.encrypt(JSON.stringify({
            sender: gun.user().is.pub,
            content: message,
            timestamp: Date.now()
        }), groupKey);
        yield gun.get(`groups/${groupId}/messages`).set(encryptedMessage);
    });
    /**
     * Retrieves messages from a group.
     * @param {string} groupId - The ID of the group.
     * @returns {Promise<Object>} A promise that resolves to a decrypted message object.
     */
    const getGroupMessages = (groupId) => {
        return new Promise((resolve, reject) => {
            gun.get(`groups/${groupId}/messages`).map().once((encryptedMessage) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const groupKey = yield getGroupKey(groupId);
                    const decryptedMessage = yield SEA.decrypt(encryptedMessage, groupKey);
                    if (decryptedMessage) {
                        resolve(JSON.parse(decryptedMessage));
                    }
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    };
    /**
     * Retrieves the group key for a given group.
     * @param {string} groupId - The ID of the group.
     * @returns {Promise<string>} A promise that resolves to the decrypted group key.
     */
    const getGroupKey = (groupId) => __awaiter(void 0, void 0, void 0, function* () {
        const group = yield gun.user().get('groups').get(groupId).then();
        if (!group || !group.encryptedKeys[gun.user().is.pub]) {
            throw new Error("Group key not found for this user");
        }
        const encryptedGroupKey = group.encryptedKeys[gun.user().is.pub];
        const sharedSecret = yield SEA.secret(gun.user().is.epub, gun.user()._.sea);
        return yield SEA.decrypt(encryptedGroupKey, sharedSecret);
    });
    /**
     * Adds a new member to an existing group.
     * @param {string} groupId - The ID of the group.
     * @param {Object} newMember - An object containing the new member's pub and epub keys.
     * @returns {Promise<void>}
     */
    const addMemberToGroup = (groupId, newMember) => __awaiter(void 0, void 0, void 0, function* () {
        const group = yield gun.user().get('groups').get(groupId).then();
        if (!group) {
            throw new Error("Group not found");
        }
        const currentMembers = group.members || [];
        const updatedMembers = [...currentMembers, newMember.pub];
        const memberDetails = [...currentMembers.map(pub => ({ pub })), newMember];
        yield updateGroupKey(groupId, group.name, memberDetails);
    });
    /**
     * Removes a member from an existing group and re-encrypts messages.
     * @param {string} groupId - The ID of the group.
     * @param {string} memberPubToRemove - The public key of the member to remove.
     * @returns {Promise<void>}
     */
    const removeMemberFromGroup = (groupId, memberPubToRemove) => __awaiter(void 0, void 0, void 0, function* () {
        const group = yield gun.user().get('groups').get(groupId).then();
        if (!group) {
            throw new Error("Group not found");
        }
        const currentMembers = group.members || [];
        const updatedMembers = currentMembers.filter(pub => pub !== memberPubToRemove);
        const memberDetails = yield Promise.all(updatedMembers.map((pub) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield gun.user(pub).once();
            return { pub, epub: user.epub };
        })));
        yield updateGroupKey(groupId, group.name, memberDetails);
        // Remove old messages and re-encrypt with the new key
        const oldMessages = yield gun.get(`groups/${groupId}/messages`).then();
        const newGroupKey = yield getGroupKey(groupId);
        for (let msgId in oldMessages) {
            if (msgId !== '_') {
                const oldEncryptedMsg = oldMessages[msgId];
                const oldGroupKey = yield getGroupKey(groupId);
                const decryptedMsg = yield SEA.decrypt(oldEncryptedMsg, oldGroupKey);
                const newEncryptedMsg = yield SEA.encrypt(decryptedMsg, newGroupKey);
                yield gun.get(`groups/${groupId}/messages`).get(msgId).put(newEncryptedMsg);
            }
        }
    });
    return {
        createGroup,
        sendGroupMessage,
        getGroupMessages,
        addMemberToGroup,
        removeMemberFromGroup
    };
};
