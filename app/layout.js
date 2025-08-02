// app/layout.js
// Removed TypeScript type imports: import type { Metadata, Viewport } from 'next'; 
import { Inter, Sora } from "next/font/google"; // Your existing Google Fonts
import localFont from "next/font/local"; // Your existing localFont
import { Geist, Geist_Mono } from "next/font/google"; // Your existing Geist Fonts

import "./globals.css"; // Your global styles
import { cn } from '@/lib/utils'; // Assuming you have a utility for class names
import { Provider } from "./provider"; // Your existing Provider
import { ClerkProvider } from '@clerk/nextjs'; // Your existing ClerkProvider
import { Toaster } from "@/components/ui/sonner"; // Your existing Toaster
import SyncClerkUser from "@/components/SyncClerkUser"; // Your existing SyncClerkUser
import Script from "next/script"; // Your existing Script import

// Your existing font initializations
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-brand",
});

const unbounded = localFont({
  src: [
    {
      path: "../public/fonts/Unbounded-Bold.ttf", // make sure this file exists
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-unbounded",
  display: "swap",
});

// --- PWA Metadata & Existing Metadata Combined ---
export const metadata = {
  // Existing metadata
  title: "Kamusi AI",
  description: "App for users to generate courses with AI and learn",
  icons: {
    icon: "/logo.svg", // Your existing favicon
  },

  // PWA-specific metadata additions
  applicationName: 'Kamusi AI', // The name of the web application (for PWA)
  appleWebApp: { // Apple-specific PWA settings for iOS
    capable: true, // Enable "Add to Home Screen" on iOS
    statusBarStyle: 'default', // Status bar style when launched from home screen
    title: 'Kamusi AI', // Title displayed on the iOS home screen icon
    // startUpImage: [], // Optional: Array of objects for splash screens on iOS
  },
  formatDetection: {
    telephone: false, // Prevents iOS from auto-linking phone numbers
  },
  // Overwriting default title/description for better PWA/SEO
  title: {
    default: 'Kamusi AI - From Curiosity to Competence. Instantly.', // Default title for the app
    template: '%s | Kamusi AI', // Template for page-specific titles
  },
  description: 'Stop searching, start learning. Kamusi uses AI to build structured, personalized courses on any topic you can imagine. Your journey to mastery begins now.',
  // REMOVED: manifest: '/manifest.json', // This is now handled by app/manifest.js
  keywords: ['AI learning', 'personalized courses', 'education', 'Kamusi', 'AI tutor', 'online learning', 'PWA'],
  authors: [{ name: 'Your Name/Company' }], // Replace with actual author
  creator: 'Your Name/Company', // Replace with actual creator
  publisher: 'Your Name/Company', // Replace with actual publisher
  
  // Open Graph / Social Media Meta Tags (for sharing on platforms like Facebook, LinkedIn)
  openGraph: {
    title: 'Kamusi AI - From Curiosity to Competence. Instantly.',
    description: 'Stop searching, start learning. Kamusi uses AI to build structured, personalized courses on any topic you can imagine.',
    url: 'https://kamusi.denexsoftware.co.ke', // Your deployed application URL
    siteName: 'Kamusi AI',
    images: [
      {
        url: '/og-image.png', // Path to your Open Graph image (e.g., 1200x630 pixels)
        width: 1200,
        height: 630,
        alt: 'Kamusi AI - Personalized Learning',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Meta Tags (for sharing on Twitter)
  twitter: {
    card: 'summary_large_image', // Use 'summary_large_image' for a larger image preview
    site: '@your_twitter_handle', // Your Twitter handle (e.g., @KamusiAI)
    creator: '@your_twitter_handle', // Your Twitter handle
    title: 'Kamusi AI - From Curiosity to Competence. Instantly.',
    description: 'Stop searching, start learning. Kamusi uses AI to build structured, personalized courses on any topic you can imagine.',
    images: ['/og-image.png'], // Same as Open Graph image
  },
};

// --- PWA Viewport Configuration ---
export const viewport = {
  minimumScale: 1, // Prevents zooming out too far
  initialScale: 1, // Sets the initial zoom level
  width: 'device-width', // Matches the viewport width to the device width
  userScalable: false, // Prevents users from pinching to zoom (common for app-like experiences)
  viewportFit: 'cover', // Important for iOS notch areas, allows content to extend into safe areas
  themeColor: '#1a1a1a', // Sets the color of the browser's address bar/toolbar on mobile
};

// The RootLayout component wraps all pages in your application
export default function RootLayout({ children }) {
  return (
    <ClerkProvider> {/* Your existing ClerkProvider */}
      <html lang="en">
        <head>
          {/* Your existing Google AdSense scripts */}
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
          <Script id="adsbygoogle-init" strategy="afterInteractive">
            {`(adsbygoogle = window.adsbygoogle || []).push({});`}
          </Script>
          
          {/* PWA: Theme color meta tag (also in viewport, but good to have explicitly) */}
          <meta name="theme-color" content="#1a1a1a" />
          {/* REMOVED: <link rel="manifest" href="/manifest.json" /> - This is now automatically injected by Next.js from app/manifest.js */}
        </head>
        <body
          className={cn(
            // Your existing font variables and Tailwind classes
            `${geistSans.variable} 
            ${geistMono.variable} 
            ${inter.variable} 
            ${sora.variable} 
            ${unbounded.variable} 
            font-sans antialiased`
          )}
        >
          <Provider> {/* Your existing Provider */}
            <SyncClerkUser /> {/* Your existing SyncClerkUser */}
            {children}
          </Provider>
          <Toaster /> {/* Your existing Toaster */}
        </body>
      </html>
    </ClerkProvider>
  );
}
