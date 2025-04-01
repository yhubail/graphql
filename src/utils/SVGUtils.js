/**
 * SVG Utilities
 * 
 * Provides a comprehensive set of utilities for creating and manipulating SVG-based
 * data visualizations throughout the application. This utility class handles the
 * creation of various chart types including progress charts, ratio charts, and
 * distribution visualizations.
 * 
 * @module utils/SVGUtils
 * @author Your Name
 * @version 1.0.0
 */
import { config } from '../config/config.js';

/**
 * SVGUtils class
 * 
 * Utility class for SVG chart generation and manipulation.
 * Encapsulates SVG creation logic to provide consistent visualization
 * components across the application.
 */
export class SVGUtils {
    /**
     * Initialize the SVG utilities
     * 
     * Sets up the color palette for various chart types and visualization states.
     * These colors are used consistently across all generated charts.
     */
    constructor() {
        /**
         * Color palette for various chart types and states
         * @type {Object}
         * @property {string} primary - Main brand color for primary elements
         * @property {string} success - Color for successful/positive indicators
         * @property {string} error - Color for error/negative indicators
         * @property {string} warning - Color for warning/caution indicators
         * @property {string} info - Color for informational elements
         * @property {string} secondary - Secondary brand color for supporting elements
         */
        this.colors = {
            primary: '#3498db',
            success: '#2ecc71',
            error: '#e74c3c',
            warning: '#f1c40f',
            info: '#9b59b6',
            secondary: '#1abc9c'
        };
    }

    /**
     * Create a horizontal progress chart
     * 
     * Generates a horizontal bar chart showing the pass/fail ratio as colored segments.
     * Used primarily for visualizing success rates in projects or assessments.
     * 
     * @param {Object} progressStats - Statistics about progress
     * @param {number} progressStats.passRate - Ratio of passed items (0-1)
     * @param {string} containerId - DOM element ID where the chart will be rendered
     * @returns {void}
     */
    createProgressChart(progressStats, containerId) {
        const container = document.getElementById(containerId);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 50');
        
        // Add bars for passed/failed projects
        const passedBar = this.createBar(10, 10, progressStats.passRate * 80, 10, 
            config.charts.colors.success);
        const failedBar = this.createBar(10 + (progressStats.passRate * 80), 10, 
            (1 - progressStats.passRate) * 80, 10, config.charts.colors.error);
        
        svg.appendChild(passedBar);
        svg.appendChild(failedBar);
        container.appendChild(svg);
    }

    /**
     * Create an SVG rectangle/bar element
     * 
     * Helper method to generate SVG rectangle elements with specified dimensions and styling.
     * Used as building blocks for various chart types.
     * 
     * @param {number} x - X-coordinate of the rectangle
     * @param {number} y - Y-coordinate of the rectangle
     * @param {number} width - Width of the rectangle
     * @param {number} height - Height of the rectangle
     * @param {string} color - Fill color for the rectangle
     * @returns {SVGRectElement} - The created SVG rectangle element
     */
    createBar(x, y, width, height, color) {
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('x', x);
        bar.setAttribute('y', y);
        bar.setAttribute('width', width);
        bar.setAttribute('height', height);
        bar.setAttribute('fill', color);
        return bar;
    }

    /**
     * Create an audit ratio chart
     * 
     * Generates a bar chart comparing upvotes to downvotes in audit activities.
     * Visualizes the balance between positive and negative feedback.
     * 
     * @param {number} up - Count of upvotes/positive ratings
     * @param {number} down - Count of downvotes/negative ratings
     * @param {string} containerId - DOM element ID where the chart will be rendered
     * @returns {void}
     */
    createAuditRatioChart(up, down, containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = ''; // Clear any existing content
        }

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('class', 'chart-svg');

        const keys = [up, down];
        const maxAttributeValue = Math.max(...keys);
        const barWidth = 100 / keys.length;

        keys.forEach((key, index) => {
            const barHeight = (key / maxAttributeValue) * 100;
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', index * barWidth);
            rect.setAttribute('y', 100 - barHeight);
            rect.setAttribute('width', barWidth - 2); // Add some spacing between bars
            rect.setAttribute('height', barHeight);
            rect.setAttribute('fill', index === 0 ? "skyblue" : "lightgreen");

            svg.appendChild(rect);
        });

