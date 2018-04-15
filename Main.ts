import * as THREE from 'three'
import { Particle, ParticleStatus } from './Particle';

const DOENTE = 0xff2222;
const SAUDAVEL = 0x4caf50;

const WORLD_PARTICLE_COUNT = 500;
const WORLD_WIDTH = 800;
const WORLD_HEIGHT = 600;

export class Main
{
  private _camera: THREE.Camera;
  private _clock: THREE.Clock;
  private _renderer: THREE.WebGLRenderer;
  private _scene: THREE.Scene;

  private _chart: any;
  private _particles: any;
  private _saudavel: any;
  private _doente: any;

  private _time: number;

  public constructor () {
    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.setClearColor(0x000, 1);
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this._renderer.domElement);
    
    this._camera = new THREE.OrthographicCamera(
      -10,
      window.innerWidth,
      10,
      -window.innerHeight,
      1,
      100
    );
    this._camera.position.x = 0;
    this._camera.position.y = 0;
    this._camera.position.z = 10;
    
    this._clock = new THREE.Clock();
    this._scene = new THREE.Scene();
    this._chart = [];
    this._time = -1;
    
    this.startSimulation(WORLD_WIDTH, WORLD_HEIGHT, WORLD_PARTICLE_COUNT);
  }
  
  startSimulation(width, height, length) {
    this.createBound(width, height);


    this._particles = [...Array(length)];

    for(let i in this._particles) {
      let w = ~~(Math.random() * width), h = ~~(Math.random() * -height);

      this._particles[i] = new Particle(w, h, ParticleStatus.HEALTHY);
      
      this._scene.add(this._particles[i].getMesh());
    }

    this._particles[0].changeStatus(ParticleStatus.SICK)
  }
  
  createBound(width, height) {
    let minX = 0, maxX = width, minY = 0, maxY = -height;

    let material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    let geometry = new THREE.Geometry();

    geometry.vertices.push(
      new THREE.Vector3(minX, minY, 0),
      new THREE.Vector3(maxX, minY, 0),
      new THREE.Vector3(maxX, maxY, 0),
      new THREE.Vector3(minX, maxY, 0),
      new THREE.Vector3(minX, minY, 0),
    );

    let line = new THREE.Line(geometry, material);
    this._scene.add(line);

    return line;
  }
  
  run() {
    var animate = () => {
      requestAnimationFrame( animate );
      
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
      return item.getStatus() == ParticleStatus.SICK;
    });
    let particle_healthy = this._particles.filter((item) => {
      return item.getStatus() == ParticleStatus.HEALTHY;
    });

    for (let s of particle_sick) {

      for (let h of particle_healthy) {
        let D = Math.sqrt( Math.pow(h.getMesh().position.x - s.getMesh().position.x, 2) + Math.pow(h.getMesh().position.y - s.getMesh().position.y,2));

        if (D <= s.getRadius() * 2) {
          h.changeStatus(ParticleStatus.SICK);
        }
      }

    }

    if (this._time != ~~this._clock.elapsedTime) {
      this._time = ~~this._clock.elapsedTime;

      this._chart.push(particle_sick.length);
    }
  }
}