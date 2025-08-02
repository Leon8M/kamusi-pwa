// app/manifest.js
// This file dynamically generates your web app manifest.

export default function manifest() {
  return {
    name: "Kamusi AI",
    short_name: "Kamusi",
    description: "AI-powered personalized learning platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#1a1a1a",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    screenshots: [
      {
        src: "/screenshots/screenshot-mobile-1.png",
        sizes: "375x667",
        type: "image/png",
        form_factor: "narrow",
        label: "Home screen of Kamusi AI on mobile"
      },
      {
        src: "/screenshots/screenshot-desktop-1.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide",
        label: "Dashboard of Kamusi AI on desktop"
      }
    ]
  };
}
