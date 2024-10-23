// notes.js
import DOMPurify from 'dompurify';

/**
 * Creates a notes module with encryption capabilities.
 * @param {Object} gun - The Gun instance.
 * @param {Object} SEA - The SEA (Security, Encryption, Authorization) object.
 * @returns {Object} An object with note management functions.
 */
export const createNotesModule = (gun, SEA) => {
  const user = gun.user();

  /**
   * Creates a new note.
   * @param {string} title - The title of the note.
   * @param {string} author - The author of the note.
   * @param {string} content - The content of the note.
   * @param {boolean} isPublic - Whether the note is public or private.
   * @param {string} [verification=''] - Verification data for public notes.
   * @returns {Promise<string>} A promise that resolves to the note's hash.
   */
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

  /**
   * Retrieves a note by its hash.
   * @param {string} hash - The hash of the note to retrieve.
   * @returns {Promise<Object|null>} A promise that resolves to the note object or null if not found.
   */
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

  /**
   * Updates an existing note.
   * @param {string} hash - The hash of the note to update.
   * @param {string} title - The updated title of the note.
   * @param {string} author - The updated author of the note.
   * @param {string} content - The updated content of the note.
   * @param {boolean} isPublic - Whether the note is public or private.
   * @param {string} [verification=''] - Updated verification data for public notes.
   * @returns {Promise<void>}
   */
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

  /**
   * Deletes a note by its hash.
   * @param {string} hash - The hash of the note to delete.
   * @returns {Promise<void>}
   */
  const deleteNote = async (hash) => {
    await user.get("gun-eth").get("notes").get(hash).put(null);
  };

  /**
   * Retrieves all notes for the current user.
   * @returns {Promise<Array>} A promise that resolves to an array of user's notes.
   */
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
            console.error("Error during decryption:", error);
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