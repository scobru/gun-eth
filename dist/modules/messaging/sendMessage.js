var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { v4 as uuidv4 } from "uuid";
/**
 * Creates a function to send encrypted messages between users.
 *
 * @param {Object} gun - The Gun instance
 * @param {Object} SEA - The SEA (Security, Encryption, Authorization) object
 * @returns {Function} An async function to send messages
 */
export const sendMessage = (gun, SEA) => (roomId, publicKey, message) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the current user's public key and key pair
    const userPub = yield gun.user().pair().pub;
    const userPair = yield gun.user()._.sea;
    // Get the recipient's user data
    const friend = yield gun.user(publicKey);
    // Check if the user's public key is available
    if (!userPub) {
        return { errMessage: "Could not find pub.", errCode: "failed-to-find-pub", success: undefined };
    }
    // Get the certificates for creating messages and updating chat metadata
    const createMessagesCertificate = yield gun.user(publicKey).get("certificates").get(userPub).get("messages").then();
    const updateMetaCertificate = yield gun.user(publicKey).get("certificates").get(userPub).get("chats").then();
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
    const secret = yield SEA.secret(friend.epub, userPair);
    const encryptedMessage = yield SEA.encrypt(JSON.stringify({ id: messageId, content: message, timeSent, sender: userPub, type: "text" }), secret);
    try {
        // Update the latest message in the user's chat
        yield gun.user().get("chats").get(roomId).get("latestMessage").put(encryptedMessage);
        // Update the latest message in the recipient's chat
        yield gun.user(publicKey).get("chats").get(roomId).get("latestMessage").put(encryptedMessage, null, { opt: { cert: updateMetaCertificate } });
        // Add the message to the user's message list
        yield gun.user().get("messages").get(roomId).set(encryptedMessage);
        // Add the message to the recipient's message list
        yield gun.user(publicKey).get("messages").get(roomId).set(encryptedMessage, null, { opt: { cert: createMessagesCertificate } });
        return { errMessage: undefined, errCode: undefined, success: "Created a message with friend." };
    }
    catch (err) {
        return { errMessage: err.message, errCode: "message-creation-error", success: undefined };
    }
});
