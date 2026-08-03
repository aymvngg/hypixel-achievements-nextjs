declare module 'opentype.js' {
  export interface Glyph {
    yMin: number;
    yMax: number;
  }

  export interface Font {
    unitsPerEm: number;
    charToGlyph(char: string): Glyph;
  }

  export function parse(buffer: ArrayBuffer): Font;
}
