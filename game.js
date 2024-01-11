var canvas = document.getElementById("mainScreen");
var context = canvas.getContext("2d");

var angleDividedBy2Pi = 0.0;

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const groundLevel = canvasHeight - (canvasHeight * 0.07);
var fuel = 100;
var statsX = 900;
var statsY = 50;


const changeLandingSurface = document.getElementById("changeLandingSurface");
const landingSurfaceOptions = document.querySelectorAll('input[name="landingSurface"]');

const thrstUpAudio = new Audio("./audio/rocket.mp3");
const crashAudio = new Audio("./audio/crash.mp3")
var thrstUpAudio_isPlaying = false;
var landingRating = 0; // 0 - worst, 5 - best
var leftTouched = false;
var rightTouched = false;


// Define oval properties
const ovalX = 500; // Center the oval horizontally
const ovalY = groundLevel-10; // Position the oval 50px from the bottom
const ovalWidth = 200; // Make the oval as wide as the canvas
const ovalHeight = 150; // Set the oval height

var gravity = 0.001;
// Create an array of stars with random positions and sizes

const moonSurface = new Image();
moonSurface.src = "./img/moonsurface.jpeg"
moonSurface.onload = function() {
    context.drawImage(moonSurface, 0, 0, canvasWidth, canvasHeight);
};
const marsSurface = new Image();
marsSurface.src = "./img/marsSurface.jpg"
marsSurface.onload = function() {
    context.drawImage(marsSurface, 0, 0, canvasWidth, canvasHeight);
};
// LandingSurfaceImages = {
//     Moon: "./img/moonsurface.jpeg",
//     Mars: "./img/marsSurface.jpg"
// }
var currentLandingSurface = marsSurface;

// function drawImage() {
//     var img = new Image();
//     img.src = currentLandingSurface;
//     img.onload = function() {
//       context.drawImage(currentLandingSurface, 0, 0, canvasWidth, canvasHeight);
//     };
//   }



let landerImg = new Image();
landerImg.src = "./img/lander.png";


var spaceship =
{
    img: landerImg,
    color: "white",
    width: 40,
    height: 40,
    position:
    {
        x: 100,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    },
    thrust: 0.01,
    angle: 0,
    thrustUpwards: false,
    thurstDownwards: false,
    rotatingLeft: false,
    rotatingRight: false,
    translateLeft: false,
    translateRight: false,
    grounded: false,
    autoPilot: true
}


// Star object definition
class Star {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.alpha = Math.random(); // Random initial alpha for twinkling
        this.decreasing = Math.random() < 0.5; // Random start for alpha animation
    }
}
const stars = [];
    for (let i = 0; i < 100; i++) {
        // Adjust star count and size range as desired
        stars.push(new Star(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2 + 1)); 
}

const dRatio = 0.01; // Alpha change rate for twinkling


function drawStars() 
{
  context.save();
  context.fillStyle = "#111"
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < stars.length; i++) {
    var star = stars[i];
    context.beginPath();
    context.arc(star.x, star.y, star.radius, 0, 2*Math.PI);
    context.closePath();
    context.fillStyle = "rgba(255, 255, 255, " + star.alpha + ")";
    if (star.decreasing == true)
    {
      star.alpha -=dRatio;
      if (star.alpha < 0.1)
      { star.decreasing = false; }
    }
    else
    {
      star.alpha += dRatio;
      if (star.alpha > 0.95)
      { star.decreasing = true; }
    }
    context.fill();
  }
  context.restore();
}

function drawBackground() {
    context.drawImage(currentLandingSurface, 0, 0, canvasWidth, canvasHeight);

    // Create a gradient object for the shade
    const gradient = context.createRadialGradient(spaceship.position.x, ovalY, spaceship.width * 0.7, spaceship.position.x, ovalY, 120);
    gradient.addColorStop(0.1, "black");
    gradient.addColorStop(0.9, "black");

    context.globalAlpha = (spaceship.position.y/2) * 0.004;
    // Draw the oval shade
    context.beginPath();
    context.ellipse(spaceship.position.x, ovalY, spaceship.width * 0.7, 20,  0, 0, 2 * Math.PI);
    context.fillStyle = gradient;
    context.fill();
    context.closePath();

    context.globalAlpha = 1;
}

