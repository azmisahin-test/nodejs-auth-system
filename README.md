# Node.js User Permissions Management

This application is a Node.js-based web server that manages user permissions using Redis and PostgreSQL. Logging is handled by Winston, and the services run in containers using Docker Compose.

## Features

- **Node.js Web Server**: Built with Express.js, handles HTTP requests to manage user permissions.
- **Redis**: Used as a caching solution for fast retrieval of user permissions.
- **PostgreSQL**: Relational database for persistent storage of user information and permissions.
- **Winston Logging**: Configured for console and file outputs, with log messages formatted to include timestamps, levels, and module names.
- **Docker Compose**: Simplifies development and deployment processes by containerizing all services.

## Services

### Web
- Built with Node.js and Express.js
- Handles HTTP requests for retrieving and setting user permissions

### Redis
- Acts as a caching layer for user permissions
- Logs connection events and errors using Winston

### PostgreSQL
- Stores user information and permissions
- Logs database connection events and errors using Winston

## Logging

- **Winston** is used for logging with both console and file transports.
- Logs are formatted to include timestamps, levels, and module names.
- Log directory and file names can be configured via environment variables.

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/azmisahin-test/nodejs-auth-system.git
   cd nodejs-auth-system
