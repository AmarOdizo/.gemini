# PetCare 3D Veterinary Platform - React Migration Plan

## Goal
Implement the "PetCare 3D Veterinary Platform" from the provided Stitch project (`12003348063379613353`) as a fully functional React application in a new directory named `PatCareLunch`. The application will replicate the UI, design system, and the 3D Three.js scene found in the generated HTML.

## Open Questions
- Do you have a preference for any specific routing library (e.g., `react-router-dom`) or state management? (By default, I'll build it as a single-page app layout matching the provided design).
- Would you like the Three.js script to remain as an embedded vanilla JS block, or should I refactor it into a React-friendly component using `@react-three/fiber`? (I will use vanilla `three.js` inside a React `useEffect` for fastest exact replication by default).

## Proposed Changes

### Setup Project
- Run `npx -y create-vite@latest PatCareLunch --template react` in the scratch directory.
- Install `tailwindcss`, `postcss`, and `autoprefixer` and initialize tailwind config.
- Install `three` for the 3D scene.

### `PatCareLunch/tailwind.config.js`
- Migrate the custom theme configuration from the HTML `<script id="tailwind-config">` to the `tailwind.config.js` file.

### `PatCareLunch/src/index.css`
- Configure Tailwind directives and global styles.

### `PatCareLunch/src/components/`
Break down the main page into reusable React components:
- `Header.jsx`: Top navigation bar.
- `HeroSection.jsx`: The 3D scene background and the main hero content.
- `ThreeJsScene.jsx`: A React component wrapping the provided Three.js code logic to render the stylized dog and cat, vet avatar, and interactive orbit controls.
- `HowItWorksSection.jsx`: The 3-step journey section.
- `TelemetrySection.jsx`: Pet health telemetry and vitals UI.

### `PatCareLunch/src/App.jsx`
- Assemble the components to build the main launch page.

## Verification Plan
1. Start the React development server.
2. Verify that the application successfully renders without errors.
3. Ensure the Tailwind CSS styling matches the provided design exactly, including typography, colors, and layout.
4. Test the 3D Three.js interactive canvas to confirm it renders the stylized pets and responds to drag/zoom controls.
