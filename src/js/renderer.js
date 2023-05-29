const width = 960;
const height = 540;

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
    // const start = performance.now();

    context.clearRect(0, 0, width, height)

    for (let i = 0; i < composites.length; i++) {
        composite = composites[i];
        if (composite.controllable) update_controls(composite);
        if (!composite.f) composite.entity.v = composite.entity.v.add({x: 0, y: 0.01});
        composite.update();
        for (let j = i + 1; j < composites.length; j++) {
            const collision = new Collision(composite, composites[j]);
            collision.solve();
        }
        composite.render(context);
    }

    calculate();

    // for (i in composites) {
    //     for (let j = 0; j < i; j++) {
    //         if (Collision.collision.cd[composites[i].type][composites[j].type](composites[i], composites[j])) {
    //             Collision.collision.pr[composites[i].type][composites[j].type](composites[i], composites[j]);
    //             Collision.collision.cr[composites[i].type][composites[j].type](composites[i], composites[j]);
    //         }
    //     }
    // }

    // pr.innerHTML = "Loop Instance Time: " + (performance.now() - start).toFixed(2);

    requestAnimationFrame(update);
}

function calculate() {
    let k = 0; let mx = 0; let my = 0;
    for (i in composites) {
        if (composites[i].type) continue;
        k += 0.5 * composites[i].entity.v.magnitude() ** 2 * composites[i].entity.m + 0.5 * (1 / composites[i].μ) * composites[i].entity.ω ** 2;
        mx += composites[i].entity.v.x * composites[i].entity.m;
        my += composites[i].entity.v.y * composites[i].entity.m;
    }
    ke.innerHTML = "Mechanical Energy: " + k.toFixed(2)
    p.innerHTML = "Momentum: " + new Vector(mx, my).magnitude().toFixed(2);
    px.innerHTML = "Momentum X: " + mx.toFixed(2);
    py.innerHTML = "Momentum Y: " + my.toFixed(2);
}

// composites.push(new BaseCircle(20, 20, 10, 50, false));
// composites.push(new BaseCircle(200, 200, 20, 50, false));
// composites.push(new BaseCircle(500, 200, 5, 50, false));
// composites.push(new BaseSegment(0, 0, 0, height));
// composites.push(new BaseSegment(0, 0, width, 0));
// composites.push(new BaseSegment(width, 0, width, height));
// composites.push(new BaseSegment(0, height, width, height));
// composites.push(new BaseSegment(100, 100, 200, 200));
composites.push(new BaseRectangle(200, 500, 400, 100, 5, true))
composites.push(new BaseRectangle(200, 400, 400, 100, 5, false))
// composites.push(new BaseRectangle(0, height / 2, 1, height, Infinity, false))
composites.push(new BaseRectangle(width / 2, height, width, 1, Infinity, false, true))
// composites.push(new BaseRectangle(0, height / 2, 1, height, Infinity, false))
// composites.push(new BaseRectangle(0, height / 2, 1, height, Infinity, false))


// const line = new BaseLine(100, 100, 200, 200);
// const line2 = new BaseLine(100, 200, 200, 100);
// const rect = new BaseRectangle(100, 100, 200, 300, true)
// composites.push(rect);

update();