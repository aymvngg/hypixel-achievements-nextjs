import { describe, expect, it } from "vitest"
import { toPublicPlayerData, type PlayerData } from "@/lib/hypixel/types"

describe("toPublicPlayerData", () => {
	it("omits private achievement state from the browser DTO", () => {
		const player: PlayerData = {
			uuid: "abc123",
			nickname: "Steve",
			rank: "MVP+",
			rankPrefix: null,
			rankPlusColor: "#55FFFF",
			rankPrefixColor: "#FFAA00",
			achievementPoints: 1234,
			tieredAchievements: { example: 10 },
			oneTimeAchievements: ["example"],
		}

		expect(toPublicPlayerData(player)).toEqual({
			uuid: "abc123",
			nickname: "Steve",
			rank: "MVP+",
			rankPrefix: null,
			rankPlusColor: "#55FFFF",
			rankPrefixColor: "#FFAA00",
		})
	})
})
