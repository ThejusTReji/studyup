import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);
scene.fog = new THREE.Fog(0xa0a0a0, 10, 500);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);
// Score System
let score = 0; // Initial score
// Remove any existing score elements to avoid duplication
document.querySelectorAll('.score-display').forEach(el => el.remove());

// Create a New Score Display on the Right
const scoreElement = document.createElement('div');
scoreElement.innerText = `Score: ${score}`;
scoreElement.classList.add('score-display'); // Unique class for easy removal
scoreElement.style.cssText = `
    position: absolute; top: 10px; right: 10px;
    font-size: 20px; color: white; background: rgba(0, 0, 0, 0.6);
    padding: 10px; border-radius: 5px;
`;
document.body.appendChild(scoreElement);

// Function to Update Score Display
function updateScore() {
    scoreElement.innerText = `Score: ${score}`;
}

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Lighting
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 1.5);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

// Load Environment
const loader = new GLTFLoader();
let environment;
loader.load('../assets/source/Project.glb', (gltf) => {
    environment = gltf.scene;
    environment.scale.set(1, 1, 1);
    environment.traverse((child) => {
        if (child.isMesh) {
            child.receiveShadow = true;
            child.castShadow = true;
        }
    });
    scene.add(environment);
}, undefined, console.error);

// Load Character Model
let character, mixer, animations = {};
let velocity = new THREE.Vector3();
let acceleration = 0.02;
let deceleration = 0.03;
let maxSpeed = 0.3;
let currentAction = 'idle';

loader.load('../assets/Xbot.glb', (gltf) => {
    character = gltf.scene;
    character.scale.set(1, 1, 1);
    character.position.set(0, 1, 0);

    character.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    scene.add(character);

    // Setup animations
    mixer = new THREE.AnimationMixer(character);
    gltf.animations.forEach((clip) => {
        animations[clip.name] = mixer.clipAction(clip);
    });

    activateAnimation('idle');
}, undefined, console.error);
const people = [];
const peopleMixers = []; // Array to store animation mixers

function addPeople() {
    const loader = new GLTFLoader();

    for (let i = 0; i < 5; i++) { // Add multiple people
        loader.load('../assets/nan.glb', (gltf) => {
            const person = gltf.scene;
            
            // ✅ Reduce size to match character proportions
            person.scale.set(0.7, 0.7, 0.7); // Smaller than the player

            // ✅ Position them randomly on the terrain
            person.position.set((Math.random() - 0.5) * 200, 0, (Math.random() - 0.5) * 200);
            
            scene.add(person);
            people.push(person);

            // ✅ Setup Walking Animation
            const mixer = new THREE.AnimationMixer(person);
            const walkAction = mixer.clipAction(gltf.animations.find(anim => anim.name.toLowerCase().includes('walk'))); // Find walk animation
            if (walkAction) {
                walkAction.play(); // Start walking animation
            }
            peopleMixers.push(mixer);
        });
    }
}
addPeople();

// Function to Animate People (Walk in Random Directions)
function animatePeople(deltaTime) {
    people.forEach((person, index) => {
        // Move people in random directions
        person.position.x += (Math.random() - 0.5) * 0.05; // Small random movement
        person.position.z += (Math.random() - 0.5) * 0.05;

        // Ensure they stay inside city bounds
        if (person.position.x > 250) person.position.x = -250;
        if (person.position.z > 250) person.position.z = -250;

        // Update walking animation
        if (peopleMixers[index]) {
            peopleMixers[index].update(deltaTime);
        }
    });
}

//const cars = [];
//function addCars() {
  //  const loader = new GLTFLoader();
//
  //  for (let i = 0; i < 1; i++) { // Add multiple cars
    ///    loader.load('../assets/scene.gltf', (gltf) => {
        //    const car = gltf.scene;
           /* car.scale.set(2, 2, 2);
            car.position.set(-100 + i * 50, 0, -100);
            car.rotation.y = Math.PI / 2;
            scene.add(car);
            cars.push(car);
        });
    }///
}
addCars(); // ✅ Call function to add cars

// Function to Move Cars Forward
function animateCars() {
    cars.forEach(car => {
        car.position.x += 0.2; // Move forward
        if (car.position.x > 200) car.position.x = -200; // Loop back when off screen
    });
}
*/

const crows = [];
const crowMixers = [];
const flyingCrows = []; // Store only flying crows

function addCrows() {
    const loader = new GLTFLoader();
    
    for (let i = 0; i < 10; i++) { // Create multiple crows
        loader.load('../assets/stork.glb', (gltf) => {
            const crow = gltf.scene;
            crow.scale.set(0.01, 0.01, 0.01); // Adjust size

            // ✅ Randomly place some crows on the street and some in the air
            if (Math.random() > 0.5) {
                // Half start on the ground
                crow.position.set((Math.random() - 0.5) * 200, 0, (Math.random() - 0.5) * 200);
            } else {
                // Half start flying
                crow.position.set((Math.random() - 0.5) * 200, 30 + Math.random() * 20, (Math.random() - 0.5) * 200);
                flyingCrows.push(crow); // Store separately for flying behavior
            }

            scene.add(crow);
            crows.push(crow);

            // ✅ Setup Animation (Flapping Wings)
            const mixer = new THREE.AnimationMixer(crow);
            const flyAction = mixer.clipAction(gltf.animations.find(anim => anim.name.toLowerCase().includes('fly')));
            if (flyAction) {
                flyAction.play(); // Start flapping animation
            }
            crowMixers.push(mixer);
        });
    }
}
addCrows();

