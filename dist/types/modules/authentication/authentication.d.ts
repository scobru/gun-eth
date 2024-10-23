export function createAuthenticationModule(gun: Object): AuthenticationModule;
export type Credentials = {
    /**
     * - User's username
     */
    username: string;
    /**
     * - User's password
     */
    password: string;
};
export type AuthenticationModule = {
    /**
     * - Checks the authentication status
     */
    checkAuth: () => Promise<boolean>;
    /**
     * - Observable for the authentication status
     */
    isAuthenticated: import("rxjs").BehaviorSubject<boolean>;
    /**
     * - Function to log in a user
     */
    loginUser: (arg0: Credentials) => Promise<any>;
    /**
     * - Function to register a new user
     */
    registerUser: (arg0: Credentials) => Promise<any>;
    /**
     * - Function to log out the user
     */
    logout: () => void;
};
