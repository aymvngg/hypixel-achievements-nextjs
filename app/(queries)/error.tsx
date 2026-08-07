"use client";

import { useEffect } from "react";
import { ErrorPanel } from "@/components/ui/ErrorPanel";

export default function QueryError({
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
		<ErrorPanel
			title="Failed to load"
			message="An unexpected error occurred while loading this page. Please try again."
			digest={error.digest}
			onRetry={() => unstable_retry()}
		/>
	);
}
