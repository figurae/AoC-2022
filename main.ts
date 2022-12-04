import day01 from './day01.ts';
import day02 from './day02.ts';
import day03 from './day03.ts';

const separator = '✲✧✲✧✲✧✲✧✲✧✲✧✲✧✲✧✲✧✲✧✲';

export interface Results {
	firstExampleResult: string;
	firstResult: string;
	secondExampleResult: string;
	secondResult: string;
}

const inputs: {
	exampleInputs: Array<string>;
	actualInputs: Array<string>;
} = {
	exampleInputs: [],
	actualInputs: [],
};

for await (const item of Deno.readDir('input')) {
	if (item.isFile) {
		const content = await Deno.readTextFile('input/' + item.name);
		if (item.name.includes('example')) {
			inputs.exampleInputs.push(content);
		}
		if (item.name.includes('actual')) {
			inputs.actualInputs.push(content);
		}
	}
}

inputs.exampleInputs.sort();
inputs.actualInputs.sort();

const days = [day01, day02, day03];

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
