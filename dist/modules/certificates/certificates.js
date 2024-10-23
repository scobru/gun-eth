// certificates.js
import { generateFriendRequestsCertificate, generateAddFriendCertificate } from './friendsCertificates.js';
import { createChatsCertificate, createMessagesCertificate } from './messagingCertificates.js';
/**
 * Creates an object that contains all the functionalities related to certificates.
 * @param {Object} gun - Gun instance
 * @param {Object} SEA - Gun's SEA object
 * @returns {Object} - Object containing all the functionalities related to certificates
 */
export const createCertificatesModule = (gun, SEA) => {
    return {
        generateFriendRequestsCertificate: () => generateFriendRequestsCertificate(gun, SEA),
        generateAddFriendCertificate: (publicKey) => generateAddFriendCertificate(gun, SEA, publicKey),
        createChatsCertificate: (publicKey) => createChatsCertificate(gun, SEA, publicKey),
        createMessagesCertificate: (publicKey) => createMessagesCertificate(gun, SEA, publicKey),
    };
};