function animateCrows(deltaTime) {
    crows.forEach((crow, index) => {
        if (crow.position.y === 0) {
            // ✅ If the player is close, make the crow fly away
            const distanceToPlayer = character.position.distanceTo(crow.position);
            if (distanceToPlayer < 10) {
                crow.position.y += 0.5; // Start flying
                flyingCrows.push(crow); // Move to flying crows list
            }
        }
    });

    // ✅ Move flying crows to higher altitudes
    flyingCrows.forEach((crow, index) => {
        crow.position.y += 0.2; // Increase height gradually (flies higher)
        crow.position.x += (Math.random() - 0.5) * 0.3; // Small random movement
        crow.position.z += (Math.random() - 0.5) * 0.3;

        // ✅ Add realistic up-and-down motion while flying
        crow.position.y += Math.sin(Date.now() * 0.002 + index) * 0.1;

        // ✅ If the crow flies too high, it disappears
        if (crow.position.y > 150) { // Increased from 80 to 150
            flyingCrows.splice(index, 1); // Remove from flying list
            scene.remove(crow); // Remove from scene
        }
    });

    // ✅ Update animation for flapping wings
    crowMixers.forEach(mixer => mixer.update(deltaTime));
}

// Animation blending function
function activateAnimation(name) {
    if (currentAction === name) return;
    const action = animations[name];
    if (!action) return;

    const previousAction = animations[currentAction];
    if (previousAction) previousAction.fadeOut(0.3);

    action.reset().fadeIn(0.3).play();
    currentAction = name;
}

// Free Fire Style Camera Movement
let isDragging = false;
let previousMouseX = 0;

window.addEventListener('mousedown', (event) => {
    isDragging = true;
    previousMouseX = event.clientX;
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mousemove', (event) => {
    if (isDragging) {
        let deltaX = event.clientX - previousMouseX;
        previousMouseX = event.clientX;
        let rotationSpeed = 0.005;
        camera.rotation.y -= deltaX * rotationSpeed;
    }
});

// Smooth Camera Follow
const cameraOffset = new THREE.Vector3(0, 4, -6); // Default offset behind the character
let targetRotationY = 0; // Store rotation for smooth transition

function updateCamera() {
    if (!character) return;

    // Smoothly adjust camera rotation when character rotates
    targetRotationY = character.rotation.y;

    // Apply rotation to the camera offset to always stay behind the character
    const rotatedOffset = cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), targetRotationY);

    // Set the new camera position behind the character
    const targetPosition = character.position.clone().add(rotatedOffset);

    // Smoothly move the camera to follow the character
    camera.position.lerp(targetPosition, 0.1);
    camera.lookAt(character.position);
}


// Character Movement with Rotation
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
window.addEventListener('keydown', (e) => { if (keys[e.key] !== undefined) keys[e.key] = true; });
window.addEventListener('keyup', (e) => { if (keys[e.key] !== undefined) keys[e.key] = false; });

// Define the terrain boundary size
const terrainSize = 506.5; // Adjust based on actual terrain size
const barrierHeight = 8;   // Height of the walls
const barrierThickness = 1; // Increased thickness for visibility and collision
const barrierColor = 0x8B0000;


// Create barriers (walls) around the terrain
const barriers = [];

// Create four walls around the terrain
createBarrier(0, -terrainSize / 2, terrainSize, barrierHeight, barrierThickness); // Back Wall
createBarrier(0, terrainSize / 2, terrainSize, barrierHeight, barrierThickness);  // Front Wall
createBarrier(-terrainSize / 2, 0, barrierThickness, barrierHeight, terrainSize); // Left Wall
createBarrier(terrainSize / 2, 0, barrierThickness, barrierHeight, terrainSize);  // Right Wall

// Treasure System
const treasures = []; // Store all treasures
const treasureSize = 1; // Standard size for all treasures

// ✅ Fixed positions for gold treasures
const goldTreasurePositions = [
    { x: 50, z: 50 },
    { x: -90, z: -90 },
    { x: 200, z: -150 }
];

// ✅ Fixed position for the single blue treasure
const blueTreasurePosition = { x: 50, z: 10}; // Center of the terrain

function createTreasure(type, position) {
    const treasureGeometry = new THREE.BoxGeometry(treasureSize, treasureSize, treasureSize);
    let treasureMaterial, treasureColor;

    if (type === "gold") {
        treasureColor = 0xffd700; // Gold color
    } else {
        treasureColor = 0x0000ff; // Blue color
    }

    treasureMaterial = new THREE.MeshStandardMaterial({ color: treasureColor });
    const treasure = new THREE.Mesh(treasureGeometry, treasureMaterial);

    // ✅ Set treasure position from predefined locations
    treasure.position.set(position.x, 1, position.z);

    // ✅ Store type in userData for identification
    treasure.userData.type = type;

    scene.add(treasure);
    treasures.push(treasure);
}

// ✅ Generate gold treasures at fixed positions
goldTreasurePositions.forEach(pos => {
    createTreasure("gold", pos);
});

// ✅ Create only one blue treasure at its fixed position
createTreasure("blue", blueTreasurePosition);


// ✅ Create a mini-screen with a scrollable area for full content
const miniScreen = document.createElement('div');
miniScreen.style.cssText = `
    position: fixed; top: 50%; left: 50%; width: 60vw; height: 70vh;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9); color: white; font-size: 16px;
    display: none; flex-direction: column; align-items: center; 
    justify-content: flex-start; border: 3px solid white; border-radius: 10px; 
    text-align: center; z-index: 1000; overflow: hidden;
`;

// ✅ Create a scrollable content container
const contentContainer = document.createElement('div');
contentContainer.style.cssText = `
    width: 95%; height: 85%; overflow-y: auto; padding: 10px; text-align: left;
    background: rgba(255, 255, 255, 0.1);
`;

