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
	const tree = await buildTree(input);

	console.log(tree);

	return await 'not implemented';
}

async function solveSecond(input: Array<string>): Promise<string> {
	return await 'not implemented';
}

enum Command {
	Cd,
	Ls,
}

enum Type {
	File,
	Directory,
}

interface Action {
	command: Command | null;
	target?: Structure;
}

interface Structure {
	name: string;
	type: Type;
	size?: number;
}

// NOTE: this seems a wee bit too hacky
function isAction(input: Action | Structure): input is Action {
	return 'command' in input;
}

class Node {
	structure: Structure;
	children: Node[];
	parent?: Node;

	constructor(structure: Structure) {
		this.structure = structure;
		this.children = [];
	}

	addChild(child: Structure) {
		const childNode = new Node(child);
		childNode.parent = this;

		this.children.push(childNode);
	}
}

async function buildTree(lines: string[]): Promise<Node> {
	const rootStructure = {
		name: '/',
		type: Type.Directory,
	};
	const rootNode = new Node(rootStructure);
	let currentNode = rootNode;

	for await (const line of lines) {
		const input = parseInput(line);

		if (isAction(input)) {
			if (input.command === Command.Cd) {
				switch (input.target?.name) {
					case '/': {
						/* 						console.log(
							`changing currentNode ${currentNode.structure.name} to root ${rootNode.structure.name}`
						); */
						currentNode = rootNode;
						break;
					}
					case '..': {
						/* 						console.log
							`changing currentNode ${currentNode.structure.name} to parent ${currentNode.parent?.structure.name}`
						); */
						currentNode = currentNode.parent!;
						break;
					}
					default: {
						/* 						console.log(
							`changing currentNode ${currentNode.structure.name} to child ${
								currentNode.children.find(
									(dir) => dir === new Node(input.target as Structure)
								)?.structure.name
							}`
						); */

						const target = new Node(input.target!);

						const newNode = currentNode.children.find(
							// TODO: this should be more sophisticated if generalized
							(dir) =>
								dir.structure.name === target.structure.name &&
								dir.parent === currentNode
						)!;

						currentNode = newNode;
					}
				}
			}
		} else {
			// TODO: check for duplicates
			/* 			console.log(
				`adding child ${input.name} to currentNode ${currentNode.structure.name}`
			); */
			currentNode.addChild(input);
			// console.log(`currentNode children: ${currentNode.children}`);
		}
	}

	return rootNode;
}

function parseInput(line: string): Action | Structure {
	const tokens = line.split(' ');

	switch (tokens[0]) {
		case '$': {
			return parseAction(tokens);
		}
		case 'dir': {
			return { name: tokens[1], type: Type.Directory };
		}
		default: {
			return { name: tokens[1], type: Type.File, size: parseInt(tokens[0]) };
		}
	}
}

function parseAction(token: string[]): Action {
	switch (token[1]) {
		case 'ls': {
			return { command: Command.Ls };
		}
		case 'cd': {
			return {
				command: Command.Cd,
				target: { name: token[2], type: Type.Directory },
			};
		}
		default:
			return {
				command: null,
			};
	}
}
