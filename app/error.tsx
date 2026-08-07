"use client";

import { useEffect } from "react";
import { ErrorPanel } from "@/components/ui/ErrorPanel";

export default function RootError({
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
		<div className="py-10">
			<ErrorPanel
				digest={error.digest}
				onRetry={() => unstable_retry()}
				retryLabel="Retry"
			/>
		</div>
	);
}