// ✅ Add full C programming content
contentContainer.innerHTML = `
        <h2>Level 6: Functions in C</h2>
        <h3>What are Functions?</h3>
        <p>A function is a block of code that performs a specific task. Functions help in code reusability, modularity, and readability.</p>
        <p>In C, there are two types of functions:
            <ul>
                <li>Library Functions – Built-in functions like printf(), scanf(), sqrt(), etc.</li>
                <li>User-defined Functions – Functions created by the programmer.</li>
            </ul>
        </p>       
        <h3>Syntax of a Function</h3>
        <p>C has three categories of control statements:</p>
        <p>A function typically has:
            <ul>
                <li>A return type (what it returns)</li>                
                <li>A name (identifier)</li>
                <li>Parameters (optional inputs)</li>
                <li>A body (statements)</li>
                <li>A return statement (if applicable)</li>
            </ul>
        </p>
        <pre>
            returnType functionName(parameters) {
                // Function body
                return value; // Optional
            }            
        </pre>
        <h3>Declaring and Calling a Function</h3>
        <p>A function must be declared before use.</p>
        <p>Example: Function to Add Two Numbers</p>
        <pre>
            #include <stdio.h>

                // Function declaration (prototype)
                int add(int, int);
                
                int main() {
                    int result = add(5, 3); // Function call
                    printf("Sum: %d", result);
                    return 0;
                }
                
                // Function definition
                int add(int a, int b) {
                    return a + b; // Return sum
                }                
        </pre>
        <p>Output</p>
        <pre>
            Sum: 8
        </pre>
        <h3>Function Categories</h3>
        <p>Functions can be classified based on:
            <ul>
                <li>Return type (returns a value or void)</li>
                <li>Parameters (with or without arguments)</li>
            </ul>
        </p>
        <table>
            <tr><th>Function Type</th><th>Description</th><th>Example</th></tr>
                <tr><td>No return, no arguments</td><td>Does not return anything or take input</td><td>void greet()</td></tr>
                <tr><td>No return, with arguments</td><td>Takes input but does not return anything</td><td>void printSum(int, int)</td></tr>
                <tr><td>With return, no arguments</td><td>Returns a value but takes no input</td><td>int getNumber()</td></tr>
                <tr><td>With return, with arguments</td><td>Takes input and returns a value</td><td>int multiply(int, int)</td></tr>
            </table>
        <h3> Types of User-Defined Functions</h3>
        <p>Functions with No Return and No Parameters</p>
        <p>Performs an action but does not return a value.</p>
        <p>Example: Print a Greeting</p>
        <pre>
            #include <stdio.h>

                void greet() {
                    printf("Hello, welcome to C programming!\n");
                }
                
                int main() {
                    greet(); // Function call
                    return 0;
                }                                   
        </pre>
        <p>Output</p>
        <pre>
            Hello, welcome to C programming!                   
        </pre>
        <p>Output</p>
        <pre>
            1 2 3 4 5
        </pre>
        <h3>Functions with No Return but with Parameters</h3>
        <p>Takes input but does not return a value..</p>
        <p>Example: Print Sum of Two Numbers</p>
        <pre>
            #include <stdio.h>

                void printSum(int a, int b) {
                    printf("Sum: %d\n", a + b);
                }
                
                int main() {
                    printSum(4, 7); // Function call
                    return 0;
                }                
        </pre>
        <p>Output</p>
        <pre> 
            Sum: 11    
            </pre>      
        <h3>Functions with Return but No Parameters</h3>
        <p>Returns a value but takes no input.</p>
        <p>Example: Return a Number</p>
        <pre>
            #include <stdio.h>

                int getNumber() {
                    return 10;
                }
                
                int main() {
                    int num = getNumber();
                    printf("Number: %d", num);
                    return 0;
                }                
            </pre>
        <p>output</p>
        <pre>
            Number: 10                                  
            </pre>
    
        <h3> Functions with Return and Parameters</h3>
        <p>Takes input and returns a value.</p>
        <p>Example: Multiply Two Numbers</p>
        <pre>
            #include <stdio.h>

                int multiply(int a, int b) {
                    return a * b;
                }
                
                int main() {
                    int result = multiply(6, 5);
                    printf("Multiplication: %d", result);
                    return 0;
                }                               
        </pre>
        <p>Output:</p>
        <pre>
            Multiplication: 30        
        </pre>
        <h3> Function Prototypes (Declaration)</h3>
        <p>
            <ol>
                <li>Function prototypes allow functions to be used before their actual definition.</li>
                <li>Placed at the beginning of the program.</li>
            </ol>
        </p>
        <p>Example</p>
        <pre>
            #include <stdio.h>

                void display(); // Function prototype
                
                int main() {
                    display(); // Function call
                    return 0;
                }
                
                void display() {
                    printf("This is a function prototype example.");
                }                
        </pre>
        <h3>Recursive Functions</h3>
        <p>
            <ol>
                <li>A function that calls itself.</li>
                <li>Used for problems like factorial, Fibonacci, etc.</li>
            </ol>
        </p>
        <p>Example: Factorial using Recursion</p>
        <pre>
            #include <stdio.h>

                int factorial(int n) {
                    if (n == 0)
                        return 1;
                    return n * factorial(n - 1);
                }
                
                int main() {
                    printf("Factorial of 5: %d", factorial(5));
                    return 0;
                }                
            </pre>
            <p>Output</p>
            <pre>
                Factorial of 5: 120
            </pre>
            <h3>Passing Arguments to Functions</h3>
            <p>Call by Value (Default in C)
                <ul>
                    <li>Passes a copy of the variable.</li>
                    <li>Changes inside the function do not affect the original value.</li>
                </ul>
            </p>
            <p>Example</p>
            <pre>
                #include <stdio.h>

                    void changeValue(int x) {
                        x = 100; // Changing x does not affect main()
                    }
                    
                    int main() {
                        int num = 50;
                        changeValue(num);
                        printf("Value: %d", num);
                        return 0;
                    }                    
            </pre>
            <p>Output</p>
            <pre>
                Value: 50
            </pre>
            <h3>Call by Reference (Using Pointers)</h3>
            <p>
                <ol>
                    <li>Passes the memory address.</li>
                    <li>Changes inside the function affect the original value.</li>
                </ol>
            </p>
            <p>Example</p>
            <pre>
                #include <stdio.h>

                    void changeValue(int *x) {
                        *x = 100; // Changes the original value
                    }
                    
                    int main() {
                        int num = 50;
                        changeValue(&num);
                        printf("Value: %d", num);
                        return 0;
                    }                    
            </pre>
            <p>Output</p>
            <pre>
                Value: 100
            </pre>
            <h3>Storage Classes in Functions</h3>
            <p>Storage classes define a variable’s scope, lifetime, and visibility.</p>
            <table>
                <tr><th>Storage Class</th><th>Lifetime</th><th>Scope</th><th>Default Value</th></tr>
                <tr><td>auto (Default)</td><td>Function execution</td><td>Local</td><td>Garbage value</td></tr>
                <tr><td>static</td><td>Entire program</td><td>Local</td><td>0</td></tr>
                <tr><td>extern</td><td>Entire program</td><td>Global</td><td>0</td></tr>
                <tr><td>register</td><td>Function execution</td><td>Local</td><td>Garbage value</td></tr>
            </table>
`;

