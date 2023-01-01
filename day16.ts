import { Results } from './main.ts';

export default async function day16(
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

const TIME_LIMIT = 30;
const FIRST_VALVE_LABEL = 'AA';

async function solveFirst(input: string[]): Promise<string> {
	const valves = await getValves(input);

	const maxPossiblePressure = await findMaxPossiblePressure(valves, TIME_LIMIT);

	return maxPossiblePressure.toString();
}

async function solveSecond(input: string[]): Promise<string> {
	return '';
}

interface Valve {
	label: string;
	flowRate: number;
	destinations: string[];
	open: boolean;
	visited: boolean;
}

async function findMaxPossiblePressure(
	valves: Valve[],
	timeLimit: number
): Promise<number> {
	let maxPossiblePressure = 0;
	let currentValve = valves.find(
		(valve) => valve.label === FIRST_VALVE_LABEL
	) as Valve;

	while (timeLimit > 0) {
		valves.forEach(valve => valve.visited = false);

		await sleep(500);
		const [timeTaken, obtainedPressure, targetValve] = await findNextBestMove(
			currentValve,
			valves,
			timeLimit
		);

		if (!targetValve.open) targetValve.open = true;

		timeLimit -= timeTaken - 1;
		maxPossiblePressure += obtainedPressure;
		currentValve = targetValve;
	}

	return maxPossiblePressure;
}

async function findNextBestMove(
	currentValve: Valve,
	valves: Valve[],
	timeLimit: number,
	timeTaken = 0,
	obtainedPressure = 0,
	targetValve = currentValve
): Promise<[timeTaken: number, obtainedPressure: number, targetValve: Valve]> {
	console.log(`beginning analysis of destinations at ${currentValve.label}`);
	currentValve.visited = true;

	for await (const destination of currentValve.destinations) {
		console.log(`trying to go to ${destination} from ${currentValve.label}`);
		const nextValve = valves.find((valve) => valve.label === destination)!;

		if (nextValve === undefined || nextValve.visited === true) {
			console.log(
				`next valve ${nextValve.label} visited or undefined, continuing`
			);
			continue;
		}

		if (!nextValve.open) {
			console.log(`valve ${nextValve.label} is closed`);
			++timeTaken;

			if (nextValve.flowRate > 0) {
				const nextValvePressure =
					nextValve.flowRate * (timeLimit - timeTaken - 1);
				console.log(
					`valve ${nextValve.label} has positive flow rate ${
						nextValve.flowRate
					} * ${timeLimit - timeTaken - 1} = ${nextValvePressure}`
				);

				if (nextValvePressure > obtainedPressure) {
					console.log(
						`this pressure of ${nextValvePressure} is higher than previously obtained ${obtainedPressure}`
					);
					obtainedPressure = nextValvePressure;
					targetValve = nextValve;
					console.log(`target valve ${targetValve.label} is set`);
				}
			}
		}

		if (timeLimit - timeTaken - 1 > 0) {
			console.log(
				`if we don't open ${nextValve.label} there's still time at ${
					timeLimit - timeTaken
				}, going inside`
			);
			[timeTaken, obtainedPressure, targetValve] = await findNextBestMove(
				nextValve,
				valves,
				timeLimit - timeTaken,
				timeTaken,
				obtainedPressure
			);
		}
	}

	console.log(
		`returning timeTaken ${timeTaken}, obtainedPressure ${obtainedPressure}, targetValve ${targetValve.label}`
	);
	return [timeTaken, obtainedPressure, targetValve];
}

async function getValves(input: string[]): Promise<Valve[]> {
	const valves = [];

	for await (const line of input) {
		const splitLine = line.split(';');
		const splitNameAndFlowRate = splitLine[0].split(' ');
		const splitDestinations = splitLine[1].split(' ');

		const label = splitNameAndFlowRate[1];
		const flowRate = Number(splitNameAndFlowRate[4].split('=')[1]);
		const destinations = [];
		const open = false;
		const visited = false;

		for await (const destination of splitDestinations.slice(5)) {
			destinations.push(destination.slice(0, 2));
		}

		valves.push({ label, flowRate, destinations, open, visited } as Valve);
	}

	return valves;
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
