// notes.js
import DOMPurify from 'dompurify';

export const createNotesModule = (gun, SEA) => {
  const user = gun.user();

  const createNote = async (title, author, content, isPublic, verification = '') => {
    const noteData = {
      title: DOMPurify.sanitize(title),
      author: DOMPurify.sanitize(author),
      content: DOMPurify.sanitize(content),
      verification: isPublic ? DOMPurify.sanitize(verification) : '',
      lastUpdated: new Date().toISOString(),
    };

    const noteString = JSON.stringify(noteData);
    const hash = await SEA.work(noteString, null, null, { name: "SHA-256" });

    if (isPublic) {
      await gun.get("gun-eth").get("notes").get(hash).put(noteString);
    } else {
      const encryptedData = await SEA.encrypt(noteString, user._.sea);
      await user.get("gun-eth").get("notes").get(hash).put(encryptedData);
    }

    return hash;
  };

  const getNote = async (hash) => {
    const publicNote = await gun.get("gun-eth").get("notes").get(hash).then();
    if (publicNote) {
      return { ...JSON.parse(publicNote), isPublic: true };
    }

    const privateNote = await user.get("gun-eth").get("notes").get(hash).then();
    if (privateNote) {
      const decryptedData = await SEA.decrypt(privateNote, user._.sea);
      return { ...JSON.parse(decryptedData), isPublic: false };
    }

    return null;
  };

  const updateNote = async (hash, title, author, content, isPublic, verification = '') => {
    const noteData = {
      title: DOMPurify.sanitize(title),
      author: DOMPurify.sanitize(author),
      content: DOMPurify.sanitize(content),
      verification: isPublic ? DOMPurify.sanitize(verification) : '',
      lastUpdated: new Date().toISOString(),
    };

    const noteString = JSON.stringify(noteData);

    if (isPublic) {
      await gun.get("gun-eth").get("notes").get(hash).put(noteString);
    } else {
      const encryptedData = await SEA.encrypt(noteString, user._.sea);
      await user.get("gun-eth").get("notes").get(hash).put(encryptedData);
    }
  };

  const deleteNote = async (hash) => {
    await user.get("gun-eth").get("notes").get(hash).put(null);
  };

  const getUserNotes = () => {
    return new Promise((resolve) => {
      const notes = [];
      user.get("gun-eth").get("notes").map().once(async (data, id) => {
        if (data && id !== '_') {
          try {
            const decryptedData = await SEA.decrypt(data, user._.sea);
            if (decryptedData) {
              notes.push({ id, ...JSON.parse(decryptedData), isPublic: false });
            }
          } catch (error) {
            console.error("Errore durante la decrittazione:", error);
          }
        }
        resolve(notes);
      });
    });
  };

  return {
    createNote,
    getNote,
    updateNote,
    deleteNote,
    getUserNotes,
  };
};