function updateStats() {
    context.font = "25px Arial";
    context.fillStyle = "red";
    context.fillText("x: "+String((spaceship.position.x).toFixed(1))+" y: "+String((spaceship.position.y).toFixed(1)), statsX, statsY);
    context.fillText("vx: "+String((spaceship.velocity.x).toFixed(3))+" vy: "+String((spaceship.velocity.y).toFixed(3)), statsX, statsY+30);
    context.fillText("Fuel: "+String(fuel.toFixed(2)), statsX, statsY+60);
    context.fillText("Autopilot: "+String(spaceship.autoPilot), statsX, statsY+90);
 
    angleDividedBy2Pi =  ((spaceship.angle * (180 / Math.PI)) % 360);
    context.fillText("Angle: "+String(angleDividedBy2Pi.toFixed(2)), statsX, statsY+120);

}

function drawSpaceship()
{
    context.save();
    // context.beginPath();
    // context.globalAlpha = 0.2;
    // context.ellipse(spaceship.position.x, spaceship.position.y, spaceship.width * 0.4, 19,  0, 0, 2 * Math.PI);
    // context.fillStyle = "black";
    // context.fill();
    // context.closePath();

    // context.globalAlpha = 1.0;

    context.beginPath();
    context.translate(spaceship.position.x, spaceship.position.y);
    context.rotate(spaceship.angle);
    
    // context.rect(spaceship.width * -0.5, spaceship.height * -0.5, spaceship.width, spaceship.height);
    context.drawImage(spaceship.img, spaceship.width * -0.5, spaceship.height * -0.5, spaceship.width, spaceship.height);
    // context.fillStyle = spaceship.color;
    // context.fill();
    context.closePath();

    

    // Draw the flame if engine is on
    if(spaceship.thrustUpwards)
    {
        context.beginPath();
        context.globalAlpha = 0.9;
        context.moveTo(spaceship.width * -0.2, spaceship.height * 0.35);
        context.lineTo(spaceship.width * 0.2, spaceship.height * 0.35);
        context.lineTo(0, spaceship.height * 0.8 + Math.random() * 5);
        context.lineTo(spaceship.width * -0.2, spaceship.height * 0.35);
        context.fillStyle = "orange";
        context.fill();
        context.closePath();
        

        context.beginPath();
        context.moveTo(spaceship.width * -0.17, spaceship.height * 0.35);
        context.lineTo(spaceship.width * 0.17, spaceship.height * 0.35);
        context.lineTo(0, spaceship.height * 0.4 + Math.random() * 5);
        context.lineTo(spaceship.width * -0.17, spaceship.height * 0.35);
        context.fillStyle = "red";
        context.fill();
        context.closePath();
        
    }
    if(spaceship.thurstDownwards)
    {
        context.beginPath();
        context.globalAlpha = 0.5;
        context.moveTo(spaceship.width * -0.3, spaceship.height * -0.35);
        context.lineTo(spaceship.width * -0.3 + 6, spaceship.height * -0.35);
        context.lineTo(spaceship.width * -0.3 + 3, spaceship.height * -0.9 + Math.random() * 5);
        context.lineTo(spaceship.width * -0.3, spaceship.height * -0.35);
        context.closePath();
        context.fillStyle = "white";
        context.fill();

        context.beginPath();
        context.globalAlpha = 0.5;
        context.moveTo(spaceship.width * 0.3, spaceship.height * -0.35);
        context.lineTo(spaceship.width * 0.3 - 6, spaceship.height * -0.35);
        context.lineTo(spaceship.width * 0.3 - 3, spaceship.height * -0.9 + Math.random() * 5);
        context.lineTo(spaceship.width * 0.3, spaceship.height * -0.35);
        context.closePath();
        context.fillStyle = "white";
        context.fill();
    }

    if (spaceship.rotatingRight) {
        context.beginPath();
        context.globalAlpha = 0.5;
        // context.rect(spaceship.width * -0.5, spaceship.height * -0.5, 10, 10);
        context.moveTo(spaceship.width * -0.3, spaceship.height * 0.3);
        context.lineTo(spaceship.width * -0.3, spaceship.height * -0.3 + 8);
        context.lineTo(spaceship.width * -0.8 + Math.random() * 5, spaceship.height * -0.5 + 8);
        context.lineTo(spaceship.width * -0.3, spaceship.height * -0.3);
        context.closePath();
        context.fillStyle = "white";
        context.fill();
    }
    if (spaceship.rotatingLeft) {
        context.beginPath();
        context.globalAlpha = 0.5;
        // context.rect(spaceship.width * -0.5, spaceship.height * -0.5, 10, 10);
        context.moveTo(spaceship.width * 0.3, spaceship.height * 0.3);
        context.lineTo(spaceship.width * 0.3, spaceship.height * -0.3 + 8);
        context.lineTo(spaceship.width * 0.8 + Math.random() * 5, spaceship.height * -0.5 + 8);
        context.lineTo(spaceship.width * 0.3, spaceship.height * -0.3);
        context.closePath();
        context.fillStyle = "white";
        context.fill();
    }

    if (spaceship.translateRight) {
        context.beginPath();
        context.globalAlpha = 0.5;
        context.moveTo(spaceship.width * -0.3, spaceship.height * 0.3);
        context.lineTo(spaceship.width * -0.3, spaceship.height * -0.3 + 6);
        context.lineTo(spaceship.width * -0.8 + Math.random() * 5, spaceship.height * -0.5 + 10);
        context.lineTo(spaceship.width * -0.3, spaceship.height * -0.3);
        context.closePath();
        context.fillStyle = "white";
        context.fill();

        context.beginPath();
        context.globalAlpha = 0.5;
        context.moveTo(spaceship.width * -0.3, spaceship.height * 0.2);
        context.lineTo(spaceship.width * -0.3, spaceship.height * 0.2 + 6);
        context.lineTo(spaceship.width * -0.8 + Math.random() * 5, spaceship.height * 0.2 +3);
        context.lineTo(spaceship.width * -0.3, spaceship.height * 0.2);
        context.closePath();
        context.fillStyle = "white";
        context.fill();
    }
    if (spaceship.translateLeft) {
        context.beginPath();
        context.globalAlpha = 0.5;
        context.moveTo(spaceship.width * 0.3, spaceship.height * 0.3);
        context.lineTo(spaceship.width * 0.3, spaceship.height * -0.3 + 6);
        context.lineTo(spaceship.width * 0.8 + Math.random() * 5, spaceship.height * -0.5 + 10);
        context.lineTo(spaceship.width * 0.3, spaceship.height * -0.3);
        context.closePath();
        context.fillStyle = "white";
        context.fill();

        context.beginPath();
        context.globalAlpha = 0.5;
        context.moveTo(spaceship.width * 0.3, spaceship.height * 0.2);
        context.lineTo(spaceship.width * 0.3, spaceship.height * 0.2 + 6);
        context.lineTo(spaceship.width * 0.8 + Math.random() * 5, spaceship.height * 0.2 +3);
        context.lineTo(spaceship.width * 0.3, spaceship.height * 0.2);
        context.closePath();
        context.fillStyle = "white";
        context.fill();
    }
    context.restore();

    context.globalAlpha = 1.0;
}

