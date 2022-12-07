import { Results } from './main.ts';

export default async function day06(
	exampleInput: string,
	actualInput: string
): Promise<Results> {
	const exampleLines = exampleInput.toString();
	const actualLines = actualInput.toString();

	return {
		firstExampleResult: await solveFirst(exampleLines),
		firstResult: await solveFirst(actualLines),
		secondExampleResult: await solveSecond(exampleLines),
		secondResult: await solveSecond(actualLines),
	};
}

async function solveFirst(input: string): Promise<string> {
	const phraseLength = 4;
	let phrase = '';
	let counter = 0;

	for await (const char of input) {
		if (counter >= phraseLength) {
			if (isMarker(phrase)) {
				return counter.toString();
			}

			phrase = phrase.slice(1);
		}

		phrase = phrase + char;
		++counter;
	}

	return '';
}

async function solveSecond(input: string): Promise<string> {
	const phraseLength = 14;
	let phrase = '';
	let counter = 0;

	for await (const char of input) {
		if (counter >= phraseLength) {
			if (isMarker(phrase)) {
				return counter.toString();
			}

			phrase = phrase.slice(1);
		}

		phrase = phrase + char;
		++counter;
	}

	return '';
}

function isMarker(chars: string): boolean {
	const length = chars.length;
	let score = 0;

	for (let i = 0; i < length - 1; ++i) {
		for (let j = i + 1; j < length; ++j) {
			if (chars[i] !== chars[j]) {
				++score;
			}
		}
	}

	if (score === nthTriangle(length - 1)) {
		return true;
	} else {
		return false;
	}
}

function nthTriangle(num: number): number {
	//return num + nthTriangle(num - 1);
	return (num * (num + 1)) / 2;
}
