import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import { MINECRAFT_PLUS_RAISE_EM } from "@/lib/font/minecraft-metrics";

function glyphCenterY(glyph: opentype.Glyph): number {
	return (glyph.yMax + glyph.yMin) / 2;
}

describe("minecraft font plus alignment", () => {
	it("matches glyph metrics from minecraft.woff", () => {
		const fontPath = path.join(process.cwd(), "app/fonts/minecraft.woff");
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
