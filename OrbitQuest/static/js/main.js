import * as THREE from 'https://cdn.skypack.dev/three@0.133.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/loaders/GLTFLoader.js';


//variables
let camera, scene, renderer, clock;
let earth, iss, moon;
let currentView = 0;
//iss velocity calculation
let lastISSPosition = new THREE.Vector2();
let ISSVelocity = new THREE.Vector2();
let ISSGoalPosition = new THREE.Vector3();
let camGoalPosition = new THREE.Vector3();
let mouseOffset = new THREE.Vector2();



//constants
const earthRotateSpeed = 0.0005;
const ISSDegreesPerSecond = 1.63888888889;
const MOON_SPEED = 5;
const shouldGetCountry = true;

init();
animate();

function init() {
    clock = new THREE.Clock();
    clock.start();
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 0;

    scene = new THREE.Scene();

    const geometry = new THREE.SphereGeometry( 300, 200, 200 );
    const moonGeometry = new THREE.SphereGeometry(100, 50, 50);
    
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    //CHANGE VIEW
    const changeViewBtn = document.getElementById('change-view-btn');
    if (changeViewBtn) {
      changeViewBtn.addEventListener('click', function() {
        console.log('The view has been changed!');
        currentView = (currentView + 1) % 3;
        // Add more functionality here to change the view
      });
    } else {
      console.log('Change view button not found');
    }


    // load earth texture
    const texLoader = new THREE.TextureLoader();
    const texture = texLoader.load(static_url + 'textures/earth.jpg');
    const moonTexture = texLoader.load(static_url + 'textures/moon.jpg')
    const phongMaterial = new THREE.MeshPhongMaterial({ 
        map: texture, // Diffuse texture map
        specular: 0x222222, // Specular highlights, adjust as needed
        shininess: 15 // Shininess of the material, adjust as needed
    });
    const moonPhongMaterial = new THREE.MeshPhongMaterial({
        map: moonTexture,
        specular: 0x222222,
        shininess: 15
    })
    

    earth = new THREE.Mesh( geometry, phongMaterial );
    scene.add( earth );

    moon = new THREE.Mesh( moonGeometry, moonPhongMaterial );
    scene.add( moon );

    const directionalLight = new THREE.DirectionalLight( 0xf0f0f0, 1.3 );
    directionalLight.position.set(-500,500,500);
    directionalLight.target =  earth;
    scene.add( directionalLight );


    const light = new THREE.AmbientLight(0xF0F0F0, 0.2);
    scene.add(light);


    //load iss model
    const objLoader = new GLTFLoader();
    // Load a glTF resource
    objLoader.load(
        // resource URL
        static_url + 'models/ISS.glb',
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

    const container = document.getElementById('three-container');
    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( container.clientWidth, container.clientHeight);
    renderer.setClearColor( 0x101010 , 0);
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize );
    onWindowResize();

    //update ISS position periodically
    setInterval(updateISSPosition, 30000);
    updateISSPosition();
}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    if (earth && iss && moon) {
        earth.scale.set(0.25,0.25,0.25);
        iss.scale.set(.3,.3,.3)







        //make moon orbit
        moon.scale.set(0.15, 0.15, 0.15);
        let lat = 90;
        let lon = clock.getElapsedTime() * MOON_SPEED;
    
        let goal = new THREE.Vector3();
        const toRad = Math.PI / 180;
        const rho = 250; //moon rho needs to be bigger
        goal.x = rho * Math.sin(lat * toRad) * Math.cos(lon * toRad); 
        goal.z = rho * Math.sin(lat * toRad) * Math.sin(lon * toRad);
        goal.y = rho * Math.cos(lat * toRad);
        moon.position.copy(goal);
        moon.rotation.x += .01



        //iss.position.set(0,50,0);
        iss.scale.set(0.2,0.2,0.2)
        iss.rotation.y = 0.1 * Math.sin(clock.getElapsedTime() * 1);
        iss.rotation.x = .05 * Math.sin(clock.getElapsedTime() * .5);
        iss.position.copy(iss.position.lerp(ISSGoalPosition, .005));

        //update cam
        camera.lookAt(earth.position);
        if (currentView == 0) {
            let directionToEarth = new THREE.Vector3().subVectors(iss.position, earth.position).normalize().multiplyScalar(60);
            camGoalPosition.copy(iss.position);
            camGoalPosition.add(directionToEarth);
        } else if (currentView == 1) {
            const toRad = Math.PI / 180;
            const rho = 500;
            let lon = (mouseOffset.x + .5) * 360;
            let lat = (mouseOffset.y) * 180;
            camGoalPosition.x = rho * Math.sin(lat * toRad) * Math.cos(lon * toRad); 
            camGoalPosition.z = rho * Math.sin(lat * toRad) * Math.sin(lon * toRad);
            camGoalPosition.y = rho * Math.cos(lat * toRad);
        } else if (currentView == 2) {
            camera.lookAt(moon.position);
            camGoalPosition.set(-600, 0, 0);
        }
        camera.position.copy(camera.position.lerp(camGoalPosition, .01));

    }


    renderer.render( scene, camera );

}

async function updateISSPosition() {
    const response = await fetch('/iss-now');
    const data = await response.json(); // Extract JSON from the HTTP response
    let lat = data.iss_position.latitude;
    let lon = data.iss_position.longitude;
    //offset
    lat -= 90;
    lon = (lon * -1) + 180;
    console.log(lat);
    console.log(lon);

    let goal = new THREE.Vector3();
    const toRad = Math.PI / 180;
    const rho = 150;
    goal.x = rho * Math.sin(lat * toRad) * Math.cos(lon * toRad); 
    goal.z = rho * Math.sin(lat * toRad) * Math.sin(lon * toRad);
    goal.y = rho * Math.cos(lat * toRad);

    console.log(goal);

    addMarker(goal);


    //now attempt to identify country
    if (shouldGetCountry) {
        fetch('/getCountry/')
        .then(response => response.json())
        .then(data => {
            //print out country
            document.getElementById('iss-current-country').textContent = data.address.country || 'Not over any country';
            console.log(data.address.country)
        })
        .catch(error => {
            document.getElementById('iss-current-country').textContent = 'Currently in the middle of nowhere :(';
            console.error('Error fetching data (we might be in the middle of no where):', error);
        });
    }


    ISSGoalPosition = goal;
}

//add red marker to show previous location of ISS
function addMarker(goal) {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32); // Adjusted segment count for smoother sphere
    const material = new THREE.MeshBasicMaterial({
        color: 0xFF0505,
        transparent: true, // Enable transparency
        opacity: 0.5 // Set the opacity to 50% transparent
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphere.position.copy(goal);
    

}

function onDocumentMouseMove( event ) {

    event.preventDefault();

    mouseOffset = new THREE.Vector2(
        ( event.clientX / renderer.domElement.width ) * 2 - 1,
        - ( event.clientY / renderer.domElement.height ) * 2 + 1,
    )
}
