import { Component } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-threejs-view',
  templateUrl: './threejs-view.component.html',
  styleUrls: ['./threejs-view.component.scss'],
})
export class ThreeJSComponent {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private cityMeshes: THREE.Mesh[];
  private controls: OrbitControls;

  private windowWidth = 1920 / 2;
  private windowHeight = 902 / 2;

  private renderingStopped = true;

  constructor() {
    // Basic parts
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.windowWidth / this.windowHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // Meshes and textures
    this.cityMeshes = [];
    this.cityMeshes.push(
      new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      )
    );
  }

  ngOnInit() {
    // Set the renderer size
    this.renderer.setSize(this.windowWidth, this.windowHeight);
    // Add the city meshes
    this.cityMeshes.forEach((mesh) => {
      this.scene.add(mesh);
    });

    this.camera.position.z = 5;
    this.controls.update();

    this.renderer.render(this.scene, this.camera);

    // this.animate();
    console.log('Rendering!');
  }

  loadRenderer() {
    const container = document.querySelector('.threejs-renderer');
    container!.appendChild(this.renderer.domElement);
    this.renderingStopped = false;
    this.render();
  }

  /**
   * Unloads the renderer, stopping future calls for render()
   */
  unloadRenderer() {
    this.renderingStopped = true;
  }

  /**
   * Main render loop for the Three.js view
   */
  render() {
    console.log('Test!');
    if (!this.renderingStopped) {
      requestAnimationFrame(this.render.bind(this));
    }
    // Update the renderer
    this.renderer.render(this.scene, this.camera);
  }
}
