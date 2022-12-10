import { Results } from './main.ts';

export default async function day09(
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
	const rope = new Rope(2);
	const instructions = await parseInput(input);

	for await (const instruction of instructions) {
		rope.move(instruction);
	}

	return rope.getUniqueTailPositions().toString();
}

async function solveSecond(input: Array<string>): Promise<string> {
	const rope = new Rope(10);
	const instructions = await parseInput(input);

	for await (const instruction of instructions) {
		rope.move(instruction);
	}

	return rope.getUniqueTailPositions().toString();
}

interface Instruction {
	dir: Coord;
	steps: number;
}

async function parseInput(input: Array<string>): Promise<Instruction[]> {
	const instructions: Instruction[] = [];

	for await (const line of input) {
		const split = line.split(' ');

		const dir = parseDir(split[0]);
		const steps = parseInt(split[1]);

		instructions.push({ dir, steps });
	}

	return instructions;
}

function parseDir(input: string): Coord {
	switch (input) {
		case 'U':
			return Dir.Up;
		case 'D':
			return Dir.Down;
		case 'L':
			return Dir.Left;
		case 'R':
			return Dir.Right;
		default:
			return new Coord(0, 0);
	}
}

class Coord {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	mul(num: number) {
		this.x *= num;
		this.y *= num;
	}

	add(coord: Coord) {
		this.x += coord.x;
		this.y += coord.y;
	}

	distance(coord: Coord): number {
		if (this.x === coord.x && this.y === coord.y) {
			return 0;
		} else if (
			Math.abs(this.x - coord.x) < 2 &&
			Math.abs(this.y - coord.y) < 2
		) {
			return 1;
		} else {
			return 2;
		}
	}

	follow(coord: Coord): Coord {
		return new Coord(coord.x - this.x, coord.y - this.y);
	}

	getUnit(): Coord {
		const newX = this.x === 0 ? 0 : this.x / Math.abs(this.x);
		const newY = this.y === 0 ? 0 : this.y / Math.abs(this.y);

		return new Coord(newX, newY);
	}

	compare(coord: Coord) {
		if (this.x === coord.x && this.y === coord.y) {
			return true;
		} else {
			return false;
		}
	}

	duplicate(): Coord {
		return new Coord(this.x, this.y);
	}
}

const Dir = {
	Up: new Coord(0, -1),
	Down: new Coord(0, 1),
	Left: new Coord(-1, 0),
	Right: new Coord(1, 0),
};

class Rope {
	knots: Coord[] = [];
	uniqueTailPos: Coord[] = [];

	constructor(segments: number) {
		for (let n = 0; n < segments; ++n) {
			this.knots.push(new Coord(0, 0));
		}
	}

	move(instruction: Instruction) {
		for (let i = 0; i < instruction.steps; ++i) {
			this.knots[0].add(instruction.dir);
			this.updateTail();
		}
	}

	updateTail(knotNo = 1) {
		if (knotNo < this.knots.length) {
			if (this.knots[knotNo].distance(this.knots[knotNo - 1]) === 2) {
				const clampedDir = this.knots[knotNo]
					.follow(this.knots[knotNo - 1])
					.getUnit();

				this.knots[knotNo].add(clampedDir);
			}

			this.updateTail(knotNo + 1);
		}
		// add current tail position to the array without duplicates
		if (knotNo === this.knots.length - 1) {
			if (!this.uniqueTailPos.find((pos) => pos.compare(this.knots[knotNo]))) {
				this.uniqueTailPos.push(this.knots[knotNo].duplicate());
			}
		}
	}

	getUniqueTailPositions(): number {
		return this.uniqueTailPos.length;
	}
}