function updateSpaceship()
{
    // autopilot
   if (spaceship.autoPilot === true) {
    angleDividedBy2Pi =  ((spaceship.angle * (180 / Math.PI)) % 360);
    if (spaceship.velocity.x > 0.5) {  // handle motion towards left
        spaceship.translateLeft = true;
    } else {
        spaceship.translateLeft = false;
    }
    if (spaceship.velocity.x < -0.5) {  // handle motion towards right
        spaceship.translateRight = true;
    } else {
        spaceship.translateRight = false;
    }
    if (spaceship.velocity.y > 0.4) {  // handle motion towards down
        spaceship.thrustUpwards = true;
    } else {
        spaceship.thrustUpwards = false;
    }
    if (spaceship.velocity.y < 0) { // handle motion towards up
        spaceship.thurstDownwards = true;
    } else {
        spaceship.thurstDownwards = false;
    }
    if (angleDividedBy2Pi > 3) { // handle left rotation
        spaceship.rotatingLeft = true;
        spaceship.rotatingRight = false;
    } else if (angleDividedBy2Pi < -3) { // handle right rotation
        spaceship.rotatingRight = true;
        spaceship.rotatingLeft = false;
    } else  {  // disable autorotation
        spaceship.rotatingLeft = false;
        spaceship.rotatingRight = false;
    }
   }

    
    spaceship.position.x += spaceship.velocity.x;
    spaceship.position.y += spaceship.velocity.y;
    
    if (spaceship.rotatingRight) {
        fuel -= 0.005;
        spaceship.angle += 0.7 * Math.PI / 180;
    } else if(spaceship.rotatingLeft) {
        fuel -= 0.005;
        spaceship.angle -= 0.7 * Math.PI / 180;
    }
    

    if (spaceship.thrustUpwards) {
        fuel -= 0.05;
        if (thrstUpAudio_isPlaying === false) {
            thrstUpAudio.currentTime = 0;
            thrstUpAudio.play();
            thrstUpAudio_isPlaying = true;
        }
        spaceship.velocity.x -= (spaceship.thrust * Math.sin(-spaceship.angle));
        spaceship.velocity.y -= (spaceship.thrust * Math.cos(spaceship.angle));
    } else {
        if (thrstUpAudio_isPlaying === true) {
            thrstUpAudio.pause();
            thrstUpAudio.currentTime = 0;
            thrstUpAudio_isPlaying = false;
        }
    }

    if (spaceship.thurstDownwards && spaceship.grounded === false) {
        fuel -= 0.01;
        spaceship.velocity.x -= (spaceship.thrust * Math.sin(-spaceship.angle));
        spaceship.velocity.y += (spaceship.thrust * Math.cos(spaceship.angle));
    }

    if (spaceship.translateLeft) {
        fuel -= 0.01;
        spaceship.velocity.x -= (spaceship.thrust * Math.cos(-spaceship.angle));
        spaceship.velocity.y += (spaceship.thrust * Math.sin(spaceship.angle));
    }

    if (spaceship.translateRight) {
        fuel -= 0.01;
        spaceship.velocity.x += (spaceship.thrust * Math.cos(-spaceship.angle));
        spaceship.velocity.y += (spaceship.thrust * Math.sin(spaceship.angle));
    }

    if (spaceship.grounded == false) {
        spaceship.velocity.y += gravity;
    }
}

