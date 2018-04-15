import * as THREE from 'three'

const VELOCITY = 1;
const RADIUS = 5;

export enum ParticleStatus {
  SICK = 0xff2222,
  HEALTHY = 0x4caf50
}

export class Particle
{
  private _geometry: THREE.CircleBufferGeometry;
  private _material: THREE.Material;
  private _mesh: THREE.Mesh;
  
  private _angle: number;
  private _radius: number;
  private _vectorX: number;
  private _vectorY: number;
  private _velocity: number;
  private _status: string;

  constructor (x, y, status) {
    this._angle = Math.random() * THREE.Math.degToRad(360) + 0.1;
    this._radius = RADIUS;
    this._velocity = VELOCITY;
    this._vectorX = Math.cos(this._angle) * this._velocity;
    this._vectorY = Math.sin(this._angle) * this._velocity;

    this._geometry = new THREE.CircleBufferGeometry(this._radius, 32);
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
    this._mesh.material = new THREE.MeshBasicMaterial({ color: this._status });
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