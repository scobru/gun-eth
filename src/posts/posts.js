// posts.js
export const createPostsModule = (gun, SEA) => {
    const dbPosts = gun.get('gun-eth').get('posts');
  
    const encryptPost = async (post, token) => {
      const text = await SEA.encrypt(post.text, token);
      return { ...post, text };
    };
  
    const decryptPost = async (post, token) => {
      const text = await SEA.decrypt(post.text, token);
      return { ...post, text };
    };
  
    const createPost = async (post, token) => {
      const encrypted = await encryptPost(post, token);
      const key = Date.now().toString();
      await dbPosts.get(key).put(encrypted);
      return key;
    };
  
    const getPost = async (key, token) => {
      const post = await dbPosts.get(key).then();
      if (post) {
        return await decryptPost(post, token);
      }
      return null;
    };
  
    const updatePost = async (key, post, token) => {
      const encrypted = await encryptPost(post, token);
      await dbPosts.get(key).put(encrypted);
    };
  
    const deletePost = async (key) => {
      await dbPosts.get(key).put(null);
    };
  
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