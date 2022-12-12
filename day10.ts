import { Results } from './main.ts';

export default async function day10(
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
	const instructions = await parseInput(input);

	const cycleOffset = 40;
	const cycleStart = 20;

	let interestingCycle = cycleStart;
	let signalStrengthSum = 0;

	const cpu = new Cpu(instructions);

	while (!cpu.done) {
		if (cpu.cycle === interestingCycle) {
			signalStrengthSum += interestingCycle * cpu.register;
			interestingCycle += cycleOffset;
		}

		cpu.advanceCycle()
	}

	return signalStrengthSum.toString();
}

async function solveSecond(input: string[]): Promise<string> {
	const instructions = await parseInput(input);
	const cycles = 240;

	const cpu = new Cpu(instructions);
	const crt = new Crt();

	for (let i = 0; i < cycles; ++i) {
		crt.drawToScreen(cpu.getSprite());
		cpu.advanceCycle();
	}

	return '\n' + crt.renderOutput();
}

enum Mnemonic {
	Noop = 1,
	Add = 2,
}

interface Instruction {
	mnemonic: Mnemonic;
	operand?: number;
}

class Cpu {
	cycle: number;
	register: number;
	instructions: IterableIterator<Instruction>;
	currentInstruction: Instruction;
	busy: boolean;
	done: boolean;

	constructor(instructions: Instruction[]) {
		this.cycle = 1;
		this.register = 1;
		this.instructions = instructions.values();
		this.currentInstruction = this.instructions.next().value;
		this.busy = false;
		this.done = false;
	}

	getSprite(): number[] {
		return [this.register - 1, this.register, this.register + 1];
	}

	advanceCycle() {
		++this.cycle;

		if ((this.currentInstruction.mnemonic as number) > 1) {
			this.busy = true;
		}

		if (!this.busy) {
			this.nextInstruction();
			return;
		}

		if ((--this.currentInstruction.mnemonic as number) === 0) {
			this.busy = false;

			this.executeCurrentInstruction();

			this.nextInstruction();
		}
	}

	nextInstruction() {
		const nextInstruction = this.instructions.next();

		if (!nextInstruction.done) {
			this.currentInstruction = nextInstruction.value;
		} else {
			this.done = true;
		}
	}

	executeCurrentInstruction() {
		this.register += this.currentInstruction.operand!;
	}
}

class Crt {
	position: number;
	output: string;

	constructor() {
		this.position = 0;
		this.output = '';
	}

	drawToScreen(sprite: number[]) {
		if (sprite.includes(this.position)) {
			this.output += '#';
		} else {
			this.output += '.';
		}

		if (this.position === 39) {
			this.output += '\n';
			this.position = 0;
		} else {
			++this.position;
		}
	}

	renderOutput(): string {
		return this.output.slice(0, -2);
	}
}

async function parseInput(input: string[]): Promise<Instruction[]> {
	const instructions: Instruction[] = [];

	for await (const line of input) {
		const split = line.split(' ');

		const mnemonic = parseMnemonic(split[0]);
		const operand = parseInt(split[1]);

		instructions.push({ mnemonic, operand });
	}

	return instructions;
}

function parseMnemonic(input: string): Mnemonic {
	switch (input) {
		case 'addx':
			return Mnemonic.Add;
		default:
			return Mnemonic.Noop;
	}
}
