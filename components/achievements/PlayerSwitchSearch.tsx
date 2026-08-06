"use client"

import type { FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PlayerSearchInput } from "@/components/home/PlayerSearchInput"
import { PixelButton } from "@/components/ui/PixelButton"
import { validatePlayerQuery } from "@/lib/util/validate"

export function PlayerSwitchSearch({ currentUsername }: { currentUsername: string }) {
	const router = useRouter()
	const searchParams = useSearchParams()

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		const raw = formData.get("username")
		if (typeof raw !== "string") return

		const query = validatePlayerQuery(raw)
		const currentQuery = searchParams.toString()
		const nextUrl = `/player/${encodeURIComponent(query)}${currentQuery ? `?${currentQuery}` : ""}`
		router.push(nextUrl)
	}

	return (
		<form onSubmit={handleSubmit} className="flex gap-2 mb-2">
			<PlayerSearchInput
				key={currentUsername}
				defaultValue={currentUsername}
				autoFocus={false}
				placeholder="Switch player..."
				className="px-2.5 py-2 text-sm"
			/>
			<PixelButton type="submit" variant="grass" className="px-4 shrink-0">
				Go
			</PixelButton>
		</form>
	)
}