// ✅ Close button
const closeButton = document.createElement("button");
closeButton.innerText = "Close";
closeButton.style.cssText = `
    margin-top: 10px; padding: 10px 20px; font-size: 18px;
    background: white; color: black; border: none; border-radius: 5px;
    cursor: pointer;
`;
closeButton.addEventListener("click", () => {
    miniScreen.style.display = "none"; // Hide the mini screen
});

// ✅ Append elements to the mini-screen
miniScreen.appendChild(contentContainer);
miniScreen.appendChild(closeButton);
document.body.appendChild(miniScreen);


function createBarrier(x, z, width, height, depth) {
    const barrierGeometry = new THREE.BoxGeometry(width, height, depth);
    const barrierMaterial = new THREE.MeshStandardMaterial({
        color: 0x00aaff,  // Light Blue / Cyan Color for Glass Effect
        transparent: true, // Enable Transparency
        opacity: 0.3,      // Adjust Glass Transparency
        roughness: 0,      // Make it Smooth
        metalness: 0.8     // Reflective Effect
    });

    const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
    barrier.position.set(x, height / 2, z);
    barrier.castShadow = false; // Glass doesn't cast shadows
    barrier.receiveShadow = false;
    scene.add(barrier);
    barriers.push(barrier);
}
function addStreetLights() {
    const lightColor = 0xfff1b5; // Warm yellow light

    for (let i = -200; i <= 200; i += 50) { // Adjust position spacing
        // Create light pole
        const poleGeometry = new THREE.CylinderGeometry(0.5, 0.5, 10, 16);
        const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(i, 5, -100);
        scene.add(pole);

        // Create light source
        const streetLight = new THREE.PointLight(lightColor, 1, 50);
        streetLight.position.set(i, 10, -100);
        scene.add(streetLight);
    }
}

addStreetLights(); // ✅ Call function to add streetlights

function updateMovement() {
    if (!character) return;

    let moving = false;
    let direction = new THREE.Vector3();

    // Move Forward & Backward
    if (keys.ArrowUp) {
        direction.z += 1;
        moving = true;
    }
    if (keys.ArrowDown) {
        direction.z -= 1;
        moving = true;
    }

    // Rotate Character Left & Right
    if (keys.ArrowLeft) character.rotation.y += 0.05;
    if (keys.ArrowRight) character.rotation.y -= 0.05;

    if (moving) {
        direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), character.rotation.y);
        let nextPosition = character.position.clone().add(direction.multiplyScalar(maxSpeed));

        // Collision detection with barriers
        for (let barrier of barriers) {
            let { width, depth } = barrier.geometry.parameters;
            let min = barrier.position.clone().sub(new THREE.Vector3(width / 2, 0, depth / 2));
            let max = barrier.position.clone().add(new THREE.Vector3(width / 2, 0, depth / 2));
            if (nextPosition.x > min.x && nextPosition.x < max.x && nextPosition.z > min.z && nextPosition.z < max.z) return;
        }

        velocity.addScaledVector(direction, acceleration);
    } else {
        velocity.multiplyScalar(1 - deceleration);
        if (velocity.length() < 1) velocity.set(0, 0, 0);
    }

    velocity.clampLength(0, maxSpeed);
    character.position.add(velocity);

    let questionActive = false; // ✅ Ensures only one question appears at a time

    treasures.forEach((treasure, index) => {
        if (!questionActive && character.position.distanceTo(treasure.position) < 2) {
            if (treasure.userData.type === "gold") {
                questionActive = true;

                askQuestion((isCorrect) => {
                    questionActive = false;

                    if (isCorrect) {
                        score += 10;
                        updateScore();
                        console.log("✅ Correct answer! Score:", score);

                        scene.remove(treasure);
                        treasures.splice(index, 1);

                        if (treasures.length === 0 && !gameOverFlag) {
                            showGameCompleteScreen(); // ✅ Trigger "Game Complete"
                        }
                    } else {
                        showGameOverOptions();
                    }
                });
            } else if (treasure.userData.type === "blue") {
                console.log("🔵 Blue treasure touched! Displaying mini screen...");
                miniScreen.style.display = "flex";

                scene.remove(treasure);
                treasures.splice(index, 1);
            }
        }
    });

    activateAnimation(moving ? 'run' : 'idle');
}


