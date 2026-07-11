import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class App {
  #threejs_ = null;
  #camera_ = null;
  #scene_ = null;

  constructor() {}

  Initialize() {
    this.#threejs_ = new THREE.WebGLRenderer();
    this.#threejs_.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.#threejs_.domElement);

    const aspect = window.innerWidth / window.innerHeight;

    this.#camera_ = new THREE.PerspectiveCamera(50, aspect, 0.1, 2000);
    this.#camera_.position.z = 5;

    const controls = new OrbitControls(
      this.#camera_,
      this.#threejs_.domElement,
    );
    controls.enableDamping = true;
    controls.target.set(0, 0, 0); // default is this
    controls.update();

    this.#scene_ = new THREE.Scene();

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
      }),
    );

    this.#scene_.add(mesh);
  }

  Run() {
    // arrow function inherits context from outerscope. So can use this and get class members
    const render = () => {
      this.#threejs_.render(this.#scene_, this.#camera_);
      requestAnimationFrame(render);
    };
    render();
  }
}

const app = new App();
app.Initialize();
app.Run();
