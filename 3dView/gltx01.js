import * as THREE from 'three';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


console.log('ASDFASDF', THREE);

//console.log('OrbitControls', OrbitControls);
console.log('GLTFLoader', GLTFLoader);

let scene = new THREE.Scene();
console.log(scene);

let renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
    antialias: true
})

renderer.outputEncoding = THREE.sRGBEncoding;

let camera = new THREE.PerspectiveCamera(30, 1);
camera.position.set(0, 0, 5);

scene.background = new THREE.Color('white');
let light = new THREE.DirectionalLight(0xffff00, 10);
scene.add(light);

let loader = new GLTFLoader();
loader.load('test01.gltf', function(gltf) {
    scene.add(gltf.scene);
    //renderer.render(scene, camera);

    function animate() {
        requestAnimationFrame(animate);
        gltf.scene.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
})
