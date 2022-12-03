import { Results } from './main.ts';

export default async function day(
	exampleInput: string,
	actualInput: string
): Promise<Results> {
	const exampleLines = exampleInput.split('\r\n');
	const actualLines = actualInput.split('\r\n');

	const firstExampleResult = await solveFirst(exampleLines);
	const firstResult = await solveFirst(actualLines);
	const secondExampleResult = await solveSecond(exampleLines);
	const secondResult = await solveSecond(actualLines);

	return {
		firstExampleResult,
		firstResult,
		secondExampleResult,
		secondResult,
	};
}

async function solveFirst(input: Array<string>): Promise<string> {
	return await input[0];
}

async function solveSecond(input: Array<string>): Promise<string> {
	return await input[0];
}
