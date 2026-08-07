import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import { MINECRAFT_PLUS_RAISE_EM } from "@/lib/font/minecraft-metrics";

function glyphCenterY(glyph: opentype.Glyph): number {
	const { y1, y2 } = (
		glyph as unknown as { getBoundingBox: () => { y1: number; y2: number } }
	).getBoundingBox();
	return (y2 + y1) / 2;
}

describe("minecraft font plus alignment", () => {
	it("matches glyph metrics from minecraft.ttf", () => {
		const fontPath = path.join(process.cwd(), "public/fonts/minecraft.ttf");
		const buffer = fs.readFileSync(fontPath);
		const exactBuffer = buffer.buffer.slice(
			buffer.byteOffset,
			buffer.byteOffset + buffer.byteLength,
		);
		const font = opentype.parse(exactBuffer);
		const m = font.charToGlyph("M");
		const plus = font.charToGlyph("+");
		const expected =
			(glyphCenterY(m) - glyphCenterY(plus)) / font.unitsPerEm;
		expect(MINECRAFT_PLUS_RAISE_EM).toBeCloseTo(expected, 5);
	});
});
