export function Badge({
	children,
	variant = "default",
}: {
	children: React.ReactNode;
	variant?: "default" | "completed" | "tiered" | "onetime" | "missing";
}) {
	const styles = {
		default: "bg-mc-stone text-white",
		completed:
			"bg-mc-grass text-white shadow-[0_0_6px_rgba(93,140,62,0.3)]",
		tiered: "bg-mc-sky/20 text-mc-sky border-mc-sky/30",
		onetime: "bg-mc-dirt/30 text-mc-gold border-mc-gold/30",
		missing: "bg-mc-red/20 text-mc-red border-mc-red/30",
	};

	return (
		<span
			className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-[family-name:var(--font-pixel)] uppercase border-2 border-mc-border rounded-sm transition-colors ${styles[variant]}`}
		>
			{children}
		</span>
	);
}
