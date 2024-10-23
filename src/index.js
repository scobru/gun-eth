// index.js

import { checkEthers } from './utils.js';
import { getEnsName, getSigner, getProvider } from './ethereum.js';
import { extendGun } from './gunExtensions.js';
import { shine } from './shine.js';
import { str2ab } from './userManagement.js';
import { createAuthenticationModule } from './authenticationIndex.js';
import { createCertificatesModule } from './certificates.js';
import { createFriendsModule } from './friends.js';
import { createMessagingModule } from './messaging.js';

const GunEth = (Gun, SEA, ethers, rxjs) => {
  console.log("Inizializzazione del plugin Gun-Eth");

  if (!checkEthers(ethers)) {
    console.error("Ethers.js non è disponibile");
    return Gun;
  }

  extendGun(Gun, SEA, ethers, getEnsName);
  Gun.chain.shine = shine(Gun, ethers, getSigner, getProvider);
  Gun.chain.str2ab = str2ab;

  Gun.chain.gunEth = function() {
    const gun = this;
    const auth = createAuthenticationModule(gun);
    const certificates = createCertificatesModule(gun, SEA);
    const friends = createFriendsModule(gun, gun.user(), certificates.generateAddFriendCertificate);
    const messaging = createMessagingModule(gun, SEA);

    return {
      auth,
      certificates,
      friends,
      messaging
    };
  };

  console.log("Plugin Gun-Eth caricato con successo");
  return Gun;
};

if (typeof window !== 'undefined') {
  window.GunEth = GunEth;
}

if (typeof module !== 'undefined') {
  module.exports = GunEth;
}

export default GunEth;