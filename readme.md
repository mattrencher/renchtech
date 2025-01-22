# RenchTech API Documentation

## Overview
RenchTech is a Node.js/Express application that provides project management and community features with user authentication. The application uses MongoDB for data storage and Passport.js for authentication.

## Authentication
The application uses Passport.js with a local strategy for authentication. Users can register and login using email/password credentials.

### Base URL
- Development: `http://<IP>:<PORT>`
- Production: Depends on Azure deployment

## API Endpoints

### Authentication Routes

#### Register
```
POST /register
```
**Parameters:**
- `username` (string): User's email address
- `password` (string): User's password

**Response:**
- Redirects to `/community` on success
- Flash messages for errors

#### Login
```
POST /login
```
**Parameters:**
- `username` (string): User's email address
- `password` (string): User's password

**Response:**
- Redirects to `/community` on success
- Flash messages for errors

#### Logout
```
GET /logout
```
**Response:**
- Redirects to `/` on success

### Project Routes

#### List All Projects
```
GET /projects
```
**Response:**
- Renders project index page with all projects

#### Create New Project
```
POST /projects
```
**Parameters:**
- `title` (string): Project title
- `description` (string): Project description
- Authentication required

**Response:**
- Redirects to project show page on success
- Flash messages for errors

#### Show Project
```
GET /projects/:id
```
**Parameters:**
- `id` (string): Project ID

**Response:**
- Renders project detail page

#### Edit Project
```
PUT /projects/:id
```
**Parameters:**
- `id` (string): Project ID
- `title` (string): Updated project title
- `description` (string): Updated project description
- Authentication required
- Must be project owner

**Response:**
- Redirects to project show page on success
- Flash messages for errors

#### Delete Project
```
DELETE /projects/:id
```
**Parameters:**
- `id` (string): Project ID
- Authentication required
- Must be project owner

**Response:**
- Redirects to projects index on success
- Flash messages for errors

### Community Routes

#### View Community
```
GET /community
```
**Response:**
- Renders community page with posts

#### Create Community Post
```
POST /community
```
**Parameters:**
- `title` (string): Post title
- `content` (string): Post content
- Authentication required

**Response:**
- Redirects to community show page on success
- Flash messages for errors

### Comment Routes

#### Add Comment
```
POST /community/:id/comments
```
**Parameters:**
- `id` (string): Community post ID
- `text` (string): Comment text
- Authentication required

**Response:**
- Redirects to community post on success
- Flash messages for errors

#### Edit Comment
```
PUT /community/:id/comments/:comment_id
```
**Parameters:**
- `id` (string): Community post ID
- `comment_id` (string): Comment ID
- `text` (string): Updated comment text
- Authentication required
- Must be comment owner

**Response:**
- Redirects to community post on success
- Flash messages for errors

#### Delete Comment
```
DELETE /community/:id/comments/:comment_id
```
**Parameters:**
- `id` (string): Community post ID
- `comment_id` (string): Comment ID
- Authentication required
- Must be comment owner

**Response:**
- Redirects to community post on success
- Flash messages for errors

## Environment Variables

The application requires the following environment variables:

```
DATABASE_URL=<mongodb-connection-string>
PORT=<port-number>
IP=<ip-address>
NODE_ENV=<development|production>
```

## Deployment

The application includes Azure deployment scripts:

```bash
# Deploy to Azure
npm run "az deploy"

# Update existing deployment
npm run "az update"

# Stop the application
npm run "az stop"
```

## Security Features

1. Express-sanitizer for input sanitization
2. Session management with express-session
3. Flash messages for user notifications
4. Passport.js authentication
5. MongoDB for secure data storage

## Dependencies

Major dependencies include:
- Express.js
- Mongoose
- Passport.js
- EJS templating
- Express-session
- Connect-flash
- Moment.js

For a complete list of dependencies, please refer to `package.json`.