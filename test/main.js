import * as THREE from 'https://cdn.skypack.dev/three@0.133.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/loaders/GLTFLoader.js';


//variables
let camera, scene, renderer, clock;
let earth, iss;
//iss velocity calculation
let lastISSPosition = new THREE.Vector2();
let ISSVelocity = new THREE.Vector2();
let ISSGoalPosition = new THREE.Vector3();



//constants
const earthRotateSpeed = 0.0005;
const ISSDegreesPerSecond = 1.63888888889;

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

    //update ISS position periodically
    setInterval(updateISSPosition, 10000);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    if (earth && iss) {
        earth.scale.set(0.25,0.25,0.25);
        iss.scale.set(.3,.3,.3)

        //earth.rotation.x += earthRotateSpeed;
    


        //iss.position.set(0,50,0);
        iss.scale.set(0.2,0.2,0.2)
        iss.rotation.y = 0.1 * Math.sin(clock.getElapsedTime() * 1);
        iss.rotation.x = .05 * Math.sin(clock.getElapsedTime() * .5);
        iss.position.copy(iss.position.lerp(ISSGoalPosition, .005));

        //update cam
        let directionToEarth = new THREE.Vector3().subVectors(iss.position, earth.position).normalize().multiplyScalar(30);
        camera.position.copy(iss.position);
        camera.position.add(directionToEarth);
        camera.lookAt(earth.position)

    }


    renderer.render( scene, camera );

}

async function updateISSPosition() {
    const response = await fetch('http://api.open-notify.org/iss-now.json');
    const data = await response.json(); // Extract JSON from the HTTP response
    let lat = data.iss_position.latitude;
    let lon = data.iss_position.longitude;
    console.log(lat);
    console.log(lon);

    let goal = new THREE.Vector3();
    const toRad = Math.PI / 180;
    const rho = 120;
    goal.x = rho * Math.sin(lat * toRad) * Math.cos(lon * toRad); 
    goal.z = rho * Math.sin(lat * toRad) * Math.sin(lon * toRad);
    goal.y = rho * Math.cos(lat * toRad);

    console.log(goal);



    ISSGoalPosition = goal;
}