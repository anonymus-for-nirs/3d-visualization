import * as THREE from '../node_modules/three/build/three.module.js';
import {Controls} from './Controls.js';
import * as CLOCK from '../node_modules/three/src/core/Clock.js';

import {getSpheres,
        getArticleName,
        searchArticle,
        searchAuthor,
        getSpheresByAuthor} from './dataProcessing.js';


let camera, scene, renderer, controls, clock, spheres, sourceSpheres, lines;

//camera
const FOV = 60;
const NEAR = 1;
const FAR = 10000;
const xCameraPosition = 500;
const yCameraPosition = 500;
const zCameraPosition = 500;
const lookAtVector = new THREE.Vector3(0, 0, 0)

//controls
const movSpeed = 500;
const rollSpeed = 2;

//ligths
const ligthsCoors = [1000, -1000, 2000, -2000]

//spheres
const polygonal = 16;
const radiusCoeff = 21.6;
let currentSphereName = '';

//lines 
const lineOpacity = 0.3;
const lineColor = '#FFFFFF';

//canvas
const inputElement = document.getElementById('search'); 
const selectElement = document.getElementById('selectPaper'); 
let isSearchArticle = true;

//resize window
var tanFOV = Math.tan( ( ( Math.PI / 180 ) * FOV / 2 ) );
var windowHeight = window.innerHeight;


init();
animate();

function init() {
    createClock();
    createCamera(); 
    createScene();    
    createRenderer();
    createControls();    
    addGraph();    
}

function createCamera() {    
    camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, NEAR, FAR);
    camera.position.set(xCameraPosition, yCameraPosition, zCameraPosition);
    camera.lookAt(lookAtVector);
}

function createScene() {
    scene = new THREE.Scene();
    const loader = new THREE.CubeTextureLoader();
    const bgTexture = loader.load(['../images/space1.jpg', '../images/space1.jpg', '../images/space1.jpg', '../images/space1.jpg', '../images/space1.jpg', '../images/space1.jpg']);
    scene.background = bgTexture;
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild(renderer.domElement);
}

function createControls() {
    controls =  new Controls(camera, renderer.domElement);

    controls.movementSpeed = movSpeed;
    controls.rollSpeed = rollSpeed;
    controls.dragToLook = true;
}

function createClock() {
    clock = new CLOCK.Clock();
    clock.start();
}

function addGraph() {
    spheres = {}; 
    sourceSpheres = getSpheres();
    addSpheres();
    console.log("Spheres were created.")   

    lines = new Map();
    addLines();
    console.log("Lines were created.")   
    
    addLights();
    console.log("Ligths were created.") 
}

function addSpheres() {    
    for (let sphereDOI in sourceSpheres) {
        createSphereByDOI(sphereDOI);
    }
}

function createSphereByDOI(sphereDOI) {
    const spherePropertes = sourceSpheres[sphereDOI];
    createSphere(
        spherePropertes["x"],
        spherePropertes["y"],
        spherePropertes["z"],
        spherePropertes["weight"],
        new THREE.Color(spherePropertes["color"]),
        sphereDOI,
        polygonal);    

}

function createSphere(xCoor, yCoor, zCoor, sphereRadius, sphereColor, sphereDOI, segmentsCount=8) {    
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius * radiusCoeff, segmentsCount, segmentsCount);

    const sphereMaterial = new THREE.MeshLambertMaterial({color: sphereColor});

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(xCoor, yCoor, zCoor);
    sphere.castShadow = true;
    sphere.name = 's:' + sphereDOI;

    spheres[sphereDOI] = sphere;
    scene.add(sphere);    

    //console.log(sphere.name + ' was created');
}

function addLines() {
    for (let sphereDOI in sourceSpheres) {
        const sphereLinks = sourceSpheres[sphereDOI]["links"];
        if ( arrayIsNotEmpty(sphereLinks) ) {            
            sphereLinks.forEach(linkDOI => {
                createLineByDOIs(sphereDOI, linkDOI);
            });
        }        
    }
}

function createLineByDOIs(sphereDOI1, sphereDOI2) {    
    const line = createLine(spheres[sphereDOI1], spheres[sphereDOI2]);   
    lines[[sphereDOI1, sphereDOI2]] = line;    
}

function createLine(sphere1, spehere2) {
    const material = new THREE.LineBasicMaterial({ color: lineColor});
    material.transparent = true;
    material.opacity = lineOpacity; 

    const geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(sphere1.position.x, sphere1.position.y, sphere1.position.z));   
    geometry.vertices.push(new THREE.Vector3(spehere2.position.x, spehere2.position.y, spehere2.position.z));

    const line = new THREE.Line(geometry, material);
    
    scene.add(line);
    return line;
}

function addLights() {
    ligthsCoors.forEach(coors => {
        addLight(coors);
    });
}

function addLight(positionCoors){
    // add subtle ambient lighting
    const ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);

    // add spotlight for the shadows
    const spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( positionCoors, positionCoors, positionCoors );
    spotLight.castShadow = true;
    scene.add( spotLight );
}

function addDocText() {
    //document.getElementById("speed").innerHTML = "Movespeed: " + String(controls.movementSpeed * controls.currentMovementSpeedMultiplier);
    document.getElementById("paperName").innerHTML = currentSphereName;
}

function render() {
    renderer.render(scene, camera);
    controls.raycasterRender(camera, scene);
}

