import { Inter } from "next/font/google";
import Navigation from "@/components/Navigation";
import ClientLayout from "@/components/LayoutClient";
import "./globals.css";
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: 'ShitcoinsList.com | Track & Analyze Meme Coins',
	description: 'Track meme coins, calculate profits, analyze volume, and convert prices. The ultimate tool for meme coin traders and investors.',
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ErrorBoundary>
					<ClientLayout>
						<Navigation />
						<main className="flex-grow">
							{children}
						</main>
					</ClientLayout>
				</ErrorBoundary>
			</body>
		</html>
	);
}
