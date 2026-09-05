/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
        "colors": {
            "on-error-container": "#93000a",
            "primary-fixed": "#89f5e7",
            "surface-bright": "#f9f9ff",
            "primary-container": "#008378",
            "on-surface-variant": "#3d4947",
            "surface-container-low": "#f0f3ff",
            "on-error": "#ffffff",
            "on-secondary-fixed-variant": "#005046",
            "tertiary-fixed-dim": "#bcc9c6",
            "secondary-fixed": "#96f3e1",
            "on-primary": "#ffffff",
            "on-tertiary-container": "#f3fffc",
            "error-container": "#ffdad6",
            "secondary-fixed-dim": "#7ad7c6",
            "tertiary": "#525e5c",
            "tertiary-fixed": "#d8e5e2",
            "outline-variant": "#bcc9c6",
            "outline": "#6d7a77",
            "surface-container": "#e7eeff",
            "primary": "#00685f",
            "on-background": "#111c2d",
            "on-tertiary": "#ffffff",
            "on-secondary-container": "#007164",
            "background": "#f9f9ff",
            "on-primary-fixed-variant": "#005049",
            "surface-container-lowest": "#ffffff",
            "on-secondary-fixed": "#00201b",
            "error": "#ba1a1a",
            "surface-container-high": "#dee8ff",
            "inverse-surface": "#263143",
            "surface-variant": "#d8e3fb",
            "on-primary-fixed": "#00201d",
            "surface": "#f9f9ff",
            "primary-fixed-dim": "#6ae8da",
            "secondary-container": "#bcece1",
            "on-secondary": "#ffffff",
            "on-primary-container": "#00f0dd",
            "on-tertiary-fixed": "#00201d",
            "secondary": "#006b5e",
            "surface-dim": "#d9dae0",
            "inverse-primary": "#6ae8da",
            "tertiary-container": "#d8e5e2",
            "on-tertiary-fixed-variant": "#374341",
            "surface-container-highest": "#e2e6ff"
        },
        "fontFamily": {
            "headline-lg": ["Manrope", "sans-serif"],
            "headline-md": ["Manrope", "sans-serif"],
            "headline-sm": ["Manrope", "sans-serif"],
            "title-lg": ["Inter", "sans-serif"],
            "title-md": ["Inter", "sans-serif"],
            "title-sm": ["Inter", "sans-serif"],
            "label-lg": ["Inter", "sans-serif"],
            "label-md": ["Inter", "sans-serif"],
            "label-sm": ["Inter", "sans-serif"],
            "body-lg": ["Inter", "sans-serif"],
            "body-md": ["Inter", "sans-serif"],
            "body-sm": ["Inter", "sans-serif"]
        },
        spacing: {
            "xs": "4px",
            "sm": "8px",
            "md": "16px",
            "lg": "24px",
            "xl": "32px",
            "xxl": "48px"
        }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
