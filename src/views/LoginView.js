/**
 * Login View
 * 
 * Renders the user authentication interface and handles login form interactions.
 * This view is responsible for collecting user credentials and communicating
 * with the authentication controller.
 * 
 * @module views/LoginView
 */

/**
 * LoginView class
 * 
 * Manages the rendering and event handling for the login interface.
 * Implements a clean separation between UI presentation and business logic.
 */
export class LoginView {
    /**
     * Initialize the login view
     * 
     * @param {HTMLElement} container - DOM element where the login form will be rendered
     */
    constructor(container) {
        /**
         * Container element for the login form
         * @type {HTMLElement}
         * @private
         */
        this.container = container;
    }

    /**
     * Render the login form
     * 
     * Creates and displays the login interface with username/email and password fields,
     * along with a submit button and error message container.
     * 
     * @returns {void}
     */
    render() {
        this.container.innerHTML = `
            <div class="login-container max-w-md mx-auto mt-10 p-6 bg-white bg-opacity-10 rounded-lg shadow-lg">
                <form id="login-form" class="login-form space-y-4">
                    <h2 class="text-2xl font-bold text-center text-white">Login</h2>
                    <div class="form-group">
                        <label for="username" class="block text-sm text-gray-300">Username or Email</label>
                        <input type="text" id="username" class="w-full p-2 mt-1 bg-white bg-opacity-20 rounded focus:outline-none focus:ring-2 focus:ring-primary-color" placeholder="Enter your username or email" required>
                    </div>
                    <div class="form-group">
                        <label for="password" class="block text-sm text-gray-300">Password</label>
                        <input type="password" id="password" class="w-full p-2 mt-1 bg-white bg-opacity-20 rounded focus:outline-none focus:ring-2 focus:ring-primary-color" placeholder="Enter your password" required>
                    </div>
                    <div class="error-message text-red-500 text-sm" id="error-message"></div>
                    <button type="submit" class="btn-login w-full py-2 bg-primary-color text-white font-bold rounded hover:bg-primary-color-dark focus:outline-none focus:ring-2 focus:ring-primary-color">Login</button>
                </form>
            </div>
        `;

        // Set up event handlers after rendering the form
        this.attachEventListeners();
    }

    /**
     * Attach event listeners to form elements
     * 
     * Sets up the form submission handler to capture login credentials
     * and prevent default form submission behavior.
     * 
     * @private
     * @returns {void}
     */
    attachEventListeners() {
        const form = document.getElementById('login-form');
        form.addEventListener('submit', (e) => {
            // Prevent the default form submission
            e.preventDefault();
            
            // Extract the username and password values
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Call the onSubmit handler with the credentials
            this.onSubmit({ username, password });
        });
    }

    /**
     * Display an error message
     * 
     * Updates the error message container with the provided text.
     * Used to show authentication failures or validation errors.
     * 
     * @param {string} message - Error message to display
     * @returns {void}
     */
    setError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
    }

    /**
     * Set the form submission handler
     * 
     * Callback setter that will be invoked by the controller to handle
     * the form submission event with the collected credentials.
     * 
     * @param {Function} handler - Callback function that receives the credentials object
     * @returns {void}
     */
    onSubmit(handler) {
        this.submitHandler = handler;
    }
}