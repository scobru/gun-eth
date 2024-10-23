import { ethers } from 'ethers';

let rpcUrl = "";
let privateKey = "";

export function setStandaloneConfig(newRpcUrl, newPrivateKey) {
  rpcUrl = newRpcUrl;
  privateKey = newPrivateKey;
}

export async function getSigner() {
  if (rpcUrl && privateKey) {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return new ethers.Wallet(privateKey, provider);
  } else if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider.getSigner();
  } else {
    throw new Error("No valid Ethereum provider found");
  }
}

export async function getProvider() {
  if (rpcUrl && privateKey) {
    return new ethers.JsonRpcProvider(rpcUrl);
  } else if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
    return new ethers.BrowserProvider(window.ethereum);
  } else {
    throw new Error("No valid Ethereum provider found");
  }
}

export async function getEnsName(address) {
  const provider = await getProvider();
  try {
    const ensName = await provider.lookupAddress(address);
    if (ensName) {
      console.log(`L'ENS name per l'indirizzo ${address} è: ${ensName}`);
      return ensName;
    } else {
      console.log(`Nessun ENS name trovato per l'indirizzo ${address}`);
      return null;
    }
  } catch (error) {
    console.error("Errore durante la ricerca dell'ENS name:", error);
    return null;
  }
}