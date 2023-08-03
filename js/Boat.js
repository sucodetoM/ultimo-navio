class Boat {
  constructor(x, y, width, height, boatPos, boatAnimation) {
    var options = {
      restitution: 0.8,
      friction: 1.0,
      density: 1.0,
      label: "boat"
    };
    this.animation = boatAnimation;
    this.speed = 0.05;
    this.body = Bodies.rectangle(x, y, width, height, options);
    this.width = width;
    this.height = height;

    this.boatPosition = boatPos;
    this.isBroken = false;

    World.add(world, this.body);
  }
  animate() {
    this.speed += 0.05 % 1.1;
  }
  // Use a função setTimeout() para remover o navio

  // Usando a função remove(), estamos removendo o navio do índice fornecido do mundo.
  remove(index) {   
    this.animation = brokenBoatAnimation
    this.speed = 0.05;
    this.width = 300;
    this.height = 300;
    this.isBroken = true;
//     Como queremos remover o navio lentamente, usamos a função setTimeout,
    setTimeout(() => {
    // a função Matter.World.remove() para remover o navio do mundo e boats.splice para removê-lo da matriz.
     Matter.World.remove(world, boats[index].body);
      // Use boats.splice() para remover os navios do mundo e da matriz
     boats.splice(index, 1)
    }, 2000);
  }

  display() {
    var angle = this.body.angle;
    var pos = this.body.position;
    var index = floor(this.speed % this.animation.length);

    push();
    translate(pos.x, pos.y);
    rotate(angle);
    imageMode(CENTER);
    image(this.animation[index], 0, this.boatPosition, this.width, this.height);
    noTint();
    pop();
  }
}
