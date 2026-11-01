import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Header, Footer } from '@/components/ui';
import './globals.css';
const inter = localFont({ src: [{ path: './fonts/Inter-Regular.ttf', weight: '400' }, { path: './fonts/Inter-Medium.ttf', weight: '500' }, { path: './fonts/Inter-SemiBold.ttf', weight: '600' }, { path: './fonts/Inter-Bold.ttf', weight: '700' }], variable: '--font-inter', display: 'swap' });
export const metadata: Metadata = { title: { default: 'myColors — Life’s too short for boring colors.', template: '%s · myColors' }, description: 'Your everyday color toolkit. Create palettes, extract colors from photos, build light and dark themes, check contrast, and play with color. Free, private, and made for everyone.' };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en" data-scroll-behavior="smooth" className={inter.variable} suppressHydrationWarning><body><a href="#main" className="skip-link">Skip to content</a><Header />{children}<Footer /></body></html>; }
