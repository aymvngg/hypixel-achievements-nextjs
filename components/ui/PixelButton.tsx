import type { ButtonHTMLAttributes } from "react";

type PixelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "grass" | "stone" | "gold" | "red";
};

const variants = {
	grass: "bg-mc-grass hover:bg-mc-grass-dark text-white",
	stone: "bg-mc-stone hover:bg-mc-stone-light text-white",
	gold: "bg-mc-dirt text-mc-gold hover:brightness-110",
	red: "bg-mc-red text-white hover:brightness-110",
};

export function PixelButton({
	variant = "grass",
	className = "",
	children,
	...props
}: PixelButtonProps) {
	return (
		<button
			type="button"
			className={`border-[3px] border-mc-border shadow-[inset_2px_2px_0_rgba(255,255,255,0.12),inset_-2px_-2px_0_rgba(0,0,0,0.3),3px_3px_0_rgba(0,0,0,0.35)] font-[family-name:var(--font-pixel)] uppercase tracking-[0.02em] px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-sky/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${variants[variant]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}
