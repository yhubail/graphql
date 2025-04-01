/**
 * Authentication Controller
 * 
 * Manages the authentication flow of the application, including login, 
 * session management, and routing between authentication states.
 * 
 * @module controllers/AuthController
 */
import { Auth } from '../models/Auth.js';
import { LoginView } from '../views/LoginView.js';
import { ProfileController } from './ProfileController.js';

/**
 * AuthController class
 * 
 * Responsible for coordinating authentication operations and managing
 * the transition between login and profile views based on auth state.
 */
export class AuthController {
    /**
     * Initialize the authentication controller
     * 
     * Creates an Auth model instance and sets up the necessary event listeners
     * for authentication state changes.
     */
    constructor() {
        // Initialize the authentication model
        this.auth = new Auth();
        
        // Get reference to the main application container
        this.container = document.getElementById('app');
        
        // Set up event listeners for auth-related events
        this.setupEventListeners();
    }

    /**
     * Set up global event listeners for authentication events
     * 
     * Uses a custom event system to handle logout requests from
     * anywhere in the application.
     */
    setupEventListeners() {
        // Listen for logout events dispatched by other components
        window.addEventListener('auth:logout', () => {
            // Navigate to home page
            history.pushState(null, '', '/');
            
            // Show the login view
            this.showLogin();
        });
    }

    /**
     * Display the login view
     * 
     * Renders the login form and sets up the form submission handler.
     */
    showLogin() {
        // Create and render the login view
        const loginView = new LoginView(this.container);
        loginView.render();
        
        // Bind the login form submission to the handler method
        loginView.onSubmit = this.handleLogin.bind(this);
    }

    /**
     * Handle login form submission
     * 
     * Attempts to authenticate the user with the provided credentials
     * and navigates to the profile page on success.
     * 
     * @param {Object} credentials - User credentials (username/email and password)
     */
    async handleLogin(credentials) {
        try {
            // Attempt to authenticate with the provided credentials
            await this.auth.login(credentials);
            
            // On successful login, navigate to the profile page
            history.pushState(null, '', '/profile/');
            this.showProfile();
        } catch (error) {
            // On authentication failure, re-render the login view with an error message
            const loginView = new LoginView(this.container);
            loginView.setError(error.message);
        }
    }

    /**
     * Display the user profile
     * 
     * Initializes the profile controller which handles fetching and
     * displaying the authenticated user's profile data.
     */
    showProfile() {
        // Initialize the profile controller with the main container
        new ProfileController(this.container);
    }
}