function checkBounds() {
    if (spaceship.position.y + spaceship.height < groundLevel) {
        spaceship.grounded = false;
    } 

  if (spaceship.position.x <= 0) {
    spaceship.position.x = 0;
  } else if (spaceship.position.x + spaceship.width >= canvasWidth) {
    spaceship.position.x = canvasWidth - spaceship.width;
  }


  if (spaceship.position.y <= 0) {
    spaceship.position.y = 0;
  }
  else if (spaceship.position.y + spaceship.height >= groundLevel) {
    spaceship.position.y = groundLevel - spaceship.height;
    if (spaceship.velocity.x > 0.5 || spaceship.velocity.y > 0.4) {
        crashAudio.play();
    }
    if (spaceship.grounded === false) {
        spaceship.grounded = true;
        spaceship.velocity.x = 0;
        spaceship.velocity.y = 0;
    }
  }
}

function draw()
{
    
    // Clear entire screen
    context.clearRect(0, 0, canvas.width, canvas.height);
    

    drawBackground();
    // drawStars();
    updateSpaceship();
    checkBounds();
    updateStats();

    // Begin drawing
    drawSpaceship();
    /* other draw methods (to add later) */

    requestAnimationFrame(draw);
}

function keyReleased(event)
{
    switch(event.keyCode)
    {
        case 37:
        case 65:
            // Left Arrow key
            spaceship.rotatingLeft = false;
            break;
        case 39:
        case 68:
            // Right Arrow key
            spaceship.rotatingRight = false;
            break;
        case 38:
        case 87:
            // Up Arrow key
            spaceship.thrustUpwards = false;
            break;
        case 72:
        case 83: // Down Arrow key
            spaceship.thurstDownwards = false;
            break;
        case 81:
            spaceship.translateLeft = false;
            break;
        case 69:
            spaceship.translateRight = false;
            break;
    }
}

document.addEventListener('keyup', keyReleased);

function keyPressed(event)
{
    switch(event.keyCode)
    {
        case 37:
        case 65: // Left Arrow key
            spaceship.rotatingLeft = true;
            break;
        case 39:
        case 68: // Right Arrow key
            spaceship.rotatingRight = true;
            break;
        case 38:
        case 87: // Up Arrow key
            spaceship.thrustUpwards = true;
            break;
        case 72:
        case 83: // Down Arrow key
            spaceship.thurstDownwards = true;
            break;
        case 81:
            spaceship.translateLeft = true;
            break;
        case 69:
            spaceship.translateRight = true;
            break;
        case 84: // Autopilot toggle
            spaceship.autoPilot = (spaceship.autoPilot === true) ? false : true;
            break;
        case 82: // Reset
            spaceship.position.x = 100;
            spaceship.position.y = 100;
            spaceship.velocity.x = 0;
            spaceship.velocity.y = 0;
            fuel = 100;
            break;
    }
}

