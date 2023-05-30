const composites = [];
const global = [];
const config = {
	physics: {
		friction: 0.01,
	},
	global: {
		unit: 50,
		width: 20,
		height: 10,
	},
	engine: {
		simulate: true,
	}
};

class Collision {
	static collision = {
		cd: [
			[Collision.c2c_cd, Collision.c2s_cd],
			[Collision.s2c_cd, Collision.s2s_cd],
		],
		pr: [
			[Collision.c2c_pr, Collision.c2s_pr],
			[Collision.s2c_pr, Collision.s2s_pr],
		],
		cr: [
			[Collision.c2c_cr, Collision.c2s_cr],
			[Collision.s2c_cr, Collision.s2s_cr],
		],
	};

	// Circle to Circle Collision Detection
	static c2c_cd(a, b) {
		if (a.r + b.r >= b.entity.p.subtract(a.entity.p).magnitude()) return true;
		return false;
	}

	// Circle to Circle Penetration Resolution
	static c2c_pr(a, b) {
		let d = a.entity.p.subtract(b.entity.p);
		let r = d.unit().multiply((a.r + b.r - d.magnitude()) / (a.entity.i + b.entity.i));
		a.entity.p = a.entity.p.add(r.multiply(a.entity.i));
		b.entity.p = b.entity.p.add(r.multiply(-b.entity.i));
	}

	// Circle to Circle Collision Resolution
	static c2c_cr(a, b) {
		const collinear = a.entity.p.subtract(b.entity.p).unit();
		const impulse_vector = collinear.multiply((-(1 + Math.min(a.entity.e, b.entity.e)) * collinear.dot(a.entity.v.subtract(b.entity.v), collinear)) / (a.entity.i + b.entity.i));

		a.entity.v = a.entity.v.add(impulse_vector.multiply(a.entity.i));
		b.entity.v = b.entity.v.add(impulse_vector.multiply(-b.entity.i));
	}

	// Circle to Segment Collision Detection
	static c2s_cd(c, s) {
		if (Collision.cscp(c, s).subtract(c.entity.p).magnitude() < c.r) return true;
		return false;
	}

	// Circle to Segment Penetration Resolution
	static c2s_pr(c, s) {
		const penetration = c.entity.p.subtract(Collision.cscp(c, s));
		c.entity.p = c.entity.p.add(penetration.unit().multiply(c.r - penetration.magnitude()));
	}

	// Circle to Segment Collision Resolution
	static c2s_cr(c, s) {
		const normal = c.entity.p.subtract(Collision.cscp(c, s)).unit();
		c.entity.v = c.entity.v.add(normal.multiply(c.entity.v.dot(normal) * -(1 + Math.min(c.entity.e, s.entity.e))));
	}

	// Segment to Circle Collision Detection
	static s2c_cd(s, c) {
		if (Collision.cscp(c, s).subtract(c.entity.p).magnitude() < c.r) return true;
		return false;
	}

	// Segment to Circle Collision Detection
	static s2c_pr(s, c) {
		const penetration = c.entity.p.subtract(Collision.cscp(c, s));
		c.entity.p = c.entity.p.add(penetration.unit().multiply(c.r - penetration.magnitude()));
	}

	// Segment to Circle Collision Resolution
	static s2c_cr(s, c) {
		const normal = c.entity.p.subtract(Collision.cscp(c, s)).unit();
		c.entity.v = c.entity.v.add(normal.multiply(c.entity.v.dot(normal) * -(1 + Math.min(s.entity.e, c.entity.e))));
	}

	// Segment to Segment Collision Detection
	static s2s_cd(a, b) {
		return false;
	}

	// Segment to Segment Collision Detection
	static s2s_pr(a, b) {}

	// Segment to Segment Collision Detection
	static s2s_cr(a, b) {}

	// Utility function: closest point from a circle to a line segment
	static cscp(c, s) {
		if (s.b.subtract(s.a).unit().dot(s.a.subtract(c.entity.p)) > 0) return s.a;
		else if (s.b.subtract(s.a).unit().dot(c.entity.p.subtract(s.b)) > 0) return s.b;
		else
			return s.a.subtract(
				s.a
					.subtract(s.b)
					.unit()
					.multiply(s.a.subtract(s.b).unit().dot(s.a.subtract(c.entity.p)))
			);
	}

