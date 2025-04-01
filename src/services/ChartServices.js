/**
 * Chart Services
 * 
 * Provides utility methods for creating and manipulating SVG-based charts
 * throughout the application. Handles common chart operations like
 * formatting, dimension calculations, and SVG element creation.
 * 
 * @module services/ChartServices
 */
import { config } from '../config/config.js';

/**
 * ChartServices class
 * 
 * Static utility class that encapsulates SVG chart creation functionality.
 * Used by various components to generate consistent data visualizations.
 */
export class ChartServices {
    /**
     * Format a decimal value as a percentage string
     * 
     * Converts a decimal value (0-1) to a percentage string with % symbol.
     * 
     * @param {number} value - Decimal value to format (e.g., 0.75)
     * @returns {string} - Formatted percentage string (e.g., "75%")
     * 
     * @example
     * // Returns "75%"
     * ChartServices.formatPercentage(0.75)
     */
    static formatPercentage(value) {
        return `${Math.round(value * 100)}%`;
    }

    /**
     * Calculate SVG chart dimensions based on a ratio
     * 
     * Used primarily for circular progress indicators to determine
     * the stroke-dasharray value based on a completion ratio.
     * 
     * @param {number} ratio - Ratio value between 0 and 1
     * @param {number} [total=config.charts.dimensions.circleCircumference] - Total circumference value
     * @returns {string} - Formatted SVG dimension string (e.g., "141 188")
     */
    static calculateChartDimensions(ratio, total = config.charts.dimensions.circleCircumference) {
        return `${ratio * total} ${total}`;
    }

    /**
     * Create an SVG element with the proper namespace
     * 
     * Helper method to create SVG elements that handles the SVG namespace
     * requirements automatically.
     * 
     * @param {string} type - Type of SVG element to create (e.g., 'circle', 'text', 'path')
     * @returns {SVGElement} - The created SVG element
     */
    static createSVGElement(type) {
        return document.createElementNS('http://www.w3.org/2000/svg', type);
    }

    /**
     * Set up a base SVG container with standard attributes
     * 
     * Creates an SVG element with consistent viewBox and class settings
     * to serve as a container for chart elements.
     * 
     * @returns {SVGElement} - Configured SVG element ready for chart components
     */
    static setupBaseSVG() {
        const svg = this.createSVGElement('svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('class', 'chart-svg');
        return svg;
    }

    /**
     * Create a text element for chart labels or values
     * 
     * Generates an SVG text element with proper positioning and alignment
     * for displaying text within charts.
     * 
     * @param {string} content - Text content to display
     * @param {number} [x=50] - X-coordinate for text positioning (center of viewBox by default)
     * @param {number} [y=50] - Y-coordinate for text positioning (center of viewBox by default)
     * @returns {SVGTextElement} - Configured SVG text element
     */
    static createChartText(content, x = 50, y = 50) {
        const text = this.createSVGElement('text');
        text.setAttribute('x', x.toString());
        text.setAttribute('y', y.toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.textContent = content;
        return text;
    }
}