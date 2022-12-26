import { range } from './helpers/range.ts';
import { Vector2D } from './helpers/vector2d.ts';
import { Results } from './main.ts';

export default async function day14(
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

const SANDSOURCE = { x: 500, y: 0 };

async function solveFirst(input: string[]): Promise<string> {
	const cave = await generateCave(input);
	const grains = countGrains(cave);

	return grains.toString();
}

async function solveSecond(input: string[]): Promise<string> {
	const cave = await generateCave(input);
	const grains = countGrainsWithFloor(cave);

	return grains.toString();
}

function countGrainsWithFloor(cave: Cave): number {
	let grains = 0
	let lastGrain = false;

	while (!lastGrain) {
		const newGrainCoordinates = simulateGrainWithFloor(cave);

		if (newGrainCoordinates.x !== SANDSOURCE.x && newGrainCoordinates.y !== SANDSOURCE.y) {
			cave.setTile(Tile.Sand, newGrainCoordinates);

			++grains;
		} else {
			lastGrain = true;
		}
	}

	return grains + 1;
}

function countGrains(cave: Cave): number {
	let grains = 0;
	let lastGrain = false;

	while (!lastGrain) {
		const newGrainCoordinates = simulateGrain(cave);

		if (newGrainCoordinates !== undefined) {
			cave.setTile(Tile.Sand, newGrainCoordinates);

			++grains;
		} else {
			lastGrain = true;
		}
	}

	return grains;
}

const Direction = {
	Down: { x: 0, y: 1 } as Vector2D,
	DownLeft: { x: -1, y: 1 } as Vector2D,
	DownRight: { x: 1, y: 1 } as Vector2D,
};

function simulateGrainWithFloor(cave: Cave): Vector2D {
	let grainCoordinates = new Vector2D(SANDSOURCE.x, SANDSOURCE.y);
	const falling = true;

	while (falling) {
		if (cave.getTile(grainCoordinates.add(Direction.Down)) > 0) {
			if (cave.getTile(grainCoordinates.add(Direction.DownLeft)) > 0) {
				if (cave.getTile(grainCoordinates.add(Direction.DownRight)) > 0) {
					return grainCoordinates;
				} else {
					grainCoordinates = grainCoordinates.add(Direction.DownRight);
				}
			} else {
				grainCoordinates = grainCoordinates.add(Direction.DownLeft);
			}
		} else {
			grainCoordinates = grainCoordinates.add(Direction.Down);
		}
	}

	return grainCoordinates;
}

function simulateGrain(cave: Cave): Vector2D | undefined {
	let grainCoordinates = new Vector2D(SANDSOURCE.x, SANDSOURCE.y).add(
		Direction.Down
	);
	const falling = true;

	while (falling) {
		if (
			grainCoordinates.y >= cave.minMax.maxY ||
			grainCoordinates.x > cave.minMax.maxX ||
			grainCoordinates.x < cave.minMax.minX
		) {
			return undefined;
		}

		if (cave.getTile(grainCoordinates.add(Direction.Down)) > 0) {
			if (cave.getTile(grainCoordinates.add(Direction.DownLeft)) > 0) {
				if (cave.getTile(grainCoordinates.add(Direction.DownRight)) > 0) {
					return grainCoordinates;
				} else {
					grainCoordinates = grainCoordinates.add(Direction.DownRight);
				}
			} else {
				grainCoordinates = grainCoordinates.add(Direction.DownLeft);
			}
		} else {
			grainCoordinates = grainCoordinates.add(Direction.Down);
		}
	}

	return grainCoordinates;
}

interface Line {
	points: Vector2D[];
}

enum Tile {
	Air,
	Rock,
	SandSource,
	Sand,
}

// TODO: refactor this for infinite floor. use a deque for width?
class Cave {
	minMax: CaveMinMax;
	sandSource: Vector2D;
	map: Tile[][];

	constructor(minMax: CaveMinMax) {
		this.minMax = minMax;

		const width = minMax.maxX - minMax.minX + 1;
		const height = minMax.maxY - minMax.minY + 1;
		this.map = [...Array(height)].map((_) => Array(width).fill(Tile.Air));

		this.sandSource = new Vector2D(
			SANDSOURCE.x - minMax.minX,
			SANDSOURCE.y - minMax.minY
		);
		this.setTile(Tile.SandSource, this.sandSource);
	}

	setTile(tile: Tile, coordinates: Vector2D) {
		this.map[coordinates.y - this.minMax.minY][
			coordinates.x - this.minMax.minX
		] = tile;
	}

	getTile(coordinates: Vector2D): Tile {
		return this.map[coordinates.y - this.minMax.minY][
			coordinates.x - this.minMax.minX
		];
	}
}

async function generateCave(input: string[]): Promise<Cave> {
	const allLines = await getLines(input);

	const caveMinMax = await getCaveMinMax(allLines);
	const cave = new Cave(caveMinMax);

	const allRockCoordinates = await getAllRockCoordinates(allLines);

	for await (const rockCoordinates of allRockCoordinates) {
		cave.setTile(Tile.Rock, rockCoordinates);
	}

	return cave;
}

async function getAllRockCoordinates(allLines: Line[]): Promise<Vector2D[]> {
	const allRockCoordinates: Vector2D[] = [];

	for await (const line of allLines) {
		const setOfRockCoordinates = getRockCoordinates(line);

		allRockCoordinates.push(...setOfRockCoordinates);
	}

	return allRockCoordinates;
}

function getRockCoordinates(line: Line): Vector2D[] {
	let setOfRockCoordinates: Vector2D[] = [];

	for (let i = 0; i < line.points.length - 1; ++i) {
		const pointA = line.points[i];
		const pointB = line.points[i + 1];

		const rocksBetweenPoints = getRocksBetweenPoints(pointA, pointB);

		// OPTIMIZE: add end-points separately from between-points so as to avoid this
		setOfRockCoordinates = [
			...new Set([...setOfRockCoordinates, ...rocksBetweenPoints]),
		];
	}

	return setOfRockCoordinates;
}

function getRocksBetweenPoints(pointA: Vector2D, pointB: Vector2D): Vector2D[] {
	const rocksBetweenPoints: Vector2D[] = [];

	if (pointA.x !== pointB.x && pointA.y === pointB.y) {
		const rocksX = range(pointA.x, pointB.x);

		for (const rockX of rocksX) {
			rocksBetweenPoints.push(new Vector2D(rockX, pointA.y));
		}
	} else if (pointA.x === pointB.x && pointA.y !== pointB.y) {
		const rocksY = range(pointA.y, pointB.y);

		for (const rockY of rocksY) {
			rocksBetweenPoints.push(new Vector2D(pointA.x, rockY));
		}
	} else {
		console.log('points are placed diagonally, this should not happen');
	}

	return rocksBetweenPoints;
}

interface CaveMinMax {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

async function getCaveMinMax(allLines: Line[]): Promise<CaveMinMax> {
	let minX = SANDSOURCE.x;
	let minY = SANDSOURCE.y;
	let maxX = SANDSOURCE.x;
	let maxY = SANDSOURCE.y;

	for await (const line of allLines) {
		for await (const point of Object.values(line.points)) {
			if (point.x < minX) minX = point.x;
			if (point.x > maxX) maxX = point.x;
			if (point.y < minY) minY = point.y;
			if (point.y > maxY) maxY = point.y;
		}
	}

	return { minX, minY, maxX, maxY };
}

async function getLines(input: string[]): Promise<Line[]> {
	const lines: Line[] = [];

	for await (const lineString of input) {
		const points = await getPoints(lineString);

		lines.push({ points });
	}

	return lines;
}

async function getPoints(line: string): Promise<Vector2D[]> {
	const pointsString = line.split(' -> ');
	const points: Vector2D[] = [];

	for await (const point of pointsString) {
		const coordinatesString = point.split(',');
		const x = parseInt(coordinatesString[0]);
		const y = parseInt(coordinatesString[1]);

		points.push(new Vector2D(x, y));
	}

	return points;
}
