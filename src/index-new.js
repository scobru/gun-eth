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

  // Estendi Gun.chain direttamente con le funzioni principali
  Gun.chain.setStandaloneConfig = function(newRpcUrl, newPrivateKey) {
    // Implementazione di setStandaloneConfig
    console.log("Standalone configuration set");
    return this;
  };

  Gun.chain.verifySignature = async function(message, signature) {
    try {
      return ethers.verifyMessage(message, signature);
    } catch (error) {
      console.error("Error verifying signature:", error);
      return null;
    }
  };

  Gun.chain.generatePassword = function(signature) {
    try {
      const hexSignature = ethers.hexlify(signature);
      const hash = ethers.keccak256(hexSignature);
      console.log("Generated password:", hash);
      return hash;
    } catch (error) {
      console.error("Error generating password:", error);
      return null;
    }
  };

  Gun.chain.createSignature = async function() {
    try {
      const signer = await getSigner();
      const signature = await signer.signMessage("GunDB access with Ethereum");
      console.log("Signature created:", signature);
      return signature;
    } catch (error) {
      console.error("Error creating signature:", error);
      return null;
    }
  };

  Gun.chain.createAndStoreEncryptedPair = async function(address, password) {
    try {
      const gun = this;
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
  };

  Gun.chain.getAndDecryptPair = async function(address, password) {
    try {
      const gun = this;
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
  };

  Gun.chain.gunToEthAccount = function(gunPrivateKey) {
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
  };

  // Mantieni gunEth per le funzionalità modulari più complesse
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
      posts
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


/* const gun = Gun();
gun.verifySignature(message, signature);
gun.createAndStoreEncryptedPair(address, password);

const gunEth = gun.gunEth();
gunEth.auth.someAuthFunction();
gunEth.posts.createPost(postData); */