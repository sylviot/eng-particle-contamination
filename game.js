define("Particle", ["require", "exports", "three"], function (require, exports, THREE) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const VELOCITY = 1;
    const RADIUS = 5;
    const GEOMETRY = new THREE.CircleGeometry(RADIUS);
    const MATERIAL_SICK = new THREE.MeshBasicMaterial({ color: 0xff2222 });
    const MATERIAL_HEALTHY = new THREE.MeshBasicMaterial({ color: 0x4caf50 });
    var ParticleStatus;
    (function (ParticleStatus) {
        ParticleStatus[ParticleStatus["SICK"] = 16720418] = "SICK";
        ParticleStatus[ParticleStatus["HEALTHY"] = 5025616] = "HEALTHY";
    })(ParticleStatus = exports.ParticleStatus || (exports.ParticleStatus = {}));
    class Particle {
        constructor(x, y, status) {
            this._angle = Math.random() * THREE.Math.degToRad(360) + 0.1;
            this._radius = RADIUS;
            this._velocity = VELOCITY;
            this._vectorX = Math.cos(this._angle) * this._velocity;
            this._vectorY = Math.sin(this._angle) * this._velocity;
            this._geometry = GEOMETRY || new THREE.CircleGeometry(this._radius);
            this._mesh = new THREE.Mesh(this._geometry, this._material);
            this.changeStatus(status);
            this.setPosition(x, y);
        }
        getMesh() {
            return this._mesh;
        }
        getMaterial() {
            return this._mesh.material;
        }
        getGeometry() {
            return this._geometry;
        }
        getAngle() {
            return this._angle;
        }
        getRadius() {
            return this._radius;
        }
        getStatus() {
            return this._status;
        }
        getVector() {
            return { x: this._vectorX, y: this._vectorY };
        }
        setPosition(x, y) {
            this._mesh.position.x = x;
            this._mesh.position.y = y;
            this._mesh.position.z = 2;
        }
        changeColor() {
            this._mesh.material = (this._status == ParticleStatus.SICK) ? MATERIAL_SICK : MATERIAL_HEALTHY;
        }
        changeStatus(newStatus) {
            this._status = newStatus;
            this.changeColor();
        }
        invertVectorX() {
            this._vectorX *= -1;
        }
        invertVectorY() {
            this._vectorY *= -1;
        }
    }
    exports.Particle = Particle;
});
define("Main", ["require", "exports", "three", "Particle"], function (require, exports, THREE, Particle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DOENTE = 0xff2222;
    const SAUDAVEL = 0x4caf50;
    const WORLD_PARTICLE_COUNT = 500;
    const WORLD_WIDTH = window.innerWidth - 10;
    const WORLD_HEIGHT = window.innerHeight - 10;
    class Main {
        constructor() {
            this._renderer = new THREE.WebGLRenderer({ antialias: false });
            this._renderer.setClearColor(0x000, 1);
            this._renderer.setSize(WORLD_WIDTH, WORLD_HEIGHT);
            document.body.appendChild(this._renderer.domElement);
            this._camera = new THREE.OrthographicCamera(0, WORLD_WIDTH, 0, -WORLD_HEIGHT, 1, 100);
            this._camera.position.x = 0;
            this._camera.position.y = 0;
            this._camera.position.z = 10;
            this._clock = new THREE.Clock();
            this._scene = new THREE.Scene();
            this._time = -1;
            this.startSimulation(WORLD_WIDTH, WORLD_HEIGHT, WORLD_PARTICLE_COUNT);
        }
        startSimulation(width, height, length) {
            while (this._scene.children.length) {
                this._scene.remove(this._scene.children[0]);
            }
            this._score = document.getElementById('score');
            this.createBound(width, height);
            this._particles = [...Array(length)];
            for (let i in this._particles) {
                let w = ~~(Math.random() * width), h = ~~(Math.random() * -height);
                this._particles[i] = new Particle_1.Particle(w, h, Particle_1.ParticleStatus.HEALTHY);
                this._scene.add(this._particles[i].getMesh());
            }
            this._particles[0].changeStatus(Particle_1.ParticleStatus.SICK);
        }
        createBound(width, height) {
            let lineWidth = 4;
            let minX = 1, maxX = width - lineWidth / 2, minY = -1, maxY = -height + lineWidth / 2;
            let material = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: lineWidth });
            let geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(minX, minY, 0), new THREE.Vector3(maxX, minY, 0), new THREE.Vector3(maxX, maxY, 0), new THREE.Vector3(minX, maxY, 0), new THREE.Vector3(minX, minY, 0));
            let line = new THREE.Line(geometry, material);
            this._scene.add(line);
            return line;
        }
        run() {
            var animate = () => {
                requestAnimationFrame(animate);
                this.render();
                this.update();
            };
            animate();
        }
        render() {
            this._renderer.render(this._scene, this._camera);
        }
        update() {
            let delta = this._clock.getDelta();
            this._particles.map((item) => {
                item.getMesh().position.x += item.getVector().x;
                item.getMesh().position.y -= item.getVector().y;
                if (item.getMesh().position.x - item.getRadius() < 0 || item.getMesh().position.x + item.getRadius() > WORLD_WIDTH) {
                    item.invertVectorX();
                }
                if (item.getMesh().position.y + item.getRadius() > 0 || item.getMesh().position.y - item.getRadius() < -WORLD_HEIGHT) {
                    item.invertVectorY();
                }
            });
            let particle_sick = this._particles.filter((item) => {
                return item.getStatus() == Particle_1.ParticleStatus.SICK;
            });
            let particle_healthy = this._particles.filter((item) => {
                return item.getStatus() == Particle_1.ParticleStatus.HEALTHY;
            });
            for (let s of particle_sick) {
                for (let h of particle_healthy) {
                    let D = Math.sqrt(Math.pow(h.getMesh().position.x - s.getMesh().position.x, 2) + Math.pow(h.getMesh().position.y - s.getMesh().position.y, 2));
                    if (D <= s.getRadius() * 2) {
                        h.changeStatus(Particle_1.ParticleStatus.SICK);
                    }
                }
            }
            this._score.innerHTML = particle_sick.length + '/' + this._particles.length;
            if (this._time != ~~this._clock.elapsedTime) {
                this._time = ~~this._clock.elapsedTime;
                if (particle_sick.length == WORLD_PARTICLE_COUNT) {
                    this.startSimulation(WORLD_WIDTH, WORLD_HEIGHT, WORLD_PARTICLE_COUNT);
                }
            }
        }
    }
    exports.Main = Main;
});
