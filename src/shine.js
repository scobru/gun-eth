import { SHINE_ABI, SHINE_OPTIMISM_SEPOLIA } from './utils.js';

export function shine(Gun, ethers, getSigner, getProvider) {
  return function (chain, nodeId, data, callback) {
    console.log("SHINE plugin called with:", { chain, nodeId, data });

    if (typeof callback !== "function") {
      console.error("Callback must be a function");
      return this;
    }

    const gun = this;
    let SHINE_CONTRACT_ADDRESS;

    if (chain === "optimismSepolia") {
      SHINE_CONTRACT_ADDRESS = SHINE_OPTIMISM_SEPOLIA;
    } else {
      throw new Error("Chain not supported");
    }

    // Funzione per verificare on-chain
    const verifyOnChain = async (nodeId, contentHash) => {
        console.log("Verifying on chain:", { nodeId, contentHash });
        const signer = await getSigner();
        const contract = new ethers.Contract(
          SHINE_CONTRACT_ADDRESS,
          SHINE_ABI,
          signer
        );
        const [isValid, timestamp, updater] = await contract.verifyData(
          ethers.toUtf8Bytes(nodeId),
          contentHash
        );
        console.log("Verification result:", { isValid, timestamp, updater });
        return { isValid, timestamp, updater };
      };
  
      // Funzione per scrivere on-chain
      const writeOnChain = async (nodeId, contentHash) => {
        console.log("Writing on chain:", { nodeId, contentHash });
        const signer = await getSigner();
        const contract = new ethers.Contract(
          SHINE_CONTRACT_ADDRESS,
          SHINE_ABI,
          signer
        );
        const tx = await contract.updateData(
          ethers.toUtf8Bytes(nodeId),
          contentHash
        );
        console.log("Transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        return tx;
      };
  
      // Nuova funzione per ottenere l'ultimo record dalla blockchain
      const getLatestRecord = async (nodeId) => {
        const signer = await getSigner();
        const contract = new ethers.Contract(
          SHINE_CONTRACT_ADDRESS,
          SHINE_ABI,
          signer
        );
        const [contentHash, timestamp, updater] = await contract.getLatestRecord(
          ethers.toUtf8Bytes(nodeId)
        );
        console.log("Latest record from blockchain:", {
          nodeId,
          contentHash,
          timestamp,
          updater,
        });
        return { contentHash, timestamp, updater };
      };

     // Processo SHINE
     if (nodeId && !data) {
        gun.get(nodeId).once(async (existingData) => {
          if (!existingData) {
            if (callback) callback({ err: "Node not found in GunDB" });
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
            const { isValid, timestamp, updater } = await verifyOnChain(
              nodeId,
              contentHash
            );
            const latestRecord = await getLatestRecord(nodeId);
  
            if (isValid) {
              if (callback)
                callback({
                  ok: true,
                  message: "Data verified on blockchain",
                  timestamp,
                  updater,
                  latestRecord,
                });
            } else {
              if (callback)
                callback({
                  ok: false,
                  message: "Data not verified on blockchain",
                  latestRecord,
                });
            }
          } catch (error) {
            if (callback) callback({ err: error.message });
          }
        });
      } else if (data && !nodeId) {
        const newNodeId = Gun.text.random();
        const dataString = JSON.stringify(data);
        const contentHash = ethers.keccak256(ethers.toUtf8Bytes(dataString));
  
        gun
          .get(newNodeId)
          .put({ ...data, _contentHash: contentHash }, async (ack) => {
            console.log("ack", ack);
            if (ack.err) {
              if (callback) callback({ err: "Error saving data to GunDB" });
              return;
            }
  
            try {
              const tx = await writeOnChain(newNodeId, contentHash);
              if (callback)
                callback({
                  ok: true,
                  message: "Data written to GunDB and blockchain",
                  nodeId: newNodeId,
                  txHash: tx.hash,
                });
            } catch (error) {
              if (callback) callback({ err: error.message });
            }
          });
      } else {
        if (callback)
          callback({
            err: "Invalid input. Provide either nodeId or data, not both.",
          });
      }

    return gun;
  };
}