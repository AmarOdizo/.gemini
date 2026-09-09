# Implement PetCare 3D Veterinary Platform in React

This document outlines the implementation plan for converting the "PetCare 3D Veterinary Platform" into a fully functional React application in a new directory named `LunchPetcare`. 

## User Review Required

> [!IMPORTANT]
> Please review this plan. Once you approve it, I will proceed with creating the React application and migrating the HTML/Tailwind/Three.js code into React components.

## Proposed Changes

### Setup and Infrastructure

1.  **Initialize React App**: Create a new React application using Vite in `C:\Users\VICTUS\.gemini\antigravity-ide\scratch\LunchPetcare`.
2.  **Install Dependencies**: 
    - `react`, `react-dom`, `react-router-dom` (for routing).
    - `tailwindcss`, `postcss`, `autoprefixer` (for styling).
    - `three` (for the 3D scene integration).
3.  **Configure Tailwind CSS**: Extract the custom Tailwind configuration (colors like `primary`, `surface-container`, `on-surface`, and fonts like `Manrope`, `Outfit`) from the Stitch design and apply it to `tailwind.config.js`.
4.  **Configure Fonts and Icons**: Update `index.html` to load the Google Fonts (Manrope, Outfit) and Material Symbols.

### Components (React)

#### [NEW] `src/App.jsx`
- Set up the main layout and basic routing.

#### [NEW] `src/components/Header.jsx`
- Migrate the fixed navigation bar containing the logo, navigation links, and "Consult a Vet" button.

#### [NEW] `src/components/Hero.jsx`
- Migrate the Hero section layout.
- Include the ambient radiance background elements.

#### [NEW] `src/components/ThreeScene.jsx`
- Create a React component to host the Three.js canvas.
- Port the vanilla Three.js script from the Stitch HTML into a `useEffect` hook to initialize the scene, camera, renderer, lights, and the 3D models (Dog, Cat, Vet, Medical Symbols) properly within the React lifecycle.
- Ensure proper cleanup of Three.js resources on component unmount.

### Styling

#### [MODIFY] `src/index.css`
- Add Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`).
- Add the base CSS overrides (`overscroll-behavior`, scrollbar hiding) from the original design.

## Verification Plan

### Automated Tests
- N/A for this visual MVP. We will rely on manual visual verification.

### Manual Verification
- Run `npm run dev` and verify that the page renders correctly on `localhost`.
- Ensure the Tailwind colors and fonts match the original Stitch design.
- Verify that the Three.js 3D scene renders and is interactive (rotates/zooms) within the Hero section.
