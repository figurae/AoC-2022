export class Vector2D {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	add(vector: Vector2D): Vector2D {
		return new Vector2D(this.x + vector.x, this.y + vector.y);
	}

	subtract(vector: Vector2D): Vector2D {
		return new Vector2D(this.x - vector.x, this.y - vector.y);
	}

	scale(scalar: number): Vector2D {
		return new Vector2D(this.x * scalar, this.y * scalar);
	}

	isEqual(vector: Vector2D): boolean {
		return this.x === vector.x && this.y === vector.y;
	}
}
