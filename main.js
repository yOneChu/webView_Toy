import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

// 1️⃣ Three.js 기본 설정
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2️⃣ 조명 추가
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040); // 약한 환경광
scene.add(ambientLight);

// 3️⃣ 컨트롤 추가 (마우스로 회전, 이동, 줌)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 부드러운 움직임

// 4️⃣ OBJ + MTL 파일 로드
const mtlLoader = new MTLLoader();
mtlLoader.setPath('./models/');  // 모델 폴더 지정
mtlLoader.load('myModel.mtl', (materials) => {
    materials.preload(); // 재질 미리 로드
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('./models/');
    objLoader.load('FinalBaseMesh.obj', (object) => {
            scene.add(object);
        },
        (xhr) => console.log(`OBJ 로딩 진행: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`),
        (error) => console.error('OBJ 로드 실패:', error));
});

// 5️⃣ 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// 6️⃣ 창 크기 조절 대응
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
