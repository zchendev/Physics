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

async function update() {
	context.clearRect(0, 0, width, height);
	context.fillStyle = "black";
	context.fillRect(0, 0, width, height);

	let collisions = 0;

	for (let i = 0; i < composites.length; i++) {
		if (!composites[i]) continue;
		if (composites[i].controllable) update_controls(composites[i]);
		// if (!composites[i].entity.c) continue;
		composites[i].update();

		let gravity = false;

		for (let j = i; j < composites.length; j++) {
			if (!composites[j]) continue;
			// if (!composites[i].entity.c || !composites[j].entity.c) continue;
			if (!composites[i].entity.m && !composites[j].entity.m) continue;
			// if (!composites[j].entity.c) continue;
			collisions++;

			const prevy = composites[i].entity.v.y;

			if (Collision.collision.cd[composites[i].type][composites[j].type](composites[i], composites[j])) {
				Collision.collision.pr[composites[i].type][composites[j].type](composites[i], composites[j]);
				Collision.collision.cr[composites[i].type][composites[j].type](composites[i], composites[j]);
				if (composites[i].controllable || composites[j].controllable) {
					canapplyforce = 1;
				}

				if ((composites[i].entity.s === 1 || composites[j].entity.s === 1) && (composites[i].controllable || composites[j].controllable)) console.log("you win");
				if (composites[i].entity.s === 2 || composites[j].entity.s === 2) console.log("you lose");
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
			composites[i].entity.v.y += config.physics.gravity_differential;
			composites[i].entity.v = composites[i].entity.v.multiply(1 - config.physics.friction);
		}

		composites[i].render(context);
	}

	for (let i = 0; i < global.length; i++) {
		global[i].render(context);
	}

	calculate(collisions);

	if (md) {
		for (let i = 0; i < players.length; i++) {
			if (av) canvas_arrow(context, players[i].entity.p.x, players[i].entity.p.y, av.x + players[i].entity.p.x, av.y + players[i].entity.p.y);
		}
	}

	if (config.engine.simulate) requestAnimationFrame(update);
}

let md = false;

function simulate_status(status) {
	config.engine.simulate = status;
	if (status) update();
}

function calculate(collisions) {
	let k = 0;
	let mx = 0;
	let my = 0;
	for (i in composites) {
		if (!composites[i] || composites[i].type) continue;
		k += 0.5 * composites[i].entity.v.magnitude() ** 2 * composites[i].entity.m + 0.5 * (1 / composites[i].μ) * composites[i].entity.ω ** 2;
		mx += composites[i].entity.v.x * composites[i].entity.m;
		my += composites[i].entity.v.y * composites[i].entity.m;
	}
	ke.innerHTML = "Kinetic Energy: " + k.toFixed(2);
	p.innerHTML = "Momentum: " + new Vector(mx, my).magnitude().toFixed(2);
	px.innerHTML = "Momentum X: " + mx.toFixed(2);
	py.innerHTML = "Momentum Y: " + my.toFixed(2);
	pr.innerHTML = "Collisions checked: " + collisions;
}

function clear_balls() {
	for (let i = 0; i < composites.length; i++) {
		if (composites[i] instanceof BaseCircle) composites[i] = null;
	}

	for (let i = 0; i < config.global.height; i++) {
		for (let k = 0; k < config.global.width; k++) {
			if (level[i][k] && level[i][k].object instanceof ComponentPlayer) level[i][k] = null;
		}
	}
}

function canvas_arrow(context, fromx, fromy, tox, toy) {
	var headlen = 10; // length of head in pixels
	var dx = tox - fromx;
	var dy = toy - fromy;
	var angle = Math.atan2(dy, dx);
	context.beginPath();
	context.lineStyle = "white";
	context.moveTo(fromx, fromy);
	context.lineTo(tox, toy);
	context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
	context.moveTo(tox, toy);
	context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
	context.stroke();
	context.closePath();
}

function init() {
	// composites.push(new BaseCircle(200, 200, 20, 25));
	// composites.push(new BaseCircle(300, 200, 5, 25));
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

// init();
update();
