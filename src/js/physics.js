const composites = [];
const config = {
    physics: {
        friction: 0,
        elasticity: 1,
    },
}

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
    }

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
        b.entity.p = b.entity.p.add(r.multiply(-b.entity.i))
    }

    // Circle to Circle Collision Resolution
    static c2c_cr(a, b) {
        const collinear = a.entity.p.subtract(b.entity.p).unit();
        const impulse_vector = collinear.multiply(-(1 + config.physics.elasticity) * collinear.dot(a.entity.v.subtract(b.entity.v), collinear) / (a.entity.i + b.entity.i));
        
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
        c.entity.v = c.entity.v.add(normal.multiply(c.entity.v.dot(normal) * -(1 + config.physics.elasticity)))
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

    // Segment to Circle Collision Detection
    static s2c_cr(s, c) {
        const normal = c.entity.p.subtract(Collision.cscp(c, s)).unit();
        c.entity.v = c.entity.v.add(normal.multiply(c.entity.v.dot(normal) * -(1 + config.physics.elasticity)))
    }

    // Segment to Segment Collision Detection
    static s2s_cd(a, b) {
        return false;
    }

    // Segment to Segment Collision Detection
    static s2s_pr(a, b) {

    }

    // Segment to Segment Collision Detection
    static s2s_cr(a, b) {
        
    }

    // Utility function: closest point from a circle to a line segment
    static cscp(c, s) {
        if (s.b.subtract(s.a).unit().dot(s.a.subtract(c.entity.p)) > 0) return s.a;
        else if (s.b.subtract(s.a).unit().dot(c.entity.p.subtract(s.b)) > 0) return s.b;
        else return s.a.subtract(s.a.subtract(s.b).unit().multiply(s.a.subtract(s.b).unit().dot(s.a.subtract(c.entity.p))));
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

        if(b instanceof BaseCircle){
            axes.push(Collision.min_v(a, b.entity.p).subtract(b.entity.p).unit());
            axes.push(a.entity.d.normal());
            if (a instanceof BaseRectangle) axes.push(a.entity.d);
            return axes;
        }

        axes.push(a.entity.d.normal());

        if (a instanceof BaseRectangle){
            axes.push(a.entity.d);
        }

        axes.push(b.entity.d.normal());

        if (b instanceof BaseRectangle){
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
        let min = null, min_axis, vo;
        let separation = a instanceof BaseRectangle ? 2 : 1;

        // axes.push(a.entity.d.normal().unit());
        // axes.push(a.entity.d);
        // axes.push(b.entity.d.normal().unit());
        // axes.push(b.entity.d);

        for (let i = 0; i < axes.length; i++){
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

            if (overlap < min || min === null){
                min = overlap;
                min_axis = axes[i];
                if (i < separation){
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

        return {min: min, max: max, cv: cv};
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
        let new_sepVel = -sepVel * config.physics.elasticity;
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
    }

    update() {
        this.a = this.a.unit().multiply(this.a.magnitude());
        this.v = this.v.add(this.a).multiply(1 - config.physics.friction)
        this.p = this.p.add(this.v);
        this.d = Matrix.rotation_matrix(this.θ).multiply_vector(this.r);
        this.ω = this.ω * (1 - config.physics.friction);
        this.θ += this.ω;
    }

    accelerate(magnitude) {
        this.a = this.d.multiply(magnitude)
    }
}

class BaseCircle {
    constructor(x, y, m, r, controllable = false) {
        this.type = 0;
        this.r = r;
        this.v = []
        this.entity = new Entity(x, y, m);
        this.μ = 1 / (m * r ** 2);
        this.controllable = controllable;
    }

    update() {
        this.entity.update();
    }

    render(context) {
        context.beginPath();
        context.arc(this.entity.p.x, this.entity.p.y, this.r, 0 + this.entity.θ, Math.PI / 6 + this.entity.θ);
        context.strokeStyle = "red";
        context.stroke();
        context.closePath();
        context.beginPath();
        context.arc(this.entity.p.x, this.entity.p.y, this.r, Math.PI / 6 + this.entity.θ, 11 * Math.PI / 6 + this.entity.θ);
        context.strokeStyle = "black";
        context.stroke();
        context.closePath();
        context.beginPath();
        context.arc(this.entity.p.x, this.entity.p.y, this.r, 11 * Math.PI / 6 + this.entity.θ, 2 * Math.PI + this.entity.θ);
        context.strokeStyle = "red";
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
        this.entity = new Entity(this.c.x, this.c.y, 1)
        this.entity.d = this.b.subtract(this.a).unit();
        this.v[0] = this.a;
        this.v[1] = this.b;
        this.μ = 0;

        this.reference = this.b.subtract(this.a).unit();
    }

    update(){};

    render(context) {
        // const rotation = Matrix.rotation_matrix(this.entity.θ).multiply_vector(this.reference);
        // this.a = this.c.add(rotation.multiply(this.l * -0.5));
        // this.b = this.c.add(rotation.multiply(this.l * 0.5));
        context.beginPath();
        context.strokeStyle = "black";
        context.moveTo(this.a.x, this.a.y);
        context.lineTo(this.b.x, this.b.y);
        context.stroke();
        context.closePath();
    }
}

// class BaseLine {
//     constructor(x1, y1, x2, y2) {
//         this.a = new Vector(x1, y1); // start
//         this.b = new Vector(x2, y2); // end
//         this.v = [this.a, this.b]; // vertices
//         this.c = this.a.add(this.b).multiply(0.5); // center
//         this.l = this.b.subtract(this.a).magnitude(); // length

//         this.reference = this.b.subtract(this.a).unit();
//         this.slope = (y2 - y1) / (x2 - x1);
//     }

//     update(){};

//     render(context) {
//         // const rotation = Matrix.rotation_matrix(this.θ).multiply_vector(this.reference);
//         // this.a = this.c.add(rotation.multiply(this.l * -0.5));
//         // this.b = this.c.add(rotation.multiply(this.l * 0.5));
//         context.beginPath();
//         context.strokeStyle = "black";
//         context.moveTo(this.a.x, this.a.y);
//         context.lineTo(this.b.x, this.b.y);
//         context.stroke();
//         context.closePath();
//     }
// }

class BaseRectangle {
    constructor(x, y, w, h, m, controllable = false, floor = false) {
        this.x = x; // center x
        this.y = y; // center y
        this.w = w; // width
        this.h = h; // height
        this.v = [];
        this.v[0] = new Vector(x - w / 2, y - h / 2);
        this.v[1] = new Vector(x + w / 2, y - h / 2);
        this.v[2] = new Vector(x + w / 2, y + h / 2);
        this.v[3] = new Vector(x - w / 2, y + h / 2);
        this.entity = new Entity(this.x, this.y, m);
        this.μ = 1 / (m * (this.w ** 2 + this.h ** 2) / 12);
        this.controllable = controllable;
        this.f = floor;
    }

    update() {
        this.entity.update();
        this.v[0] = this.entity.p.add(this.entity.d.multiply(-this.w / 2).add(this.entity.d.normal().multiply(this.h / 2)))
        this.v[1] = this.entity.p.add(this.entity.d.multiply(-this.w / 2).add(this.entity.d.normal().multiply(-this.h / 2)))
        this.v[2] = this.entity.p.add(this.entity.d.multiply(this.w / 2).add(this.entity.d.normal().multiply(-this.h / 2)))
        this.v[3] = this.entity.p.add(this.entity.d.multiply(this.w / 2).add(this.entity.d.normal().multiply(this.h / 2)))
    }

    render(context) {
        context.beginPath();
        context.moveTo(this.v[0].x, this.v[0].y);
        context.lineTo(this.v[1].x, this.v[1].y);
        context.lineTo(this.v[2].x, this.v[2].y);
        context.lineTo(this.v[3].x, this.v[3].y);
        context.lineTo(this.v[0].x, this.v[0].y);
        context.strokeStyle = "black";
        context.stroke();
        context.closePath();
    }
}

// class BaseRectangle {
//     constructor(x, y, w, h, controllable) {
//         this.c = new Vector()
//         this.entity = new Entity(x, y);
//         this.w = w;
//         this.h = h;
//         this.sides = [];
//         this.controllable = controllable;

//         this.calculate_segment();
//     }

//     calculate_segment() {
//         this.sides[0] = new BaseLine(this.entity.p.x, this.entity.p.y, this.entity.p.x + this.w, this.entity.p.y);
//         this.sides[1] = new BaseLine(this.entity.p.x, this.entity.p.y, this.entity.p.x, this.entity.p.y + this.h);
//         this.sides[2] = new BaseLine(this.entity.p.x, this.entity.p.y + this.h, this.entity.p.x + this.w, this.entity.p.y + this.h);
//         this.sides[3] = new BaseLine(this.entity.p.x + this.w, this.entity.p.y, this.entity.p.x + this.w, this.entity.p.y + this.h);
//     }

//     update() {
//         this.calculate_segment();
//     }

//     render(context) {
//         for (let i in this.sides) {
//             this.sides[i].render(context);
//         }
//     }

//     // check_collision(vertex) {
//     //     if ((this.slope)(vertex.x - this.a.x) + this.a.y < vertex.y) return true;
//     //     return false;
//     // }
// }

// class BaseRectangle() {
//     constructor ()
// }

// class Composite {
//     constructor(x, y, m, bases, controllable = false) {
//         this.bases = bases;
//         this.entity = new Entity(x, y, m);
//         this.controllable = controllable;
//     }

//     update() {
//         this.entity.update();
//     }

//     render(context) {
//         for (i in this.bases)
//             this.bases[i].render(context, this.entity.p);
//     }
// }