	static axis(a, b) {
		const axes = [];
		if (a instanceof BaseCircle && b instanceof BaseCircle) {
			axes.push(b.entity.p.subtract(a.entity.p).unit());
			return axes;
		}

		if (a instanceof BaseCircle) {
			axes.push(Collision.min_v(b, a.entity.p).subtract(a.entity.p).unit());
			axes.push(b.entity.d.normal());
			if (b instanceof BaseRectangle) axes.push(b.entity.d);
			return axes;
		}

		if (b instanceof BaseCircle) {
			axes.push(Collision.min_v(a, b.entity.p).subtract(b.entity.p).unit());
			axes.push(a.entity.d.normal());
			if (a instanceof BaseRectangle) axes.push(a.entity.d);
			return axes;
		}

		axes.push(a.entity.d.normal());

		if (a instanceof BaseRectangle) {
			axes.push(a.entity.d);
		}

		axes.push(b.entity.d.normal());

		if (b instanceof BaseRectangle) {
			axes.push(b.entity.d);
		}

		return axes;
	}

	static min_v(o, p) {
		let v;
		let min;

		for (let i = 0; i < o.v.length; i++) {
			if (p.subtract(o.v[i]).magnitude() < min || min === undefined) {
				v = o.v[i];
				min = p.subtract(o.v[i]).magnitude();
			}
		}

		return v;
	}

	static hst(a, b) {
		const axes = Collision.axis(a, b);
		let min = null,
			min_axis,
			vo;
		let separation = a instanceof BaseRectangle ? 2 : 1;

		// axes.push(a.entity.d.normal().unit());
		// axes.push(a.entity.d);
		// axes.push(b.entity.d.normal().unit());
		// axes.push(b.entity.d);

		for (let i = 0; i < axes.length; i++) {
			const p1 = this.proj(axes[i], a);
			const p2 = this.proj(axes[i], b);
			let overlap = Math.min(p1.max, p2.max) - Math.max(p1.min, p2.min);
			if (overlap < 0) return false;

			if ((p1.max > p2.max && p1.min < p2.min) || (p1.max < p2.max && p1.min > p2.min)) {
				const mins = Math.abs(p1.min - p2.min);
				const maxs = Math.abs(p1.max - p2.max);
				if (mins < maxs) {
					overlap += mins;
				} else {
					overlap += maxs;
					axes[i] = axes[i].multiply(-1);
				}
			}

			if (overlap < min || min === null) {
				min = overlap;
				min_axis = axes[i];
				if (i < separation) {
					vo = b;
					if (p1.max < p2.max) min_axis = axes[i].multiply(-1);
				} else {
					vo = a;
					if (p1.max < p2.max) min_axis = axes[i].multiply(-1);
				}
			}
		}

		return {
			penetration: min,
			axis: min_axis,
			vertex: Collision.proj(min_axis, vo).cv,
		};
	}

	static proj(x, o) {
		Collision.c(x, o);
		let min = x.dot(o.v[0]);
		let max = min;
		let cv = o.v[0];

		for (let i in o.v) {
			const p = x.dot(o.v[i]);
			if (p > max) max = p;
			if (p < min) {
				min = p;
				cv = o.v[i];
			}
		}

		return { min: min, max: max, cv: cv };
	}

	static c(x, o) {
		if (o instanceof BaseCircle) {
			o.v[0] = o.entity.p.add(x.unit().multiply(-o.r));
			o.v[1] = o.entity.p.add(x.unit().multiply(o.r));
		}
	}

	constructor(a, b) {
		this.a = a;
		this.b = b;
	}

	solve() {
		if (!this.cd()) return;
		this.pr();
		this.cr();
	}

	cd() {
		const c = Collision.hst(this.a, this.b);
		if (!c) return false;
		this.x = c.axis;
		this.v = c.vertex;
		this.p = c.penetration;
		return true;
	}

	pr() {
		let pr = this.x.multiply(this.p / (this.a.entity.i + this.b.entity.i));
		this.a.entity.p = this.a.entity.p.add(pr.multiply(this.a.entity.i));
		this.b.entity.p = this.b.entity.p.add(pr.multiply(-this.b.entity.i));
	}

