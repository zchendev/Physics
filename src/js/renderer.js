const width = config.global.unit * config.global.width;
const height = config.global.unit * config.global.height;

const canvas = document.querySelector("#canvas-renderer");
const context = canvas.getContext("2d");
canvas.width = width;
canvas.height = height;

const ke = document.querySelector("#ke");
const p = document.querySelector("#p");
const px = document.querySelector("#px");
const py = document.querySelector("#py");
const pr = document.querySelector("#pr");

function update() {
	context.clearRect(0, 0, width, height);
	context.fillStyle = "black";
	context.fillRect(0, 0, width, height);

	let collisions = 0;

	for (let i = 0; i < composites.length; i++) {
		if (composites[i].controllable) update_controls(composites[i]);
		composites[i].update();

		let gravity = false;

		for (let j = i; j < composites.length; j++) {
			if (!composites[i].entity.m && !composites[j].entity.m) continue;
			collisions++;

			const prevy = composites[i].entity.v.y;

			if (Collision.collision.cd[composites[i].type][composites[j].type](composites[i], composites[j])) {
				Collision.collision.pr[composites[i].type][composites[j].type](composites[i], composites[j]);
				Collision.collision.cr[composites[i].type][composites[j].type](composites[i], composites[j]);
			}

			const postvy = composites[i].entity.v.y;

			if (prevy <= postvy) gravity = true;
		}

		if (composites[i].entity.i != 0) {
			for (let k = 0; k < global.length; k++) {
				if (global[k].range(composites[i].entity.p)) global[k].interact(composites[i]);
			}
		}

		if (gravity) {
			composites[i].entity.v.y += 0.2;
			composites[i].entity.v = composites[i].entity.v.multiply(1 - config.physics.friction);
		}

		composites[i].render(context);
	}

	for (let i = 0; i < global.length; i++) {
		global[i].render(context);
	}

	calculate(collisions);

	requestAnimationFrame(update);
}

function calculate(collisions) {
	let k = 0;
	let mx = 0;
	let my = 0;
	for (i in composites) {
		if (composites[i].type) continue;
		k += 0.5 * composites[i].entity.v.magnitude() ** 2 * composites[i].entity.m + 0.5 * (1 / composites[i].μ) * composites[i].entity.ω ** 2;
		mx += composites[i].entity.v.x * composites[i].entity.m;
		my += composites[i].entity.v.y * composites[i].entity.m;
	}
	ke.innerHTML = "Mechanical Energy: " + k.toFixed(2);
	p.innerHTML = "Momentum: " + new Vector(mx, my).magnitude().toFixed(2);
	px.innerHTML = "Momentum X: " + mx.toFixed(2);
	py.innerHTML = "Momentum Y: " + my.toFixed(2);
	pr.innerHTML = "Collisions checked: " + collisions;
}

function init() {
	const c1 = new BaseSegment(0, 0, 0, height);
	const c2 = new BaseSegment(0, 0, width, 0);
	const c3 = new BaseSegment(width, 0, width, height);
	const c4 = new BaseSegment(0, height, width, height);
	c1.entity.e = 0.5;
	c2.entity.e = 0.5;
	c3.entity.e = 0.5;
	c4.entity.e = 0.5;
	composites.push(c1);
	composites.push(c2);
	composites.push(c3);
	composites.push(c4);
}

composites.push(new BaseCircle(100, 100, 10, 25, true));
composites.push(new BaseCircle(200, 200, 20, 25, false));
composites.push(new BaseCircle(300, 200, 5, 25, false));

init();
update();