const quizQuestions = [
    {
        question: "What will be the output of the following code?\n\nint x = 10;\nif (x > 5)\n    printf(\"Greater\");\nelse\n    printf(\"Smaller\");",
        options: ["Greater", "Smaller", "Error", "None of the above"],
        answer: "Greater"
    },
    {
        question: "Which of the following is NOT a valid conditional statement in C?",
        options: [
            "if-else statement",
            "switch statement",
            "select-case statement",
            "Nested if statement"
        ],
        answer: "select-case statement"
    },
    {
        question: "What is the correct syntax for a ternary operator in C?",
        options: [
            "if (condition) ? expr1 : expr2;",
            "condition ? expr1 : expr2;",
            "if condition then expr1 else expr2;",
            "condition -> expr1 else expr2;"
        ],
        answer: "condition ? expr1 : expr2;"
    },
    {
        question: "What will be the output of the following code?\n\nint x = 5;\nif (x == 5)\n    printf(\"Equal\");\nelse\n    printf(\"Not Equal\");",
        options: ["Equal", "Not Equal", "Error", "None of the above"],
        answer: "Equal"
    },
    {
        question: "Which of the following is TRUE about the `switch` statement in C?",
        options: [
            "It can only compare integer values.",
            "It allows duplicate case values.",
            "The break statement is optional but recommended.",
            "Default case must be at the end."
        ],
        answer: "The break statement is optional but recommended."
    },
    {
        question: "What happens if the break statement is omitted in a switch case?",
        options: [
            "Only the matched case executes.",
            "The program stops execution.",
            "All subsequent cases execute until a break is found.",
            "It results in a compilation error."
        ],
        answer: "All subsequent cases execute until a break is found."
    },
    {
        question: "What will be the output of the following code?\n\nint num = 10;\nprintf(\"%s\", (num % 2 == 0) ? \"Even\" : \"Odd\");",
        options: ["Even", "Odd", "Error", "None of the above"],
        answer: "Even"
    },
    {
        question: "Which of the following is FALSE about nested if statements?",
        options: [
            "You can have multiple if statements inside another if.",
            "Every nested if must have an else.",
            "Nested if can be used inside loops.",
            "Indentation helps in readability of nested if statements."
        ],
        answer: "Every nested if must have an else."
    },
    {
        question: "Which statement correctly checks if `x` is between 10 and 20 (inclusive)?",
        options: [
            "if (x >= 10 && <= 20)",
            "if (x >= 10 && x <= 20)",
            "if (x => 10 and x =< 20)",
            "if (x between 10 and 20)"
        ],
        answer: "if (x >= 10 && x <= 20)"
    },
    {
        question: "What will be the output of the following code?\n\nint age = 18;\nif (age = 21)\n    printf(\"Allowed\");\nelse\n    printf(\"Not Allowed\");",
        options: ["Allowed", "Not Allowed", "Compilation Error", "Runtime Error"],
        answer: "Allowed"
    }
];

// Function to Show a Quiz Prompt
// Function to Show a Quiz Prompt
function askQuestion(callback) {
    if (document.getElementById("questionBox")) return; // ✅ Prevent multiple question popups

    // ✅ Pick a random question
    const randomIndex = Math.floor(Math.random() * quizQuestions.length);
    const selectedQuestion = quizQuestions[randomIndex];

    // ✅ Create the question popup container
    const questionBox = document.createElement("div");
    questionBox.id = "questionBox"; // ✅ Prevent duplicates
    questionBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; width: 70vw; max-width: 500px; height: auto; 
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg,rgb(17, 15, 16), #ff758c);
        color: white; font-size: 20px; padding: 25px;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        border-radius: 15px; text-align: center;
        box-shadow: 0 10px 30px rgba(61, 5, 5, 0.3);
        z-index: 1000;
        animation: fadeIn 0.3s ease-in-out;
    `;

    // ✅ Question Title
    const questionTitle = document.createElement("p");
    questionTitle.innerHTML = selectedQuestion.question;
    questionTitle.style.cssText = "font-size: 22px; font-weight: bold; margin-bottom: 15px;";

    questionBox.appendChild(questionTitle);

    // ✅ Answer Section
    const answerContainer = document.createElement("div");
    answerContainer.style.cssText = "width: 100%; display: flex; flex-direction: column; gap: 10px;";

    if (selectedQuestion.options) {
        // ✅ Multiple-Choice Buttons
        selectedQuestion.options.forEach((option) => {
            const optionButton = document.createElement("button");
            optionButton.innerText = option;
            optionButton.style.cssText = `
                width: 100%; padding: 12px; font-size: 18px; background: white; color:rgb(3, 3, 3);
                border: none; border-radius: 8px; cursor: pointer; font-weight: bold;
                transition: 0.3s ease-in-out; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            `;
            optionButton.addEventListener("mouseover", () => optionButton.style.background = "#ff5771");
            optionButton.addEventListener("mouseout", () => optionButton.style.background = "white");
            optionButton.addEventListener("click", () => {
                document.body.removeChild(questionBox); // ✅ Close question box
                callback(option.toLowerCase() === selectedQuestion.answer.toLowerCase());
            });

            answerContainer.appendChild(optionButton);
        });
    } else {
        // ✅ Text Input for Open-Ended Answers
        const answerInput = document.createElement("input");
        answerInput.type = "text";
        answerInput.placeholder = "Type your answer here...";
        answerInput.style.cssText = `
            padding: 10px; font-size: 18px; width: 85%; text-align: center;
            border: 2px solid white; border-radius: 6px;
            background: rgba(51, 168, 28, 0.2); color: white;
            outline: none; transition: all 0.3s ease-in-out;
        `;
        answerInput.onfocus = function() {
            this.style.background = "white"; this.style.color = "black";
        };

        const submitButton = document.createElement("button");
        submitButton.innerText = "Submit";
        submitButton.style.cssText = `
            margin-top: 15px; padding: 12px 25px; font-size: 18px;
            background: white; color:rgb(22, 21, 21); font-weight: bold;
            border: none; border-radius: 8px; cursor: pointer;
            transition: 0.3s ease-in-out; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        `;
        submitButton.addEventListener("mouseover", () => submitButton.style.background = "#ff5771");
        submitButton.addEventListener("mouseout", () => submitButton.style.background = "white");
        submitButton.addEventListener("click", () => {
            const userAnswer = answerInput.value.trim().toLowerCase();
            document.body.removeChild(questionBox); // ✅ Close question box
            callback(userAnswer === selectedQuestion.answer.toLowerCase());
        });

        answerContainer.appendChild(answerInput);
        answerContainer.appendChild(submitButton);
    }

    questionBox.appendChild(answerContainer);
    document.body.appendChild(questionBox);

    // ✅ Add fade-in animation
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -55%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }
    `;
    document.head.appendChild(styleSheet);

    // ✅ Handle Answer Submission
    document.getElementById("submitAnswer").addEventListener("click", () => {
        const userAnswer = document.getElementById("answerInput").value.trim().toLowerCase();
        document.body.removeChild(questionBox); // ✅ Close question box

        if (userAnswer === selectedQuestion.answer.toLowerCase()) {
            callback(true); // ✅ Correct answer
        } else {
            callback(false); // ❌ Wrong answer - Show Quit/Restart options
        }
    });
}

