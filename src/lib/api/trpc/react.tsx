"use client"

import { type QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { loggerLink, httpBatchLink, createTRPCClient } from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server"
import { useState, type ReactNode } from "react"
import SuperJSON from "superjson"
import { type AppRouter } from "~/lib/api/trpc/root"
import { createQueryClient } from "./utils/queryClientFactory"
import { getBaseURL } from "~/data/baseURL"
import env from "~/env"

let clientQueryClientSingleton: QueryClient | undefined = undefined
function getQueryClient() {
	if (typeof window === "undefined") {
		// server: always make a new query client
		return createQueryClient()
	}
	// browser: use singleton pattern to keep the same query client
	return (clientQueryClientSingleton ??= createQueryClient())
}

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>

export function TRPCReactProvider(props: { children: Readonly<ReactNode> }) {
	const queryClient = getQueryClient()

	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			links: [
				loggerLink({
					enabled: op =>
						env.NODE_ENV === "development" ||
						(op.direction === "down" && op.result instanceof Error),
				}),
				httpBatchLink({
					transformer: SuperJSON,
					url: getBaseURL() + "/api/trpc",
					headers: () => {
						const headers = new Headers()
						headers.set("x-trpc-source", "nextjs-react")
						return headers
					},
				}),
			],
		})
	)

	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{props.children}
			</TRPCProvider>
		</QueryClientProvider>
	)
}
