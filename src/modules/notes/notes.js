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
    if (!isPublic && !user.is) {
      console.log("L'utente deve essere autenticato per creare note private");
      throw new Error("L'utente deve essere autenticato per creare note private");
    }

    const noteData = {
      title: DOMPurify.sanitize(title),
      author: DOMPurify.sanitize(author),
      content: DOMPurify.sanitize(content),
      verification: isPublic ? DOMPurify.sanitize(verification) : '',
      lastUpdated: new Date().toISOString(),
      isPublic: isPublic
    };

    const noteString = JSON.stringify(noteData);
    const hash = await SEA.work(noteString, null, null, { name: "SHA-256" });

    if (isPublic) {
      await gun.get("gun-eth").get("public-notes").get(hash).put(noteString);
    } else {
      if (!user.is) {
        throw new Error("L'utente deve essere autenticato per creare note private");
      }
      await user.get("gun-eth").get("private-notes").get(hash).put(noteData);
    }

    return hash;
  };

  /**
   * Retrieves a note by its hash.
   * @param {string} hash - The hash of the note to retrieve.
   * @returns {Promise<Object|null>} A promise that resolves to the note object or null if not found.
   */
  const getNote = async (hash) => {
    const publicNote = await gun.get("gun-eth").get("public-notes").get(hash).then();
    if (publicNote) {
      return JSON.parse(publicNote);
    }

    if (!user.is) {
      throw new Error("L'utente deve essere autenticato per accedere alle note private");
    }

    const privateNote = await user.get("gun-eth").get("private-notes").get(hash).then();
    if (privateNote) {
      const decryptedData = await SEA.decrypt(privateNote, user._.sea);
      return JSON.parse(decryptedData);
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
      isPublic: isPublic
    };

    const noteString = JSON.stringify(noteData);

    if (isPublic) {
      await gun.get("gun-eth").get("public-notes").get(hash).put(noteString);
    } else {
      if (!user.is) {
        throw new Error("L'utente deve essere autenticato per aggiornare note private");
      }
      const encryptedData = await SEA.encrypt(noteString, user._.sea);
      await user.get("gun-eth").get("private-notes").get(hash).put(encryptedData);
    }
  };

  /**
   * Deletes a note by its hash.
   * @param {string} hash - The hash of the note to delete.
   * @returns {Promise<void>}
   */
  const deleteNote = async (hash, isPublic) => {
    if (isPublic) {
      await gun.get("gun-eth").get("public-notes").get(hash).put(null);
    } else {
      await user.get("gun-eth").get("private-notes").get(hash).put(null);
    }
  };

  /**
   * Retrieves all notes for the current user.
   * @returns {Promise<Array>} A promise that resolves to an array of user's notes.
   */
  const getUserNotes = () => {
    return new Promise((resolve) => {
      const notes = [];

      const loadPublicNotes = () => {
        return new Promise((resolvePublic) => {
          gun.get("gun-eth").get("public-notes").map().once((data, id) => {
            if (data && id !== '_') {
              try {
                notes.push({ id, ...JSON.parse(data), isPublic: true });
              } catch (error) {
                console.error("Errore durante il parsing della nota pubblica:", error);
                notes.push({ id, error: "Errore durante il parsing della nota", isPublic: true });
              }
            }
          });
          setTimeout(resolvePublic, 500);
        });
      };

      const loadPrivateNotes = () => {
        return new Promise((resolvePrivate) => {
          if (user.is) {
            user.get("gun-eth").get("private-notes").map().once(async (data, id) => {
              if (data && id !== '_') {
                try {
                  const decryptedData = await SEA.decrypt(data, user._.sea);
                  console.log("decryptedData:", decryptedData);
                  if (typeof decryptedData === 'string' ) {
                    notes.push({ id, ...JSON.parse(decryptedData), isPublic: false });
                  } else if (typeof decryptedData === 'object' && decryptedData !== null) {
                    notes.push({ id, ...decryptedData, isPublic: false });
                  } else {
                    console.error("Dati decriptati non validi:", decryptedData);
                    notes.push({ id, error: "Dati decriptati non validi", isPublic: false });
                  }
                } catch (error) {
                  console.error("Errore durante la decrittazione della nota privata:", error);
                  notes.push({ id, error: "Errore durante la decrittazione della nota", isPublic: false });
                }
              }
            });
          }
          setTimeout(resolvePrivate, 500);
        });
      };

      Promise.all([loadPublicNotes(), loadPrivateNotes()]).then(() => {
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

