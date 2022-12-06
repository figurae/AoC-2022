import { Results } from './main.ts';

export default async function day05(
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
	const numberLine = await findNumberLine(input);
	const stackQuantity = getStackQuantity(input[numberLine]);
	const crateLines = input.slice(0, numberLine);
	const orderLines = input.slice(numberLine + 2);

	const stacks = await getStacks(stackQuantity, crateLines);

	for await (const orderLine of orderLines) {
		const input = parseInput(orderLine);
		moveCratesSeparately(stacks, input.crateQuantity, input.from, input.to);
	}

	const result = stacks.map((stack) => stack.pop() as string);

	return result.join('');
}

async function solveSecond(input: Array<string>): Promise<string> {
	const numberLine = await findNumberLine(input);
	const stackQuantity = getStackQuantity(input[numberLine]);
	const crateLines = input.slice(0, numberLine);
	const orderLines = input.slice(numberLine + 2);

	const stacks = await getStacks(stackQuantity, crateLines);

	for await (const orderLine of orderLines) {
		const input = parseInput(orderLine);
		moveCratesTogether(stacks, input.crateQuantity, input.from, input.to);
	}

	const result = stacks.map((stack) => stack.pop() as string);

	return result.join('');
}

class Stack {
	stack: string[];

	constructor() {
		this.stack = [];
	}

	unshift(char: string) {
		this.stack.unshift(char);
	}

	push(char: string) {
		this.stack.push(char);
	}

	pop() {
		return this.stack.pop();
	}

	cut(num: number) {
		return this.stack.splice(num * -1);
	}

	append(chars: string[]) {
		this.stack.push(...chars);
	}
}

interface Order {
	crateQuantity: number;
	from: number;
	to: number;
}

function parseInput(orderLine: string): Order {
	const orders = orderLine.split(' ');

	return {
		crateQuantity: parseInt(orders[1]),
		from: parseInt(orders[3]),
		to: parseInt(orders[5]),
	};
}
function moveCratesTogether(
	stacks: Stack[],
	crateQuantity: number,
	from: number,
	to: number
) {
	const movedCrates = stacks[from - 1].cut(crateQuantity);
	stacks[to - 1].append(movedCrates);
}


function moveCratesSeparately(
	stacks: Stack[],
	crateQuantity: number,
	from: number,
	to: number
) {
	for (let i = 0; i < crateQuantity; ++i) {
		const movedCrate = stacks[from - 1].pop() as string;
		stacks[to - 1].push(movedCrate);
	}
}

async function getStacks(
	stackQuantity: number,
	crateLines: string[]
): Promise<Stack[]> {
	const stacks: Stack[] = [];
	for (let i = 0; i < stackQuantity; ++i) {
		stacks[i] = new Stack();
	}

	for await (const line of crateLines) {
		for (let i = 1; i <= stackQuantity; ++i) {
			let offset = 0;

			if (i !== 0) {
				offset = 3;
			}

			const crate = getCrate(i + offset * (i - 1), line);
			if (crate) {
				stacks[i - 1].unshift(crate);
			}
		}
	}

	return stacks;
}

function getCrate(offset: number, crateLine: string): string | null {
	const crate = crateLine[offset];

	if (crate === ' ') {
		return null;
	} else {
		return crate;
	}
}

async function findNumberLine(allLines: string[]): Promise<number> {
	for await (const [index, line] of allLines.entries()) {
		if (line.charAt(1) === '1') {
			return index;
		}
	}

	return 0;
}

function getStackQuantity(numberLine: string): number {
	// NOTE: this only works with sanitized no-trailing-whitespace input
	return parseInt(numberLine[numberLine.length - 1]);
}
