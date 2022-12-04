import { Results } from './main.ts';

export default async function day03(
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
	let sum = 0;

	for await (const line of input) {
		const [firstCompartment, secondCompartment] = splitRucksack(line);
		const mistake = await findMistake(firstCompartment, secondCompartment);

		sum += assignPriority(mistake);
	}

	return sum.toString();
}

async function solveSecond(input: Array<string>): Promise<string> {
	let sum = 0;
	let group: Array<string> = [];

	for await (const [index, line] of input.entries()) {
		group.push(line);

		if ((index + 1) % 3 === 0) {
			const [badge] = await findBadge(group);
			sum += assignPriority(badge);

			group = [];
		}
	}

	return sum.toString();
}

function assignPriority(char: string): number {
	let offset = 0;

	if (isUpperCase(char)) {
		offset = 38;
	} else {
		offset = 96;
	}

	return char.charCodeAt(0) - offset;
}

function isUpperCase(char: string): boolean {
	return char === char.toUpperCase();
}

async function findMistake(
	firstCompartment: string,
	secondCompartment: string
): Promise<string> {
	for await (const item of firstCompartment) {
		if (secondCompartment.includes(item)) {
			return item;
		}
	}

	return '';
}

async function findBadge(
	rucksacks: Array<string>,
	index = 0,
	counter = 0,
	[currentChar, isFinal] = ['', false]
): Promise<[string, boolean]> {
	if (counter === rucksacks.length - 1) {
		return [currentChar, true];
	}

	for await (const item of rucksacks[index]) {
		if (index > 0) {
			if (currentChar === item) {
				const [newChar, newIsFinal] = await findBadge(
					rucksacks,
					index + 1,
					counter + 1,
					[currentChar, isFinal]
				);

				if (currentChar === newChar) {
					return [newChar, newIsFinal];
				}
			}
		}

		if (index === 0 && isFinal === false) {
			[currentChar, isFinal] = await findBadge(rucksacks, index + 1, counter, [
				item,
				isFinal,
			]);
		}
	}

	return [currentChar, isFinal];
}

function splitRucksack(rucksack: string): [string, string] {
	const length = rucksack.length;

	const firstCompartment = rucksack.slice(0, length / 2);
	const secondCompartment = rucksack.slice(length / 2, length);

	return [firstCompartment, secondCompartment];
}
