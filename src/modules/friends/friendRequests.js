import { Observable } from "rxjs";

/**
 * Creates an Observable that emits friend requests for the current user.
 * @param {Object} gun - The Gun instance
 * @returns {Observable} An Observable that emits friend request objects
 */
export const friendRequests = (gun) => new Observable((subscriber) => {
  // Listen for changes in the user's friend requests
  gun.user().get("friendRequests").map().on((publicKey, key) => {
    if (publicKey) {
      // Fetch the user data for the friend request
      gun.user(publicKey).once((_user) => {
        if (_user && _user.info && _user.pub && _user.alias) {
          // If the user has additional info, fetch and emit it
          gun.get(_user.info["#"]).on((data) => {
            subscriber.next({
              key,
              pub: _user.pub,
              alias: _user.alias,
              displayName: data.displayName,
              about: data.about || undefined,
            });
          });
        } else if (_user && _user.pub && _user.alias) {
          // If only basic user data is available, emit that
          subscriber.next({
            key,
            pub: _user.pub,
            alias: _user.alias,
          });
        }
      });
    } else {
      // If the publicKey is null (request removed), emit undefined
      subscriber.next(undefined);
    }
  });
});