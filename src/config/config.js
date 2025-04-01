/**
 * Application Configuration
 * 
 * This module contains centralized configuration settings for the application,
 * including API endpoints and chart visualization parameters.
 */
export const config = {
    /**
     * API Configuration
     * 
     * Contains all settings related to backend API communication.
     */
    api: {
        /**
         * Base URL for all API requests
         * Points to the Reboot01 learning platform API
         */
        baseUrl: 'https://learn.reboot01.com/api',
        
        /**
         * API Endpoints
         * 
         * Relative paths for specific API services, to be appended to the baseUrl
         */
        endpoints: {
            /**
             * Authentication endpoint for obtaining JWT tokens
             * Used with Basic authentication (username/password or email/password)
             */
            auth: '/auth/signin',
            
            /**
             * GraphQL API endpoint
             * Used for querying user profile data with JWT authentication
             */
            graphql: '/graphql-engine/v1/graphql'
        }
    },
    
    /**
     * Chart Visualization Configuration
     * 
     * Parameters for SVG-based data visualizations throughout the application
     */
    charts: {
        /**
         * Color Palette
         * 
         * Consistent color scheme for data visualizations
         */
        colors: {
            primary: '#3498db',  // Blue - used for primary data points
            success: '#2ecc71',  // Green - used for positive metrics (e.g., passed projects)
            error: '#e74c3c'     // Red - used for negative metrics (e.g., failed projects)
        },
        
        /**
         * Chart Dimensions
         * 
         * Size parameters for SVG chart elements to ensure consistent styling
         * Optimized for balance between visibility and space efficiency
         */
        dimensions: {
            circleRadius: 30,            // Radius for circular chart elements (in pixels)
            circleCircumference: 188,    // Circumference for circular progress indicators (2πr)
            barWidth: 50,                // Width for bar chart elements (in pixels)
            barHeight: 12                // Height for bar chart elements (in pixels)
        }
    }
};