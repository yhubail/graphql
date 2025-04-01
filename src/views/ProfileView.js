/**
 * ProfileView.js
 * 
 * Responsible for rendering the user profile dashboard interface.
 * Displays user information, audit ratios, and XP data visualizations.
 */

import { SVGUtils } from '../utils/SVGUtils.js';

/**
 * ProfileView class
 * Handles the rendering and interaction of the user profile dashboard.
 */
export class ProfileView {
    /**
     * Creates a new ProfileView instance.
     * @param {HTMLElement} container - The DOM element where the profile will be rendered.
     */
    constructor(container) {
        this.container = container;
        this.svgUtils = new SVGUtils();
    }

    /**
     * Renders the profile dashboard with user data.
     * @param {Object} data - The user profile data containing basicInfo, auditInfo, xpInfo, etc.
     */
    render(data) {
        // Extract and log all XP data
        console.group('All XP Data');
        console.log('Raw XP Data:', data?.xpInfo);
        console.groupEnd();
        
        // Prepare the HTML content
        this.container.innerHTML = `
            <div class="profile max-w-4xl mx-auto mt-10 p-6 bg-white bg-opacity-10 rounded-lg shadow-lg">
                <header class="profile__header flex justify-between items-center mb-4">
                    <div class="header-content">
                        <h1 class="text-2xl font-bold text-white">Welcome, ${data.basicInfo.login}</h1>
                        <p class="text-sm text-gray-300">Your Learning Journey Dashboard</p>
                    </div>
                    <button id="logout-btn" class="btn-logout bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500">Logout</button>
                </header>
                
                <div class="profile__grid grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- User Info Section -->
                    <section class="profile__info">
                        <h1 class="text-xl font-semibold text-white mb-2">User Information</h1>
                        <div class="info-card p-4 bg-white bg-opacity-20 rounded-lg shadow-md">
                        <p><strong>Basic user identification: </strong>
                            <p><strong>Email:</strong> ${data.basicInfo.email}</p>
                            <p><strong>Name:</strong> ${data.basicInfo.firstName} ${data.basicInfo.lastName}</p>
                            <p><strong>User ID:</strong> ${data.basicInfo.login}</p>
                            <p><strong>Campus:</strong> ${data.basicInfo.campus}</p>
                            <hr class="my-2 border-gray-600">
                            <p><strong>Level:</strong> ${data.level}</p>
                            <hr class="my-2 border-gray-600">
                            <p><strong>Audit</strong>
                            <p>Done: ${(data.auditInfo.totalUp / 1000000).toFixed(2)} MB  | Received: ${(data.auditInfo.totalDown / 1000000).toFixed(2)} MB</p>
                            <hr class="my-2 border-gray-600">
                        </div>
                    </section>

                    <!-- Audit Stats -->
                    <section class="profile__audit">
                        <h1 class="text-xl font-semibold text-white mb-2">Audit Performance</h1>
                        <div class="stat-card p-4 bg-white bg-opacity-20 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-white">Audit Ratio</h3>
                            <div class="audit-details text-gray-300">
                                <p>Done 🟦: ${(data.auditInfo.totalUp / 1000000).toFixed(2)} MB  | Received 🟩: ${(data.auditInfo.totalDown / 1000000).toFixed(2)} MB</p>
                                <p>Ratio: ${(data.auditInfo.ratio).toFixed(1)}%</p>
                            </div>
                            <div id="audit-ratio" class="chart-container mt-4"></div>
                        </div>
                    </section>
                    
                    <!-- XP by Project (Bahrain Module) -->
                    <section class="profile__xp-projects col-span-2">
                        <h2 class="text-xl font-semibold text-white mb-2">XP Earned by Project</h2>
                        <div id="xp-pie-chart" class="stat-card p-4 bg-white bg-opacity-20 rounded-lg shadow-md" style="height: auto;"></div>
                    </section>
                </div>
            </div>
        `;
        
        // Render the audit ratio chart
        this.svgUtils.createAuditRatioChart(data.auditInfo.totalUp, data.auditInfo.totalDown, 'audit-ratio');
        
        // Extract project data from xpByPath
        this.renderProjectPieChart(data?.xpInfo?.xpByPath || {});
        
        this.attachEventListeners();
    }

