import { Results } from './main.ts';

export default async function day04(
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

async function solveFirst(input: Array<string>): Promise<string> {
	let pairs = 0;

	for await (const line of input) {
		const [firstRange, secondRange] = getRanges(line);

		if (containsRange(firstRange, secondRange)) {
			pairs += 1;
		}
	}

	return pairs.toString();
}

async function solveSecond(input: Array<string>): Promise<string> {
	let pairs = 0;

	for await (const line of input) {
		const [firstRange, secondRange] = getRanges(line);

		if (await overlapsRange(firstRange, secondRange)) {
			pairs += 1;
		}
	}

	return pairs.toString();
}

async function overlapsRange(
	firstRange: number[],
	secondRange: number[]
): Promise<boolean> {
	for await (const firstNumber of firstRange) {
		for await (const secondNumber of secondRange) {
			if (firstNumber === secondNumber) {
				return true;
			}
		}
	}

	return false;
}

function containsRange(firstRange: number[], secondRange: number[]): boolean {
	return (
		firstRange.every((item) => secondRange.includes(item)) ||
		secondRange.every((item) => firstRange.includes(item))
	);
}

function getRanges(line: string): [number[], number[]] {
	const [firstRangeString, secondRangeString] = line.split(',');

	const firstRange = getRange(firstRangeString);
	const secondRange = getRange(secondRangeString);

	return [firstRange, secondRange];
}

function getRange(rangeString: string): number[] {
	const [beginRange, endRange] = rangeString.split('-');

	return range(parseInt(beginRange), parseInt(endRange));
}

function range(begin: number, end: number): number[] {
	return [...Array(Math.floor(end - begin) + 1)].map((_, i) => begin + i);
}
