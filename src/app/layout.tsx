import "~/styles/globals.css"

import { type Metadata } from "next"
import { Geist } from "next/font/google"

import { TRPCReactProvider } from "~/lib/api/trpc/react"

export const metadata: Metadata = {
	title: "URL shortener migration test",
	description:
		"This is a basic URL shortener with performance optimizations intentionally omitted. This is used for testing zero-downtime database migrations.",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
}

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
})

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`}>
			<body>
				<TRPCReactProvider>{children}</TRPCReactProvider>
			</body>
		</html>
	)
}