function showGameOverOptions() { 
    console.log("❌ Wrong answer! Asking player to Quit, Restart, or Go to Next Level...");

    // ✅ Stop movement and interactions
    gameOverFlag = true;

    // ✅ Remove any existing game-over screen (if it exists)
    const existingScreen = document.getElementById("gameOverScreen");
    if (existingScreen) existingScreen.remove();

    // ✅ Create a game over screen
    const gameOverScreen = document.createElement("div");
    gameOverScreen.id = "gameOverScreen";
    gameOverScreen.style.cssText = `
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9); color: white;
        padding: 20px; border-radius: 10px;
        text-align: center; z-index: 1000;
        width: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
    `;

    gameOverScreen.innerHTML = `
        <h2>❌ Wrong Answer!</h2>
        <p>Would you like to quit, restart, or go to the next level?</p>
        <button id="quitGame" style="
            margin: 10px; padding: 10px 20px; font-size: 16px;
            background: red; color: white; border: none; border-radius: 5px;
            cursor: pointer;
        ">Quit Game</button>
        <button id="retryGame" style="
            margin: 10px; padding: 10px 20px; font-size: 16px;
            background: blue; color: white; border: none; border-radius: 5px;
            cursor: pointer;
        ">Restart Game</button>
        <button id="nextLevel" style="
            margin: 10px; padding: 10px 20px; font-size: 16px;
            background: green; color: white; border: none; border-radius: 5px;
            cursor: pointer;
        ">Next Level</button>
    `;

    document.body.appendChild(gameOverScreen);

    // ✅ Quit Game Button
    document.getElementById("quitGame").addEventListener("click", () => {
        window.close(); // ✅ Close the game window
    });

    // ✅ Retry Game Button
    document.getElementById("retryGame").addEventListener("click", () => {
        location.reload(); // ✅ Reload the page to restart the game
    });

    // ✅ Next Level Button (Fixed ID reference)
    document.getElementById("nextLevel").addEventListener("click", () => {
        window.location.href = "certificate.html"; // ✅ Go to the next level
    });
}

// Store the level start time when the game begins
let levelStartTime = Date.now();

function showGameCompleteScreen() {
    console.log("🎮 GAME COMPLETE! Displaying final screen...");

    // ✅ Stop game updates
    gameOverFlag = true;

    // ✅ Calculate Time Taken
    let timeTakenMs = Date.now() - levelStartTime; // Get elapsed time in milliseconds
    let seconds = Math.floor((timeTakenMs / 1000) % 60);
    let minutes = Math.floor((timeTakenMs / (1000 * 60)) % 60);
    let timeTakenFormatted = `${minutes}m ${seconds}s`;

    // ✅ Create Game Complete Mini-Screen
    const gameCompleteScreen = document.createElement("div");
    gameCompleteScreen.id = "gameCompleteScreen"; // Unique ID for debugging
    gameCompleteScreen.style.cssText = `
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9); color: white;
        padding: 20px; border-radius: 10px;
        text-align: center; z-index: 1000;
        display: flex; flex-direction: column; align-items: center;
    `;

    gameCompleteScreen.innerHTML = `
        <h2>🏆 Level Complete!</h2>
        <p>Congratulations! You have finished all levels 🥳.</p>
        <p>✅ Your final score: ${score}</p>
        <p>⏱ Time Taken: ${timeTakenFormatted}</p> <!-- ✅ Display time taken -->
        <button id="restartGame" style="
            margin-top: 10px; padding: 10px 20px; font-size: 18px;
            background: blue; color: white; border: none; border-radius: 5px;
            cursor: pointer;
        ">Restart Game</button>
        <button id="nextLevel" style="
            margin-top: 10px; padding: 10px 20px; font-size: 18px;
            background: blue; color: white; border: none; border-radius: 5px;
            cursor: pointer;
        ">Next Level</button>
    `;

    document.body.appendChild(gameCompleteScreen);

    // ✅ Restart Game Button
    document.getElementById("restartGame").addEventListener("click", () => {
        window.location.href = "pro.html"; // ✅ Restart from level 1
    });

    document.getElementById("nextLevel").addEventListener("click", () => {
        window.location.href = "certificate.html"; // ✅ Go to the next level
    });
}

// Mini-Map Setup (Rounded and Properly Positioned in UI)
const miniMapSize = 200; // Mini-map diameter
const miniMapRenderer = new THREE.WebGLRenderer({ alpha: true });
miniMapRenderer.setSize(miniMapSize, miniMapSize);
miniMapRenderer.domElement.style.cssText = `
    position: absolute; top: 20px; left: 20px; 
    border: 4px solid white; border-radius: 50%;
    width: ${miniMapSize}px; height: ${miniMapSize}px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.6);
    clip-path: circle(50%);
`;
document.body.appendChild(miniMapRenderer.domElement);

// Adjusted Mini-Map Camera for Better View
let miniMapZoom = 300; // Adjusted zoom for terrain visibility
const miniMapCamera = new THREE.OrthographicCamera(-miniMapZoom, miniMapZoom, miniMapZoom, -miniMapZoom, 0.1, 1000);
miniMapCamera.position.set(0, 400, 0); // Higher view to properly show terrain
miniMapCamera.lookAt(0, 0, 0);

// Mini-Map Zoom Feature
miniMapRenderer.domElement.addEventListener('wheel', (event) => {
    event.preventDefault();
    miniMapZoom += event.deltaY * 0.3; // Smooth zoom scaling
    miniMapZoom = Math.max(150, Math.min(500, miniMapZoom)); // Zoom range limits

    // Update camera projection
    miniMapCamera.left = -miniMapZoom;
    miniMapCamera.right = miniMapZoom;
    miniMapCamera.top = miniMapZoom;
    miniMapCamera.bottom = -miniMapZoom;
    miniMapCamera.updateProjectionMatrix();
});

