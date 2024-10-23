import { Observable } from "rxjs";

/**
 * Creates an Observable that emits message list updates for a specific chat room.
 * 
 * @param {Object} gun - The Gun instance
 * @param {Object} SEA - The SEA (Security, Encryption, Authorization) object
 * @returns {Function} A function that takes roomId and pub as parameters and returns an Observable
 */
export const messageList = (gun, SEA) => (roomId, pub) => new Observable((subscriber) => {
  let unsubscribe = () => {};

  (async () => {
    const userPair = await gun.user()._.sea;
    const friend = await gun.user(pub);

    gun.user().get("messages").get(roomId).once(async (messages) => {
      let initial = [];

      // Decrypt and process initial messages
      for (let key in messages) {
        let message = messages[key].toString();
        let decryptSecretFriend = await SEA.secret(friend.epub, userPair);
        let decryptedMessageFriend = await SEA.decrypt(message, decryptSecretFriend);

        if (decryptedMessageFriend) {
          let individual = { ...decryptedMessageFriend, encrypted: true };
          if (!initial.some(current => current.id === individual.id)) {
            initial.push(individual);
          }
        }
      }

      // Emit initial messages
      subscriber.next({ initial, individual: undefined });

      // Listen for new messages
      const off = gun.user().get("messages").get(roomId).map().once(async (message) => {
        if (message.toString().startsWith("SEA")) {
          let decryptSecretFriend = await SEA.secret(friend.epub, userPair);
          let decryptedMessageFriend = await SEA.decrypt(message, decryptSecretFriend);

          if (decryptedMessageFriend) {
            let individual = { ...decryptedMessageFriend, encrypted: true };
            if (!initial.some(current => current.id === individual.id)) {
              // Emit new individual message
              subscriber.next({ initial: undefined, individual });
            }
          }
        }
      });

      unsubscribe = () => {
        off();
      };
    });
  })();

  return () => {
    unsubscribe();
  };
});
