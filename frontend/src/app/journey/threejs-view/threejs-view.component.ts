import {
  Component,
  Input,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { CollectionData } from '../services/journey.service';
import { ViewType } from '../journey.component';
import { Observable, combineLatest } from 'rxjs';

// Interface representing a single city tile
interface CityTile {
  name: string;
  scenePosition: THREE.Vector3;
}

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
  private windowWidth = 960 * 1.2;
  private windowHeight = 451 * 1.2;
  // Toggle parameters
  private renderingStopped = true;
  private objectsLoaded = false;

  @Input({ required: true }) collectionsData!: Observable<CollectionData>[];
  @Input({ required: true }) viewType!: ViewType;

  @ViewChild('renderContainer', { static: false }) container!: ElementRef;

  //private datapointMeshes: Map<THREE.Mesh, Datafile>;

  constructor() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    // Add light
    const light = new THREE.AmbientLight(0xffffff, 1.2);
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
    this.controls.zoomSpeed = 6;
    this.controls.update();
    // Datapoints
    this.loadedDatapoints = [];
  }

  ngOnChanges(changes: SimpleChanges) {
    // Remove old datapoints
    this.loadedDatapoints.forEach(() => {
      const objMesh = this.scene.getObjectByName('meshName');
      this.scene.remove(objMesh!);
    });
    this.loadedDatapoints = [];
    // Create new ones
    combineLatest(this.collectionsData).subscribe((collectionsData) =>
      collectionsData.forEach((collection) => {
        collection.files.results.forEach((datapoint) => {
          // Create new mesh for each of the datapoints
          const datapointMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({ color: collection.color })
          );
          datapointMesh.name = 'meshName';
          datapointMesh.scale.copy(new THREE.Vector3(1.5, 0.1, 1.5));
          // Convert the coordinates
          const sceneCoordinates = this.convertCoordinates(
            datapoint.content.location!.coordinates[0],
            datapoint.content.location!.coordinates[1]
          );
          // Set the position and add to the scene
          datapointMesh.position.set(
            sceneCoordinates.x,
            -20,
            sceneCoordinates.z
          );
          // Copy the mesh and create the beam
          const beam = new THREE.Mesh().copy(datapointMesh);
          beam.scale.copy(new THREE.Vector3(0.2, 300, 0.2));
          beam.material = new THREE.MeshBasicMaterial({
            color: collection.color,
            opacity: 0.4,
            transparent: true,
          });
          // Add the objects to the scene and array
          this.scene.add(datapointMesh);
          this.scene.add(beam);
          this.loadedDatapoints.push(datapointMesh);
          this.loadedDatapoints.push(beam);
        });
      })
    );
  }

  /**
   * Loads the renderer and starts the render() function.
   */
  loadRenderer() {
    console.log(this.viewType);
    if (!this.objectsLoaded) {
      // Load city meshes, taken from:
      // https://www.businesslocationcenter.de/berlin3d-downloadportal/?lang=en#/export
      this.loadTiles([
        { name: 'tile1', scenePosition: new THREE.Vector3(0, 0, 0) },
        { name: 'tile2', scenePosition: new THREE.Vector3(207, -12.5, 5) },
        { name: 'tile3', scenePosition: new THREE.Vector3(-205, -2.0, -4.5) },
      ]);
      this.objectsLoaded = true;
    }
    // Resize renderer window
    if (this.viewType === 'no-map') {
      this.windowWidth = this.container.nativeElement.clientWidth;
      this.windowHeight = (this.windowWidth / 21) * 9;
      this.renderer.setSize(this.windowWidth, this.windowHeight);
      console.log('View!');
    } else {
      this.windowWidth = this.container.nativeElement.clientWidth;
      this.windowHeight = (this.windowWidth / 16) * 9;
      this.renderer.setSize(this.windowWidth, this.windowHeight);
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

  /**
   * Translates the world coordinates (long, lat) into the scene coordinates (x, y, z).
   * @param longitude the longitude of the datapoint
   * @param latitude the latitude of the datapoint
   * @returns translated coordinates
   */
  convertCoordinates(longitude: number, latitude: number) {
    // Scaling factor, calculated based on the scene size and the long,lat coordinates of the city mesh
    const scaleFactor = 214 / (13.329418317727734 - 13.32631827581811); // Assuming x-direction corresponds to longitude
    // The relative origin of the scene. The scene coordinates of (0,0,0) now will correspond to these coordinates in long, lat system.
    const latitudeOffset = 52.513091975725075;
    const longitudeOffset = 13.327974301530459;
    // Conversion formulas
    const x = (longitude - longitudeOffset) * scaleFactor;
    const y = 0; // Assuming a flat scene, no vertical displacement
    const z = -(latitude - latitudeOffset) * scaleFactor;
    return { x, y, z };
  }

  /**
   * Loads the city tiles
   * @param tiles
   */
  loadTiles(tiles: CityTile[]) {
    tiles.forEach((tile) => {
      const objLoader2 = new OBJLoader();
      const mtlLoader2 = new MTLLoader();
      mtlLoader2.load(
        `assets/threejs-city-data/${tile.name}/${tile.name}.mtl`,
        (materials) => {
          materials.preload();
          const sc = this.scene;
          objLoader2.setMaterials(materials);
          objLoader2.load(
            `assets/threejs-city-data/${tile.name}/${tile.name}.obj`,
            (group) => {
              const mesh = <THREE.Mesh>group.children[0];
              mesh.frustumCulled = false;
              mesh.geometry.center();
              mesh.translateZ(210);
              mesh.position.copy(tile.scenePosition);
              sc.add(mesh);
              this.hideLoadingDiv();
            }
          );
        }
      );
    });
  }
}
