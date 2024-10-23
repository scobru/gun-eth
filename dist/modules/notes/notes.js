var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    const createNote = (title_1, author_1, content_1, isPublic_1, ...args_1) => __awaiter(void 0, [title_1, author_1, content_1, isPublic_1, ...args_1], void 0, function* (title, author, content, isPublic, verification = '') {
        const noteData = {
            title: DOMPurify.sanitize(title),
            author: DOMPurify.sanitize(author),
            content: DOMPurify.sanitize(content),
            verification: isPublic ? DOMPurify.sanitize(verification) : '',
            lastUpdated: new Date().toISOString(),
        };
        const noteString = JSON.stringify(noteData);
        const hash = yield SEA.work(noteString, null, null, { name: "SHA-256" });
        if (isPublic) {
            yield gun.get("gun-eth").get("notes").get(hash).put(noteString);
        }
        else {
            const encryptedData = yield SEA.encrypt(noteString, user._.sea);
            yield user.get("gun-eth").get("notes").get(hash).put(encryptedData);
        }
        return hash;
    });
    /**
     * Retrieves a note by its hash.
     * @param {string} hash - The hash of the note to retrieve.
     * @returns {Promise<Object|null>} A promise that resolves to the note object or null if not found.
     */
    const getNote = (hash) => __awaiter(void 0, void 0, void 0, function* () {
        const publicNote = yield gun.get("gun-eth").get("notes").get(hash).then();
        if (publicNote) {
            return Object.assign(Object.assign({}, JSON.parse(publicNote)), { isPublic: true });
        }
        const privateNote = yield user.get("gun-eth").get("notes").get(hash).then();
        if (privateNote) {
            const decryptedData = yield SEA.decrypt(privateNote, user._.sea);
            return Object.assign(Object.assign({}, JSON.parse(decryptedData)), { isPublic: false });
        }
        return null;
    });
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
    const updateNote = (hash_1, title_1, author_1, content_1, isPublic_1, ...args_1) => __awaiter(void 0, [hash_1, title_1, author_1, content_1, isPublic_1, ...args_1], void 0, function* (hash, title, author, content, isPublic, verification = '') {
        const noteData = {
            title: DOMPurify.sanitize(title),
            author: DOMPurify.sanitize(author),
            content: DOMPurify.sanitize(content),
            verification: isPublic ? DOMPurify.sanitize(verification) : '',
            lastUpdated: new Date().toISOString(),
        };
        const noteString = JSON.stringify(noteData);
        if (isPublic) {
            yield gun.get("gun-eth").get("notes").get(hash).put(noteString);
        }
        else {
            const encryptedData = yield SEA.encrypt(noteString, user._.sea);
            yield user.get("gun-eth").get("notes").get(hash).put(encryptedData);
        }
    });
    /**
     * Deletes a note by its hash.
     * @param {string} hash - The hash of the note to delete.
     * @returns {Promise<void>}
     */
    const deleteNote = (hash) => __awaiter(void 0, void 0, void 0, function* () {
        yield user.get("gun-eth").get("notes").get(hash).put(null);
    });
    /**
     * Retrieves all notes for the current user.
     * @returns {Promise<Array>} A promise that resolves to an array of user's notes.
     */
    const getUserNotes = () => {
        return new Promise((resolve) => {
            const notes = [];
            user.get("gun-eth").get("notes").map().once((data, id) => __awaiter(void 0, void 0, void 0, function* () {
                if (data && id !== '_') {
                    try {
                        const decryptedData = yield SEA.decrypt(data, user._.sea);
                        if (decryptedData) {
                            notes.push(Object.assign(Object.assign({ id }, JSON.parse(decryptedData)), { isPublic: false }));
                        }
                    }
                    catch (error) {
                        console.error("Error during decryption:", error);
                    }
                }
                resolve(notes);
            }));
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
