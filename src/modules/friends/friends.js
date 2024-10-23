import { acceptFriendRequest } from './acceptFriendRequest.js';
import { addFriendRequest } from './addFriendRequest.js';
import { friendRequests } from './friendRequests.js';
import { rejectFriendRequest } from './rejectFriendRequest.js';
import { friendsList } from './friendsList.js';

export const createFriendsModule = (gun, user, generateAddFriendCertificate) => ({
  acceptFriendRequest: acceptFriendRequest(gun, user),
  addFriendRequest: addFriendRequest(gun, user, generateAddFriendCertificate),
  friendRequests: friendRequests(gun),
  rejectFriendRequest: rejectFriendRequest(gun),
  friendsList: friendsList(gun)
});