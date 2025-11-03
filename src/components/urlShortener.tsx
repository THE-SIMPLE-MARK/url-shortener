"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTRPC } from "~/lib/api/trpc/react"
import { getBaseURL } from "~/data/baseURL"

export function UrlShortener() {
	const api = useTRPC()
	const queryClient = useQueryClient()
	const [userName, setUserName] = useState("")
	const [urlToShorten, setUrlToShorten] = useState("")
	const [searchedUser, setSearchedUser] = useState<string>("")
	const [deletingUrlId, setDeletingUrlId] = useState<string | null>(null)

	const { data: user, isLoading: isLoadingUser } = useQuery({
		...api.url.getUserByName.queryOptions({ name: searchedUser }),
		enabled: searchedUser.length > 0,
	})

	const { data: urls = [] } = useQuery({
		...api.url.getUserUrls.queryOptions({ userId: user?.id ?? "" }),
		enabled: !!user?.id,
	})

	const createUser = useMutation(
		api.url.createUser.mutationOptions({
			onSuccess: () => {
				setSearchedUser(userName)
				void queryClient.invalidateQueries(api.url.getUserByName.queryFilter())
			},
		})
	)

	const createUrl = useMutation(
		api.url.createUrl.mutationOptions({
			onSuccess: () => {
				setUrlToShorten("")
				void queryClient.invalidateQueries(api.url.getUserUrls.queryFilter())
			},
		})
	)

	const deleteUrl = useMutation(
		api.url.deleteUrl.mutationOptions({
			onSuccess: () => {
				setDeletingUrlId(null)
				void queryClient.invalidateQueries(api.url.getUserUrls.queryFilter())
			},
			onError: () => {
				setDeletingUrlId(null)
			},
		})
	)

	function handleDeleteUrl(urlId: string) {
		setDeletingUrlId(urlId)
		deleteUrl.mutate({ urlId })
	}

	function handleSearchUser(e: React.FormEvent) {
		e.preventDefault()
		if (userName.trim().length === 0) return

		setSearchedUser(userName.trim())
	}

	function handleAddUrl(e: React.FormEvent) {
		e.preventDefault()
		if (!user?.id || !urlToShorten.trim()) return

		createUrl.mutate({
			originalUrl: urlToShorten.trim(),
			creatorId: user.id,
		})
	}

	function handleCreateUser() {
		if (userName.trim().length === 0) return

		createUser.mutate({ name: userName.trim() })
	}

	function getShortUrl(shortId: string) {
		const baseURL = getBaseURL()
		return `${baseURL}/s/${shortId}`
	}

	const canAddUrl = !!user?.id && urlToShorten.trim().length > 0
	const showCreateUserButton =
		searchedUser.length > 0 && !user && !isLoadingUser

	const shouldShowURLField = Boolean(user)
	const shouldShowTable = user?.id && urls.length > 0
	const shouldShowNoURLsMessage = Boolean(user) && urls.length === 0

	return (
		<div className="w-full max-w-2xl space-y-6">
			<form onSubmit={handleSearchUser} className="flex flex-col gap-2">
				<label htmlFor="userName" className="text-lg font-semibold">
					User Name
				</label>
				<div className="flex gap-2">
					<input
						id="userName"
						type="text"
						placeholder="Enter user name"
						value={userName}
						onChange={e => setUserName(e.target.value)}
						className="flex-1 rounded-full bg-white/10 px-4 py-2 text-white placeholder:text-white/50"
					/>
					<button
						type="submit"
						className="rounded-full bg-white/10 px-6 py-2 font-semibold transition hover:bg-white/20"
						disabled={userName.trim().length === 0}
					>
						Search
					</button>
				</div>

				{showCreateUserButton && (
					<button
						type="button"
						onClick={handleCreateUser}
						className="self-start rounded-full bg-blue-500/20 px-6 py-2 font-semibold transition hover:bg-blue-500/30 disabled:opacity-50"
						disabled={createUser.isPending || userName.trim().length === 0}
					>
						{createUser.isPending ? "Creating..." : "Add User"}
					</button>
				)}
			</form>

			{shouldShowURLField && (
				<form onSubmit={handleAddUrl} className="flex flex-col gap-2">
					<label htmlFor="urlToShorten" className="text-lg font-semibold">
						URL to Shorten
					</label>
					<div className="flex gap-2">
						<input
							id="urlToShorten"
							type="url"
							placeholder="https://example.com"
							value={urlToShorten}
							onChange={e => setUrlToShorten(e.target.value)}
							className="flex-1 rounded-full bg-white/10 px-4 py-2 text-white placeholder:text-white/50"
						/>

						<button
							type="submit"
							className="rounded-full bg-white/10 px-6 py-2 font-semibold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={!canAddUrl || createUrl.isPending}
						>
							{createUrl.isPending ? "Adding..." : "Add"}
						</button>
					</div>
				</form>
			)}

			{shouldShowTable && (
				<div className="flex flex-col gap-2">
					<h2 className="text-lg font-semibold">Your URLs</h2>
					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr className="border-b border-white/20">
									<th className="px-4 py-2 text-left">Original URL</th>
									<th className="px-4 py-2 text-left">Short URL</th>
									<th className="px-4 py-2 text-left">Actions</th>
								</tr>
							</thead>
							<tbody>
								{urls.map(url => (
									<tr
										key={url.id}
										className="border-b border-white/10 hover:bg-white/5"
									>
										<td className="px-4 py-2">
											<a
												href={url.originalUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="block max-w-xs truncate text-blue-300 hover:underline"
											>
												{url.originalUrl}
											</a>
										</td>
										<td className="px-4 py-2">
											<a
												href={getShortUrl(url.shortId)}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-300 hover:underline"
											>
												{getShortUrl(url.shortId)}
											</a>
										</td>
										<td className="px-4 py-2">
											<button
												onClick={() => handleDeleteUrl(url.id)}
												className="rounded-full bg-red-500/20 px-4 py-1 text-sm font-semibold transition hover:bg-red-500/30 disabled:opacity-50"
												disabled={deletingUrlId === url.id}
											>
												{deletingUrlId === url.id ? "Deleting..." : "Remove"}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{shouldShowNoURLsMessage && (
				<p className="text-white/70">No URLs yet. Add one above!</p>
			)}
		</div>
	)
}