function animate () {
    requestAnimationFrame( animate );

    addDocText();

    searchUpdate();

    const delta = clock.getDelta();
    controls.update(delta);
    render();
}

function arrayIsNotEmpty(array) {
    return (array !== undefined && array.length != 0)
}

export function getSelectedLines(sphereDOI, selectLinesFunc) {
    const selectedSpheres = selectLinesFunc;
    let selectedLines = []; 

    selectedSpheres.forEach(selectedSphere => {
        for (let DOICouple in lines) {
            const isRigthCouple =  DOICouple.includes(sphereDOI) && DOICouple.includes(selectedSphere);            
            if (isRigthCouple) {                                      
                selectedLines.push(lines[DOICouple]);         
            }
        }
    });

    return selectedLines;
}

export function paintLine(line, color, opacity) {
    line.material.color.set(color);
    line.material.opacity = opacity;
}

export function paintSphereByDOI(sphereDOI, color) {
    spheres[sphereDOI].material.color.set(color);   
}

export function paintSphere(sphere, color) {
    sphere.material.color.set(color);  
}

export function clearSphere(sphereDOI) {
    const sourceSphereColor =  sourceSpheres[sphereDOI]['color'];
    spheres[sphereDOI].material.color.set(sourceSphereColor);
}

export function clearLine(line) {
    line.material.color.set(lineColor);  
    line.material.opacity = lineOpacity;
}

export function changeCurrentSphereName(sphereDOI) {
    document.getElementById("paperName").style.color = sourceSpheres[sphereDOI]['color'];  
    currentSphereName = getArticleName(sphereDOI);    
}

export function clearCurrentSphereName() {
    currentSphereName = '';
}

inputElement.onfocus = function() {    
    controls.isSearchInFocus = true;
}

inputElement.onblur = function() {
    controls.isSearchInFocus = false;
}

inputElement.onreset = function() {
    deleteAllOptions();
}

inputElement.onchange = function() {
    document.getElementById('showBtn').onclick();
}

selectElement.onchange = function() {   
    setSelectnameToInputname();
    hideSelectElement();
}

function setSelectnameToInputname() {
    const selectedText = selectElement.options[selectElement.options.selectedIndex].text;
    inputElement.value = selectedText;  
}

function searchUpdate() {
    if (inputElement.value == '') {
        deleteAllOptions();
    } 
}

function addOption(text, value) {
    const newOption = new Option(text, value);      
    selectElement.options[value] = newOption;
}

function deleteAllOptions() {
    for (let i = selectElement.options.length - 1; i >= 0 ; i--) {
        selectElement.options[i] = null;
    }
    hideSelectElement();
}

function showSelectElement() {
    selectElement.style.display = 'block';
}

function hideSelectElement() {
    selectElement.style.display = 'none';
}

document.getElementById('searchArticleBtn').onclick = function() {
    isSearchArticle = true;
    deleteAllOptions();  
    const searchResult = searchArticle(inputElement.value);
    showSelectElement();
    
    addOption('Select article', 0);
    
    for (let i = 0; i < searchResult['total']; i++) {
        addOption(searchResult[i]['target'], i+1);
    }
    
    selectElement.options.selectedIndex = 0;
}

document.getElementById('searchAuthorBtn').onclick = function() {
    isSearchArticle = false;
    deleteAllOptions();  
    
    const searchResult = searchAuthor(inputElement.value);
    showSelectElement();
    
    addOption('Select author', 0);
    
    for (let i = 0; i < searchResult['total']; i++) {
        addOption(searchResult[i]['target'], i+1);
    }
    
    selectElement.options.selectedIndex = 0;
}

document.getElementById('showBtn').onclick = function() {
    if (isSearchArticle) {
        let searchSphereDOI = '';

        for (let sphereDOI in spheres) {
            if (getArticleName(sphereDOI) == inputElement.value.trim()) {
                searchSphereDOI = sphereDOI;
            }
        }
    
        if (searchSphereDOI != '') {
            const searchSphere = spheres[searchSphereDOI];
            const searchSphereRadius = sourceSpheres[searchSphereDOI]['weight'];
            camera.position.x = searchSphere.position.x + searchSphereRadius * radiusCoeff * 1.5;
            camera.position.y = searchSphere.position.y + searchSphereRadius * radiusCoeff * 1.5;
            camera.position.z = searchSphere.position.z + searchSphereRadius * radiusCoeff * 1.5;
            camera.lookAt(new THREE.Vector3(searchSphere.position.x, searchSphere.position.y, searchSphere.position.z));
        }
    } else {
        const author = inputElement.value.trim();
        const spheresByAuthors = getSpheresByAuthor(author);

        for (let sphereDOI of spheresByAuthors) {
            paintSphereByDOI(sphereDOI, controls.AUTHORS_COLOR);
            controls.paintedSphresByAuthors.push(sphereDOI);
        }
    }    
}

function onWindowResize( event ) {

    camera.aspect = window.innerWidth / window.innerHeight;
    
    // adjust the FOV
    camera.fov = ( 360 / Math.PI ) * Math.atan( tanFOV * ( window.innerHeight / windowHeight ) );
    
    camera.updateProjectionMatrix();
    camera.lookAt( scene.position );

    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.render( scene, camera );
    
}

window.addEventListener('resize', onWindowResize, false);

window.onload = function() {
    console.log(clock.getElapsedTime());
    document.getElementById("preloader").style.display = "none";
}