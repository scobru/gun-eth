import { Observable } from "rxjs";

/**
 * Creates an Observable that emits the friends list for the current user.
 * @param {Object} gun - The Gun instance
 * @returns {Observable} An Observable that emits friend objects
 */
export const friendsList = (gun) => new Observable((subscriber) => {
  // Listen for changes in the user's friends list
  gun.user().get("friends").map().on((publicKey, key) => {
    if (publicKey) {
      // Fetch the user data for each friend
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
      // If the publicKey is null (friend removed), emit undefined
      subscriber.next(undefined);
    }
  });
});