/**
 * @typedef {Object} Window
 * @property {any} ethereum
 */
/**
 * Sets the configuration for standalone mode
 * @param {string} newRpcUrl - The new RPC URL
 * @param {string} newPrivateKey - The new private key
 */
export function setStandaloneConfig(newRpcUrl: string, newPrivateKey: string): void;
/**
 * Gets a signer for Ethereum transactions
 * @returns {Promise<ethers.Signer>} A signer object
 * @throws {Error} If no valid Ethereum provider is found
 */
export function getSigner(): Promise<ethers.Signer>;
/**
 * Gets an Ethereum provider
 * @returns {Promise<ethers.Provider>} An Ethereum provider
 * @throws {Error} If no valid Ethereum provider is found
 */
export function getProvider(): Promise<ethers.Provider>;
/**
 * Gets the ENS name for a given Ethereum address
 * @param {string} address - The Ethereum address to look up
 * @returns {Promise<string|null>} The ENS name if found, null otherwise
 */
export function getEnsName(address: string): Promise<string | null>;
export type Window = {
    ethereum: any;
};
import { ethers } from 'ethers';
