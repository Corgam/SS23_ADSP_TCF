import { Component, Input, SimpleChanges } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { Collection, Datafile, PaginationResult } from '@common/types';

@Component({
  selector: 'app-threejs-view',
  templateUrl: './threejs-view.component.html',
  styleUrls: ['./threejs-view.component.scss'],
})
export class ThreeJSComponent {
  // Basic Three.js components
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private loadedDatapoints: THREE.Mesh[];
  // Window properties
  private windowWidth = 1920 / 2;
  private windowHeight = 902 / 2;
  // Toggle parameters
  private renderingStopped = true;
  private objectsLoaded = false;

  @Input({ required: true }) collectionFilesMap!: Map<
    Collection,
    PaginationResult<Datafile>
  >;

  //private datapointMeshes: Map<THREE.Mesh, Datafile>;

  constructor() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    // Add light
    const light = new THREE.PointLight();
    light.position.set(2.5, 7.5, 15);
    this.scene.add(light);
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.windowWidth / this.windowHeight,
      0.1,
      1000000
    );
    this.camera.position.z = 5;
    // Renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.windowWidth, this.windowHeight);
    // Orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.zoomSpeed = 10;
    this.controls.update();
    // Datapoints
    this.loadedDatapoints = [];
  }

  ngOnChanges(changes: SimpleChanges) {
    // Remove old datapoints
    this.loadedDatapoints.forEach((datapoint) => {
      datapoint.remove();
    });
    // Create new ones
    this.collectionFilesMap.forEach((paginationResult) => {
      paginationResult.results.forEach((datapoint) => {
        const datapointMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(1, 1, 1),
          new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        datapointMesh.scale.copy(new THREE.Vector3(1, 0.1, 1));
        console.log(datapoint.content.location!.coordinates);
        datapointMesh.translateX(datapoint.content.location!.coordinates[0]);
        datapointMesh.translateZ(datapoint.content.location!.coordinates[1]);
        this.scene.add(datapointMesh);
      });
    });
    for (let i = 0; i <= 5; i++) {}
  }

  /**
   * Loads the renderer and starts the render() function.
   */
  loadRenderer() {
    if (!this.objectsLoaded) {
      // Load city meshes
      const objLoader = new OBJLoader();
      const mtlLoader = new MTLLoader();
      mtlLoader.load(
        'assets/threejs-city-data/tile1/tile1.mtl',
        (materials) => {
          materials.preload();
          const sc = this.scene;
          objLoader.setMaterials(materials);
          objLoader.load(
            'assets/threejs-city-data/tile1/tile1.obj',
            (group) => {
              const mesh = <THREE.Mesh>group.children[0];
              mesh.frustumCulled = false;
              mesh.geometry.center();
              console.log(mesh);
              sc.add(mesh);
              this.hideLoadingDiv();
            }
          );
        }
      );
      this.objectsLoaded = true;
    }
    // Append renderer
    const container = document.querySelector('.threejs-renderer');
    container!.appendChild(this.renderer.domElement);
    this.renderingStopped = false;
    this.render();
  }

  /**
   * Main render loop for the Three.js view
   */
  render() {
    if (!this.renderingStopped) {
      requestAnimationFrame(this.render.bind(this));
    }
    this.controls.update();
    // Update the renderer
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Unloads the renderer, stopping future calls for render()
   */
  unloadRenderer() {
    this.renderingStopped = true;
  }

  /**
   * Hide the loading text component
   */
  hideLoadingDiv() {
    const loadingDiv = document.querySelector(
      '.threejs-loading-text'
    ) as HTMLElement;
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }
  }
}
