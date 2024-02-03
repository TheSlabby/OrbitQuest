import * as THREE from 'https://cdn.skypack.dev/three@0.133.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/loaders/GLTFLoader.js';


let camera, scene, renderer;
let earth, iss;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 400;

    scene = new THREE.Scene();

    const geometry = new THREE.SphereGeometry( 200, 200, 200 );


    // load earth texture
    const texLoader = new THREE.TextureLoader();
    const texture = texLoader.load('textures/earth.jpg');
    const material = new THREE.MeshBasicMaterial({map: texture});

    earth = new THREE.Mesh( geometry, material );
    scene.add( earth );


    const light = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
    scene.add( light );



    //load iss model
    const objLoader = new GLTFLoader();
    // Load a glTF resource
    objLoader.load(
        // resource URL
        'models/ISS.glb',
        // called when the resource is loaded
        function ( gltf ) {
            iss = gltf.scene;
            scene.add( gltf.scene );

            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object

        },
        // called while loading is progressing
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {

            console.log( 'An error happened' );

        }
    );


    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x050505    , 1);
    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    earth.rotation.x += 0.005;
    earth.rotation.y += 0.01;

    console.log(iss);

    renderer.render( scene, camera );

}