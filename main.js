const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 500;

const scoreBoard = document.getElementById("scoreBoard");

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const N = 100;
const cars = generateCars(N);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(
            localStorage.getItem("bestBrain"));
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.15);
        }
    }
}

let carsPassed = 0;
let generation = localStorage.getItem("generation") ? Number(localStorage.getItem("generation")) + 1 : 0

let traffic = [
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2)
]

animate();

function save() {
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
    localStorage.setItem("generation", generation);
}

function discard() {
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("generation")
}

function generateCars(N) {
    const cars = [];
    for (let i = 0; i < N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

function animate(time) {

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    bestCar = cars.find(
        c => c.y == Math.min(
            ...cars.map(c => c.y)
        ));
    
    scoreBoard.innerHTML = "Score: " + Math.floor((- bestCar.y + 200) / 10 + carsPassed * 20) + "<br/>\n" + 
                                "Car passed: " + carsPassed + "<br/>\n" +
                                    "Generation: " + generation;

    if(traffic[traffic.length - 1].y - 300 > bestCar.y){
        carsPassed++;
        traffic.pop();
        const lane = Math.floor(Math.random() * 4);
        traffic.unshift(new Car(road.getLaneCenter(lane), bestCar.y - 600, 30, 50, "DUMMY", 2));
        traffic[0].update(road.borders, []);
    }

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, traffic[i].color);
    }

    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx, "blue");
    }

    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, "blue", true);

    carCtx.restore();

    networkCtx.lineDashOffet = - time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
}