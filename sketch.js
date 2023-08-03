const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;
var engine,
  world,
  backgroundImg,
  waterSound,
  pirateLaughSound,
  backgroundMusic,
  cannonExplosion;
var canvas, angle, tower, ground, cannon, boat;
var balls = [];
var boats = [];
var score = 0;
var boatAnimation = [];
var boatSpritedata, boatSpritesheet;

var brokenBoatAnimation = [];
var brokenBoatSpritedata, brokenBoatSpritesheet;

var waterSplashAnimation = [];
var waterSplashSpritedata, waterSplashSpritesheet;
// vamos escrever uma função gameOver() que mostrará um pop-up com a imagem do navio e um botão de reiniciar.

var isGameOver = false;
var isLaughing = false;

function preload() {
  backgroundImg = loadImage("./assets/background.gif");
  waterSound = loadSound("./assets/cannon_water.mp3");
  // Adicione o som de fundo e o som da risada do pirata sempre que o navio tocar na torre.
  backgroundMusic = loadSound("./assets/background_music.mp3");
  pirateLaughSound = loadSound("./assets/pirate_laugh.mp3");
  // Carregue o som dentro da função preload 
  cannonExplosion = loadSound("./assets/cannon_explosion.mp3");
  towerImage = loadImage("./assets/tower.png");
  boatSpritedata = loadJSON("assets/boat/boat.json");
  boatSpritesheet = loadImage("assets/boat/boat.png");
  brokenBoatSpritedata = loadJSON("assets/boat/broken_boat.json");
  brokenBoatSpritesheet = loadImage("assets/boat/broken_boat.png");
  waterSplashSpritedata = loadJSON("assets/water_splash/water_splash.json");
  waterSplashSpritesheet = loadImage("assets/water_splash/water_splash.png");
}

function setup() {
  canvas = createCanvas(1200,600);
  engine = Engine.create();
  world = engine.world;
  angle = -PI / 4;
  ground = new Ground(0, height - 1, width * 2, 1);
  tower = new Tower(150, 350, 160, 310);
  cannon = new Cannon(180, 110, 130, 100, angle);

  var boatFrames = boatSpritedata.frames;
  for (var i = 0; i < boatFrames.length; i++) {
    var pos = boatFrames[i].position;
    var img = boatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }

  var brokenBoatFrames = brokenBoatSpritedata.frames;
  for (var i = 0; i < brokenBoatFrames.length; i++) {
    var pos = brokenBoatFrames[i].position;
    var img = brokenBoatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    brokenBoatAnimation.push(img);
  }

  var waterSplashFrames = waterSplashSpritedata.frames;
  for (var i = 0; i < waterSplashFrames.length; i++) {
    var pos = waterSplashFrames[i].position;
    var img = waterSplashSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    waterSplashAnimation.push(img);
  }
}

function draw() {
  background(189);
  image(backgroundImg, 0, 0, width, height);

  if (!backgroundMusic.isPlaying()) {
    // Adicione o som de fundo e o som da risada do pirata sempre que o navio tocar na torre.
    backgroundMusic.play();
    backgroundMusic.setVolume(0.1);
  }

  Engine.update(engine);
  ground.display();

  showBoats();

  for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    // Adicione loops para obter todos os navios e balas de canhão
    for (var j = 0; j < boats.length; j++) {
      // precisamos pegar todas as balas e os navios da matriz.
      if (balls[i] !== undefined && boats[j] !== undefined) {
//         a Matter.SAT.collides(). Matter.SAT é um módulo que trabalha com um teorema do eixo de separação
// para detectar colisão. O Teorema do Eixo de Separação (Separating AxisTheorem - SAT) afirma que se você pode
// desenhar uma linha para separar dois polígonos, eles não irão colidir.
        var collision = Matter.SAT.collides(balls[i].body, boats[j].body);
        if (collision.collided) {
          if (!boats[j].isBroken && !balls[i].isSink) {
          //  aumentar a pontuação quando a bala de canhão atingir o barco e, exibir a pontuação
            score += 5;
            boats[j].remove(j);
            j--;
          }

          Matter.World.remove(world, balls[i].body);
          balls.splice(i, 1);
          i--;
        }
      }
    }
  }

  cannon.display();
  tower.display();

  fill("#6d4c41");
  textSize(40);
  // Exiba a pontuação usando uma função de texto
 text("Score: "+score, width - 200, 50);
  textAlign(CENTER, CENTER);
}

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
  }
}

function showCannonBalls(ball, index) {
  ball.display();
  ball.animate();
  if (ball.body.position.x >= width || ball.body.position.y >= height - 50) {
    if (!ball.isSink) {
      waterSound.play();
      ball.remove(index);
    }
  }
}

function showBoats() {  
  if (boats.length > 0) {
    if (
      boats.length < 4 &&
      boats[boats.length - 1].body.position.x < width - 300
    ) {
      var positions = [-40, -60, -70, -20];
      var position = random(positions);
      var boat = new Boat(
        width,
        height - 100,
        170,
        170,
        position,
        boatAnimation
      );
      boats.push(boat);
    }

    for (var i = 0; i < boats.length; i++) {
      Matter.Body.setVelocity(boats[i].body, {
        x: -0.9,
        y: 0
      });

      boats[i].display();
      boats[i].animate();
      var collision = Matter.SAT.collides(tower.body, boats[i].body);
      if (collision.collided && !boats[i].isBroken) {
//          o som da risada do pirata toque apenas uma vez, pois a condição de colisão se
// tornará verdadeira e o som continuará tocando no loop, o que pode se tornar um pouco irritante.
         if(!isLaughing && !pirateLaughSound.isPlaying()){
         pirateLaughSound.play();
          isLaughing = true
        }
        isGameOver = true;
        gameOver();
      }
    }
  } else {
    var boat = new Boat(width, height - 60, 170, 170, -60, boatAnimation);
    boats.push(boat);
  }
}

function keyReleased() {
  if (keyCode === DOWN_ARROW && !isGameOver) {
    // Adicione o som da explosão
    cannonExplosion.play();
    balls[balls.length - 1].shoot();
  }
}

function gameOver() {
//   A função swal() recebe a entrada do usuário. Se o usuário clicar em SIM, o valor de retorno será
// true (verdadeiro).
  swal(
    {
      title: `Game Over!!!`,
      text: "Thanks for playing!!",
      imageUrl:
        "https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png",
      imageSize: "150x150",
      confirmButtonText: "Play Again"
    },
    
//     a função isConfirm confirma e recarrega o jogo.
// O método reload() é usado para recarregar o jogo atual.
    function(isConfirm) {
      if (isConfirm) {
        location.reload();
      }
    }
  );
}
