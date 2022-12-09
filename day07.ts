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
	const rootStructure = {
		name: '/',
		type: Type.Directory,
	};
	const rootNode = new Node(rootStructure);

	const tree = await buildTree(input, rootNode);
	const dirSizes = await findDirSizes(tree);

	const result = dirSizes
		.map((item) => item.size)
		.filter((item) => item < 100000)
		.reduce((a, b) => a + b);

	return result.toString();
}

async function solveSecond(input: Array<string>): Promise<string> {
	const rootStructure = {
		name: '/',
		type: Type.Directory,
	};
	const rootNode = new Node(rootStructure);

	const tree = await buildTree(input, rootNode);
	const dirSizes = await findDirSizes(tree);

	const availableSpace = 70000000 - dirSizes[0].size;
	const neededSpace = 30000000 - availableSpace;

	const candidates = dirSizes
		.map((item) => item.size)
		.filter((item) => item >= neededSpace);

	const result = Math.min(...candidates);

	return result.toString();
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

interface DirSizes {
	dir: Node;
	size: number;
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

async function findDirSizes(
	startNode: Node,
	dirSizes: DirSizes[] = []
): Promise<DirSizes[]> {
	const dirSize = {
		dir: startNode,
		size: 0,
	};
	dirSizes.push(dirSize);

	if (startNode.children.length > 0) {
		for await (const child of startNode.children) {
			const parentIndex = dirSizes.findIndex((item) => item.dir === startNode);

			if (child.structure.type === Type.File) {
				dirSizes[parentIndex].size += child.structure.size!;
			} else {
				const childDirSizes = await findDirSizes(child, dirSizes);
				const childIndex = childDirSizes.findIndex(
					(item) => item.dir === child
				);

				dirSizes[parentIndex].size += childDirSizes[childIndex].size;
				// join without duplicates
				dirSizes = [...new Set([...dirSizes, ...childDirSizes])];
			}
		}
	}

	return dirSizes;
}

async function buildTree(lines: string[], rootNode: Node): Promise<Node> {
	let currentNode = rootNode;

	for await (const line of lines) {
		const input = parseInput(line);

		if (isAction(input)) {
			if (input.command === Command.Cd) {
				switch (input.target?.name) {
					case '/': {
						currentNode = rootNode;
						break;
					}
					case '..': {
						currentNode = currentNode.parent!;
						break;
					}
					default: {
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
			// TODO: check for duplicates if generalized
			currentNode.addChild(input);
		}
	}

	return rootNode;
}

// NOTE: this seems a wee bit too hacky
function isAction(input: Action | Structure): input is Action {
	return 'command' in input;
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
