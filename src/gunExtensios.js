export function extendGun(Gun, SEA, ethers, getEnsName) {
    Gun.chain.setStandaloneConfig = function (newRpcUrl, newPrivateKey) {
      setStandaloneConfig(newRpcUrl, newPrivateKey);
      console.log("Standalone configuration set");
      return this;
    };
  
    Gun.chain.verifySignature = async function (message, signature) {
      try {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        return recoveredAddress;
      } catch (error) {
        console.error("Error verifying signature:", error);
        return null;
      }
    };
  
    Gun.chain.generatePassword = function (signature) {
      try {
        const hexSignature = ethers.hexlify(signature);
        const hash = ethers.keccak256(hexSignature);
        console.log("Generated password:", hash);
        return hash;
      } catch (error) {
        console.error("Error generating password:", error);
        return null;
      }
    };
  
    Gun.chain.createSignature = async function () {
      try {
        const signer = await getSigner();
        const signature = await signer.signMessage(MESSAGE_TO_SIGN);
        console.log("Signature created:", signature);
        return signature;
      } catch (error) {
        console.error("Error creating signature:", error);
        return null;
      }
    };
  
    Gun.chain.createAndStoreEncryptedPair = async function (address, password) {
      try {
        const gun = this;
        const pair = await SEA.pair();
        const encryptedPair = await SEA.encrypt(JSON.stringify(pair), password);
        const ensName = await getEnsName(address);
        const username = ensName ? ensName : address;
  
        await gun.get("gun-eth").get("users").get(username).put(encryptedPair);
        await gun.get(`~${username}`).get("safe").get("enc").put(encryptedPair);
  
        console.log("Encrypted pair stored for:", address);
      } catch (error) {
        console.error("Error creating and storing encrypted pair:", error);
      }
    };
  
    Gun.chain.getAndDecryptPair = async function (address, password) {
      try {
        const gun = this;
        const encryptedData = await gun
          .get("gun-eth")
          .get("users")
          .get(address)
          .get("encryptedPair")
          .then();
        if (!encryptedData) {
          throw new Error("No encrypted data found for this address");
        }
        const decryptedPair = await SEA.decrypt(encryptedData, password);
        console.log(decryptedPair);
        return decryptedPair;
      } catch (error) {
        console.error("Error retrieving and decrypting pair:", error);
        return null;
      }
    };
  
    Gun.chain.gunToEthAccount = function (gunPrivateKey) {
      const base64UrlToHex = (base64url) => {
        const padding = "=".repeat((4 - (base64url.length % 4)) % 4);
        const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/") + padding;
        const binary = atob(base64);
        return Array.from(binary, (char) =>
          char.charCodeAt(0).toString(16).padStart(2, "0")
        ).join("");
      };
  
      const hexPrivateKey = "0x" + base64UrlToHex(gunPrivateKey);
      const wallet = new ethers.Wallet(hexPrivateKey);
      const publicKey = wallet.address;
  
      return {
        account: wallet,
        publicKey: publicKey,
      };
    };
  }