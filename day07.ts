import { Results } from './main.ts';

export default async function day07(
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
	return await 'not implemented';
}

async function solveSecond(input: Array<string>): Promise<string> {
	return await 'not implemented';
}

enum Command {
	Cd,
	Ls,
}

interface Action {
	command: Command;
	target: Type | null;
}

enum Type {
	File,
	Directory,
}

interface Structure {
	name: string;
	type: Type;
	size?: number;
}

// TODO: interface Tree {}

function parseInput(line: string): Action | Structure {
	const tokens = line.split(' ');
	let result: Action | Structure;

	switch (tokens[0]) {
		case '$': {
			result = parseAction(tokens);
			break;
		}
		case 'dir': {
			result = { name: tokens[1], type: Type.Directory };
			break;
		}
		default: {
			result = { name: tokens[1], type: Type.File, size: parseInt(tokens[0]) };
		}
	}

	return result;
}

function parseAction(token: string[]): Action {
	// not implemented
	return { command: Command.Cd, target: null };
}
