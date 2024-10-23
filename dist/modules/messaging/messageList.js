var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Observable } from "rxjs";
/**
 * Creates an Observable that emits message list updates for a specific chat room.
 *
 * @param {Object} gun - The Gun instance
 * @param {Object} SEA - The SEA (Security, Encryption, Authorization) object
 * @returns {Function} A function that takes roomId and pub as parameters and returns an Observable
 */
export const messageList = (gun, SEA) => (roomId, pub) => new Observable((subscriber) => {
    let unsubscribe = () => { };
    (() => __awaiter(void 0, void 0, void 0, function* () {
        const userPair = yield gun.user()._.sea;
        const friend = yield gun.user(pub);
        gun.user().get("messages").get(roomId).once((messages) => __awaiter(void 0, void 0, void 0, function* () {
            let initial = [];
            // Decrypt and process initial messages
            for (let key in messages) {
                let message = messages[key].toString();
                let decryptSecretFriend = yield SEA.secret(friend.epub, userPair);
                let decryptedMessageFriend = yield SEA.decrypt(message, decryptSecretFriend);
                if (decryptedMessageFriend) {
                    let individual = Object.assign(Object.assign({}, decryptedMessageFriend), { encrypted: true });
                    if (!initial.some(current => current.id === individual.id)) {
                        initial.push(individual);
                    }
                }
            }
            // Emit initial messages
            subscriber.next({ initial, individual: undefined });
            // Listen for new messages
            const off = gun.user().get("messages").get(roomId).map().once((message) => __awaiter(void 0, void 0, void 0, function* () {
                if (message.toString().startsWith("SEA")) {
                    let decryptSecretFriend = yield SEA.secret(friend.epub, userPair);
                    let decryptedMessageFriend = yield SEA.decrypt(message, decryptSecretFriend);
                    if (decryptedMessageFriend) {
                        let individual = Object.assign(Object.assign({}, decryptedMessageFriend), { encrypted: true });
                        if (!initial.some(current => current.id === individual.id)) {
                            // Emit new individual message
                            subscriber.next({ initial: undefined, individual });
                        }
                    }
                }
            }));
            unsubscribe = () => {
                off();
            };
        }));
    }))();
    return () => {
        unsubscribe();
    };
});
