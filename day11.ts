import { Results } from './main.ts';

export default async function day11(
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
	const monkeys = parseInput(input);
	const monkeyQuantity = monkeys.length;

	const rounds = 20;
	let inspected: Uint16Array = new Uint16Array(monkeyQuantity).fill(0);

	for (let i = 0; i < rounds; ++i) {
		const newInspected = await monkeysTurn(monkeys);

		inspected = inspected.map((item, index) => item + newInspected[index]);
	}

	const sorted = inspected.sort().reverse();
	const result = sorted[0] * sorted[1];

	return result.toString();
}

async function solveSecond(input: string[]): Promise<string> {
	const monkeys = parseInput(input);
	const monkeyQuantity = monkeys.length;

	const modulus = monkeys
		.map((monkey) => monkey.divisor)
		.reduce((a, b) => a * b);

	const rounds = 10000;
	let inspected: Uint32Array = new Uint32Array(monkeyQuantity).fill(0);

	for (let i = 0; i < rounds; ++i) {
		const newInspected = await monkeysTurn(monkeys, modulus);

		inspected = inspected.map((item, index) => item + newInspected[index]);
	}

	const sorted = inspected.sort().reverse();
	const result = sorted[0] * sorted[1];

	return result.toString();
}

async function monkeysTurn(
	monkeys: Monkey[],
	modulus?: number
): Promise<number[]> {
	const monkeyQuantity = monkeys.length;
	const inspected: number[] = Array(monkeyQuantity).fill(0);

	for await (const monkey of monkeys) {
		for await (let item of monkey.items) {
			item = operate(item, monkey.operator, monkey.operand);

			item = modulus ? item % modulus : ~~(item / 3);

			const target = testItem(item, monkey.divisor)
				? monkey.target.trueId
				: monkey.target.falseId;

			monkeys[target].items.push(item);

			++inspected[monkey.id];
		}

		monkey.items = [];
	}

	return inspected;
}

function testItem(item: number, divisor: number): boolean {
	if (item % divisor === 0) {
		return true;
	} else {
		return false;
	}
}

function operate(
	item: number,
	operator: Operator,
	operand: number | string
): number {
	let result;
	const numOperand = operand === 'old' ? item : (operand as number);

	switch (operator) {
		case Operator.Add:
			result = item + numOperand;
			break;
		case Operator.Multiply:
			result = item * numOperand;
	}

	return result;
}

enum Operator {
	Add,
	Multiply,
}

interface Monkey {
	id: number;
	items: number[];
	operator: Operator;
	operand: number | string;
	divisor: number;
	target: Target;
}

interface Target {
	trueId: number;
	falseId: number;
}

function parseInput(input: string[]): Monkey[] {
	const monkeys: Monkey[] = [];

	const monkeyStart = 0;
	const monkeyEnd = 6;
	const monkeyOffset = 7;
	const monkeyQuantity = (input.length + 1) / monkeyOffset;

	for (let i = 0; i < monkeyQuantity; ++i) {
		const monkey = input.slice(
			monkeyStart + monkeyOffset * i,
			monkeyEnd + monkeyOffset * i
		);

		monkeys.push(parseMonkey(monkey));
	}

	return monkeys;
}

function parseMonkey(monkey: string[]): Monkey {
	const id = parseInt(monkey[0].split(' ')[1]);
	const items = monkey[1]
		.split(': ')[1]
		.split(', ')
		.map((item) => parseInt(item));
	const operation = monkey[2].split('old ')[1].split(' ');
	const operator = parseOperator(operation[0]);
	const operand = parseOperand(operation[1]);
	const divisor = parseInt(monkey[3].split(' ').at(-1) as string);
	const target = {
		trueId: parseInt(monkey[4].split(' ').at(-1) as string),
		falseId: parseInt(monkey[5].split(' ').at(-1) as string),
	};

	return {
		id,
		items,
		operator,
		operand,
		divisor,
		target,
	};
}

function parseOperand(operand: string): number | string {
	switch (operand) {
		case 'old':
			return 'old';
		default:
			return parseInt(operand);
	}
}

function parseOperator(operator: string): Operator {
	switch (operator) {
		case '+':
			return Operator.Add;
		default:
			return Operator.Multiply;
	}
}