// Full Map Display (Expands When Clicking Mini-Map)
const fullMapContainer = document.createElement('div');
fullMapContainer.style.cssText = `
    position: fixed; top: 50%; left: 50%; width: 80vw; height: 80vh;
    background: rgba(0, 0, 0, 0.9); display: none; align-items: center; justify-content: center;
    transform: translate(-50%, -50%);
    border: 3px solid white; border-radius: 10px; cursor: grab;
`;
document.body.appendChild(fullMapContainer);

const fullMapRenderer = new THREE.WebGLRenderer({ alpha: true });
fullMapRenderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
fullMapContainer.appendChild(fullMapRenderer.domElement);

let fullMapDragging = false, startX, startY;
fullMapContainer.addEventListener('mousedown', (e) => {
    fullMapDragging = true;
    startX = e.clientX - fullMapContainer.offsetLeft;
    startY = e.clientY - fullMapContainer.offsetTop;
});
fullMapContainer.addEventListener('mousemove', (e) => {
    if (!fullMapDragging) return;
    fullMapContainer.style.left = `${e.clientX - startX}px`;
    fullMapContainer.style.top = `${e.clientY - startY}px`;
});
fullMapContainer.addEventListener('mouseup', () => { fullMapDragging = false; });
fullMapContainer.addEventListener('mouseleave', () => { fullMapDragging = false; });

// Close Full Map When Clicking Outside
fullMapContainer.addEventListener('click', () => {
    fullMapContainer.style.display = 'none';
});

// Show Full Map When Clicking Mini-Map
miniMapRenderer.domElement.addEventListener('click', () => {
    fullMapContainer.style.display = 'flex';
    fullMapRenderer.render(scene, miniMapCamera);
});

// Show Full Map When Clicking Mini-Map
miniMapRenderer.domElement.addEventListener('click', () => {
    fullMapContainer.style.display = 'flex';
    fullMapRenderer.render(scene, miniMapCamera);
});

let fullMapPanOffset = new THREE.Vector3(0, 0, 0);

function updateMiniMap() {
    if (!character || !environment) return; // Ensure character and terrain are loaded

    // Position the mini-map camera directly above the player
    miniMapCamera.position.set(character.position.x, 400, character.position.z);
    miniMapCamera.lookAt(character.position.x, 0, character.position.z);

    // Create a new mini-map scene
    const miniMapScene = new THREE.Scene();

    // **Show Terrain & Environment**
    let miniMapEnvironment = environment.clone();
    miniMapScene.add(miniMapEnvironment);

    // **Ensure Proper Lighting in Mini-Map**
    const miniMapLight = new THREE.AmbientLight(0xffffff, 1); // Light to make objects visible
    miniMapScene.add(miniMapLight);

    // **Show Player as a Blue Dot**
    const playerIndicator = new THREE.Mesh(
        new THREE.CircleGeometry(10, 16), // Bigger for visibility
        new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue for player
    );
    playerIndicator.position.set(character.position.x, 2, character.position.z);
    miniMapScene.add(playerIndicator);

    // **Show Player Direction Arrow**
    const arrowGeometry = new THREE.ConeGeometry(6, 12, 8); // Bigger arrow
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const characterArrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    characterArrow.position.set(character.position.x, 6, character.position.z);
    characterArrow.rotation.y = -character.rotation.y; // Align with player direction
    miniMapScene.add(characterArrow);

    // **Show Treasures in Mini-Map (Now Updates Properly)**
    treasures.forEach(treasure => {
        const treasureIndicator = new THREE.Mesh(
            new THREE.CircleGeometry(4, 16), // Bigger for clarity
            new THREE.MeshBasicMaterial({ color: treasure.userData.type === "gold" ? 0xffd700 : 0x0000ff }) // ✅ Gold or Blue
        );
        treasureIndicator.position.set(treasure.position.x, 2, treasure.position.z);
        miniMapScene.add(treasureIndicator);
    });
    
    // Render Mini-Map
    miniMapRenderer.render(miniMapScene, miniMapCamera);

    // **Update Full Map if Opened**
    if (fullMapContainer.style.display === "flex") {
        fullMapRenderer.render(miniMapScene, miniMapCamera);
    }
}

const moveButtons = document.createElement('div');
moveButtons.style.position = 'absolute';
moveButtons.style.bottom = '20px';
moveButtons.style.left = '50%';
moveButtons.style.transform = 'translateX(-50%)';
moveButtons.style.display = 'flex';
moveButtons.style.gap = '10px';

document.body.appendChild(moveButtons);

const buttonStyle = 'width: 50px; height: 50px; font-size: 20px; background: rgba(0, 0, 0, 0.5); color: white; border: none; border-radius: 5px;';

const upButton = document.createElement('button');
upButton.innerText = '↑';
upButton.style.cssText = buttonStyle;
moveButtons.appendChild(upButton);

const leftButton = document.createElement('button');
leftButton.innerText = '←';
leftButton.style.cssText = buttonStyle;
moveButtons.appendChild(leftButton);

const downButton = document.createElement('button');
downButton.innerText = '↓';
downButton.style.cssText = buttonStyle;
moveButtons.appendChild(downButton);

const rightButton = document.createElement('button');
rightButton.innerText = '→';
rightButton.style.cssText = buttonStyle;
moveButtons.appendChild(rightButton);

const keyMapping = {
    'ArrowUp': upButton,
    'ArrowDown': downButton,
    'ArrowLeft': leftButton,
    'ArrowRight': rightButton,
};

Object.entries(keyMapping).forEach(([key, button]) => {
    button.addEventListener('mousedown', () => keys[key] = true);
    button.addEventListener('mouseup', () => keys[key] = false);
    button.addEventListener('mouseleave', () => keys[key] = false);
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys[key] = true;
    }, { passive: false });
    button.addEventListener('touchend', () => keys[key] = false);
});
// ✅ Create a timer display (initially set to 0)
let elapsedTime = 0; // Start at 0 seconds
const timerElement = document.createElement("div");
timerElement.style.cssText = `
    position: absolute; top: 10px; left: 50%;
    transform: translateX(-50%);
    font-size: 22px; color: white; background: rgba(0, 0, 0, 0.6);
    padding: 10px; border-radius: 5px; font-weight: bold;
`;
timerElement.innerText = `Time: ${formatTime(elapsedTime)}`; // Changed text to "Time"
document.body.appendChild(timerElement);

