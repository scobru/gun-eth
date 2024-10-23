// index.js

import { checkEthers } from './utils.js';
import { getEnsName, getSigner, getProvider } from './ethereum.js';
import { shine } from './shine.js';
import { str2ab } from './userManagement.js';
import { createAuthenticationModule } from './authenticationIndex.js';
import { createCertificatesModule } from './certificates.js';
import { createFriendsModule } from './friends.js';
import { createMessagingModule } from './messaging.js';
import { createNotesModule } from './notes.js';
import { createPostsModule } from './posts.js';

const GunEth = (Gun, SEA, ethers, rxjs, DOMPurify) => {
  console.log("Inizializzazione del plugin Gun-Eth");

  if (!checkEthers(ethers)) {
    console.error("Ethers.js non è disponibile");
    return Gun;
  }

  Gun.chain.shine = shine(Gun, ethers, getSigner, getProvider);
  Gun.chain.str2ab = str2ab;

  Gun.chain.gunEth = function() {
    const gun = this;
    const auth = createAuthenticationModule(gun, SEA, ethers, rxjs);
    const certificates = createCertificatesModule(gun, SEA);
    const friends = createFriendsModule(gun, gun.user(), certificates.generateAddFriendCertificate);
    const messaging = createMessagingModule(gun, SEA);
    const notes = createNotesModule(gun, SEA, DOMPurify);
    const posts = createPostsModule(gun, SEA);

    return {
      auth,
      certificates,
      friends,
      messaging,
      notes,
      posts,
      shine: (chain, nodeId, data, callback) => Gun.chain.shine.call(gun, chain, nodeId, data, callback),
      
      setStandaloneConfig: (newRpcUrl, newPrivateKey) => {
        // Implementazione di setStandaloneConfig
        console.log("Standalone configuration set");
        return gun;
      },

      verifySignature: async (message, signature) => {
        try {
          return ethers.verifyMessage(message, signature);
        } catch (error) {
          console.error("Error verifying signature:", error);
          return null;
        }
      },

      generatePassword: (signature) => {
        try {
          const hexSignature = ethers.hexlify(signature);
          const hash = ethers.keccak256(hexSignature);
          console.log("Generated password:", hash);
          return hash;
        } catch (error) {
          console.error("Error generating password:", error);
          return null;
        }
      },

      createSignature: async () => {
        try {
          const signer = await getSigner();
          const signature = await signer.signMessage("GunDB access with Ethereum");
          console.log("Signature created:", signature);
          return signature;
        } catch (error) {
          console.error("Error creating signature:", error);
          return null;
        }
      },

      createAndStoreEncryptedPair: async (address, password) => {
        try {
          const pair = await SEA.pair();
          const encryptedPair = await SEA.encrypt(JSON.stringify(pair), password);
          const ensName = await getEnsName(address);
          const username = ensName ? ensName : address;

          await gun.get("gun-eth").get("users").get(username).put(encryptedPair);
          await gun.get(`~${username}`).get("safe").get("enc").put(encryptedPair);

          console.log("Encrypted pair stored for:", address);
        } catch (error) {
          console.error("Error creating and storing encrypted pair:", error);
        }
      },

      getAndDecryptPair: async (address, password) => {
        try {
          const encryptedData = await gun.get("gun-eth").get("users").get(address).get("encryptedPair").then();
          if (!encryptedData) {
            throw new Error("No encrypted data found for this address");
          }
          const decryptedPair = await SEA.decrypt(encryptedData, password);
          console.log(decryptedPair);
          return decryptedPair;
        } catch (error) {
          console.error("Error retrieving and decrypting pair:", error);
          return null;
        }
      },

      gunToEthAccount: (gunPrivateKey) => {
        const base64UrlToHex = (base64url) => {
          const padding = "=".repeat((4 - (base64url.length % 4)) % 4);
          const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/") + padding;
          const binary = atob(base64);
          return Array.from(binary, (char) =>
            char.charCodeAt(0).toString(16).padStart(2, "0")
          ).join("");
        };

        const hexPrivateKey = "0x" + base64UrlToHex(gunPrivateKey);
        const wallet = new ethers.Wallet(hexPrivateKey);
        const publicKey = wallet.address;

        return {
          account: wallet,
          publicKey: publicKey,
        };
      }
    };
  };

  console.log("Plugin Gun-Eth caricato con successo");

  return Gun;
};

// Configurazione UMD
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["gun", "gun/sea", "ethers", "rxjs", "DOMPurify"], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory(
      require("gun"),
      require("gun/sea"),
      require("ethers"),
      require("rxjs"),
      require("DOMPurify")
    );
  } else {
    root.GunEth = factory(root.Gun, root.SEA, root.ethers, root.rxjs, root.DOMPurify);
  }
})(typeof self !== "undefined" ? self : this, function (Gun, SEA, ethers, rxjs, DOMPurify) {
  return GunEth(Gun, SEA, ethers, rxjs, DOMPurify);
});

export default GunEth;