	cr() {
		let collArm1 = this.v.subtract(this.a.entity.p);
		let closVel1 = this.a.entity.v.add(new Vector(-this.a.entity.ω * collArm1.y, this.a.entity.ω * collArm1.x));
		let collArm2 = this.v.subtract(this.b.entity.p);
		let closVel2 = this.b.entity.v.add(new Vector(-this.b.entity.ω * collArm2.y, this.b.entity.ω * collArm2.x));

		let impAug1 = collArm1.cross(this.x) ** 2 * this.a.μ;
		let impAug2 = collArm2.cross(this.x) ** 2 * this.b.μ;

		let relVel = closVel1.subtract(closVel2);
		let sepVel = relVel.dot(this.x);
		let new_sepVel = -sepVel * Math.min(this.a.entity.e, this.b.entity.e);
		let vsep_diff = new_sepVel - sepVel;

		let impulseVec = this.x.multiply(vsep_diff / (this.a.entity.i + this.b.entity.i + impAug1 + impAug2));

		this.a.entity.v = this.a.entity.v.add(impulseVec.multiply(this.a.entity.i));
		this.b.entity.v = this.b.entity.v.add(impulseVec.multiply(-this.b.entity.i));

		this.a.entity.ω += this.a.μ * collArm1.cross(impulseVec);
		this.b.entity.ω -= this.b.μ * collArm2.cross(impulseVec);
	}
}

class Entity {
	constructor(x, y, m) {
		this.p = new Vector(x, y);
		this.v = new Vector(0, 0);
		this.a = new Vector(0, 0);
		this.r = new Vector(1, 0);
		this.d = this.r;
		this.m = m;
		this.i = m ? 1 / m : 0; // Inverse Mass
		this.θ = 0;
		this.ω = 0;
		this.e = 1; // Elasticity
		this.q = 1; // Charge
        this.c = true; // Collidable
	}

	update() {
		this.a = this.a.unit().multiply(this.a.magnitude());
		this.v = this.v.add(this.a).multiply(1 - config.physics.friction);
		this.p = this.p.add(this.v);
		this.d = Matrix.rotation_matrix(this.θ).multiply_vector(this.r);
		this.ω = this.ω * (1 - config.physics.friction);
		this.θ += this.ω;
	}

	accelerate(magnitude) {
		this.a = this.d.multiply(magnitude);
	}
}

class BaseCircle {
	constructor(x, y, m, r) {
		this.type = 0;
		this.r = r;
		this.v = [];
		this.entity = new Entity(x, y, m);
		this.μ = 1 / (m * r ** 2);
		this.controllable = false;
	}

	update() {
		this.entity.update();
	}

	render(context) {
		context.beginPath();
		context.arc(this.entity.p.x, this.entity.p.y, this.r, 0 + this.entity.θ, Math.PI / 6 + this.entity.θ);
		context.strokeStyle = this.controllable ? "red" : "white";
		context.stroke();
		context.closePath();
		context.beginPath();
		context.arc(this.entity.p.x, this.entity.p.y, this.r, Math.PI / 6 + this.entity.θ, (11 * Math.PI) / 6 + this.entity.θ);
		context.strokeStyle = "white";
		context.stroke();
		context.closePath();
		context.beginPath();
		context.arc(this.entity.p.x, this.entity.p.y, this.r, (11 * Math.PI) / 6 + this.entity.θ, 2 * Math.PI + this.entity.θ);
		context.strokeStyle = this.controllable ? "red" : "white";
		context.stroke();
		context.closePath();
	}
}

class BaseSegment {
	constructor(x1, y1, x2, y2) {
		this.type = 1;
		this.a = new Vector(x1, y1);
		this.b = new Vector(x2, y2);
		this.c = this.a.add(this.b).multiply(0.5);
		this.l = this.b.subtract(this.a).magnitude();
		this.v = [];
		this.entity = new Entity(this.c.x, this.c.y, 0);
		this.entity.d = this.b.subtract(this.a).unit();
		this.v[0] = this.a;
		this.v[1] = this.b;
		this.μ = 0;
        this.o = "rgb(255, 255, 255)";

		this.reference = this.b.subtract(this.a).unit();
	}

	update() {}

