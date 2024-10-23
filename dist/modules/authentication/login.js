/**
 * Authenticates a registered user.
 * @param {Object} gun - Gun instance
 * @param {Object} credentials - User credentials
 * @param {string} credentials.username - The username
 * @param {string} credentials.password - The password
 * @returns {Promise<Object>} - An object with the authentication result
 */
export const loginUser = (gun, credentials) => {
    return new Promise((resolve) => {
        gun.user().auth(credentials.username, credentials.password, ({ err, pub }) => {
            if (err) {
                resolve({ errMessage: err, errCode: "gun-auth-error" });
            }
            else {
                resolve({
                    errMessage: undefined,
                    errCode: undefined,
                    pub,
                    message: "Successfully authenticated user.",
                });
            }
        });
    });
};
