const MapObjects = [ComponentElasticUnit, ComponentInelasticUnit, ComponentStandardUnit, ComponentSpikeUnit, ComponentSlopeUnit];

const levels = [
	{
		objects: [],
	},
];

function load() {
	const lv = JSON.parse(document.getElementById("level").value);
	console.log(lv);

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

var selected = 0;
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

for (let i = 0; i < config.global.height; i++) {
	level[i] = [];
	for (let k = 0; k < config.global.width; k++) {
		level[i][k];
	}
}

document.addEventListener("keydown", (select) => {
	selected = parseInt(select.key) - 1 || selected;
	if (select.key == "r") {
		rotation = rotation + 1;
	}
});

canvas.addEventListener("mousemove", (e) => {});

canvas.addEventListener("mousedown", (e) => {
	var x = Math.floor(e.offsetX / 50);
	var y = Math.floor(e.offsetY / 50);
	if (e.which == 1) {
		if (!level[y][x]) level[y][x] = new MapObject(selected, x, y, rotation);
	} else if (e.which == 3) {
		delete level[y][x];
		level[y][x] = undefined;
	}
});