document.addEventListener('keydown', keyPressed);

canvas.addEventListener("mousedown", function(event) {
    if (event.button === 0 && event.clientX < canvas.width / 2) {
      // Left side clicked
      spaceship.rotatingLeft = true;
    } else if (event.button === 0 && event.clientX > canvas.width / 2) {
      // Right side clicked
      spaceship.rotatingRight = true;
    }
  });

  canvas.addEventListener("mouseup", function(event) {
    if (event.button === 0 && event.clientX < canvas.width / 2) {
      // Left side clicked
      spaceship.rotatingLeft = false;
    } else if (event.button === 0 && event.clientX > canvas.width / 2) {
      // Right side clicked
      spaceship.rotatingRight = false;
    }
  });

//   canvas.addEventListener("touchstart", function(event) {
//     if (event.touches[0].clientX < canvas.width / 2) {
//       // Left side touched
//       spaceship.rotatingLeft = true;
//     } else if (event.touches[0].clientX > canvas.width / 2) {
//       // Right side touched
//       spaceship.rotatingRight = true;
//     }
//   });

//   canvas.addEventListener("touchend", function(event) {
//     if (event.touches[0].clientX < canvas.width / 2) {
//       // Left side touched
//       spaceship.rotatingLeft = false;
//     } else if (event.touches[0].clientX > canvas.width / 2) {
//       // Right side touched
//       spaceship.rotatingRight = falses;
//     }
//   });
  
  

// document.querySelectorAll('input[name="landingSurface"]').forEach((elem) => {
//     elem.addEventListener("change", function(event) {
//         if (event.target.value === "Moon") {
//             currentLandingSurface = moonSurface;
//         }
//         if (event.target.value === "Mars") {
//             currentLandingSurface = marsSurface;
//         }
//     //   currentLandingSurface = LandingSurfaceImages[event.target.value];
//     //   drawImage();
//     });
//   });

  changeLandingSurface.addEventListener("click", function() {
    // Add your action here
    var landingSurfaceSelected;
    for (const landingSurfaceOption of landingSurfaceOptions) {
        if (landingSurfaceOption.checked) {
            landingSurfaceSelected = landingSurfaceOption.value;
            break;
        }
    }
    console.log(landingSurfaceSelected)
    if (landingSurfaceSelected === "Moon") {
        currentLandingSurface = moonSurface;
    }
    else if (landingSurfaceSelected === "Mars") {
        currentLandingSurface = marsSurface;
    }
  });

  autoPilotToggle.addEventListener("click", () => {
    spaceship.autoPilot = (spaceship.autoPilot === true) ? false : true;
  });

  canvas.addEventListener("touchstart", function(event) {
    // event.preventDefault();
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      if (touch.clientX < canvas.width / 2) {
        leftTouched = true;
      } else {
        rightTouched = true;
      }
    }
    touchActionTrigger();
  });
  
  canvas.addEventListener("touchmove", function(event) {
    // event.preventDefault();
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      if (touch.clientX < canvas.width / 2) {
        leftTouched = true;
        rightTouched = false;
      } else {
        leftTouched = false;
        rightTouched = true;
      }
    }
    touchActionTrigger();
  });
  
  canvas.addEventListener("touchend", function(event) {
    // event.preventDefault();
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      if (touch.clientX < canvas.width / 2) {
        leftTouched = false;
      } else {
        rightTouched = false;
      }
    }
    touchActionTrigger();
  });
  
  function touchActionTrigger() {
    if (leftTouched && rightTouched) {
      spaceship.thrustUpwards = true;
    } else if (leftTouched) {
      spaceship.rotatingLeft = true;
      spaceship.rotatingRight = false;
      spaceship.thrustUpwards = false;
    } else if (rightTouched) {
      spaceship.rotatingRight = true;
      spaceship.rotatingLeft = false;
      spaceship.thrustUpwards = false;
    } else {
      spaceship.rotatingLeft = false;
      spaceship.rotatingRight = false;
      spaceship.thrustUpwards = false;
    }
  }

draw();