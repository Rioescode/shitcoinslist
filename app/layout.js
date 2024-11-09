import { Inter } from "next/font/google";
import Navigation from "@/components/Navigation";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "./globals.css";
import ErrorBoundary from '@/components/ErrorBoundary';

const font = Inter({ subsets: ["latin"] });

export const viewport = {
	themeColor: config.colors?.main || '#7c3aed',
	width: "device-width",
	initialScale: 1,
};

export const metadata = {
	title: 'ShitcoinsList.com | Track & Analyze Meme Coins',
	description: 'Track meme coins, calculate profits, analyze volume, and convert prices. The ultimate tool for meme coin traders and investors.',
	keywords: 'shitcoins list, meme coins, dogecoin, shiba inu, pepe coin, crypto calculator, meme coin tracker',
	metadataBase: new URL('https://shitcoinslist.com'),
	openGraph: {
		title: 'ShitcoinsList.com - Ultimate Meme Coin Tracker',
		description: 'Track, analyze, and calculate meme coin profits. Real-time prices and tools.',
		url: 'https://shitcoinslist.com',
		siteName: 'ShitcoinsList.com',
		images: [
			{
				url: '/og-image.jpg',
				width: 1200,
				height: 630,
			}
		],
		locale: 'en_US',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'ShitcoinsList.com - Track & Analyze Meme Coins',
		description: 'Real-time meme coin tracking and analysis tools',
		images: ['/og-image.jpg'],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={font.className}>
				<ErrorBoundary>
					<ClientLayout>
						<Navigation />
						{children}
					</ClientLayout>
				</ErrorBoundary>
			</body>
		</html>
	);
}
