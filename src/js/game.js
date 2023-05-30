const MapObjects = [ComponentElasticUnit, ComponentInelasticUnit, ComponentStandardUnit, ComponentSpikeUnit, ComponentSlopeUnit, ComponentFlagUnit, ComponentPlayerNegative, ComponentPlayerPositive, ComponentCircleNegative, ComponentCirclePositive, ComponentMagneticInductor];

const levels = [
	{
		objects: [],
	},
];

function load() {
	const lv = JSON.parse(document.getElementById("level").value);
	console.log(lv);

	clearcanvas();

	for (let i = 0; i < config.global.height; i++) {
		for (let k = 0; k < config.global.width; k++) {
			if (!lv[i][k]) continue;
			const d = JSON.parse(lv[i][k]);
			level[i][k] = new MapObject(d.i, d.x, d.y, d.r);
		}
	}
}

function exp() {
	const data = [];

	for (let i = 0; i < config.global.height; i++) {
		data[i] = [];
		for (let k = 0; k < config.global.width; k++) {
			if (level[i][k]) data[i][k] = level[i][k].to_string();
			else data[i][k];
		}
	}

	console.log(data);

	document.getElementById("level").value = JSON.stringify(data);
}

var selected = -1;
var rotation = 0;
let level = [];

class MapObject {
	constructor(i, x, y, r) {
		this.object = new MapObjects[i](x, y, r);
		this.i = i;
		this.x = x;
		this.y = y;
		this.r = r;
	}

	to_string() {
		return JSON.stringify({
			i: this.i,
			x: this.x,
			y: this.y,
			r: this.r,
		});
	}
}

clearcanvas();

function clearcanvas() {
	for (let i = 0; i < config.global.height; i++) {
		level[i] = [];
		for (let k = 0; k < config.global.width; k++) {
			composites.length = 0;
		}
	}

	init();
}

let players = [];
let offset = 0;

function spawn_player(p, status) {

	if (status) {
		players.push(p);
    	p.controllable = true;
	} 
    
    for (let i = 0; i < config.global.height; i++) {
		for (let k = 0; k < config.global.width; k++) {
			if (level[i][k]) level[i][k].object.i ++;
		}
	}
}

document.addEventListener("keydown", (select) => {
	selected = parseInt(select.key) - 1 || selected;
	if (select.key == "r") {
		rotation = rotation + 1;
	} else if (select.key == "m") {
		selected = -1;
	}
});

canvas.addEventListener("mousemove", (e) => {
	if (!pi) return;
	pi.subtract(new Vector(e.offsetX, e.offsetY)).render(context, pi.x, pi.y);
});

let xi, yi;
let pi;

canvas.addEventListener("mousedown", e => {
	var x = Math.floor(e.offsetX / 50);
	var y = Math.floor(e.offsetY / 50);
	if (e.which == 1) {
		if (!level[y][x] && selected != -1) level[y][x] = new MapObject(selected, x, y, rotation);
	} else if (e.which == 3) {
		if (level[y][x]) {
			for (let i = 0; i < level[y][x].object.c; i++) {
				composites[level[y][x].object.i + i + offset] = null;
			}

			level[y][x] = undefined;
		}
	} else if (e.which == 2) {
		selected = -1;
	}

	xi = e.offsetX;
	yi = e.offsetY;

	pi = new Vector(xi, yi);
});

let canapplyforce = 1;

canvas.addEventListener("mouseup", e => {
	let p = pi.subtract(new Vector(e.offsetX, e.offsetY));

	if (selected == -1) {
		for (i in players) {
			if (canapplyforce == 1) {
				players[i].entity.v = players[i].entity.v.add(p.unit().multiply(20));
				canapplyforce = 2;
			} 
		}
	}

	pi = undefined;
})

function newselect(selection) {
    selected = selection - 1;
}