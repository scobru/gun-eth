export function checkEthers(ethers) {
    if (typeof ethers === "undefined") {
      console.error(
        "Ethers.js non è disponibile. Assicurati che sia caricato prima di questo script."
      );
      return false;
    }
    console.log("Ethers version:", ethers.version);
    return true;
  }
  
  export const MESSAGE_TO_SIGN = "GunDB access with Ethereum";
  
  export const SHINE_ABI = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes",
          name: "nodeId",
          type: "bytes",
        },
        {
          indexed: false,
          internalType: "bytes32",
          name: "contentHash",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "address",
          name: "updater",
          type: "address",
        },
      ],
      name: "DataUpdated",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "bytes[]",
          name: "nodeIds",
          type: "bytes[]",
        },
        {
          internalType: "bytes32[]",
          name: "contentHashes",
          type: "bytes32[]",
        },
      ],
      name: "batchUpdateData",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "nodeId",
          type: "bytes",
        },
      ],
      name: "getLatestRecord",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      name: "nodeData",
      outputs: [
        {
          internalType: "bytes32",
          name: "contentHash",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "updater",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "nodeId",
          type: "bytes",
        },
        {
          internalType: "bytes32",
          name: "contentHash",
          type: "bytes32",
        },
      ],
      name: "updateData",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "nodeId",
          type: "bytes",
        },
        {
          internalType: "bytes32",
          name: "contentHash",
          type: "bytes32",
        },
      ],
      name: "verifyData",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];
  
  export const SHINE_OPTIMISM_SEPOLIA = "0x43D838b683F772F08f321E5FA265ad3e333BE9C2";