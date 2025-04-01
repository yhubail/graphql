/**
 * User Model
 * 
 * Represents a user entity in the application, encapsulating user data
 * and providing methods for data transformation and analysis.
 * 
 * @module models/User
 */
export class User {
    /**
     * Create a new User instance
     * 
     * Initializes a user object with data retrieved from the GraphQL API,
     * setting default values for optional properties when not provided.
     * 
     * @param {Object} userData - User data from the GraphQL API
     * @param {string} userData.login - User's login/username
     * @param {string} userData.email - User's email address
     * @param {string} userData.firstName - User's first name
     * @param {string} userData.lastName - User's last name
     * @param {number} [userData.auditRatio=0] - User's audit ratio
     * @param {number} [userData.totalUp=0] - Total upvotes received
     * @param {number} [userData.totalDown=0] - Total downvotes received
     * @param {Array} [userData.progressesByPath=[]] - Array of user's progress records
     * @param {Array} [userData.transactions=[]] - Array of user's transactions
     * @param {Array} [userData.xps=[]] - Array of user's XP records
     * @param {Object} [userData.attrs={}] - Additional user attributes
     */
    constructor(userData) {
        this.login = userData.login;
        this.email = userData.email;
        this.firstName = userData.firstName;
        this.lastName = userData.lastName;
        this.auditRatio = userData.auditRatio || 0;
        this.totalUp = userData.totalUp || 0;
        this.totalDown = userData.totalDown || 0;
        this.progressesByPath = userData.progressesByPath || [];
        this.transactions = userData.transactions || [];
        this.xps = userData.xps || [];
        this.attrs = userData.attrs || {};
        this.level = this.transactions[0]?.amount || 0;
    }

    /**
     * Get the user's full name
     * 
     * Combines the first and last name into a formatted full name.
     * 
     * @returns {string} - User's full name (firstName + lastName)
     */
    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    /**
     * Calculate the user's pass/fail ratio
     * 
     * Determines the ratio of successful progressions to total progressions,
     * providing a measure of the user's success rate.
     * 
     * @returns {number} - Ratio of passed progressions (0-1)
     */
    getPassFailRatio() {
        const passed = this.progressesByPath.filter(p => p.succeeded).length;
        const total = this.progressesByPath.length;
        return total > 0 ? passed / total : 0;
    }

    /**
     * Get XP accumulation over time
     * 
     * Transforms transaction data into a time series of cumulative XP,
     * suitable for visualizing the user's progress over time.
     * 
     * @returns {Array<Object>} - Array of {date, value} objects representing XP over time
     */
    getXPOverTime() {
        let accumulator = 0;
        return this.transactions
            .filter(t => t.type === 'xp')
            .map(t => ({
                date: new Date(t.createdAt),
                value: (accumulator += t.amount)
            }));
    }

    /**
     * Get XP distribution by project
     * 
     * Aggregates XP data by project path, providing a breakdown of
     * where the user has earned XP throughout their journey.
     * 
     * @returns {Object} - Map of project paths to XP amounts
     */
    getXPByProject() {
        return this.xps.reduce((acc, xp) => {
            const project = xp.path || 'Other';
            acc[project] = (acc[project] || 0) + xp.amount;
            return acc;
        }, {});
    }
}