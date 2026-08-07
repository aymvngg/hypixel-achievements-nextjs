"use client";

import { useEffect } from "react";

export default function GlobalError({
	error,
	unstable_retry,
}: {
	error: Error & { digest?: string };
	unstable_retry: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="en">
			<body
				style={{
					margin: 0,
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "1.5rem",
					background: "#2d2d2d",
					color: "#e8e8e8",
					fontFamily:
						"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
				}}
			>
				<div
					style={{
						maxWidth: "30rem",
						width: "100%",
						textAlign: "center",
						padding: "2.5rem 1.5rem",
						background: "#4a4a4a",
						border: "3px solid #1a1a1a",
						borderRadius: "2px",
						boxShadow:
							"inset 2px 2px 0 rgba(255,255,255,0.1), inset -2px -2px 0 rgba(0,0,0,0.2), 6px 6px 0 rgba(0,0,0,0.4)",
					}}
				>
					<div
						style={{
							fontSize: "2.5rem",
							lineHeight: 1,
							marginBottom: "1rem",
						}}
						aria-hidden
					>
						⚠️
					</div>
					<h2
						style={{
							margin: "0 0 0.75rem",
							fontSize: "1.25rem",
							letterSpacing: "0.06em",
							textTransform: "uppercase",
							color: "#aa3333",
							fontFamily:
								"ui-monospace, SFMono-Regular, Menlo, monospace",
						}}
					>
						Something went wrong
					</h2>
					<p style={{ margin: "0 0 1.5rem", fontSize: "0.875rem" }}>
						An unexpected error occurred. Please try again.
					</p>
					<button
						type="button"
						onClick={() => unstable_retry()}
						style={{
							cursor: "pointer",
							fontFamily:
								"ui-monospace, SFMono-Regular, Menlo, monospace",
							textTransform: "uppercase",
							letterSpacing: "0.02em",
							fontSize: "0.875rem",
							padding: "0.5rem 1.25rem",
							color: "#fff",
							background: "#aa3333",
							border: "3px solid #1a1a1a",
							borderRadius: "2px",
							boxShadow:
								"inset 2px 2px 0 rgba(255,255,255,0.12), inset -2px -2px 0 rgba(0,0,0,0.3), 3px 3px 0 rgba(0,0,0,0.35)",
						}}
					>
						Try Again
					</button>
					{error.digest && (
						<p
							style={{
								margin: "1.25rem 0 0",
								fontSize: "0.7rem",
								color: "#7a7a7a",
								wordBreak: "break-all",
							}}
						>
							Error ID: {error.digest}
						</p>
					)}
				</div>
			</body>
		</html>
	);
}
