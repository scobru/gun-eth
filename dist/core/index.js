"use strict";
// index.js
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { checkEthers } = require('../utils/utils');
const { getEnsName, getSigner, getProvider, setStandaloneConfig } = require('../blockchain/ethereum');
const { shine } = require('../blockchain/shine');
const { str2ab } = require('../modules/authentication/register');
const { createAuthenticationModule } = require('../modules/authentication/authentication');
const { createCertificatesModule } = require('../modules/certificates/certificates');
const { createFriendsModule } = require('../modules/friends/friends');
const { createMessagingModule, createGroupMessagingModule } = require('../modules/messaging/messaging');
const { createNotesModule } = require('../modules/notes/notes');
const { createPostsModule } = require('../modules/posts/posts');
const gunEth = (Gun, SEA, ethers, rxjs, DOMPurify) => {
    console.log("Inizializzazione del plugin Gun-Eth");
    if (!checkEthers(ethers)) {
        console.error("Ethers.js non è disponibile");
        return Gun;
    }
    Gun.chain.shine = shine(Gun, ethers, getSigner, getProvider);
    Gun.chain.str2ab = str2ab;
    Gun.chain.gunEth = function () {
        console.log("gunEth called");
        const gun = this;
        console.log("gun in gunEth:", gun);
        let auth, certificates, friends, messaging, groupMessaging, notes, posts;
        try {
            auth = createAuthenticationModule(gun);
        }
        catch (error) {
            console.error("Error creating authentication module:", error);
            auth = {};
        }
        try {
            certificates = createCertificatesModule(gun, SEA);
        }
        catch (error) {
            console.error("Error creating certificates module:", error);
            certificates = {};
        }
        try {
            friends = createFriendsModule(gun, gun.user(), certificates.generateAddFriendCertificate);
        }
        catch (error) {
            console.error("Error creating friends module:", error);
            friends = {};
        }
        try {
            messaging = createMessagingModule(gun, SEA);
        }
        catch (error) {
            console.error("Error creating messaging module:", error);
            messaging = {};
        }
        try {
            if (typeof createGroupMessagingModule === 'function') {
                groupMessaging = createGroupMessagingModule(gun, SEA);
            }
            else {
                console.error("createGroupMessagingModule is not a function");
                groupMessaging = {};
            }
        }
        catch (error) {
            console.error("Error creating group messaging module:", error);
            groupMessaging = {};
        }
        try {
            notes = createNotesModule(gun, SEA);
        }
        catch (error) {
            console.error("Error creating notes module:", error);
            notes = {};
        }
        try {
            posts = createPostsModule(gun, SEA);
        }
        catch (error) {
            console.error("Error creating posts module:", error);
            posts = {};
        }
        return {
            auth,
            certificates,
            friends,
            messaging,
            groupMessaging,
            notes,
            posts,
            shine: (chain, nodeId, data, callback) => Gun.chain.shine.call(gun, chain, nodeId, data, callback),
            setStandaloneConfig: (newRpcUrl, newPrivateKey) => {
                console.log("setStandaloneConfig called with:", newRpcUrl, newPrivateKey);
                setStandaloneConfig(newRpcUrl, newPrivateKey);
                console.log("Standalone configuration set");
                return gun;
            },
            verifySignature: (message, signature) => __awaiter(this, void 0, void 0, function* () {
                try {
                    return ethers.verifyMessage(message, signature);
                }
                catch (error) {
                    console.error("Error verifying signature:", error);
                    return null;
                }
            }),
            generatePassword: (signature) => {
                try {
                    const hexSignature = ethers.hexlify(signature);
                    const hash = ethers.keccak256(hexSignature);
                    console.log("Generated password:", hash);
                    return hash;
                }
                catch (error) {
                    console.error("Error generating password:", error);
                    return null;
                }
            },
            createSignature: () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const signer = yield getSigner();
                    const signature = yield signer.signMessage("GunDB access with Ethereum");
                    console.log("Signature created:", signature);
                    return signature;
                }
                catch (error) {
                    console.error("Error creating signature:", error);
                    return null;
                }
            }),
            createAndStoreEncryptedPair: (address, password) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const pair = yield SEA.pair();
                    const encryptedPair = yield SEA.encrypt(JSON.stringify(pair), password);
                    const ensName = yield getEnsName(address);
                    const username = ensName ? ensName : address;
                    yield gun.get("gun-eth").get("users").get(username).put({ encryptedPair });
                    yield gun.get(`~${username}`).get("safe").get("enc").put({ encryptedPair });
                    console.log("Encrypted pair stored for:", address);
                }
                catch (error) {
                    console.error("Error creating and storing encrypted pair:", error);
                }
            }),
            getAndDecryptPair: (address, password) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const encryptedData = yield gun.get("gun-eth").get("users").get(address).get("encryptedPair").then();
                    if (!encryptedData) {
                        throw new Error("No encrypted data found for this address");
                    }
                    const decryptedPair = yield SEA.decrypt(encryptedData, password);
                    console.log(decryptedPair);
                    return decryptedPair;
                }
                catch (error) {
                    console.error("Error retrieving and decrypting pair:", error);
                    return null;
                }
            }),
            gunToEthAccount: (gunPrivateKey) => {
                const base64UrlToHex = (base64url) => {
                    const padding = "=".repeat((4 - (base64url.length % 4)) % 4);
                    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/") + padding;
                    const binary = Buffer.from(base64, 'base64').toString('binary');
                    return Array.from(binary, (char) => char.charCodeAt(0).toString(16).padStart(2, "0")).join("");
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
// Esporta la funzione che estende Gun
module.exports = gunEth;