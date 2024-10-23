import { Observable } from "rxjs";
/**
 * Creates an Observable that emits chat list updates for the current user.
 *
 * @param {Object} gun - The Gun instance
 * @returns {Observable} An Observable that emits chat objects
 */
export const chatsList = (gun) => new Observable((subscriber) => {
    // Listen for changes in the user's chats
    gun.user().get("chats").on((chats, _) => {
        for (let publicKey in chats) {
            try {
                // Parse the chat details for each chat
                let chatDetails = JSON.parse(chats[publicKey]);
                if (chatDetails) {
                    // Emit the chat object with relevant details
                    subscriber.next({
                        roomId: chatDetails.roomId,
                        pub: chatDetails.pub,
                        latestMessage: chatDetails.latestMessage,
                    });
                }
            }
            catch (err) {
                // Log any errors that occur during parsing
                console.error("Error parsing chat details:", err);
            }
        }
    });
});