// ✅ Function to format time (mm:ss)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

// ✅ Variable to track if the game is over (still useful for other game logic)
let gameOverFlag = false;

// ✅ Start continuous timer
function startContinuousTimer() {
    const timerInterval = setInterval(() => {
        if (gameOverFlag) return; // ✅ Stop updating if the game is over (e.g., if the user wins/loses by other means)

        elapsedTime++; // Increase time by 1 second
        timerElement.innerText = `Time: ${formatTime(elapsedTime)}`; // Update display

        // Removed the totalTime check since there's no limit
    }, 1000); // Update every second
}

// ✅ Call `startContinuousTimer()` when the game starts
startContinuousTimer();

// You would still need your `gameOver()` function if you want to end the game based on other conditions.
// For example:
// function gameOver() {
//     gameOverFlag = true;
//     alert("Game Over!");
//     // Add any other game over logic here (e.g., display score, restart button)
// }
// Animation Loop
// Animation Loop
const clock = new THREE.Clock();

function animate() {
    if (gameOverFlag) {
        console.log("🚫 Game Over! Animation stopped.");
        return; // ✅ Stop updating after mini-screen appears
    }

    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta(); // Get time between frames

    updateMovement();
    updateCamera();
    updateMiniMap();
    animatePeople(deltaTime); // ✅ Stop NPC movement
   // animateCars(); // ✅ Stop car movement
    animateCrows(deltaTime); // ✅ Stop crow movement
    if (mixer) mixer.update(deltaTime); // ✅ Stop animations
    renderer.render(scene, camera);
}
animate();

// Handle Window Resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
// script.js (This code would be part of your existing script.js file for Level 1)

// ... (Your existing game code for Level 1, including score and time tracking) ...
// Function to save score and time to your backend API
async function saveLevelData(finalScore, finalTimeTakenSeconds) {
    const levelIdentifier = "level6"; // Unique identifier for this level for Level 1

    // Retrieve user ID and username from localStorage
    const userId = localStorage.getItem('loggedInUserId');
    const username = localStorage.getItem('loggedInUsername');

    if (!userId || !username) {
        console.error("User ID or username not found in localStorage. Cannot save game data.");
        // Optionally, redirect to login or show a message to log in
        alert("Please log in to save your game progress!");
        // window.location.href = '/login'; // Uncomment if you want to force login
        return;
    }

    const gameData = {
        userId: userId,
        username: username,
        level: levelIdentifier, // This is the value sent to the backend
        score: finalScore,
        timeTaken: finalTimeTakenSeconds // Ensure this matches your backend's expectation (seconds/ms)
    };

    // --- DEBUGGING LOGS (Keep these for now to confirm the fix) ---
    console.log("Frontend (Pre-fetch): Data being sent:", gameData);
    console.log("Frontend (Pre-fetch): Level value:", gameData.level);
    // --- END DEBUGGING LOGS ---

    try {
        const response = await fetch('http://localhost:3000/api/save-game-data', { // Adjust backend URL/port if different
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // If your backend uses JWT for authentication, include the token here:
                // 'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Assuming you store an auth token
            },
            body: JSON.stringify(gameData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Failed to save game data: ${response.status} - ${errorData.message}`);
            // Display an error message to the user (e.g., in a custom modal)
            // alert(`Error saving progress: ${errorData.message}`);
            return; // Exit if saving failed
        }

        const data = await response.json();
        console.log('Game data saved successfully:', data);
        // Display a success message to the user (e.g., in a custom modal)
        // alert("Your score has been saved!");

    } catch (error) {
        console.error('Error sending game data to backend:', error);
        // Display a network error message
        // alert("Network error. Could not save game data.");
    }
}

// --- IMPORTANT: This is the CORRECT and ONLY showGameCompleteScreen definition ---
async function showGameCompleteScreen() {
    console.log("🎮 showGameCompleteScreen called!");

    const existingScreen = document.getElementById("gameCompleteScreen");
    if (existingScreen) existingScreen.remove();

    gameOverFlag = true;

    let timeTakenMs = Date.now() - levelStartTime;
    let finalScore = score;
    let finalTimeTakenSeconds = Math.floor(timeTakenMs / 1000);

    try {
        await saveLevelData(finalScore, finalTimeTakenSeconds);
        console.log("Game data saved successfully.");
    } catch (error) {
        console.error("Error saving game data:", error);
    }

    const gameCompleteScreen = document.createElement("div");
    gameCompleteScreen.id = "gameCompleteScreen";
    gameCompleteScreen.style.cssText = `
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9); color: white;
        padding: 20px; border-radius: 10px;
        text-align: center; z-index: 1000;
        display: flex; flex-direction: column; align-items: center;
    `;

    let secondsDisplay = finalTimeTakenSeconds % 60;
    let minutesDisplay = Math.floor(finalTimeTakenSeconds / 60);
    let timeTakenFormatted = `${minutesDisplay}m ${secondsDisplay < 10 ? "0" : ""}${secondsDisplay}s`;

    gameCompleteScreen.innerHTML = `
        <h2>🏆 Level Complete!</h2>
        <p>Congratulations! You have finished level 6 🥳.</p>
        <p>✅ Your final score: ${finalScore}</p>
        <p>⏱ Time Taken: ${timeTakenFormatted}</p>
        <button id="restartGame" style="margin-top: 10px; padding: 10px 20px; font-size: 18px; background: blue; color: white; border: none; border-radius: 5px; cursor: pointer;">Restart Game</button>
        <button id="nextLevel" style="margin-top: 10px; padding: 10px 20px; font-size: 18px; background: green; color: white; border: none; border-radius: 5px; cursor: pointer;">Next Level</button>
    `;

    document.body.appendChild(gameCompleteScreen);

    document.getElementById("restartGame").addEventListener("click", () => {
        window.location.href = "lev6.html";
    });

    document.getElementById("nextLevel").addEventListener("click", () => {
        window.location.href = "certificate.html";
    });
}
