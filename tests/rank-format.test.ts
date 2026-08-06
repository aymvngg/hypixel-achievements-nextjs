import { describe, it, expect } from "vitest"
import { formatRankPrefix, getNicknameColor, hasDisplayableRank, HYPIXEL_HEX } from "@/lib/util/rank-format"

describe("formatRankPrefix", () => {
	it("colors MVP+ plus sign separately from MVP text", () => {
		const segments = formatRankPrefix("MVP+")
		expect(segments.map((s) => s.text).join("")).toBe("[MVP+] ")
		expect(segments.find((s) => s.text === "+")?.color).toBe(HYPIXEL_HEX.RED)
		expect(segments.find((s) => s.text === "[MVP")?.color).toBe(HYPIXEL_HEX.AQUA)
	})

	it("merges MVP++ plus signs into one segment", () => {
		const segments = formatRankPrefix("MVP++", HYPIXEL_HEX.DARK_BLUE, HYPIXEL_HEX.GOLD)
		expect(segments.map((s) => s.text)).toEqual(["[MVP", "++", "] "])
		expect(segments[1]?.color).toBe(HYPIXEL_HEX.DARK_BLUE)
	})

	it("colors VIP+ plus sign gold", () => {
		const segments = formatRankPrefix("VIP+")
		expect(segments.find((s) => s.text === "+")?.color).toBe(HYPIXEL_HEX.GOLD)
		expect(segments.find((s) => s.text === "[VIP")?.color).toBe(HYPIXEL_HEX.GREEN)
	})
})

describe("hasDisplayableRank", () => {
	it("treats Default and empty as non-displayable", () => {
		expect(hasDisplayableRank(null)).toBe(false)
		expect(hasDisplayableRank("Default")).toBe(false)
		expect(hasDisplayableRank("MVP+")).toBe(true)
	})
})

describe("getNicknameColor", () => {
	it("uses aqua for MVP and MVP+", () => {
		expect(getNicknameColor("MVP+")).toBe(HYPIXEL_HEX.AQUA)
		expect(getNicknameColor("MVP")).toBe(HYPIXEL_HEX.AQUA)
	})

	it("uses monthly tag color for MVP++ nickname", () => {
		expect(getNicknameColor("MVP++", HYPIXEL_HEX.GOLD)).toBe(HYPIXEL_HEX.GOLD)
		expect(getNicknameColor("MVP++", HYPIXEL_HEX.AQUA)).toBe(HYPIXEL_HEX.AQUA)
		expect(getNicknameColor("MVP++")).toBe(HYPIXEL_HEX.GOLD)
	})

	it("uses gray for default players", () => {
		expect(getNicknameColor(null)).toBe(HYPIXEL_HEX.GRAY)
		expect(getNicknameColor("Default")).toBe(HYPIXEL_HEX.GRAY)
	})

	it("keeps INNIT nicknames purple", () => {
		expect(getNicknameColor("INNIT")).toBe(HYPIXEL_HEX.LIGHT_PURPLE)
	})

	it("keeps the nickname pink for PIG+++ special ranks", () => {
		expect(getNicknameColor("PIG+++", null, "§d[PIG§b+++§d]")).toBe(HYPIXEL_HEX.LIGHT_PURPLE)
	})
})