	render(context) {
		// const rotation = Matrix.rotation_matrix(this.entity.θ).multiply_vector(this.reference);
		// this.a = this.c.add(rotation.multiply(this.l * -0.5));
		// this.b = this.c.add(rotation.multiply(this.l * 0.5));
		context.beginPath();
		context.strokeStyle = this.o;
		context.moveTo(this.a.x, this.a.y);
		context.lineTo(this.b.x, this.b.y);
		context.stroke();
		context.closePath();
	}
}

class CompositeTriangle {
	constructor(x0, y0, x1, y1, x2, y2, e, color) {
		const s0 = new BaseSegment(x0, y0, x1, y1);
		const s1 = new BaseSegment(x1, y1, x2, y2);
		const s2 = new BaseSegment(x2, y2, x0, y0);

		s0.entity.e = e;
		s1.entity.e = e;
		s2.entity.e = e;

        if (color) {
            s0.o = color;
            s1.o = color;
            s2.o = color;
        }

        this.i = composites.length;
        this.c = 3;

		composites.push(s0, s1, s2);
	}
}

class CompositeRectangle {
	constructor(cx, cy, w, h, e, color) {
		const s0 = new BaseSegment(cx - w / 2, cy + h / 2, cx - w / 2, cy - h / 2);
		const s1 = new BaseSegment(cx - w / 2, cy - h / 2, cx + w / 2, cy - h / 2);
		const s2 = new BaseSegment(cx + w / 2, cy + h / 2, cx + w / 2, cy - h / 2);
		const s3 = new BaseSegment(cx + w / 2, cy + h / 2, cx - w / 2, cy + h / 2);

		if (typeof e == "object") {
			s0.entity.e = e[0];
			s1.entity.e = e[1];
			s2.entity.e = e[2];
			s3.entity.e = e[3];
		} else {
			s0.entity.e = e;
			s1.entity.e = e;
			s2.entity.e = e;
			s3.entity.e = e;
		}

        if (color) {
            s0.o = color;
            s1.o = color;
            s2.o = color;
            s3.o = color;
        }

        this.i = composites.length;
        this.c = 4;

		composites.push(s0, s1, s2, s3);
	}
}

class ComponentElasticUnit extends CompositeRectangle {
	constructor(x, y) {
		x = x * config.global.unit + config.global.unit / 2;
		y = y * config.global.unit + config.global.unit / 2;
		super(x, y, config.global.unit, config.global.unit, 1, "rgb(0, 255, 0)");
	}
}

class ComponentInelasticUnit extends CompositeRectangle {
	constructor(x, y) {
		x = x * config.global.unit + config.global.unit / 2;
		y = y * config.global.unit + config.global.unit / 2;
		super(x, y, config.global.unit, config.global.unit, 0, "rgb(0, 191, 255)");
	}
}

class ComponentStandardUnit extends CompositeRectangle {
	constructor(x, y) {
		x = x * config.global.unit + config.global.unit / 2;
		y = y * config.global.unit + config.global.unit / 2;
		super(x, y, config.global.unit, config.global.unit, 0.5);
	}
}

class ComponentSpikeUnit extends CompositeTriangle {
	constructor(x, y, d) {
		x *= config.global.unit;
		y *= config.global.unit;
		switch (d % 4) {
			default:
				super(x, y + config.global.unit, x + config.global.unit / 2, y, x + config.global.unit, y + config.global.unit, 0);
				break;
			case 1:
				super(x, y + config.global.unit, x + config.global.unit, y + config.global.unit / 2, x, y, 0);
				break;
			case 2:
				super(x, y, x + config.global.unit / 2, y + config.global.unit, x + config.global.unit, y, 0);
				break;
			case 3:
				super(x + config.global.unit, y, x, y + config.global.unit / 2, x + config.global.unit, y + config.global.unit, 0);
				break;
		}
	}
}

class ComponentSlopeUnit extends CompositeTriangle {
	constructor(x, y, d) {
		x *= config.global.unit;
		y *= config.global.unit;
		switch (d % 4) {
			default:
				super(x, y + config.global.unit, x + config.global.unit, y, x + config.global.unit, y + config.global.unit, 0);
				break;
			case 1:
				super(x, y, x + config.global.unit, y + config.global.unit, x, y + config.global.unit, 0);
				break;
			case 2:
				super(x, y, x + config.global.unit, y, x, y + config.global.unit, 0);
				break;
			case 3:
				super(x, y, x + config.global.unit, y, x + config.global.unit, y + config.global.unit, 0);
				break;
		}
	}
}

