export function range(begin: number, end: number): number[] {
	if (begin > end) {
		[begin, end] = [end, begin];
	}

	return [...Array(Math.floor(end - begin) + 1)].map((_, i) => begin + i);
}
