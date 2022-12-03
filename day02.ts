import { Results } from './main.ts';

export default async function day(
	exampleInput: string,
	actualInput: string
): Promise<Results> {
	const exampleLines = exampleInput.split('\r\n');
	const actualLines = actualInput.split('\r\n');

	const firstExampleResult = await solveFirst(exampleLines);
	const firstResult = await solveFirst(actualLines);
	const secondExampleResult = await solveSecond(exampleLines);
	const secondResult = await solveSecond(actualLines);

	return {
		firstExampleResult,
		firstResult,
		secondExampleResult,
		secondResult,
	};
}

async function solveFirst(input: Array<string>): Promise<string> {
	let opponentAction = Action.Default;
	let myAction = Action.Default;

	let score = 0;

	for await (const line of input) {
		for (const char of line) {
			if (char === 'A' || char === 'B' || char === 'C')
				opponentAction = determineAction(char);

			if (char === 'X' || char === 'Y' || char === 'Z')
				myAction = determineAction(char);
		}

		score += myAction + didIWin(opponentAction, myAction);
	}

	return score.toString();
}

async function solveSecond(input: Array<string>): Promise<string> {
	return await input[0];
}

enum Action {
	Rock = 1,
	Paper = 2,
	Scissors = 3,
	Default,
}

enum Outcome {
	Win = 6,
	Draw = 3,
	Lose = 0,
	Default,
}

function determineAction(char: string): Action {
	if (char === 'A' || char === 'X') return Action.Rock;

	if (char === 'B' || char === 'Y') return Action.Paper;

	if (char === 'C' || char === 'Z') return Action.Scissors;

	return Action.Default;
}

function didIWin(opponentAction: Action, myAction: Action): Outcome {
	if (opponentAction === myAction) return Outcome.Draw;

	if (opponentAction === Action.Rock && myAction === Action.Paper)
		return Outcome.Win;

	if (opponentAction === Action.Rock && myAction === Action.Scissors)
		return Outcome.Lose;

	if (opponentAction === Action.Paper && myAction === Action.Scissors)
		return Outcome.Win;

	if (opponentAction === Action.Paper && myAction === Action.Rock)
		return Outcome.Lose;

	if (opponentAction === Action.Scissors && myAction === Action.Rock)
		return Outcome.Win;

	if (opponentAction === Action.Scissors && myAction === Action.Paper)
		return Outcome.Lose;

	return Outcome.Default;
}
