declare module 'gun-eth/blockchain/ethereum' {
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

}
declare module 'gun-eth/blockchain/shine' {
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

}
declare module 'gun-eth/core/config' {

}
declare module 'gun-eth/core/index' {
  export = gunEth;
  function gunEth(Gun: any, SEA: any, ethers: any, rxjs: any, DOMPurify: any): any;

}
declare module 'gun-eth/modules/authentication/authentication' {
  export function createAuthenticationModule(gun: Object): AuthenticationModule;
  export type Credentials = {
      /**
       * - User's username
       */
      username: string;
      /**
       * - User's password
       */
      password: string;
  };
  export type AuthenticationModule = {
      /**
       * - Checks the authentication status
       */
      checkAuth: () => Promise<boolean>;
      /**
       * - Observable for the authentication status
       */
      isAuthenticated: import("rxjs").BehaviorSubject<boolean>;
      /**
       * - Function to log in a user
       */
      loginUser: (arg0: Credentials) => Promise<any>;
      /**
       * - Function to register a new user
       */
      registerUser: (arg0: Credentials) => Promise<any>;
      /**
       * - Function to log out the user
       */
      logout: () => void;
  };

}
declare module 'gun-eth/modules/authentication/isAuthenticated' {
  export function createAuthenticationStatus(gun: Object): Object;

}
declare module 'gun-eth/modules/authentication/login' {
  export function loginUser(gun: Object, credentials: {
      username: string;
      password: string;
  }): Promise<Object>;

}
declare module 'gun-eth/modules/authentication/register' {
  export function checkUsernameInUse(gun: Object, username: string): Promise<boolean>;
  export function registerUser(gun: Object, credentials: {
      username: string;
      password: string;
  }): Promise<Object>;
  export function str2ab(str: string): ArrayBuffer;
  export function loginUser(gun: Object, credentials: {
      username: string;
      password: string;
  }): Promise<Object>;

}
declare module 'gun-eth/modules/certificates/certificates' {
  export function createCertificatesModule(gun: Object, SEA: Object): Object;

}
declare module 'gun-eth/modules/certificates/friendsCertificates' {
  export function generateFriendRequestsCertificate(gun: Object, SEA: Object): Promise<Object>;
  export function generateAddFriendCertificate(gun: Object, SEA: Object, publicKey: string): Promise<Object>;

}
declare module 'gun-eth/modules/certificates/messagingCertificates' {
  export function createChatsCertificate(gun: Object, SEA: Object, publicKey: string): Promise<Object>;
  export function createMessagesCertificate(gun: Object, SEA: Object, publicKey: string): Promise<Object>;

}
declare module 'gun-eth/modules/friends/acceptFriendRequest' {
  export function acceptFriendRequest(gun: Object, user: Object): Function;

}
declare module 'gun-eth/modules/friends/addFriendRequest' {
  export function addFriendRequest(gun: Object, user: Object, generateAddFriendCertificate: Function): Function;

}
declare module 'gun-eth/modules/friends/friendRequests' {
  export function friendRequests(gun: Object): Observable<any>;
  import { Observable } from "rxjs";

}
declare module 'gun-eth/modules/friends/friends' {
  export function createFriendsModule(gun: Object, user: Object, generateAddFriendCertificate: Function): Object;

}
declare module 'gun-eth/modules/friends/friendsList' {
  export function friendsList(gun: Object): Observable<any>;
  import { Observable } from "rxjs";

}
declare module 'gun-eth/modules/friends/rejectFriendRequest' {
  export function rejectFriendRequest(gun: Object): Function;

}
declare module 'gun-eth/modules/messaging/chatsList' {
  export function chatsList(gun: Object): Observable<any>;
  import { Observable } from "rxjs";

}
declare module 'gun-eth/modules/messaging/createChat' {
  export function createChat(gun: Object): Function;

}
declare module 'gun-eth/modules/messaging/groupMessaging' {
  export function createGroupMessaging(gun: Object, SEA: Object): Object;

}
declare module 'gun-eth/modules/messaging/messageList' {
  export function messageList(gun: Object, SEA: Object): Function;

}
declare module 'gun-eth/modules/messaging/messaging' {
  export function createMessagingModule(gun: Object, SEA: Object): Object;
  export function createGroupMessagingModule(gun: Object, SEA: Object): Object;

}
declare module 'gun-eth/modules/messaging/sendMessage' {
  export function sendMessage(gun: Object, SEA: Object): Function;

}
declare module 'gun-eth/modules/messaging/sendVoiceMessage' {
  export function sendVoiceMessage(gun: Object): Function;

}
declare module 'gun-eth/modules/notes/notes' {
  export function createNotesModule(gun: Object, SEA: Object): Object;

}
declare module 'gun-eth/modules/posts/posts' {
  export function createPostsModule(gun: Object, SEA: Object): Object;

}
declare module 'gun-eth/utils/utils' {
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

}
declare module 'gun-eth' {
  import main = require('gun-eth/index');
  export = main;
}