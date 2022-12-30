import { range } from './helpers/range.ts';
import { Vector2D } from './helpers/vector2d.ts';
import { OMIT_RESULTS, Results } from './main.ts';

// this is quite heavy, takes around one minute
const OMIT = true;

const LINES_IN_EXAMPLE = 14;
const EXAMPLE_ROW_TO_SEARCH = 10;
const ACTUAL_ROW_TO_SEARCH = 2000000;
const TUNING_FREQUENCY_MULTIPLIER = 4000000;
const EXAMPLE_MAX_DIMENSION = 20;
const ACTUAL_MAX_DIMENSION = 4000000;

export default async function day15(
	exampleInput: string,
	actualInput: string
): Promise<Results> {
	if (OMIT) {
		return OMIT_RESULTS;
	}

	const exampleLines = exampleInput.split('\n');
	const actualLines = actualInput.split('\n');

	const exampleSensors = await getSensors(exampleLines);
	const actualSensors = await getSensors(actualLines);

	return {
		firstExampleResult: await solveFirst(exampleSensors),
		firstResult: await solveFirst(actualSensors),
		secondExampleResult: await solveSecond(exampleSensors),
		secondResult: await solveSecond(actualSensors),
	};
}

async function solveFirst(sensors: Sensors): Promise<string> {
	const searchRow =
		sensors.sensorList.length === 14
			? EXAMPLE_ROW_TO_SEARCH
			: ACTUAL_ROW_TO_SEARCH;

	const positionsWithoutBeacon = sensors.getEmptyInRow(searchRow);

	return positionsWithoutBeacon.length.toString();
}

async function solveSecond(sensors: Sensors): Promise<string> {
	const maxDimension =
		sensors.sensorList.length === LINES_IN_EXAMPLE
			? EXAMPLE_MAX_DIMENSION
			: ACTUAL_MAX_DIMENSION;

	const foundBeacon = await findBeacon(sensors, maxDimension);

	const tuningFrequency =
		foundBeacon.x * TUNING_FREQUENCY_MULTIPLIER + foundBeacon.y;

	return tuningFrequency.toString();
}

class Sensors {
	sensorList: Vector2D[];
	beaconList: Vector2D[];
	distanceList: number[];

	constructor(sensorList: Vector2D[], beaconList: Vector2D[]) {
		this.sensorList = sensorList;
		this.beaconList = beaconList;
		this.distanceList = generateDistanceList(sensorList, beaconList);
	}

	// OPTIMIZE: this could go faster if iterated by coordinate, not sensor
	getEmptyInRow(row: number): Vector2D[] {
		const sensorCount = this.sensorList.length;
		const pointsWithoutSensor = new Set();

		for (let i = 0; i < sensorCount; ++i) {
			const currentSensor = this.sensorList[i];
			const currentBeacon = this.beaconList[i];
			const projectOnRow = new Vector2D(currentSensor.x, row);

			const sensorBeaconDistance = manhattan(currentSensor, currentBeacon);
			const sensorRowDistance = manhattan(currentSensor, projectOnRow);

			if (sensorBeaconDistance < sensorRowDistance) {
				// currentSensor is too far to have any influence on result
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

		return [...pointsWithoutSensor].map(
			(pointString) => JSON.parse(pointString as string) as Vector2D
		);
	}
}

async function findBeacon(sensors: Sensors, limitX: number): Promise<Vector2D> {
	const sensorCount = sensors.sensorList.length;

	for (let i = 0; i < sensorCount; ++i) {
		const currentSensor = sensors.sensorList[i];
		const currentBeacon = sensors.beaconList[i];

		const sensorBeaconDistance = manhattan(currentSensor, currentBeacon);
		const outerRadius = sensorBeaconDistance + 1;

		const outerRadiusCoordinates = generateRadiusCoordinates(
			currentSensor,
			outerRadius
		);

		const searchResult = await searchRadius(
			sensors,
			outerRadiusCoordinates,
			limitX
		);

		if (searchResult) {
			return searchResult;
		}
	}

	return new Vector2D(-1, -1);
}

async function searchRadius(
	sensors: Sensors,
	outerRadiusCoordinates: Vector2D[],
	limitX: number
): Promise<Vector2D | undefined> {
	for await (const point of outerRadiusCoordinates) {
		if (point.x < 0 || point.y < 0 || point.x > limitX || point.y > limitX) {
			continue;
		}

		if (await isPointInRange(point, sensors.sensorList, sensors.distanceList)) {
			continue;
		} else {
			return point;
		}
	}
}

async function isPointInRange(
	point: Vector2D,
	sensorList: Vector2D[],
	distanceList: number[]
): Promise<boolean> {
	for await (const [index, sensor] of Object.entries(sensorList)) {
		if (distanceList[Number(index)] >= manhattan(sensor, point)) {
			return true;
		}
	}

	return false;
}

function generateRadiusCoordinates(
	sensor: Vector2D,
	radius: number
): Vector2D[] {
	const pointSet = new Set();

	for (let i = 0; i <= radius; ++i) {
		const leftTop = new Vector2D(sensor.x - i, sensor.y + radius - i);
		const leftBottom = new Vector2D(sensor.x - i, sensor.y - radius + i);
		const rightTop = new Vector2D(sensor.x + i, sensor.y + radius - i);
		const rightBottom = new Vector2D(sensor.x + i, sensor.y - radius + i);

		pointSet.add(JSON.stringify(leftTop));
		pointSet.add(JSON.stringify(leftBottom));
		pointSet.add(JSON.stringify(rightTop));
		pointSet.add(JSON.stringify(rightBottom));
	}

	const points = [...pointSet].map(
		(point) => JSON.parse(point as string) as Vector2D
	);

	return points;
}

function generateDistanceList(
	sensorList: Vector2D[],
	beaconList: Vector2D[]
): number[] {
	const distanceList = [];

	for (let i = 0; i < sensorList.length; ++i) {
		const distance = manhattan(sensorList[i], beaconList[i]);

		distanceList.push(distance);
	}

	return distanceList;
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
