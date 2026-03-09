/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#1d8cf8",
                "primary-dark": "#1666c1",
                "background-light": "#f8f9fa",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            boxShadow: {
                'glow': '0 0 0 4px rgba(29, 140, 248, 0.15)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
                'card-enterprise': '0 20px 40px -12px rgba(0, 0, 0, 0.08)',
                'btn-glow': '0 10px 25px -5px rgba(29, 140, 248, 0.4)',
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
