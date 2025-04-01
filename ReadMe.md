# GraphQL Profile Dashboard

A professional, data-driven web application that provides comprehensive visualization of user profile data from a GraphQL API.

## [View Live ](https://yhubail.github.io/)


## Overview

The GraphQL Profile Dashboard delivers an intuitive interface for  user indetification ,analyzing user performance metrics and project completion statistics through data visualizations.

## Key Features

- **Secure Authentication**: JWT-based authentication system with secure token management
- **Interactive Data Visualization**: Custom SVG-based charts for performance metrics
- **Project Analytics**: Visual breakdown of project completion rates and categories
- **XP Distribution Analysis**: Detailed visualization of experience point allocation
- **Audit Performance Tracking**: Comprehensive audit ratio and contribution metrics
- **Responsive Design**: Fully adaptive interface with modern glassmorphism aesthetics

## Architecture

This application implements a clean **Model-View-Controller (MVC)** architecture:

- **Model Layer**: Manages data structures, API communication, and business logic
- **View Layer**: Handles UI rendering, user interactions, and data presentation
- **Controller Layer**: Orchestrates data flow between models and views, manages application state

## Technology Stack

| Category | Technologies |
|----------|--------------|
| **Core** | Vanilla JavaScript (ES6+), HTML5, CSS3 |
| **Styling** | TailwindCSS, Custom animations, Glassmorphism UI |
| **Data Visualization** | Custom SVG charts, Interactive graphics |
| **API Communication** | GraphQL, Fetch API |
| **Authentication** | JWT (JSON Web Tokens) |
| **Deployment** | GitHub Pages |

## Project Structure

```
graphql/
├── index.html              # Application entry point
├── README.md               # Project documentation
├── src/
│   ├── controllers/        # Application controllers
│   │   ├── AuthController.js
│   │   └── ProfileController.js
│   ├── models/             # Data models
│   │   ├── Auth.js
│   │   └── User.js
│   ├── views/              # UI components
│   │   ├── LoginView.js
│   │   └── ProfileView.js
│   ├── services/           # Service layer
│   │   ├── GraphQLService.js
│   │   └── ChartServices.js
│   ├── utils/              # Utility functions
│   │   └── SVGUtils.js
│   ├── config/             # Configuration
│   │   └── config.js
│   └── public/css/         # Stylesheets
│       └── style.css
```

---

Developed by [Yusuf Ebrahim]
