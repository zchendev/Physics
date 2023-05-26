const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
}

document.addEventListener('keydown', function(event) {
    keys[event.code] = true;
})

document.addEventListener('keyup', function(event) {
    keys[event.code] = false;
})

function update_controls(composite) {
    composite.entity.accelerate(0, 0)
    if (keys.ArrowUp) composite.entity.accelerate(1);
    if (keys.ArrowDown) composite.entity.accelerate(-1)
    if (keys.ArrowLeft) composite.entity.θ -= 0.05;
    if (keys.ArrowRight) composite.entity.θ += 0.05;
    // if (keys.ArrowLeft) composite.entity.accelerate(-(keys.ArrowLeft != keys.ArrowRight), null);
    // if (keys.ArrowRight) composite.entity.accelerate((keys.ArrowLeft != keys.ArrowRight), null);
}