import * as THREE from 'https://cdn.skypack.dev/three@0.133.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/loaders/GLTFLoader.js';


let camera, scene, renderer, clock;
let earth, iss;

//constants
const earthRotateSpeed = 0.0005;

init();
animate();

function init() {
    clock = new THREE.Clock();
    clock.start();
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 250;

    scene = new THREE.Scene();

    const geometry = new THREE.SphereGeometry( 200, 200, 200 );


    // load earth texture
    const texLoader = new THREE.TextureLoader();
    const texture = texLoader.load('textures/earth.jpg');
    const phongMaterial = new THREE.MeshPhongMaterial({ 
        map: texture, // Diffuse texture map
        specular: 0x222222, // Specular highlights, adjust as needed
        shininess: 10 // Shininess of the material, adjust as needed
    });
    

    earth = new THREE.Mesh( geometry, phongMaterial );
    scene.add( earth );

    const directionalLight = new THREE.DirectionalLight( 0xf0f0f0, 1.3 );
    directionalLight.position.set(-500,500,500);
    directionalLight.target =  earth;
    scene.add( directionalLight );


    const light = new THREE.AmbientLight(0xF0F0F0, 0.1);
    scene.add(light);



    //load iss model
    const objLoader = new GLTFLoader();
    // Load a glTF resource
    objLoader.load(
        // resource URL
        'models/ISS.glb',
        // called when the resource is loaded
        function ( gltf ) {

            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                    // Adjust the material's emissive property to make it brighter
                    child.material.emissiveIntensity = 1.5; // Increase this value to make it brighter
                    child.material.emissive = new THREE.Color(0x040404); // This adds a slight glow. Adjust the color as needed.
        
                    // OR adjust the material's color directly
                    child.material.color.multiplyScalar(1.03); // Increase scalar to brighten, reduce to darken
                }
            });
            scene.add(gltf.scene);

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

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x050505    , 0);
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

    if (earth && iss) {
        earth.scale.set(0.2,0.2,0.2);

        earth.rotation.x += earthRotateSpeed;
    


        iss.position.set(0,50,0);
        iss.scale.set(0.2,0.2,0.2)
        iss.rotation.y = 0.1 * Math.sin(clock.getElapsedTime() * 1);
        iss.rotation.x = .05 * Math.sin(clock.getElapsedTime() * .5);

        //update cam
        camera.position.copy(iss.position);
        camera.position.y += 100;
        camera.lookAt(iss.position);
        camera.updateMatrix();

    }


    renderer.render( scene, camera );

}