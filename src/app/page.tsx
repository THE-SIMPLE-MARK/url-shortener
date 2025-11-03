import { HydrateClient } from "~/lib/api/trpc/utils/prefetch"
import { UrlShortener } from "~/components/urlShortener"

export default async function Home() {
	return (
		<HydrateClient>
			<main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-[#2e026d] to-[#15162c] text-white">
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
					<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
						URL <span className="text-[hsl(280,100%,70%)]">Shortener</span>
					</h1>

					<UrlShortener />
				</div>
			</main>
		</HydrateClient>
	)
}
