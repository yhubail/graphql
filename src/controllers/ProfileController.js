/**
 * Profile Controller
 * 
 * Manages the user profile functionality, including data fetching,
 * display, and user interactions within the profile view.
 * 
 * @module controllers/ProfileController
 */
import { GraphQLService } from '../services/GraphQLService.js';
import { ProfileView } from '../views/ProfileView.js';
import { Auth } from '../models/Auth.js';
import { User } from '../models/User.js';

/**
 * ProfileController class
 * 
 * Responsible for coordinating the retrieval of user profile data
 * and rendering it through the ProfileView component.
 */
export class ProfileController {
    /**
     * Initialize the profile controller
     * 
     * @param {HTMLElement} container - DOM element where the profile will be rendered
     */
    constructor(container) {
        // Store reference to the container element
        this.container = container;
        
        // Initialize the GraphQL service for data fetching
        this.graphQLService = new GraphQLService();
        
        // Create the profile view instance
        this.profileView = new ProfileView(container);
        
        // Initialize authentication model for logout functionality
        this.auth = new Auth();
        
        // Begin profile data loading and rendering
        this.init();
    }

    /**
     * Initialize the profile data and view
     * 
     * Fetches user profile data from the GraphQL API and renders it.
     * Handles any errors that occur during the process.
     */
    async init() {
        try {
            // Fetch user profile data from GraphQL service
            const userData = await this.graphQLService.getUserProfile();
            
            // Verify that basic user information was retrieved
            if (!userData.basicInfo) {
                throw new Error('No user data found');
            }
            
            // Create user model instance with the retrieved data
            const user = new User(userData.basicInfo);
            
            // Render the profile view with the complete user data
            this.profileView.render(userData);
            
            // Set up event handlers for user interactions
            this.attachLogoutHandler();
        } catch (error) {
            // Handle any errors that occurred during initialization
            this.handleError(error);
        }
    }

    /**
     * Attach event handler for logout button
     * 
     * Sets up the click event listener on the logout button to
     * trigger the authentication logout process.
     */
    attachLogoutHandler() {
        // Find the logout button in the DOM
        const logoutBtn = document.getElementById('logout-btn');
        
        // If the button exists, attach a click event listener
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                // Call the logout method from the Auth model
                this.auth.logout();
            });
        }
    }

    /**
     * Handle errors during profile operations
     * 
     * Processes errors that occur during profile data fetching or rendering.
     * Handles authentication errors by logging the user out, and displays
     * appropriate error messages for other types of errors.
     * 
     * @param {Error} error - The error that occurred
     */
    handleError(error) {
        // Log the error to the console for debugging
        console.error('Profile Error:', error);
        
        // Check if the error is related to authentication
        if (error.message.includes('authentication') || error.message.includes('JWT')) {
            // For authentication errors, log the user out immediately
            this.auth.logout();
        } else {
            // For other errors, display an error message to the user
            this.container.innerHTML = `
                <div class="error-message">
                    Failed to load profile. Please try logging in again.
                </div>
            `;
            
            // After a delay, log the user out to reset the application state
            setTimeout(() => this.auth.logout(), 2000);
        }
    }
}