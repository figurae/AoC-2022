export class DoubleEndedArray<T> {
	positiveArray: Array<T>;
	negativeArray: Array<T>;

	constructor() {
		this.negativeArray = [];
		this.positiveArray = [];
	}

	at(index: number) {
		if (index < 0) {
			return this.negativeArray[index * -1 - 1];
		} else {
			return this.positiveArray[index];
		}
	}

	pushRight(item: T) {
		this.positiveArray.push(item);
	}

	pushLeft(item: T) {
		this.negativeArray.push(item);
	}
}