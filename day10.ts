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
		crt.advanceCycle(cpu);
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
		if (this.currentInstruction === undefined) {
			console.log('aborting');
			return;
		}
		console.log(this.currentInstruction.mnemonic);
		if ((this.currentInstruction.mnemonic as number) > 1) {
			console.log('setting busy');
			this.busy = true;
		}

		if (this.busy) {
			console.log(
				`busy, waiting for ${this.currentInstruction.mnemonic} ${this.currentInstruction.operand}`
			);
			--this.currentInstruction.mnemonic;
			if ((this.currentInstruction.mnemonic as number) === 0) {
				this.busy = false;
				console.log('adding ' + this.currentInstruction.operand + ' to register');
				this.executeInstruction(this.currentInstruction);
				this.currentInstruction = this.instructions.next().value[1];
			}
		} else {
			this.currentInstruction = this.instructions.next().value;
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
		this.cycle = 1;
		this.output = '';
	}

	advanceCycle(cpu: Cpu) {
		this.drawToScreen(cpu.getSprite());

		++this.cycle;
	}

	drawToScreen(sprite: number[]) {
		console.log(`sprite ${sprite} includes ${this.cycle}?`);
		if (sprite.includes(this.cycle)) {
			console.log(`drawing #`);
			this.output += '#';
		} else {
			console.log(`drawing .`);
			this.output += '.';
		}

		if (this.cycle % 40 === 0) {
			console.log('adding \\n and resetting cycle');
			this.output += '\n';
			this.cycle = 1;
		}
	}

	renderOutput(): string {
		return this.output;
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
