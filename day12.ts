import { Results } from './main.ts';

export default async function day12(
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

const STARTCHAR = 'S';
const ENDCHAR = 'E';

type Coord = [y: number, x: number];

async function solveFirst(input: string[]): Promise<string> {
	const map = await generateMap(input);
	const startPos = await findChar(map, STARTCHAR);
	const endPos = await findChar(map, ENDCHAR);

	const [width, height] = [map[0].length, map.length];

	// TODO: map the solution
	const solutionMap = await generateEmptyMap(width, height);

	const graph = new Graph(map);

	for await (const node of graph.nodes) {
		await node.setValidNeighbours(graph);
	}

	const startNode = graph.getNode(startPos);
	startNode?.setVisitableFrom(startPos);

	// FIXME: this works for example but not for final data
	await floodFill(graph, startNode!, endPos);

	console.log(graph.getNode(endPos)?.floodedOnStep);
	return '';
}

async function solveSecond(input: string[]): Promise<string> {
	return await input[0];
}

async function floodFill(
	graph: Graph,
	currentNode: Node,
	endPos: Coord,
	currentStep = 0
) {
	await currentNode.setValidNeighbours(graph);

	for await (const neighbourCoord of currentNode.validNeighbours) {
		const neighbourNode = graph.getNode(neighbourCoord);

		neighbourNode!.setVisitableFrom(currentNode.coord);

		if (neighbourNode!.floodedOnStep === -1) {
			neighbourNode!.floodOnStep(currentStep + 1);
		}
	}

	for await (const neighbourCoord of currentNode.validNeighbours) {
		const neighbourNode = graph.getNode(neighbourCoord);
		await floodFill(graph, neighbourNode!, endPos, currentStep + 1);
	}
	return;
}

const Direction = {
	Up: [0, -1] as Coord,
	Down: [0, 1] as Coord,
	Left: [-1, 0] as Coord,
	Right: [1, 0] as Coord,
};

function addCoords(coord1: Coord, coord2: Coord): Coord {
	return [coord1[0] + coord2[0], coord1[1] + coord2[1]];
}

function compareCoords(coord1: Coord, coord2: Coord): boolean {
	return coord1[0] === coord2[0] && coord1[1] === coord2[1];
}

class Node {
	coord: Coord;
	char: string;
	height: number;
	validNeighbours: Coord[];
	visitableFrom: Coord;
	floodedOnStep: number;

	constructor(coord: Coord, char: string) {
		this.coord = coord;
		this.char = char;
		this.validNeighbours = [];
		this.height = this.calculateHeight(this.char);
		this.visitableFrom = [-1, -1];
		this.floodedOnStep = -1;
	}

	calculateHeight(char: string) {
		switch (char) {
			case STARTCHAR:
				return 1;
			case ENDCHAR:
				return 26;
			default:
				return char.charCodeAt(0) - 96;
		}
	}

	async setValidNeighbours(graph: Graph) {
		const neighbours = await getNeighbours(graph.dimensions, this);
		const validNeighbours: Coord[] = [];

		for await (const neighbour of neighbours) {
			const neighbourNode = graph.getNode(neighbour);

			if (
				neighbourNode !== undefined &&
				(compareCoords(neighbourNode!.visitableFrom, [-1, -1]) ||
					compareCoords(neighbourNode!.visitableFrom, this.coord)) &&
				isValidDestination(this, neighbourNode!)
			) {
				validNeighbours.push(neighbour);
			}
		}

		this.validNeighbours = validNeighbours;
	}

	floodOnStep(step: number) {
		this.floodedOnStep = step;
	}

	setVisitableFrom(coord: Coord) {
		this.visitableFrom = coord;
	}
}

class Graph {
	nodes: Node[] = [];
	dimensions: Coord;

	constructor(map: string[][]) {
		// TODO: can this be done asynchronously?
		searchMapSync(map, (coord, mapChar) => {
			const newNode = new Node(coord, mapChar);

			this.nodes.push(newNode);
		});

		const width = map[0].length;
		const height = map.length;
		this.dimensions = [height, width];
	}

	getNode(coord: Coord): Node | undefined {
		const node = this.nodes.find((node) => compareCoords(node.coord, coord));

		return node;
	}
}

async function getNeighbours(dimensions: Coord, node: Node): Promise<Coord[]> {
	const neighbours: Coord[] = [];

	for await (const direction of Object.values(Direction)) {
		const potentialDestination = addCoords(node.coord, direction);

		if (isValidCoord(dimensions, potentialDestination)) {
			neighbours.push(potentialDestination);
		}
	}

	return neighbours;
}

function isValidDestination(beginNode: Node, endNode: Node): boolean {
	return endNode.height <= beginNode.height + 1 ? true : false;
}

function isValidCoord(dimensions: Coord, coord: Coord): boolean {
	const [height, width] = dimensions;

	return coord[0] < 0 || coord[1] < 0 || coord[0] >= height || coord[1] >= width
		? false
		: true;
}

async function findChar(map: string[][], char: string): Promise<Coord> {
	for await (const [y, row] of map.entries()) {
		for await (const [x, mapChar] of row.entries()) {
			if (mapChar === char) {
				return [y, x];
			}
		}
	}

	return [-1, -1];
}

function searchMapSync(
	map: string[][],
	func: (coord: Coord, mapChar: string) => void
) {
	for (const [y, row] of map.entries()) {
		for (const [x, mapChar] of row.entries()) {
			func([y, x], mapChar);
		}
	}
}

function generateEmptyMap(width: number, height: number): string[][] {
	return [...Array(height)].map((_) => Array(width).fill('.'));
}

async function generateMap(input: string[]): Promise<string[][]> {
	const width = input[0].length;
	const height = input.length;

	const map: string[][] = [...Array(height)].map((_) => Array(width));

	for await (const [y, line] of input.entries()) {
		const entries: [number, string][] = Object.entries(line).map(
			([index, value]) => [parseInt(index), value]
		);

		for await (const [x, char] of entries) {
			map[y][x] = char;
		}
	}

	return map;
}
