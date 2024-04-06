import { AuthClient } from "@dfinity/auth-client";

const IDENTITY_PROVIDER = `http://${process.env.IDENTITY_CANISTER_ID}.${window.location.hostname}:4943`;
const MAX_TTL = 7 * 24 * 60 * 60 * 1000 * 1000 * 1000; // Maximum Time To Live

// Function to create and return an instance of AuthClient
export async function getAuthClient() {
    try {
        return await AuthClient.create();
    } catch (error) {
        console.error("Error creating AuthClient:", error);
        throw new Error("Unable to create AuthClient");
    }
}

// Function to get the principal from the authenticated user
export async function getPrincipal() {
    try {
        const authClient = await getAuthClient();
        return authClient.getIdentity()?.getPrincipal();
    } catch (error) {
        console.error("Error getting principal:", error);
        throw new Error("Unable to get principal");
    }
}

// Function to get the principal text from the authenticated user
export async function getPrincipalText() {
    try {
        return (await getPrincipal()).toText();
    } catch (error) {
        console.error("Error getting principal text:", error);
        throw new Error("Unable to get principal text");
    }
}

// Function to check if the user is authenticated
export async function isAuthenticated() {
    try {
        const authClient = await getAuthClient();
        return await authClient.isAuthenticated();
    } catch (error) {
        console.error("Error checking authentication status:", error);
        logout();
    }
}

// Function to log in the user
export async function login() {
    try {
        const authClient = await getAuthClient();
        const isAuthenticated = await authClient.isAuthenticated();

        if (!isAuthenticated) {
            await authClient?.login({
                identityProvider: IDENTITY_PROVIDER,
                onSuccess: async () => {
                    window.location.reload();
                },
                maxTimeToLive: MAX_TTL,
            });
        }
    } catch (error) {
        console.error("Error logging in:", error);
        throw new Error("Unable to log in");
    }
}

// Function to log out the user
export async function logout() {
    try {
        const authClient = await getAuthClient();
        authClient.logout();
        window.location.reload();
    } catch (error) {
        console.error("Error logging out:", error);
        throw new Error("Unable to log out");
    }
}
