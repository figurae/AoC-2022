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
	let registerX = 1;
	let cycle = 1;

	const cycleOffset = 40;
	const cycleStart = 20;

	let interestingCycle = cycleStart;
	let signalStrengthSum = 0;

	for await (const instruction of instructions) {
		const instructionCycles = instruction.mnemonic as number;

		if (
			cycle === interestingCycle ||
			(cycle < interestingCycle && cycle + instructionCycles > interestingCycle)
		) {
			signalStrengthSum += interestingCycle * registerX;
			interestingCycle += cycleOffset;
		}

		if (instruction.operand) {
			registerX += instruction.operand;
		}
		cycle += instructionCycles;
	}

	return signalStrengthSum.toString();
}

async function solveSecond(input: string[]): Promise<string> {
	const instructions = await parseInput(input);

	const cpu = new Cpu(instructions);
	const crt = new Crt();

	for (let i = 1; i <= 240; ++i) {
		crt.drawToScreen(cpu.getSprite());
		cpu.advanceCycle();
	}

	return '\n' + crt.renderOutput();
}

enum Mnemonic {
	Noop = 1,
	Addx = 2,
}

interface Instruction {
	mnemonic: Mnemonic;
	operand?: number;
}

class Cpu {
	cycle: number;
	register: number;
	instructions: IterableIterator<[number, Instruction]>;
	currentInstruction: Instruction;
	busy: boolean;

	constructor(instructions: Instruction[]) {
		this.cycle = 1;
		this.register = 1;
		this.instructions = instructions.entries();
		this.currentInstruction = this.instructions.next().value[1];
		this.busy = false;
	}

	getSprite(): number[] {
		return [this.register - 1, this.register, this.register + 1];
	}

	advanceCycle() {
		if ((this.currentInstruction.mnemonic as number) > 1) {
			this.busy = true;
		}

		if (this.busy) {
			--this.currentInstruction.mnemonic;
			if ((this.currentInstruction.mnemonic as number) === 0) {
				this.busy = false;
				this.executeInstruction(this.currentInstruction);

				const nextInstruction = this.instructions.next();

				if (!nextInstruction.done) {
					this.currentInstruction = nextInstruction.value[1];
				}
			}
		} else {
			const nextInstruction = this.instructions.next();

			if (!nextInstruction.done) {
				this.currentInstruction = nextInstruction.value[1];
			}
		}

		++this.cycle;
	}

	executeInstruction(instruction: Instruction) {
		this.register += instruction.operand!;
	}
}

class Crt {
	cycle: number;
	output: string;

	constructor() {
		this.cycle = 0;
		this.output = '';
	}

	drawToScreen(sprite: number[]) {
		if (sprite.includes(this.cycle)) {
			this.output += '#';
		} else {
			this.output += '.';
		}

		if (this.cycle === 39) {
			this.output += '\n';
			this.cycle = 0;
		} else {
			++this.cycle;
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
			return Mnemonic.Addx;
		default:
			return Mnemonic.Noop;
	}
}
