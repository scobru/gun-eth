// posts.js
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Creates a posts module with encryption capabilities.
 * @param {Object} gun - The Gun instance.
 * @param {Object} SEA - The SEA (Security, Encryption, Authorization) object.
 * @returns {Object} An object with post management functions.
 */
export const createPostsModule = (gun, SEA) => {
    const dbPosts = gun.get("gun-eth").get("posts");
    /**
     * Encrypts a post's text content.
     * @param {Object} post - The post object to encrypt.
     * @param {string} token - The encryption token.
     * @returns {Promise<Object>} A promise that resolves to the encrypted post object.
     */
    const encryptPost = (post, token) => __awaiter(void 0, void 0, void 0, function* () {
        const text = yield SEA.encrypt(post.text, token);
        return Object.assign(Object.assign({}, post), { text });
    });
    /**
     * Decrypts a post's text content.
     * @param {Object} post - The encrypted post object to decrypt.
     * @param {string} token - The decryption token.
     * @returns {Promise<Object>} A promise that resolves to the decrypted post object.
     */
    const decryptPost = (post, token) => __awaiter(void 0, void 0, void 0, function* () {
        const text = yield SEA.decrypt(post.text, token);
        return Object.assign(Object.assign({}, post), { text });
    });
    /**
     * Creates a new encrypted post.
     * @param {Object} post - The post object to create.
     * @param {string} token - The encryption token.
     * @returns {Promise<string>} A promise that resolves to the new post's key.
     */
    const createPost = (post, token) => __awaiter(void 0, void 0, void 0, function* () {
        const encrypted = yield encryptPost(post, token);
        const key = Date.now().toString();
        yield dbPosts.get(key).put(encrypted);
        return key;
    });
    /**
     * Retrieves and decrypts a post by its key.
     * @param {string} key - The key of the post to retrieve.
     * @param {string} token - The decryption token.
     * @returns {Promise<Object|null>} A promise that resolves to the decrypted post object or null if not found.
     */
    const getPost = (key, token) => __awaiter(void 0, void 0, void 0, function* () {
        const post = yield dbPosts.get(key).then();
        if (post) {
            return yield decryptPost(post, token);
        }
        return null;
    });
    /**
     * Updates an existing post with new encrypted content.
     * @param {string} key - The key of the post to update.
     * @param {Object} post - The updated post object.
     * @param {string} token - The encryption token.
     * @returns {Promise<void>}
     */
    const updatePost = (key, post, token) => __awaiter(void 0, void 0, void 0, function* () {
        const encrypted = yield encryptPost(post, token);
        yield dbPosts.get(key).put(encrypted);
    });
    /**
     * Deletes a post by its key.
     * @param {string} key - The key of the post to delete.
     * @returns {Promise<void>}
     */
    const deletePost = (key) => __awaiter(void 0, void 0, void 0, function* () {
        yield dbPosts.get(key).put(null);
    });
    /**
     * Retrieves and decrypts all posts.
     * @param {string} token - The decryption token.
     * @returns {Promise<Array>} A promise that resolves to an array of decrypted post objects.
     */
    const getAllPosts = (token) => __awaiter(void 0, void 0, void 0, function* () {
        return new Promise((resolve) => {
            const posts = [];
            dbPosts.map().once((data, key) => __awaiter(void 0, void 0, void 0, function* () {
                if (data) {
                    const decrypted = yield decryptPost(data, token);
                    posts.push(Object.assign(Object.assign({}, decrypted), { id: key }));
                }
                resolve(posts);
            }));
        });
    });
    return {
        createPost,
        getPost,
        updatePost,
        deletePost,
        getAllPosts,
    };
};
module.exports = createPostsModule;
