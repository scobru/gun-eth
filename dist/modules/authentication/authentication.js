import { createAuthenticationStatus } from './isAuthenticated.js';
import { loginUser } from './login.js';
import { registerUser } from './register.js';
/**
 * @typedef {Object} Credentials
 * @property {string} username - User's username
 * @property {string} password - User's password
 */
/**
 * @typedef {Object} AuthenticationModule
 * @property {function(): Promise<boolean>} checkAuth - Checks the authentication status
 * @property {import('rxjs').BehaviorSubject<boolean>} isAuthenticated - Observable for the authentication status
 * @property {function(Credentials): Promise<any>} loginUser - Function to log in a user
 * @property {function(Credentials): Promise<any>} registerUser - Function to register a new user
 * @property {function(): void} logout - Function to log out the user
 */
/**
 * Creates an object containing all authentication functionalities.
 * @param {Object} gun - Gun instance
 * @returns {AuthenticationModule} - Object containing all authentication functionalities
 */
export const createAuthenticationModule = (gun) => {
    const { isAuthenticated, checkAuth } = createAuthenticationStatus(gun);
    /**
     * Logs out the user
     * @returns {void}
     */
    const logout = () => {
        gun.user().leave();
        isAuthenticated.next(false);
    };
    return {
        checkAuth,
        isAuthenticated,
        loginUser: (credentials) => loginUser(gun, credentials),
        registerUser: (credentials) => registerUser(gun, credentials),
        logout
    };
};
