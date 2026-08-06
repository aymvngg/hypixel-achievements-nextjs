import { describe, expect, it } from "vitest";
import { getPlayerBadge } from "@/lib/util/special-players";

describe("getPlayerBadge", () => {
	it("returns early-tester for known early tester UUIDs", () => {
		expect(getPlayerBadge("c6b017cf334b4e1498e3a24a54b72afc")).toBe(
			"early-tester",
		);
		expect(getPlayerBadge("bc83916ce9784f56910c3db74703004d")).toBe(
			"early-tester",
		);
	});

	it("returns technoblade for Technoblade UUID", () => {
		expect(getPlayerBadge("b876ec32e396476ba1158438d83c67d4")).toBe(
			"technoblade",
		);
	});

	it("returns owner for the owner UUID", () => {
		expect(getPlayerBadge("082bfd492d274403a8bb3d807d603af4")).toBe(
			"owner",
		);
	});

	it("normalizes dashed UUIDs before matching", () => {
		expect(getPlayerBadge("c6b017cf-334b-4e14-98e3-a24a54b72afc")).toBe(
			"early-tester",
		);
		expect(getPlayerBadge("082BFD49-2D27-4403-A8BB-3D807D603AF4")).toBe(
			"owner",
		);
	});

	it("prioritizes owner over early-tester", () => {
		expect(getPlayerBadge("082bfd492d274403a8bb3d807d603af4")).toBe(
			"owner",
		);
	});

	it("returns null for unknown UUIDs", () => {
		expect(getPlayerBadge("00000000000000000000000000000000")).toBeNull();
	});
});