class ComponentFlagUnit {
	constructor(x, y, d) {
        x *= config.global.unit;
		y *= config.global.unit;
		const s0 = new BaseSegment(x + config.global.unit / 3, y + config.global.unit, x + config.global.unit / 3, y - config.global.unit);
		const s1 = new BaseSegment(x + config.global.unit / 3, y - config.global.unit, x + config.global.unit, y - config.global.unit / 2);
		const s2 = new BaseSegment(x + config.global.unit, y - config.global.unit / 2, x + config.global.unit / 3, y - config.global.unit / 2);

        s0.entity.c = false;
        s1.entity.c = false;
        s2.entity.c = false;

        composites.push(s0, s1, s2);
	}
}

class ComponentCircle {
    constructor (x, y, q) {
        x *= config.global.unit;
		y *= config.global.unit;

        this.circle = new BaseCircle(x + config.global.unit / 2, y + config.global.unit / 2, 5, config.global.unit / 2)
		this.circle.entity.q = q;

		spawn_player(this.circle, false)
		composites.unshift(this.circle)
    }
}

class ComponentCircleNegative extends ComponentCircle {
    constructor (x, y) {
        super(x, y, -1)
    }
}

class ComponentCirclePositive extends ComponentCircle {
    constructor (x, y) {
        super(x, y, 1)
    }
}

class ComponentPlayer {
    constructor(x, y, q) {
        x *= config.global.unit;
		y *= config.global.unit;
        this.player = new BaseCircle(x + config.global.unit / 2, y + config.global.unit / 2, 5, config.global.unit / 2)
        this.player.controllable = true;
        this.player.entity.q = q;

        spawn_player(this.player, true)
        composites.unshift(this.player)
    }
}

class ComponentPlayerNegative extends ComponentPlayer {
    constructor(x, y) {
        super(x, y, -1);
    }
}

class ComponentPlayerPositive extends ComponentPlayer {
    constructor(x, y) {
        super(x, y, 1);
    }
}

class ComponentMagneticInductor {
	constructor(x, y) {
		this.field = new ComponentFieldUniform(x - 2, y - 2, 5, 5, 0, 1);
		this.box = new ComponentStandardUnit(x, y);
	}
}

class ComponentFieldUniform {
	constructor(x, y, w, h, d, b) {
		this.x = x * config.global.unit;
		this.y = y * config.global.unit;
		this.w = w * config.global.unit;
		this.h = h * config.global.unit;
		this.d = d; // 0 = into, 1 = out of
		this.b = b;
		global.push(this);
	}

	range(p) {
		if (p.x >= this.x && p.x <= this.x + this.w && p.y >= this.y && p.y <= this.y + this.h) return true;
		return false;
	}

	interact(o) {
		const m = o.entity.v.magnitude();
		if (this.d) {
			o.entity.v = o.entity.v
				.add(
					Matrix.rotation_matrix((Math.PI / 2) * 3)
						.multiply_vector(o.entity.v)
						.multiply(o.entity.q * o.entity.v.magnitude() * 0.01 * this.b)
				)
				.unit()
				.multiply(m);
		} else {
			o.entity.v = o.entity.v
				.add(
					Matrix.rotation_matrix((Math.PI / 2))
						.multiply_vector(o.entity.v)
						.multiply(o.entity.q * o.entity.v.magnitude() * 0.01 * this.b)
				)
				.unit()
				.multiply(m);
		}
	}

	render(context) {
		context.beginPath();
		context.strokeStyle = "rgba(255, 255, 255, 0.5)";
		context.moveTo(this.x, this.y);
		context.lineTo(this.x + this.w, this.y);
		context.lineTo(this.x + this.w, this.y + this.h);
		context.lineTo(this.x, this.y + this.h);
		context.lineTo(this.x, this.y);
		context.stroke();
		context.closePath();
		context.fillStyle = "rgba(255, 255, 255, 0.25)";
		context.fill();
	}
}
