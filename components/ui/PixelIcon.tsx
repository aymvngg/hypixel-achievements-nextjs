import type { SVGProps } from "react";

/**
 * Pixel-art style icons matching the Minecraft/Hypixel visual language.
 * Each icon is drawn on a hard 8x8 pixel grid (viewBox 0 0 8 8) with
 * shape-rendering="crispEdges" so squares stay square at any size.
 */
export function PixelIcon({
	name,
	className = "",
	...props
}: { name: PixelIconName; className?: string } & SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 8 8"
			shapeRendering="crispEdges"
			aria-hidden="true"
			fill="currentColor"
			className={`block ${className}`}
			{...props}
		>
			{ICON_PATHS[name]}
		</svg>
	);
}

export type PixelIconName =
	| "trophy"
	| "chart"
	| "scroll"
	| "magnifier"
	| "mailbox"
	| "check";

const ICON_PATHS: Record<PixelIconName, React.ReactNode> = {
	// Cup shape: wide bowl, stem, base
	trophy: (
		<>
			<path d="M1 1h1v2H1z" />
			<path d="M6 1h1v2H6z" />
			<path d="M2 1h4v1H2z" />
			<path d="M2 2h4v2H2z" />
			<path d="M3 4h2v1H3z" />
			<path d="M2 5h4v1H2z" />
		</>
	),
	// Bar chart: three bars of different heights
	chart: (
		<>
			<path d="M1 5h1v2H1z" />
			<path d="M3 3h1v4H3z" />
			<path d="M5 1h1v6H5z" />
			<path d="M0 7h8v1H0z" />
		</>
	),
	// Scroll: rolled ends, open middle
	scroll: (
		<>
			<path d="M1 1h1v1H1z" />
			<path d="M6 1h1v1H6z" />
			<path d="M2 1h4v1H2z" />
			<path d="M2 2h4v4H2z" />
			<path d="M1 6h1v1H1z" />
			<path d="M6 6h1v1H6z" />
			<path d="M2 6h4v1H2z" />
		</>
	),
	// Magnifying glass: ring + handle
	magnifier: (
		<>
			<path d="M1 1h3v1H1z" />
			<path d="M1 1v3H0V1z" />
			<path d="M4 1h1v3H4z" />
			<path d="M4 4h1v1H4z" />
			<path d="M5 4h1v1H5z" />
			<path d="M6 5h1v1H6z" />
			<path d="M7 6h1v1H7z" />
			<path d="M0 4v1h1v1h1v1h1v1H2V6H1V5H0z" />
		</>
	),
	// Mailbox: box with a flag
	mailbox: (
		<>
			<path d="M1 1h4v1H1z" />
			<path d="M5 1h1v3H5z" />
			<path d="M6 1h1v2H6z" />
			<path d="M1 2h4v1H1z" />
			<path d="M1 3h4v3H1z" />
			<path d="M2 6h2v1H2z" />
		</>
	),
	// Check mark
	check: (
		<>
			<path d="M1 3h1v1H1z" />
			<path d="M2 4h1v1H2z" />
			<path d="M3 5h1v1H3z" />
			<path d="M4 4h1v1H4z" />
			<path d="M5 3h1v1H5z" />
			<path d="M6 2h1v1H6z" />
		</>
	),
};
