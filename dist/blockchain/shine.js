var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SHINE_ABI, SHINE_OPTIMISM_SEPOLIA } from "../utils/utils.js";
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
export function shine(Gun, ethers, getSigner, getProvider) {
    /**
     * The SHINE plugin function
     * @param {string} chain - The blockchain network to use
     * @param {string} [nodeId] - The ID of the node to verify (for read operations)
     * @param {Object} [data] - The data to write (for write operations)
     * @param {Function} callback - The callback function to handle the result
     * @returns {Object} The Gun instance
     * @this {any}
     */
    return function (chain, nodeId, data = null, callback = () => { }) {
        console.log("SHINE plugin called with:", { chain, nodeId, data });
        if (typeof callback !== "function") {
            callback = () => { };
            console.error("Callback must be a function");
            return this;
        }
        const gun = this;
        let SHINE_CONTRACT_ADDRESS;
        if (chain === "optimismSepolia") {
            SHINE_CONTRACT_ADDRESS = SHINE_OPTIMISM_SEPOLIA;
        }
        else {
            throw new Error("Chain not supported");
        }
        /**
         * Verifies data on-chain
         * @param {string} nodeId - The ID of the node to verify
         * @param {string} contentHash - The content hash to verify
         * @returns {Promise<{isValid: boolean, timestamp: number, updater: string}>} The verification result
         */
        const verifyOnChain = (nodeId, contentHash) => __awaiter(this, void 0, void 0, function* () {
            console.log("Verifying on chain:", { nodeId, contentHash });
            const signer = yield getSigner();
            const contract = new ethers.Contract(SHINE_CONTRACT_ADDRESS, SHINE_ABI, signer);
            const [isValid, timestamp, updater] = yield contract.verifyData(ethers.toUtf8Bytes(nodeId), contentHash);
            console.log("Verification result:", { isValid, timestamp, updater });
            return { isValid, timestamp, updater };
        });
        /**
         * Writes data on-chain
         * @param {string} nodeId - The ID of the node to write
         * @param {string} contentHash - The content hash to write
         * @returns {Promise<any>} The transaction object
         */
        const writeOnChain = (nodeId, contentHash) => __awaiter(this, void 0, void 0, function* () {
            console.log("Writing on chain:", { nodeId, contentHash });
            const signer = yield getSigner();
            const contract = new ethers.Contract(SHINE_CONTRACT_ADDRESS, SHINE_ABI, signer);
            const tx = yield contract.updateData(ethers.toUtf8Bytes(nodeId), contentHash);
            console.log("Transaction sent:", tx.hash);
            const receipt = yield tx.wait();
            console.log("Transaction confirmed:", receipt);
            return tx;
        });
        /**
         * Gets the latest record from the blockchain
         * @param {string} nodeId - The ID of the node to retrieve
         * @returns {Promise<{contentHash: string, timestamp: number, updater: string}>} The latest record
         */
        const getLatestRecord = (nodeId) => __awaiter(this, void 0, void 0, function* () {
            const signer = yield getSigner();
            const contract = new ethers.Contract(SHINE_CONTRACT_ADDRESS, SHINE_ABI, signer);
            const [contentHash, timestamp, updater] = yield contract.getLatestRecord(ethers.toUtf8Bytes(nodeId));
            console.log("Latest record from blockchain:", {
                nodeId,
                contentHash,
                timestamp,
                updater,
            });
            return { contentHash, timestamp, updater };
        });
        // SHINE process
        if (nodeId && !data) {
            gun.get(nodeId).once((existingData) => __awaiter(this, void 0, void 0, function* () {
                if (!existingData) {
                    if (callback)
                        callback({ err: "Node not found in GunDB" });
                    return;
                }
                console.log("existingData", existingData);
                const contentHash = existingData._contentHash;
                console.log("contentHash", contentHash);
                if (!contentHash) {
                    if (callback)
                        callback({ err: "No content hash found for this node" });
                    return;
                }
                try {
                    const { isValid, timestamp, updater } = yield verifyOnChain(nodeId, contentHash);
                    const latestRecord = yield getLatestRecord(nodeId);
                    if (isValid) {
                        if (callback)
                            callback({
                                ok: true,
                                message: "Data verified on blockchain",
                                timestamp,
                                updater,
                                latestRecord,
                            });
                    }
                    else {
                        if (callback)
                            callback({
                                ok: false,
                                message: "Data not verified on blockchain",
                                latestRecord,
                            });
                    }
                }
                catch (error) {
                    if (callback)
                        callback({ err: error.message });
                }
            }));
        }
        else if (data && !nodeId) {
            const newNodeId = Gun.text.random();
            const dataString = JSON.stringify(data);
            const contentHash = ethers.keccak256(ethers.toUtf8Bytes(dataString));
            gun
                .get(newNodeId)
                .put(Object.assign(Object.assign({}, data), { _contentHash: contentHash }), (ack) => __awaiter(this, void 0, void 0, function* () {
                console.log("ack", ack);
                if (ack.err) {
                    if (callback)
                        callback({ err: "Error saving data to GunDB" });
                    return;
                }
                try {
                    const tx = yield writeOnChain(newNodeId, contentHash);
                    if (callback)
                        callback({
                            ok: true,
                            message: "Data written to GunDB and blockchain",
                            nodeId: newNodeId,
                            txHash: tx.hash,
                        });
                }
                catch (error) {
                    if (callback)
                        callback({ err: error.message });
                }
            }));
        }
        else {
            if (callback)
                callback({
                    err: "Invalid input. Provide either nodeId or data, not both.",
                });
        }
        return gun;
    };
}
