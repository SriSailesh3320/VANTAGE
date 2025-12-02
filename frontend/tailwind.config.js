/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#000000",
                surface: "#0A0A0A",
                "surface-light": "#1A1A1A",
                primary: "#FFFFFF",
                accent: "#808080",
                text: "#E0E0E0",
                "text-muted": "#666666",
                border: "#262626",
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
