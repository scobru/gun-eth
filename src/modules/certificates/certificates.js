// certificates.js

import { generateFriendRequestsCertificate, generateAddFriendCertificate } from './friendsCertificates.js';
import { createChatsCertificate, createMessagesCertificate } from './messagingCertificates.js';

/**
 * Crea un oggetto che contiene tutte le funzionalità relative ai certificati.
 * @param {Object} gun - Istanza di Gun
 * @param {Object} SEA - Oggetto SEA di Gun
 * @returns {Object} - Oggetto contenente tutte le funzionalità relative ai certificati
 */
export const createCertificatesModule = (gun, SEA) => {
  return {
    generateFriendRequestsCertificate: () => generateFriendRequestsCertificate(gun, SEA),
    generateAddFriendCertificate: (publicKey) => generateAddFriendCertificate(gun, SEA, publicKey),
    createChatsCertificate: (publicKey) => createChatsCertificate(gun, SEA, publicKey),
    createMessagesCertificate: (publicKey) => createMessagesCertificate(gun, SEA, publicKey),
  };
};