var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ethers } from 'ethers';
let rpcUrl = "";
let privateKey = "";
/**
 * @typedef {Object} Window
 * @property {any} ethereum
 */
/**
 * Sets the configuration for standalone mode
 * @param {string} newRpcUrl - The new RPC URL
 * @param {string} newPrivateKey - The new private key
 */
export function setStandaloneConfig(newRpcUrl, newPrivateKey) {
    rpcUrl = newRpcUrl;
    privateKey = newPrivateKey;
}
/**
 * Gets a signer for Ethereum transactions
 * @returns {Promise<ethers.Signer>} A signer object
 * @throws {Error} If no valid Ethereum provider is found
 */
export function getSigner() {
    return __awaiter(this, void 0, void 0, function* () {
        if (rpcUrl && privateKey) {
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            return new ethers.Wallet(privateKey, provider);
        }
        else if (typeof window !== "undefined" && typeof /** @type {any} */ (window).ethereum !== "undefined") {
            yield window.ethereum.request({ method: "eth_requestAccounts" });
            const provider = new ethers.BrowserProvider(window.ethereum);
            return provider.getSigner();
        }
        else {
            throw new Error("No valid Ethereum provider found");
        }
    });
}
/**
 * Gets an Ethereum provider
 * @returns {Promise<ethers.Provider>} An Ethereum provider
 * @throws {Error} If no valid Ethereum provider is found
 */
export function getProvider() {
    return __awaiter(this, void 0, void 0, function* () {
        if (rpcUrl && privateKey) {
            return new ethers.JsonRpcProvider(rpcUrl);
        }
        else if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            return new ethers.BrowserProvider(window.ethereum);
        }
        else {
            throw new Error("No valid Ethereum provider found");
        }
    });
}
/**
 * Gets the ENS name for a given Ethereum address
 * @param {string} address - The Ethereum address to look up
 * @returns {Promise<string|null>} The ENS name if found, null otherwise
 */
export function getEnsName(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = yield getProvider();
        try {
            const ensName = yield provider.lookupAddress(address);
            if (ensName) {
                console.log(`The ENS name for address ${address} is: ${ensName}`);
                return ensName;
            }
            else {
                console.log(`No ENS name found for address ${address}`);
                return null;
            }
        }
        catch (error) {
            console.error("Error while looking up ENS name:", error);
            return null;
        }
    });
}