    /**
     * Renders a pie chart visualization of project XP distribution.
     * Filters projects from the Bahrain module and displays them with percentage contributions.
     * @param {Object} xpByPath - Object mapping project paths to XP amounts.
     */
    renderProjectPieChart(xpByPath) {
        const container = document.getElementById('xp-pie-chart');
        if (!container) return;
        
        // Filter for Bahrain module projects with exactly one segment after bh-module
        const projectXP = Object.entries(xpByPath)
            .filter(([path, _]) => {
                if (!path || !path.includes('/bahrain/bh-module/')) {
                    return false;
                }
                
                // Check if there's exactly one segment after bh-module
                const parts = path.split('/bahrain/bh-module/');
                if (parts.length !== 2) return false;
                
                const afterModule = parts[1];
                // Only include if there are no additional slashes (only one segment)
                return !afterModule.includes('/');
            })
            .map(([path, amount]) => {
                // Extract just the project name from the path
                const projectName = path.split('/bahrain/bh-module/')[1];
                
                return {
                    project: projectName,
                    amount: Math.round(amount / 1000), // Convert to kB
                    path: path
                };
            });
        
        // Handle empty data case
        if (projectXP.length === 0) {
            container.innerHTML = '<div class="flex h-full items-center justify-center text-white">No XP data available for Bahrain module projects</div>';
            return;
        }
        
        // Sort by amount descending
        projectXP.sort((a, b) => b.amount - a.amount);
        
        // Calculate total XP
        const totalXP = projectXP.reduce((sum, project) => sum + project.amount, 0);
        
        // Dynamically calculate SVG dimensions based on project count
        const projectCount = projectXP.length;
        const titleHeight = 60; // Space for title
        const pieChartHeight = 500; // Height needed for pie chart
        const rectHeight = 40; // Height of each rectangle
        const rectMargin = 10; // Margin between rectangles
        const rowsNeeded = Math.ceil(projectCount / 2); // Two projects per row
        const legendStartY = titleHeight + pieChartHeight; // Start legend below pie chart
        const legendHeight = rowsNeeded * (rectHeight + rectMargin);
        const totalHeight = legendStartY + legendHeight + 30; // Add padding at bottom
        
        // Create SVG with dynamic dimensions
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 1000 ${totalHeight}`);
        svg.setAttribute('class', 'w-full h-full');
        
        // Update container height dynamically - ensure it's tall enough
        container.style.height = `${totalHeight}px`;
        
        // Add title at the very top
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', '500');
        title.setAttribute('y', '40');
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('font-size', '24');
        title.setAttribute('fill', 'white');
        title.setAttribute('font-weight', 'bold');
        title.textContent = 'Project XP Distribution';
        svg.appendChild(title);
        
        // Add defs for gradients
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Create a modern color palette for up to 65 projects
        const colors = [
            // Blues
            '#3B82F6', '#60A5FA', '#2563EB', '#1D4ED8', '#3730A3',
            // Greens
            '#10B981', '#34D399', '#059669', '#047857', '#065F46',
            // Purples
            '#8B5CF6', '#A78BFA', '#7C3AED', '#6D28D9', '#5B21B6',
            // Pinks
            '#EC4899', '#F472B6', '#DB2777', '#BE185D', '#9D174D',
            // Oranges
            '#F59E0B', '#FBBF24', '#D97706', '#B45309', '#92400E',
            // Reds
            '#EF4444', '#F87171', '#DC2626', '#B91C1C', '#991B1B',
            // Teals
            '#14B8A6', '#2DD4BF', '#0D9488', '#0F766E', '#115E59',
            // Indigos
            '#6366F1', '#818CF8', '#4F46E5', '#4338CA', '#3730A3',
            // Yellows
            '#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E',
            // Limes
            '#84CC16', '#A3E635', '#65A30D', '#4D7C0F', '#3F6212',
            // Cyans
            '#06B6D4', '#22D3EE', '#0891B2', '#0E7490', '#155E75',
            // Grays
            '#6B7280', '#9CA3AF', '#4B5563', '#374151', '#1F2937',
            // Additional colors for up to 65 projects
            '#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#F59E0B'
        ];
        
        // Create gradients for each color
        colors.forEach((color, i) => {
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', `pie-gradient-${i}`);
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '100%');
            gradient.setAttribute('y2', '100%');
            
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', color);
            
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', this.darkenColor(color, 20));
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
        });
        
        // Add drop shadow filter
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'pie-shadow');
        filter.setAttribute('x', '-20%');
        filter.setAttribute('y', '-20%');
        filter.setAttribute('width', '140%');
        filter.setAttribute('height', '140%');
        
        const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
        feDropShadow.setAttribute('dx', '0');
        feDropShadow.setAttribute('dy', '3');
        feDropShadow.setAttribute('stdDeviation', '3');
        feDropShadow.setAttribute('flood-color', 'rgba(0,0,0,0.5)');
        
        filter.appendChild(feDropShadow);
        defs.appendChild(filter);
        svg.appendChild(defs);
        
        // Pie chart settings - positioned at the top
        const centerX = 500;
        const centerY = titleHeight + pieChartHeight/2; // Center vertically in the pie chart area
        const radius = 220; // Slightly smaller to fit better
        const innerRadius = 90; // For donut chart
        
        // Draw pie slices
        let startAngle = -Math.PI / 2; // Start from top
        
        projectXP.forEach((project, i) => {
            const percentage = project.amount / totalXP;
            const angleSize = percentage * Math.PI * 2;
            const endAngle = startAngle + angleSize;
            
            // Calculate points for pie slice
            const x1 = centerX + innerRadius * Math.cos(startAngle);
            const y1 = centerY + innerRadius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(startAngle);
            const y2 = centerY + radius * Math.sin(startAngle);
            const x3 = centerX + radius * Math.cos(endAngle);
            const y3 = centerY + radius * Math.sin(endAngle);
            const x4 = centerX + innerRadius * Math.cos(endAngle);
            const y4 = centerY + innerRadius * Math.sin(endAngle);
            
            // Determine if the arc is more than half a circle
            const largeArcFlag = angleSize > Math.PI ? 1 : 0;
            
            // Create path for pie slice
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `
                M ${x1} ${y1}
                L ${x2} ${y2}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x3} ${y3}
                L ${x4} ${y4}
                A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
                Z
            `);
            path.setAttribute('fill', `url(#pie-gradient-${i % colors.length})`);
            path.setAttribute('stroke', 'rgba(255, 255, 255, 0.3)');
            path.setAttribute('stroke-width', '1');
            path.setAttribute('filter', 'url(#pie-shadow)');
            path.setAttribute('data-project', project.project);
            path.setAttribute('data-amount', project.amount);
            path.setAttribute('data-percentage', Math.round(percentage * 100));
            
            // Add hover effect
            path.addEventListener('mouseenter', (e) => {
                path.setAttribute('transform', `translate(${Math.cos((startAngle + endAngle) / 2) * 10} ${Math.sin((startAngle + endAngle) / 2) * 10})`);
                path.setAttribute('stroke', 'white');
                path.setAttribute('stroke-width', '2');
                
                // Show tooltip
                const tooltip = document.getElementById('pie-tooltip');
                if (tooltip) {
                    tooltip.textContent = `${project.project}: ${Math.round(percentage * 100)}% (${project.amount} kB)`;
                    tooltip.setAttribute('x', centerX);
                    tooltip.setAttribute('y', centerY + radius + 30);
                    tooltip.setAttribute('opacity', '1');
                }
            });
            
            path.addEventListener('mouseleave', () => {
                path.setAttribute('transform', '');
                path.setAttribute('stroke', 'rgba(255, 255, 255, 0.3)');
                path.setAttribute('stroke-width', '1');
                
                // Hide tooltip
                const tooltip = document.getElementById('pie-tooltip');
                if (tooltip) {
                    tooltip.setAttribute('opacity', '0');
                }
            });
            
            svg.appendChild(path);
            
            // Add percentage label for slices that are large enough
            if (percentage > 0.03) {
                const labelAngle = startAngle + angleSize / 2;
                const labelRadius = innerRadius + (radius - innerRadius) / 2;
                const labelX = centerX + labelRadius * Math.cos(labelAngle);
                const labelY = centerY + labelRadius * Math.sin(labelAngle);
                
                const percentText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                percentText.setAttribute('x', labelX);
                percentText.setAttribute('y', labelY);
                percentText.setAttribute('text-anchor', 'middle');
                percentText.setAttribute('dominant-baseline', 'middle');
                percentText.setAttribute('font-size', '14');
                percentText.setAttribute('fill', 'white');
                percentText.setAttribute('font-weight', 'bold');
                percentText.textContent = `${Math.round(percentage * 100)}%`;
                
                svg.appendChild(percentText);
            }
            
            startAngle = endAngle;
        });
        
        // Add center circle with total XP
        const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerCircle.setAttribute('cx', centerX);
        centerCircle.setAttribute('cy', centerY);
        centerCircle.setAttribute('r', innerRadius);
        centerCircle.setAttribute('fill', 'rgba(30, 41, 59, 0.8)');
        centerCircle.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
        centerCircle.setAttribute('stroke-width', '2');
        
        svg.appendChild(centerCircle);
        
        // Add total XP text
        const totalText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        totalText.setAttribute('x', centerX);
        totalText.setAttribute('y', centerY - 15);
        totalText.setAttribute('text-anchor', 'middle');
        totalText.setAttribute('font-size', '16');
        totalText.setAttribute('fill', 'white');
        totalText.textContent = 'Total XP';
        
        const totalValue = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        totalValue.setAttribute('x', centerX);
        totalValue.setAttribute('y', centerY + 15);
        totalValue.setAttribute('text-anchor', 'middle');
        totalValue.setAttribute('font-size', '20');
        totalValue.setAttribute('fill', 'white');
        totalValue.setAttribute('font-weight', 'bold');
        totalValue.textContent = `${totalXP} kB`;
        
        svg.appendChild(totalText);
        svg.appendChild(totalValue);
        
        // Add tooltip element
        const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tooltip.setAttribute('id', 'pie-tooltip');
        tooltip.setAttribute('x', centerX);
        tooltip.setAttribute('y', centerY + radius + 30);
        tooltip.setAttribute('text-anchor', 'middle');
        tooltip.setAttribute('font-size', '16');
        tooltip.setAttribute('fill', 'white');
        tooltip.setAttribute('opacity', '0');
        tooltip.textContent = '';
        
        svg.appendChild(tooltip);
        
        // Add section title for project list
        const projectsTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        projectsTitle.setAttribute('x', '500');
        projectsTitle.setAttribute('y', legendStartY - 10);
        projectsTitle.setAttribute('text-anchor', 'middle');
        projectsTitle.setAttribute('font-size', '20');
        projectsTitle.setAttribute('fill', 'white');
        projectsTitle.setAttribute('font-weight', 'bold');
        svg.appendChild(projectsTitle);
        
        // Create two-column rectangle layout for project names
        const rectWidth = 450;
        const rectPadding = 10;
        const rectCornerRadius = 5;
        
        // Draw project rectangles in two columns
        projectXP.forEach((project, i) => {
            // Determine position (left or right column)
            const isLeftColumn = i % 2 === 0;
            const rowIndex = Math.floor(i / 2);
            
            const rectX = isLeftColumn ? 50 : 50 + rectWidth + rectMargin;
            const rectY = legendStartY + rowIndex * (rectHeight + rectMargin);
            
            // Create rectangle
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', rectX);
            rect.setAttribute('y', rectY);
            rect.setAttribute('width', rectWidth);
            rect.setAttribute('height', rectHeight);
            rect.setAttribute('rx', rectCornerRadius);
            rect.setAttribute('fill', `url(#pie-gradient-${i % colors.length})`);
            rect.setAttribute('stroke', 'rgba(255, 255, 255, 0.3)');
            rect.setAttribute('stroke-width', '1');
            rect.setAttribute('filter', 'url(#pie-shadow)');
            
            // Add hover effect
            rect.addEventListener('mouseenter', () => {
                rect.setAttribute('stroke', 'white');
                rect.setAttribute('stroke-width', '2');
                rect.setAttribute('transform', 'scale(1.02)');
                rect.setAttribute('transform-origin', `${rectX + rectWidth/2} ${rectY + rectHeight/2}`);
            });
            
            rect.addEventListener('mouseleave', () => {
                rect.setAttribute('stroke', 'rgba(255, 255, 255, 0.3)');
                rect.setAttribute('stroke-width', '1');
                rect.setAttribute('transform', '');
            });
            
            // Create project name text
            const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            nameText.setAttribute('x', rectX + rectPadding);
            nameText.setAttribute('y', rectY + rectHeight/2);
            nameText.setAttribute('dominant-baseline', 'middle');
            nameText.setAttribute('font-size', '16');
            nameText.setAttribute('fill', 'white');
            nameText.setAttribute('font-weight', 'bold');
            nameText.textContent = project.project;
            
            // Create percentage text
            const percentText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            percentText.setAttribute('x', rectX + rectWidth - rectPadding);
            percentText.setAttribute('y', rectY + rectHeight/2);
            percentText.setAttribute('text-anchor', 'end');
            percentText.setAttribute('dominant-baseline', 'middle');
            percentText.setAttribute('font-size', '16');
            percentText.setAttribute('fill', 'white');
            percentText.textContent = `${Math.round((project.amount / totalXP) * 100)}% (${project.amount} kB)`;
            
            svg.appendChild(rect);
            svg.appendChild(nameText);
            svg.appendChild(percentText);
        });
        
        container.innerHTML = '';
        container.appendChild(svg);
    }

    /**
     * Darkens a hex color by a specified percentage.
     * Used for creating color gradients in the visualization.
     * @param {string} color - Hex color code (e.g. '#3B82F6')
     * @param {number} percent - Percentage to darken (0-100)
     * @returns {string} - Darkened hex color
     */
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        
        return '#' + (
            0x1000000 +
            (R < 0 ? 0 : R) * 0x10000 +
            (G < 0 ? 0 : G) * 0x100 +
            (B < 0 ? 0 : B)
        ).toString(16).slice(1);
    }

    /**
     * Attaches event listeners to interactive elements in the profile.
     * Currently handles the logout button click event.
     */
    attachEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                const event = new CustomEvent('auth:logout');
                window.dispatchEvent(event);
            });
        }
    }
}