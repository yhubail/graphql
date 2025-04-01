/**
 * Authentication Model
 * 
 * Handles user authentication operations including login, logout,
 * and authentication state verification.
 * 
 * @module models/Auth
 */
export class Auth {
    /**
     * Initialize the authentication model
     * 
     * Sets up the authentication endpoint URL for API requests.
     */
    constructor() {
        // Define the authentication endpoint URL
        this.baseUrl = 'https://learn.reboot01.com/api/auth/signin';
    }

    /**
     * Authenticate a user with the provided credentials
     * 
     * Makes a request to the authentication endpoint using Basic authentication,
     * processes the JWT token response, and stores it for future API requests.
     * 
     * @param {Object} credentials - User login credentials
     * @param {string} credentials.username - Username or email
     * @param {string} credentials.password - User password
     * @returns {Promise<Object>} - Promise resolving to an object containing the JWT token
     * @throws {Error} - If authentication fails for any reason
     */
    async login(credentials) {
        try {
            // Make a POST request to the authentication endpoint
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    // Use Basic authentication with base64-encoded credentials
                    'Authorization': `Basic ${btoa(credentials.username + ":" + credentials.password)}`
                }
            });

            // Handle unsuccessful responses
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Authentication failed');
            }

            // Extract the token from the response
            const token = await response.text();
            console.log('Raw token received:', token);

            // Clean the token by removing quotes and whitespace
            const cleanToken = token.replace(/^"|"$/g, '').trim();
            console.log('Token after cleaning:', cleanToken);

            // Validate the token structure (should be a JWT with 3 parts)
            if (!cleanToken || cleanToken.split('.').length !== 3) {
                throw new Error('Invalid token structure');
            }

            // Store the token in localStorage for future API requests
            localStorage.setItem('token', cleanToken);
            console.log('Token stored in localStorage:', localStorage.getItem('token'));
            
            // Return the token for immediate use if needed
            return { token: cleanToken };
        } catch (error) {
            // Log detailed error information for debugging
            console.error('Login error details:', error);
            
            // Throw a user-friendly error message
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    /**
     * Log out the current user
     * 
     * Removes the authentication token from storage and dispatches
     * a logout event to notify the application of the state change.
     */
    logout() {
        // Remove the token from localStorage
        localStorage.removeItem('token');
        
        // Dispatch a custom event to notify the application of logout
        const event = new CustomEvent('auth:logout');
        window.dispatchEvent(event);
    }

    /**
     * Check if the user is currently authenticated
     * 
     * Verifies the presence and basic structure of a JWT token in storage.
     * Note: This does not validate the token signature or expiration.
     * 
     * @returns {boolean} - True if a valid-looking token exists, false otherwise
     */
    isAuthenticated() {
        // Retrieve the token from localStorage
        const token = localStorage.getItem('token');
        
        // If no token exists, user is not authenticated
        if (!token) return false;
        
        try {
            // Verify the token has the correct JWT structure (3 parts separated by dots)
            const parts = token.split('.');
            
            // Check that we have 3 parts and each part contains only valid JWT characters
            return parts.length === 3 && parts.every(part => 
                part && part.match(/^[A-Za-z0-9_-]+$/)
            );
        } catch {
            // If any error occurs during validation, consider the user not authenticated
            return false;
        }
    }
}