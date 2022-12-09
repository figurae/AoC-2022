import { Results } from './main.ts';

export default async function day08(
	exampleInput: string,
	actualInput: string
): Promise<Results> {
	const exampleLines = exampleInput.split('\n');
	const actualLines = actualInput.split('\n');

	return {
		firstExampleResult: await solveFirst(exampleLines),
		firstResult: await solveFirst(actualLines),
		secondExampleResult: await solveSecond(exampleLines),
		secondResult: await solveSecond(actualLines),
	};
}

async function solveFirst(input: string[]): Promise<string> {
	const treeMap = createTreeMap(input);
	const width = treeMap[0].length;
	const height = treeMap.length;

	// TODO: this should be possible using methods
	let counter = 0;

	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {
			if (isTreeVisible(treeMap, [y, x])) {
				++counter;
			}
		}
	}

	return counter.toString();
}

async function solveSecond(input: string[]): Promise<string> {
	return await input[0];
}

// TODO: try doing this with methods and generalizing it to any comparison
function isTreeVisible(
	treeMap: number[][],
	treePositon: [number, number]
): boolean {
	const width = treeMap[0].length;
	const height = treeMap.length;
	const treeY = treePositon[0];
	const treeX = treePositon[1];
	const treeHeight = treeMap[treeY][treeX];

	if (
		treeY === 0 ||
		treeY === height - 1 ||
		treeX === 0 ||
		treeX === width - 1
	) {
		return true;
	}

	let counter = 0;

	// TODO: rewrite this into two nested loops, skipping treeY:treeX, like in Game of Life
	for (let y = 0; y < treeY; ++y) {
		if (treeMap[y][treeX] >= treeHeight) {
			++counter;
			break;
		}
	}

	for (let x = 0; x < treeX; ++x) {
		if (treeMap[treeY][x] >= treeHeight) {
			++counter;
			break;
		}
	}

	for (let x = treeX + 1; x < width; ++x) {
		if (treeMap[treeY][x] >= treeHeight) {
			++counter;
			break;
		}
	}

	for (let y = treeY + 1; y < height; ++y) {
		if (treeMap[y][treeX] >= treeHeight) {
			++counter;
			break;
		}
	}

	if (counter === 4) {
		return false;
	} else {
		return true;
	}
}

function createTreeMap(input: string[]): number[][] {
	const width = input[0].length;
	const height = input.length;

	let treeMap: number[][] = [...Array(width)].map((_) => Array(height));

	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {
			treeMap[y][x] = parseInt(input[y].charAt(x));
		}
	}

	return treeMap;
}
