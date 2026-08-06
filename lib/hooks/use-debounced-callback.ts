import { useCallback, useEffect, useRef } from "react";

export function useDebouncedCallback<T extends (...args: never[]) => void>(
	fn: T,
	delay: number,
): T {
	const fnRef = useRef(fn);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);

	useEffect(() => {
		fnRef.current = fn;
	}, [fn]);

	useEffect(() => () => clearTimeout(timeoutRef.current), []);

	return useCallback(
		(...args: Parameters<T>) => {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = setTimeout(
				() => fnRef.current(...args),
				delay,
			);
		},
		[delay],
	) as T;
}
