/**
 * GraphQL Service
 * 
 * Core service responsible for all GraphQL API communication. Handles query execution,
 * authentication, error handling, and data transformation for the entire application.
 * 
 * This service is the central point of interaction with the backend GraphQL API and
 * implements robust error handling and authentication management.
 * 
 * @module services/GraphQLService
 * @author Your Name
 * @version 1.0.0
 */
export class GraphQLService {
    /**
     * Initialize the GraphQL service
     * 
     * Sets up the GraphQL endpoint URL and prepares the service for query execution.
     * All API requests will be directed to this endpoint with appropriate authentication.
     */
    constructor() {
        /**
         * GraphQL API endpoint URL
         * @type {string}
         * @private
         */
        this.endpoint = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';
    }

    /**
     * Execute a GraphQL query
     * 
     * Sends a query to the GraphQL endpoint with JWT authentication and processes
     * the response. Handles authentication errors by triggering a logout flow.
     * 
     * @param {string} queryString - The GraphQL query string to execute
     * @returns {Promise<Object>} - Promise resolving to the data property of the GraphQL response
     * @throws {Error} - If authentication fails or the query returns errors
     */
    async query(queryString) {
        const token = localStorage.getItem('token');
        console.log('Token retrieved for GraphQL query:', token);
        console.log('Executing GraphQL Query:', queryString);
        
        if (!token) {
            this.handleAuthError();
            throw new Error('No authentication token found');
        }
    
        try {
            console.log('Making GraphQL request with token:', token);
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ query: queryString })
            });

            const data = await response.json();
            console.log('GraphQL response:', data);
            
            if (data.errors) {
                console.error('GraphQL errors:', data.errors);
                if (data.errors[0].message.includes('JWT')) {
                    this.handleAuthError();
                }
                throw new Error(data.errors[0].message);
            }
            
            return data.data;
        } catch (error) {
            throw new Error(`GraphQL query failed: ${error.message}`);
        }
    }

    /**
     * Handle authentication errors
     * 
     * Dispatches a logout event to notify the application that authentication
     * has failed and the user should be logged out.
     * 
     * @private
     * @fires auth:logout - Custom event triggering the logout flow
     */
    handleAuthError() {
        const event = new CustomEvent('auth:logout');
        window.dispatchEvent(event);
    }

    /**
     * Fetch the authenticated user's profile data
     * 
     * Executes a comprehensive GraphQL query to retrieve all user profile data
     * including basic information, audit statistics, XP data, and project progress.
     * Transforms the raw GraphQL response into a structured user profile object.
     * 
     * @returns {Promise<Object>} - Promise resolving to the structured user profile data
     * @throws {Error} - If the query fails or returns invalid data
     */
    async getUserProfile() {
        try {
            console.log("Fetching user profile with GraphQL...");
            const response = await this.query(`
                query {
                    user {
                        # Basic user information
                        login
                        email
                        firstName
                        lastName
                        attrs
                        campus
                        
                        # Audit Information
                        totalUp
                        totalDown
                        auditRatio
                        
                        # XP data with originEventId 20 (projects)
                        xps(where: {originEventId: {_eq: 20}}) {
                            amount
                            originEventId
                            path
                        }
                        
                        # All Transactions (XP and Level)
                        transactions(order_by: {createdAt: desc}) {
                            type
                            amount
                            createdAt
                            path
                            originEventId
                        }

                        audits(where: {auditedAt:{_is_null:false}}) {
                            grade
                            auditedAt
                        }

                        progressesByPath {
                            succeeded
                            count          
                            object {
                                attrs
                            }
                            path
                        }
                    }
                }
            `);
            
            console.log("Raw GraphQL response for user profile:", response);
        
            if (!response || !response.user || !response.user[0]) {
                throw new Error('Invalid response structure from GraphQL');
            }
        
            const userData = response.user[0];
            console.log("Processed user data:", userData);
            
            return {
                basicInfo: {
                    login: userData.login,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    campus: userData.campus
                },
                auditInfo: {
                    ratio: userData.auditRatio || 0,
                    totalUp: userData.totalUp || 0,
                    totalDown: userData.totalDown || 0,
                    auditsperformed: userData.audits.length, 
                    audits: userData.audits.filter(a => a.grade > 0).length
                },
                xpInfo: {
                    totalXP: this.calculateTotalXP(userData.transactions),
                    xpByPath: this.groupXPByPath(userData.transactions),
                    xps: userData.xps || []
                },
                xpTimeline: this.createTimeline(userData.transactions),
                progressInfo: {
                    totalProjects: userData.progressesByPath.length,
                    succeededProjects: userData.progressesByPath.filter(p => p.succeeded).length,
                    projectDetails: userData.progressesByPath
                },
                level: this.getCurrentLevel(userData.transactions)
            };
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    }
    
    /**
     * Calculate total XP from transactions
     * 
     * Sums all XP transactions to determine the user's total XP.
     * 
     * @private
     * @param {Array<Object>} transactions - Array of user transactions
     * @returns {number} - Total XP amount
     */
    calculateTotalXP(transactions) {
        return transactions
            .filter(t => t.type === 'xp')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    /**
     * Create a timeline of XP transactions
     * 
     * Transforms XP transactions into a chronological timeline format
     * suitable for time-series visualizations.
     * 
     * @private
     * @param {Array<Object>} transactions - Array of user transactions
     * @returns {Array<Object>} - Formatted timeline entries with date and amount
     */
    createTimeline(transactions) {
        console.log("Creating timeline from transactions:", transactions);
        return transactions
            .filter(t => t.type === 'xp')
            .map(xp => ({
                date: new Date(xp.createdAt),
                amount: xp.amount,
                originEventId: xp.originEventId
            }));
    }
    
    /**
     * Group XP transactions by path
     * 
     * Aggregates XP amounts by project path to show distribution
     * of XP across different projects or learning paths.
     * 
     * @private
     * @param {Array<Object>} transactions - Array of user transactions
     * @returns {Object} - Map of paths to their total XP amounts
     */
    groupXPByPath(transactions) {
        return transactions
            .filter(t => t.type === 'xp')
            .reduce((acc, t) => {
                const path = t.path || 'Unknown';
                acc[path] = (acc[path] || 0) + t.amount;
                return acc;
            }, {});
    }
    
    /**
     * Get the user's current level
     * 
     * Determines the user's highest level from level transactions.
     * 
     * @private
     * @param {Array<Object>} transactions - Array of user transactions
     * @returns {number} - User's current level
     */
    getCurrentLevel(transactions) {
        const levelTransactions = transactions
            .filter(t => t.type === 'level')
            .sort((a, b) => b.amount - a.amount);
        return levelTransactions[0]?.amount || 0;
    }
    
    /**
     * Process raw user data from GraphQL
     * 
     * Legacy method for transforming user data. Maintained for
     * backward compatibility but may be deprecated in future versions.
     * 
     * @deprecated Use the structured return from getUserProfile() instead
     * @param {Object} data - Raw GraphQL response data
     * @returns {Object} - Processed user profile object
     */
    processUserData(data) {
        const user = data.user[0];
        console.log(user)
        return {
            basicInfo: {
                campus: user.campus,
                login: user.login,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            },
            auditInfo: {
                ratio: user.auditRatio,
                totalUp: user.totalUp,
                totalDown: user.totalDown
            },
            xpInfo: {
                totalXP: user.xps.reduce((sum, xp) => sum + xp.amount, 0),
                xpByPath: user.xps.reduce((acc, xp) => {
                    acc[xp.path] = xp.amount;
                    return acc;
                }, {})
            },
            progressInfo: {
                totalProjects: user.progressesByPath.length,
                succeededProjects: user.progressesByPath.filter(p => p.succeeded).length,
                projectDetails: user.progressesByPath
            },
            level: user.transactions[0]?.amount || 0,
            attributes: user.attrs
        };
    }
    
    /**
     * Process XP statistics from transactions
     * 
     * Legacy method for XP data processing. Maintained for
     * backward compatibility but may be deprecated in future versions.
     * 
     * @deprecated Use the structured return from getUserProfile() instead
     * @param {Array<Object>} transactions - Array of user transactions
     * @returns {Object} - Processed XP statistics
     */
    processXPStats(transactions) {
        const xpTransactions = transactions.filter(t => t.type === 'xp');
        return {
            totalXP: xpTransactions.reduce((sum, t) => sum + t.amount, 0),
            xpByProject: this.groupByPath(xpTransactions),
            xpTimeline: this.createTimeline(xpTransactions)
        };
    }
    
    /**
     * Process audit statistics from transactions
     * 
     * Legacy method for audit data processing. Maintained for
     * backward compatibility but may be deprecated in future versions.
     * 
     * @deprecated Use the structured return from getUserProfile() instead
     * @param {Array<Object>} transactions - Array of user transactions
     * @returns {Object} - Processed audit statistics
     */
    processAuditStats(transactions) {
        const upVotes = transactions.filter(t => t.type === 'up')
            .reduce((sum, t) => sum + t.amount, 0);
        const downVotes = transactions.filter(t => t.type === 'down')
            .reduce((sum, t) => sum + t.amount, 0);
        
        return {
            upVotes,
            downVotes,
            ratio: upVotes / (upVotes + downVotes) || 0
        };
    }
}
