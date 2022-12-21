import { Results } from './main.ts';

export default async function day13(
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

async function solveFirst(input: string[]): Promise<string> {
	const pairs = await parseInput(input);

	const sumOfIndices = await countIndices(pairs);

	return sumOfIndices.toString();
}

async function solveSecond(input: string[]): Promise<string> {
	const pairs = await parseInput(input);
	const dividerPackets = await generateDividerPackets();
	let allPackets: Packet[] = [];

	for await (const pair of pairs) {
		allPackets.push(pair.leftIterator);
		allPackets.push(pair.rightIterator);
	}

	allPackets = allPackets.concat(dividerPackets);

	const sortedPackets = await sortPackets(allPackets);

	let decoderKey = 1;

	for await (const [index, packet] of sortedPackets.entries()) {
		if (
			dividerPackets.find(
				(dividerPacket) => dividerPacket.string === packet.string
			)
		) {
			decoderKey *= index + 1;
		}
	}

	return decoderKey.toString();
}

type Value = number | Packet;

class Packet implements AsyncIterator<Value> {
	elements: Value[];
	counter: number;
	string: string;

	constructor() {
		this.elements = [];
		this.counter = 0;
		this.string = '[';
	}

	next() {
		if (this.counter < this.elements.length) {
			return Promise.resolve({
				value: this.elements[this.counter++],
				done: false,
			} as IteratorResult<Value>);
		} else {
			return Promise.resolve({ done: true } as IteratorResult<Value>);
		}
	}

	async *[Symbol.asyncIterator]() {
		for await (const element of this.elements) {
			yield element;
		}
	}

	addToPacket(element: number | Packet) {
		this.elements.push(element);
	}

	clone(packet: Packet = this): Packet {
		const clonedPacket: Packet = new Packet();

		for (const element of packet.elements) {
			if (typeof element === 'number') {
				clonedPacket.elements.push(element);
			} else {
				const subPacket = this.clone(element);
				clonedPacket.elements.push(subPacket);
			}
		}

		clonedPacket.string = this.string;
		return clonedPacket;
	}
}

interface Pair {
	leftIterator: Packet;
	rightIterator: Packet;
}

async function sortPackets(packets: Packet[]): Promise<Packet[]> {
	let isSwapped = false;

	for (let i = 0; i < packets.length; ++i) {
		isSwapped = false;

		for (let j = 0; j < packets.length - 1; ++j) {
			const [result] = await isLeftSideSmaller(
				packets[j].clone(),
				packets[j + 1].clone()
			);
			if (result !== CompareResult.True) {
				const tempPacket = packets[j];
				packets[j] = packets[j + 1];
				packets[j + 1] = tempPacket;
				isSwapped = true;
			}
		}
		if (isSwapped === false) {
			break;
		}
	}

	return packets;
}

async function generateDividerPackets(): Promise<Packet[]> {
	const dividerPackets: Packet[] = [];
	const dividers = [
		['[', '[', '2', ']', ']'],
		['[', '[', '6', ']', ']'],
	];

	for await (const divider of dividers) {
		dividerPackets.push(
			await generatePacket(divider.slice(1)[Symbol.iterator]())
		);
	}

	return dividerPackets;
}

async function countIndices(pairs: Pair[]): Promise<number> {
	let result = 0;

	for await (const [index, pair] of pairs.entries()) {
		const { leftIterator, rightIterator } = pair;
		const [elementsInRightOrder] = await isLeftSideSmaller(
			leftIterator,
			rightIterator
		);

		if (elementsInRightOrder === CompareResult.True) {
			result += index + 1;
		}
	}

	return result;
}

enum CompareResult {
	True,
	False,
	Undefined,
}

async function isLeftSideSmaller(
	leftIterator: AsyncIterableIterator<Value>,
	rightIterator: AsyncIterableIterator<Value>,
	[result, stop] = [CompareResult.Undefined, false]
): Promise<[CompareResult, boolean]> {
	const leftItem = await leftIterator.next();
	const rightItem = await rightIterator.next();

	if (
		typeof leftItem.value === 'number' &&
		typeof rightItem.value === 'number'
	) {
		if (leftItem.value < rightItem.value) {
			return [CompareResult.True, true];
		}
		if (leftItem.value > rightItem.value) {
			return [CompareResult.False, true];
		}
	}

	if (leftItem.done && !rightItem.done) {
		return [CompareResult.True, true];
	}

	if (!leftItem.done && rightItem.done) {
		return [CompareResult.False, true];
	}

	if (leftItem.done && rightItem.done) {
		return [result, stop];
	}

	if (
		typeof leftItem.value !== 'number' &&
		typeof rightItem.value !== 'number'
	) {
		[result, stop] = await isLeftSideSmaller(leftItem.value, rightItem.value, [
			result,
			stop,
		]);
	}

	if (
		typeof leftItem.value === 'number' &&
		typeof rightItem.value !== 'number'
	) {
		const newLeftIterator = new Packet();
		newLeftIterator.addToPacket(leftItem.value);

		[result, stop] = await isLeftSideSmaller(newLeftIterator, rightItem.value, [
			result,
			stop,
		]);
	}

	if (
		typeof leftItem.value !== 'number' &&
		typeof rightItem.value === 'number'
	) {
		const newRightIterator = new Packet();
		newRightIterator.addToPacket(rightItem.value);

		[result, stop] = await isLeftSideSmaller(leftItem.value, newRightIterator, [
			result,
			stop,
		]);
	}

	if (stop === false) {
		[result, stop] = await isLeftSideSmaller(leftIterator, rightIterator, [
			result,
			stop,
		]);
	}

	return [result, stop];
}

async function parseInput(input: string[]): Promise<Pair[]> {
	const pairs: Pair[] = [];
	const pairOffset = 3;

	for (let i = 0; i < input.length; i += pairOffset) {
		const leftString = input[i];
		const rightString = input[i + 1];

		const leftArray = await packetStringToArray(leftString);
		const rightArray = await packetStringToArray(rightString);

		pairs.push({
			leftIterator: await generatePacket(leftArray.slice(1)[Symbol.iterator]()),
			rightIterator: await generatePacket(
				rightArray.slice(1)[Symbol.iterator]()
			),
		});
	}

	return pairs;
}

async function packetStringToArray(packetString: string): Promise<string[]> {
	let packetArray: string[] = [];
	const splitString = packetString.split(',');

	for await (const item of splitString) {
		const chars = await splitChars(item);
		packetArray = packetArray.concat(chars);
	}

	return packetArray;
}

async function splitChars(item: string): Promise<string[]> {
	const splitChars: string[] = [];
	let currentNumber: string | undefined = undefined;

	for await (const char of item) {
		switch (char) {
			case '[':
			case ']': {
				if (currentNumber !== undefined) {
					splitChars.push(currentNumber);
					currentNumber = undefined;
				}

				splitChars.push(char);

				break;
			}
			default: {
				currentNumber =
					currentNumber === undefined ? char : currentNumber + char;
			}
		}
	}
	if (currentNumber !== undefined) {
		splitChars.push(currentNumber);
	}

	return splitChars;
}

async function generatePacket(
	packetIterator: IterableIterator<string>
): Promise<Packet> {
	const packet = new Packet();

	for await (const item of packetIterator) {
		switch (item) {
			case '[': {
				const innerPacket = await generatePacket(packetIterator);
				packet.addToPacket(innerPacket);

				packet.string += innerPacket.string;

				break;
			}
			case ']': {
				packet.string += item;

				return packet;
			}
			default: {
				const integer = parseInt(item);
				packet.addToPacket(integer);

				packet.string += item;
			}
		}
	}

	return packet;
}
