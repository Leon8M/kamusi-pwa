// next.config.mjs
import withPWAInit from 'next-pwa'; // Use import for next-pwa

// Initialize withPWA. Note the .default if next-pwa exports as a default.
const withPWA = withPWAInit({
  dest: 'public', // This is the output directory for the PWA files (service worker, workbox files)
  register: true, // Register the PWA service worker
  skipWaiting: true, // Skip waiting for service worker activation
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development mode for easier debugging
  // If you want to enable default runtime caching (for assets, pages etc.), uncomment the line below.
  // Note: For runtimeCaching in ES Modules, you might need to import it separately
  // or adjust how it's required if it's a CommonJS module.
  // For simplicity, I've commented it out. If you need it, you'd do:
  // runtimeCaching: (await import('next-pwa/cache')).default,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com', 'res.cloudinary.com'],
  },
  // Add other Next.js configurations here if you have them
  // For example:
  // experimental: {
  //   serverActions: true,
  // },
};

// This is the correct way to export your Next.js configuration when using ES Module syntax
export default withPWA(nextConfig);
