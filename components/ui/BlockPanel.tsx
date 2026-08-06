import type { ReactNode } from "react";

const variantStyles = {
	default:
		"border-[3px] border-mc-border shadow-[inset_2px_2px_0_rgba(255,255,255,0.08),inset_-2px_-2px_0_rgba(0,0,0,0.25),4px_4px_0_rgba(0,0,0,0.35)] bg-mc-panel",
	elevated:
		"border-[3px] border-mc-border shadow-[inset_2px_2px_0_rgba(255,255,255,0.1),inset_-2px_-2px_0_rgba(0,0,0,0.2),6px_6px_0_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.3)] bg-mc-panel",
};

export function BlockPanel({
	children,
	className = "",
	variant = "default",
}: {
	children: ReactNode;
	className?: string;
	variant?: "default" | "elevated";
}) {
	return (
		<div className={`${variantStyles[variant]} p-4 ${className}`}>
			{children}
		</div>
	);
}
