/**
 * @typedef {Object} ShineResult
 * @property {boolean} ok - Indicates if the operation was successful
 * @property {string} message - A descriptive message about the operation result
 * @property {number} [timestamp] - The timestamp of the verified data (if applicable)
 * @property {string} [updater] - The address of the last updater (if applicable)
 * @property {Object} [latestRecord] - The latest record from the blockchain (if applicable)
 * @property {string} [nodeId] - The ID of the newly created node (for write operations)
 * @property {string} [txHash] - The transaction hash (for write operations)
 */
/**
 * Creates a SHINE (Secure Hybrid Information and Node Ecosystem) plugin for Gun
 * @param {any} Gun - The Gun instance
 * @param {any} ethers - The ethers.js library
 * @param {Function} getSigner - Function to get the signer
 * @param {Function} getProvider - Function to get the provider
 * @returns {Function} The SHINE plugin function
 */
export function shine(Gun: any, ethers: any, getSigner: Function, getProvider: Function): Function;
export type ShineResult = {
    /**
     * - Indicates if the operation was successful
     */
    ok: boolean;
    /**
     * - A descriptive message about the operation result
     */
    message: string;
    /**
     * - The timestamp of the verified data (if applicable)
     */
    timestamp?: number | undefined;
    /**
     * - The address of the last updater (if applicable)
     */
    updater?: string | undefined;
    /**
     * - The latest record from the blockchain (if applicable)
     */
    latestRecord?: Object | undefined;
    /**
     * - The ID of the newly created node (for write operations)
     */
    nodeId?: string | undefined;
    /**
     * - The transaction hash (for write operations)
     */
    txHash?: string | undefined;
};
