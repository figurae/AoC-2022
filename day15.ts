import { range } from './helpers/range.ts';
import { Vector2D } from './helpers/vector2d.ts';
import { Results } from './main.ts';

export default async function day15(
	exampleInput: string,
	actualInput: string
): Promise<Results> {
	const exampleLines = exampleInput.split('\n');
	const actualLines = actualInput.split('\n');

	return {
		firstExampleResult: await solveFirst(exampleLines),
		firstResult: await solveFirst(actualLines),
		secondExampleResult: await solveSecond(exampleLines),
		secondResult: await solveSecond(exampleLines),
	};
}

const LINES_IN_EXAMPLE = 14;
const EXAMPLE_ROW_TO_SEARCH = 10;
const ACTUAL_ROW_TO_SEARCH = 2000000;

async function solveFirst(input: string[]): Promise<string> {
	const searchRow =
		input.length === LINES_IN_EXAMPLE
			? EXAMPLE_ROW_TO_SEARCH
			: ACTUAL_ROW_TO_SEARCH;

	const sensors = await getSensors(input);
	const positionsWithoutBeacon = sensors.getEmptyInRow(searchRow);

	return positionsWithoutBeacon.toString();
}

async function solveSecond(input: string[]): Promise<string> {
	return '';
}

class Sensors {
	sensorList: Vector2D[];
	beaconList: Vector2D[];

	constructor(sensorList: Vector2D[], beaconList: Vector2D[]) {
		this.sensorList = sensorList;
		this.beaconList = beaconList;
	}

	getEmptyInRow(row: number): number {
		const sensorCount = this.sensorList.length;
		const pointsWithoutSensor = new Set();

		for (let i = 0; i < sensorCount; ++i) {
			const currentSensor = this.sensorList[i];
			const currentBeacon = this.beaconList[i];
			const projectOnRow = new Vector2D(currentSensor.x, row);

			const sensorBeaconDistance = manhattan(currentSensor, currentBeacon);
			const sensorRowDistance = manhattan(currentSensor, projectOnRow);

			if (sensorBeaconDistance < sensorRowDistance) {
				console.log(`${currentSensor.x}:${currentSensor.y} is too far`);
				continue;
			}

			const pointsOnRow = getPointsOnRow(
				row,
				currentSensor,
				sensorBeaconDistance
			).filter(
				(point) => !(point.x === currentBeacon.x && point.y === currentBeacon.y)
			);

			for (const point of pointsOnRow) {
				pointsWithoutSensor.add(JSON.stringify(point));
			}
		}

		return pointsWithoutSensor.size;
	}
}

function getPointsOnRow(
	row: number,
	sensor: Vector2D,
	distanceToBeacon: number
): Vector2D[] {
	const points: Vector2D[] = [];

	const distanceToRow = Math.abs(sensor.y - row);
	const horizontalOffset = distanceToBeacon - distanceToRow;

	const firstXOnRow = sensor.x - horizontalOffset;
	const lastXOnRow = sensor.x + horizontalOffset;

	const rangeOfX = range(firstXOnRow, lastXOnRow);

	for (const x of rangeOfX) {
		points.push(new Vector2D(x, row));
	}

	return points;
}

async function getSensors(input: string[]): Promise<Sensors> {
	const [sensorInput, beaconInput] = await splitInput(input);

	const [sensorList, beaconList] = [
		await getList(sensorInput),
		await getList(beaconInput),
	];

	const sensors = new Sensors(sensorList, beaconList);

	return sensors;
}

async function getList(input: string[]): Promise<Vector2D[]> {
	const list: Vector2D[] = [];

	for await (const line of input) {
		const splitLine = line.split(',');
		const x = Number(splitLine[0].slice(2));
		const y = Number(splitLine[1].slice(2));

		const coordinates = new Vector2D(x, y);

		list.push(coordinates);
	}

	return list;
}

async function splitInput(input: string[]): Promise<[string[], string[]]> {
	const [sensorInput, beaconInput]: [string[], string[]] = [[], []];

	for await (const line of input) {
		const splitLine = line.split(' ');

		const sensorLine = splitLine[2] + splitLine[3].slice(0, -1);
		const beaconLine = splitLine[8] + splitLine[9];

		sensorInput.push(sensorLine);
		beaconInput.push(beaconLine);
	}

	return [sensorInput, beaconInput];
}

function manhattan(pointA: Vector2D, pointB: Vector2D): number {
	return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);
}
