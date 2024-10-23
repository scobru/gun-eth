import { Observable } from "rxjs";

export const chatsList = (gun) => new Observable((subscriber) => {
  gun.user().get("chats").on((chats, _) => {
    for (let publicKey in chats) {
      try {
        let chatDetails = JSON.parse(chats[publicKey]);
        if (chatDetails) {
          subscriber.next({
            roomId: chatDetails.roomId,
            pub: chatDetails.pub,
            latestMessage: chatDetails.latestMessage,
          });
        }
      } catch (err) {
        console.error("Error parsing chat details:", err);
      }
    }
  });
});