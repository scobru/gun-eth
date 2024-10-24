import { acceptFriendRequest } from "./acceptFriendRequest.js";
import { addFriendRequest } from "./addFriendRequest.js";
import { friendRequests } from "./friendRequests.js";
import { rejectFriendRequest } from "./rejectFriendRequest.js";
import { friendsList } from "./friendsList.js";
import { Observable } from "rxjs";

/**
 * Creates a friends module with various friend-related functionalities.
 *
 * @param {Object} gun - The Gun instance
 * @param {Object} user - The current user object
 * @returns {Object} An object containing friend-related functions
 */
export const createFriendsModule = (gun, user) => ({
  /**
   * Function to accept a friend request
   * @type {Function}
   */
  acceptFriendRequest: acceptFriendRequest(gun, user),

  /**
   * Function to send a friend request
   * @type {Promise<any>}
   */
  addFriendRequest: addFriendRequest(gun, user),

  /**
   * Observable che emette le richieste di amicizia
   * @type {Observable}
   */
  friendRequests: friendRequests(gun),

  /**
   * Function to reject a friend request
   * @type {Function}
   */
  rejectFriendRequest: rejectFriendRequest(gun),

  /**
   * Observable that emits the friends list
   * @type {Observable}
   */
  friendsList: friendsList(gun),
});
