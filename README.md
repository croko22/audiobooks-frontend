# Audiobooks Frontend

A web application for managing and consuming audiobook content. This application provides a user interface for uploading documents, generating audio summaries, and managing an audiobook library.

## Technical Stack

- React Router for application routing and server-side rendering
- TypeScript for type safety and improved developer experience
- Bun as the JavaScript runtime and package manager
- CSS for styling and visual design

## Features

- Document upload supporting multiple formats (PDF, EPUB, TXT)
- Audio summary generation and processing
- Library management for audiobook content
- Job status tracking for asynchronous operations
- Responsive design for various screen sizes

## Prerequisites

- Bun installed on your system
- Node.js (version 18 or higher recommended)
- Access to the backend API service

## Installation

Install project dependencies:

```bash
bun install
```

## Configuration

Create a `.env.local` file in the project root with the following variables:

```bash
API_BASE_URL=http://localhost:8000
```

Adjust the API base URL according to your backend deployment.

## Development

Start the development server:

```bash
bun dev
```

The application will be available at `http://localhost:5173`.

## Building for Production

Create an optimized production build:

```bash
bun run build
```

The build output will be generated in the `build` directory:

```
├── build/
│   ├── client/    # Static client assets
│   └── server/    # Server-side rendering code
```

## Deployment

### Docker Deployment

Build and run the application using Docker:

```bash
docker build -t audiobooks-frontend .
docker run -p 3000:3000 audiobooks-frontend
```

Supported deployment platforms:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### Manual Deployment

For traditional Node.js hosting environments, deploy the contents of the `build` directory along with:

- `package.json`
- `bun.lockb`

Ensure the production environment has access to the required API endpoints.

## Project Structure

```
├── app/                # Application source code
│   ├── routes/        # Route components and logic
│   ├── components/    # Reusable UI components
│   ├── utils/         # Utility functions and API clients
│   └── root.tsx       # Application root component
├── public/            # Static assets
└── build/             # Production build output
```

## License

All rights reserved.