        container.appendChild(svg);
    }

    /**
     * Create a pass/fail chart
     * 
     * Generates a horizontal bar chart showing the ratio of passed to failed items.
     * Includes a percentage text indicator for quick assessment.
     * 
     * @param {Array<Object>} progressData - Array of progress items
     * @param {boolean} progressData[].succeeded - Whether each item was successful
     * @param {string} containerId - DOM element ID where the chart will be rendered
     * @returns {void}
     */
    createPassFailChart(progressData, containerId) {
        const container = document.getElementById(containerId);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('class', 'chart-svg');
    
        const passed = progressData.filter(p => p.succeeded).length;
        const total = progressData.length;
        const ratio = total > 0 ? passed / total : 0;
    
        const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect1.setAttribute('x', '10');
        rect1.setAttribute('y', '10');
        rect1.setAttribute('width', `${ratio * config.charts.dimensions.barWidth}`);
        rect1.setAttribute('height', config.charts.dimensions.barHeight);
        rect1.setAttribute('fill', config.charts.colors.success);
        rect1.setAttribute('rx', '4');
    
        const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect2.setAttribute('x', `${10 + (ratio * config.charts.dimensions.barWidth)}`);
        rect2.setAttribute('y', '10');
        rect2.setAttribute('width', `${(1 - ratio) * config.charts.dimensions.barWidth}`);
        rect2.setAttribute('height', config.charts.dimensions.barHeight);
        rect2.setAttribute('fill', config.charts.colors.error);
        rect2.setAttribute('rx', '4');
    
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '50');
        text.setAttribute('y', '50');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.textContent = `${Math.round(ratio * 100)}%`;
    
        svg.appendChild(rect1);
        svg.appendChild(rect2);
        svg.appendChild(text);
        container.appendChild(svg);
    }

    /**
     * Create a level progress chart
     * 
     * Generates a simple text-based visualization of the user's current level.
     * Designed for clear and prominent display of achievement level.
     * 
     * @param {number} level - User's current level
     * @param {string} containerId - DOM element ID where the chart will be rendered
     * @returns {void}
     */
    createLevelProgressChart(level, containerId) {
        const container = document.getElementById(containerId);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('class', 'chart-svg');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '50');
        text.setAttribute('y', '50');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '24');
        text.textContent = `Level ${Math.floor(level)}`;

        svg.appendChild(text);
        container.appendChild(svg);
    }

    /**
     * Create an XP timeline chart
     * 
     * Generates a line chart showing XP accumulation over time.
     * Visualizes the user's progress and growth rate.
     * 
     * @param {Array<Object>} xpData - Array of XP data points
     * @param {number} xpData[].amount - Amount of XP for each data point
     * @param {string} containerId - DOM element ID where the chart will be rendered
     * @returns {void}
     */
    createXPTimelineChart(xpData, containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = ''; // Clear any existing content
        }

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 50');
        svg.setAttribute('class', 'chart-svg');

        const pathData = this.calculateTimelinePath(xpData);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', config.charts.colors.primary);
        path.setAttribute('fill', 'none');

        svg.appendChild(path);
        container.appendChild(svg);
    }

    /**
     * Calculate the SVG path data for a timeline chart
     * 
     * Helper method that transforms XP data points into an SVG path string.
     * Handles the mathematical conversion of data to visual coordinates.
     * 
     * @param {Array<Object>} xpData - Array of XP data points
     * @param {number} xpData[].amount - Amount of XP for each data point
     * @returns {string} - SVG path data string
     */
    calculateTimelinePath(xpData) {
        if (!xpData || xpData.length === 0) return '';

        const maxXP = Math.max(...xpData.map(d => d.amount));
        const pathData = xpData.map((d, i) => {
            const x = (i / (xpData.length - 1)) * 100;
            const y = 50 - (d.amount / maxXP) * 50;
            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
        });

        return pathData.join(' ');
    }

    /**
     * Create a project distribution chart
     * 
     * Generates a bar chart showing the distribution of projects across categories.
     * Includes interactive elements for exploring the data.
     * 
     * @param {Array<Object>} projectDetails - Array of project data
     * @param {string} projectDetails[].path - Project path/category
     * @param {boolean} projectDetails[].succeeded - Whether the project was completed successfully
     * @param {string} containerId - DOM element ID where the chart will be rendered
     * @returns {void}
     */
    createProjectDistribution(projectDetails, containerId) {
        if (!projectDetails || !containerId) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 200 100');
        svg.setAttribute('class', 'w-full h-full');

        // Group projects by category
        const categories = {};
        projectDetails.forEach(project => {
            const category = project.path.split('/')[1] || 'Other';
            if (!categories[category]) {
                categories[category] = {
                    total: 0,
                    completed: 0
                };
            }
            categories[category].total++;
            if (project.succeeded) {
                categories[category].completed++;
            }
        });

        // Create bars
        const categoryNames = Object.keys(categories);
        const barWidth = 160 / categoryNames.length;
        const spacing = 5;

        categoryNames.forEach((category, index) => {
            const x = 20 + (index * (barWidth + spacing));
            const completedHeight = (categories[category].completed / categories[category].total) * 60;

            // Create bar for completed projects
            const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bar.setAttribute('x', x);
            bar.setAttribute('y', 70 - completedHeight);
            bar.setAttribute('width', barWidth);
            bar.setAttribute('height', completedHeight);
            bar.setAttribute('fill', this.colors.success);
            bar.setAttribute('rx', '2');
            
            // Add category label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x + (barWidth / 2));
            label.setAttribute('y', '85');
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('fill', 'white');
            label.setAttribute('font-size', '8');
            label.textContent = category;

            // Add count label
            const countLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            countLabel.setAttribute('x', x + (barWidth / 2));
            countLabel.setAttribute('y', 65 - completedHeight);
            countLabel.setAttribute('text-anchor', 'middle');
            countLabel.setAttribute('fill', 'white');
            countLabel.setAttribute('font-size', '8');
            countLabel.textContent = categories[category].completed;

            // Add hover effect
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.appendChild(bar);
            group.appendChild(label);
            group.appendChild(countLabel);

            group.addEventListener('mouseenter', () => {
                bar.setAttribute('fill', this.colors.primary);
            });

            group.addEventListener('mouseleave', () => {
                bar.setAttribute('fill', this.colors.success);
            });

            svg.appendChild(group);
        });

        // Add title
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', '100');
        title.setAttribute('y', '15');
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('fill', 'white');
        title.setAttribute('font-size', '10');
        title.textContent = 'Projects by Category';

        svg.appendChild(title);
        container.appendChild(svg);
    }

    /**
     * Generate a random color
     * 
     * Utility method to create random hex color codes for dynamic visualizations.
     * Useful when the number of categories is not known in advance.
     * 
     * @returns {string} - Random hex color code
     */
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}

