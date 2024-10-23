// posts.js

/**
 * Creates a posts module with encryption capabilities.
 * @param {Object} gun - The Gun instance.
 * @param {Object} SEA - The SEA (Security, Encryption, Authorization) object.
 * @returns {Object} An object with post management functions.
 */
export const createPostsModule = (gun, SEA) => {
    const dbPosts = gun.get('gun-eth').get('posts');
  
    /**
     * Encrypts a post's text content.
     * @param {Object} post - The post object to encrypt.
     * @param {string} token - The encryption token.
     * @returns {Promise<Object>} A promise that resolves to the encrypted post object.
     */
    const encryptPost = async (post, token) => {
      const text = await SEA.encrypt(post.text, token);
      return { ...post, text };
    };
  
    /**
     * Decrypts a post's text content.
     * @param {Object} post - The encrypted post object to decrypt.
     * @param {string} token - The decryption token.
     * @returns {Promise<Object>} A promise that resolves to the decrypted post object.
     */
    const decryptPost = async (post, token) => {
      const text = await SEA.decrypt(post.text, token);
      return { ...post, text };
    };
  
    /**
     * Creates a new encrypted post.
     * @param {Object} post - The post object to create.
     * @param {string} token - The encryption token.
     * @returns {Promise<string>} A promise that resolves to the new post's key.
     */
    const createPost = async (post, token) => {
      const encrypted = await encryptPost(post, token);
      const key = Date.now().toString();
      await dbPosts.get(key).put(encrypted);
      return key;
    };
  
    /**
     * Retrieves and decrypts a post by its key.
     * @param {string} key - The key of the post to retrieve.
     * @param {string} token - The decryption token.
     * @returns {Promise<Object|null>} A promise that resolves to the decrypted post object or null if not found.
     */
    const getPost = async (key, token) => {
      const post = await dbPosts.get(key).then();
      if (post) {
        return await decryptPost(post, token);
      }
      return null;
    };
  
    /**
     * Updates an existing post with new encrypted content.
     * @param {string} key - The key of the post to update.
     * @param {Object} post - The updated post object.
     * @param {string} token - The encryption token.
     * @returns {Promise<void>}
     */
    const updatePost = async (key, post, token) => {
      const encrypted = await encryptPost(post, token);
      await dbPosts.get(key).put(encrypted);
    };
  
    /**
     * Deletes a post by its key.
     * @param {string} key - The key of the post to delete.
     * @returns {Promise<void>}
     */
    const deletePost = async (key) => {
      await dbPosts.get(key).put(null);
    };
  
    /**
     * Retrieves and decrypts all posts.
     * @param {string} token - The decryption token.
     * @returns {Promise<Array>} A promise that resolves to an array of decrypted post objects.
     */
    const getAllPosts = async (token) => {
      return new Promise((resolve) => {
        const posts = [];
        dbPosts.map().once(async (data, key) => {
          if (data) {
            const decrypted = await decryptPost(data, token);
            posts.push({ ...decrypted, id: key });
          }
          resolve(posts);
        });
      });
    };
  
    return {
      createPost,
      getPost,
      updatePost,
      deletePost,
      getAllPosts
    };
  };