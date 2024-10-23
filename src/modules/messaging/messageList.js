import { Observable } from "rxjs";

export const messageList = (gun, SEA) => (roomId, pub) => new Observable(async (subscriber) => {
  const userPair = await gun.user()._.sea;
  const friend = await gun.user(pub);

  gun.user().get("messages").get(roomId).once(async (messages) => {
    let initial = [];

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

    subscriber.next({ initial, individual: undefined });

    gun.user().get("messages").get(roomId).map().once(async (message) => {
      if (message.toString().startsWith("SEA")) {
        let decryptSecretFriend = await SEA.secret(friend.epub, userPair);
        let decryptedMessageFriend = await SEA.decrypt(message, decryptSecretFriend);

        if (decryptedMessageFriend) {
          let individual = { ...decryptedMessageFriend, encrypted: true };
          if (!initial.some(current => current.id === individual.id)) {
            subscriber.next({ initial: undefined, individual });
          }
        }
      }
    });
  });
});