import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SettingsProvider } from "@/hooks/use-settings";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Nova AI — Cosmic AI Assistant",
  description:
    "Nova AI is a premium multilingual AI chat application (English · සිංහල · தமிழ்) powered by open-weight language models through Hugging Face Inference Providers.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06060c",
};

/**
 * Runs before hydration to apply the stored theme and avoid a flash of
 * the wrong color scheme. Static string — no user input involved.
 */
const themeInitScript = `(function(){try{var s=localStorage.getItem('nova-settings-v1');var t='dark';if(s){var p=JSON.parse(s);t=p&&p.theme?p.theme:'dark';}if(t==='system'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);var l=s?JSON.parse(s).locale:null;if(l){document.documentElement.setAttribute('lang',l);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <SettingsProvider>
          <ToastProvider>{children}</ToastProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
