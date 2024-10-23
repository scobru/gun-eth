/**
 * Verifica la disponibilità e la versione di Ethers.js.
 * @param {Object} ethers - L'oggetto Ethers.js da verificare.
 * @returns {boolean} True se Ethers.js è disponibile, altrimenti False.
 */
export function checkEthers(ethers: Object): boolean;
/**
 * Messaggio da firmare per l'accesso a GunDB tramite Ethereum.
 */
export const MESSAGE_TO_SIGN: "GunDB access with Ethereum";
/**
 * ABI (Application Binary Interface) per il contratto SHINE.
 * Definisce la struttura e i metodi del contratto smart.
 */
export const SHINE_ABI: ({
    anonymous: boolean;
    inputs: {
        indexed: boolean;
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    outputs?: undefined;
    stateMutability?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
})[];
/**
 * Indirizzo del contratto SHINE sulla rete Optimism Sepolia.
 */
export const SHINE_OPTIMISM_SEPOLIA: "0x43D838b683F772F08f321E5FA265ad3e333BE9C2";
