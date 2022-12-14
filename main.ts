import day01 from './day01.ts';
import day02 from './day02.ts';
import day03 from './day03.ts';
import day04 from './day04.ts';
import day05 from './day05.ts';
import day06 from './day06.ts';
import day07 from './day07.ts';
import day08 from './day08.ts';
import day09 from './day09.ts';
import day10 from './day10.ts';
import day11 from './day11.ts';
import day12 from './day12.ts';
import day13 from './day13.ts';
import day14 from './day14.ts';
import day15 from './day15.ts';
import day16 from './day16.ts';

const separator = '✲✧✲✧✲✧✲✧✲✧✲✧✲✧✲✧✲✧✲✧✲';

export interface Results {
	firstExampleResult: string;
	firstResult: string;
	secondExampleResult: string;
	secondResult: string;
}

export const OMIT_RESULTS: Results = {
	firstExampleResult: 'omitted for performance',
	firstResult: 'omitted for performance',
	secondExampleResult: 'omitted for performance',
	secondResult: 'omitted for performance',
};

const inputs: {
	exampleInputs: Array<string>;
	actualInputs: Array<string>;
} = {
	exampleInputs: [],
	actualInputs: [],
};

const filenames: string[] = [];

for await (const item of Deno.readDir('input')) {
	if (item.isFile) {
		filenames.push(item.name);
	}
}

filenames.sort();

for await (const filename of filenames) {
	const content = await Deno.readTextFile('input/' + filename);
	if (filename.includes('example')) {
		inputs.exampleInputs.push(content);
	}
	if (filename.includes('actual')) {
		inputs.actualInputs.push(content);
	}
}

const days = [
	day01,
	day02,
	day03,
	day04,
	day05,
	day06,
	day07,
	day08,
	day09,
	day10,
	day11,
	day12,
	day13,
	day14,
	day15,
	day16,
];

const allResults: Array<Results> = [];

for await (const [index, day] of days.entries()) {
	allResults.push(
		await day(
			inputs.exampleInputs[index],
			inputs.actualInputs[index]
			//''
		)
	);
}

for await (const [index, result] of allResults.entries()) {
	console.log(
		`Day ${index + 1} first example result: ${result.firstExampleResult}`
	);
	console.log(`Day ${index + 1} first result: ${result.firstResult}`);
	console.log(
		`Day ${index + 1} second example result: ${result.secondExampleResult}`
	);
	console.log(`Day ${index + 1} second result: ${result.secondResult}`);
	console.log(separator);
}
