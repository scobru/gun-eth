export function checkUsernameInUse(gun: Object, username: string): Promise<boolean>;
export function registerUser(gun: Object, credentials: {
    username: string;
    password: string;
}): Promise<Object>;
export function str2ab(str: string): ArrayBuffer;
export function loginUser(gun: Object, credentials: {
    username: string;
    password: string;
}): Promise<Object>;
