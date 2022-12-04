import { Results } from './main.ts';

export default async function day01(
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
	const calories = await countCalories(input);

	const result = Math.max(...calories);

	return result.toString();
}

async function solveSecond(input: Array<string>): Promise<string> {
	const calories = await countCalories(input);

	let result = 0;

	for (let i = 0; i < 3; ++i) {
		const currentMax = Math.max(...calories);

		result += currentMax;

		const index = calories.indexOf(currentMax);
		calories.splice(index, 1);
	}

	return result.toString();
}

async function countCalories(input: Array<string>): Promise<Array<number>> {
	const calories: Array<number> = [];
	let index = 0;

	for await (const line of input) {
		if (line === '') {
			index += 1;
		} else {
			if (calories[index] === undefined) {
				calories[index] = 0;
			}
			calories[index] += parseInt(line);
		}
	}

	return calories;
}
