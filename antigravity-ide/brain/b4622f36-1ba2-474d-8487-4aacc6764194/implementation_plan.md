# Connect Frontend to Backend and Deploy to Vercel & Render

This plan outlines the steps required to replace all hardcoded API URLs in the frontend with dynamic environment variables, configure the backend CORS, and deploy the applications to Vercel and Render.

## User Review Required

> [!IMPORTANT]
> Since deployment requires authentication with Vercel and Render, I will need you to authenticate in your terminal, provide an API token, or I can guide you to push the code to a GitHub repository that is connected to Render and Vercel. 
> Please let me know your preferred deployment method in the Open Questions below.

## Open Questions

> [!WARNING]
> 1. **Authentication for Deployment**: Do you have the Vercel CLI installed and authenticated? For Render, do you have a `render.yaml` setup to deploy from a Git repository, or do you want me to try deploying using a Render deploy hook/API key? The easiest approach is typically pushing to a GitHub repo linked to both services.
> 2. **MongoDB Database**: Ensure your MongoDB cluster allows connections from anywhere (0.0.0.0/0) so Render can connect to it. Are your MongoDB connection string and credentials ready for production?

## Proposed Changes

### Frontend Modifications (`C:\Users\VICTUS\.gemini\antigravity-ide\scratch\petcare-react`)

- Create or update `.env` to include `VITE_API_URL`.
- Modify all frontend pages/components to replace `http://localhost:5000` with `import.meta.env.VITE_API_URL || 'http://localhost:5000'`.
- Ensure all fetch/axios requests point to the new dynamic URL.

### Backend Modifications (`C:\Users\VICTUS\.gemini\API`)

- Update `server.js` to configure `cors({ origin: process.env.FRONTEND_URL || '*' })`.
- Ensure the Render start script (`node server.js`) is correctly defined in `package.json`.

## Verification Plan

### Automated Tests
- Build the frontend locally using `npm run build` to ensure no errors.
- Run the backend locally and test connection using the updated frontend URL configuration.

### Manual Verification
- Deploy backend to Render and verify its health endpoint.
- Deploy frontend to Vercel and test CRUD operations (GET, POST, PUT, DELETE) against the live Render backend.
- Ensure the production Vercel frontend URL is added as an environment variable to the Render backend for CORS.
