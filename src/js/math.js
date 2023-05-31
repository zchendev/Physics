class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	add(vector) {
		return new Vector(this.x + vector.x, this.y + vector.y);
	}

	subtract(vector) {
		return new Vector(this.x - vector.x, this.y - vector.y);
	}

	multiply(scalar) {
		return new Vector(this.x * scalar, this.y * scalar);
	}

	normal() {
		return new Vector(-this.y, this.x);
	}

	unit() {
		if (this.magnitude()) return new Vector(this.x / this.magnitude(), this.y / this.magnitude());
		return new Vector(0, 0);
	}

	magnitude() {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}

	dot(vector) {
		return this.x * vector.x + this.y * vector.y;
	}

	cross(vector) {
		return this.x * vector.y - this.y * vector.x;
	}

	render(context, x0, y0) {
		canvas_arrow(context, x0, y0, this.x, this.y);
	}
}

class Matrix {
	constructor(r, c) {
		this.r = r;
		this.c = c;
		this.matrix = [];
		for (let i = 0; i < r; i++) {
			this.matrix[i] = [];
			for (let k = 0; k < c; k++) {
				this.matrix[i][k] = 0;
			}
		}
	}

	multiply_vector(vector) {
		return new Vector(this.matrix[0][0] * vector.x + this.matrix[0][1] * vector.y, this.matrix[1][0] * vector.x + this.matrix[1][1] * vector.y);
	}

	apply_rotation_matrix(matrix) {}

	static rotation_matrix(angle) {
		const matrix = new Matrix(2, 2);
		matrix.matrix = [
			[Math.cos(angle), -Math.sin(angle)],
			[Math.sin(angle), Math.cos(angle)],
		];
		return matrix;
	}
}

class Logic {
	static xor(a, b) {
		return a != b;
	}
}
