import { GameScene } from "./gameScene";
import { Depths } from "./depths";
import { Player } from "./player";

const spawnTime = 2000;
const telegraphTime = 1200;
const radius = 30;

export enum Powerup {
	Turbo,
}

export class PowerupBox {
	telegraph: Phaser.GameObjects.Image;
	startedTelegraph: number;
	image: Phaser.Physics.Matter.Image;
	body: Matter.Body;

	powerup = Powerup.Turbo

	constructor(private scene: GameScene, private source: Phaser.Math.Vector2, private destination: Phaser.Math.Vector2) {
	}

	showTelegraph() {
		this.telegraph = this.scene.add.image((this.source.x + this.destination.x) / 2, (this.source.y + this.destination.y) / 2, 'powerup-telegraph');
		//TODO this.telegraph.blendMode = Phaser.BlendModes.COLOR_BURN;
		this.telegraph.setDepth(Depths.telegraph);
		this.telegraph.alpha = 0.3;

		this.telegraph.angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.BetweenPoints(this.source, this.destination)) - 90;


		this.startedTelegraph = this.scene.time.now;
	}

	public update(time: number, delta: number) {
		if (this.startedTelegraph && this.scene.time.now > this.startedTelegraph + telegraphTime) {
			this.startedTelegraph = undefined;

			this.image = this.scene.matter.add.image(this.source.x, this.source.y, 'box');
			this.image.setCircle(radius, {});
			this.image.setDepth(Depths.normal);

			this.body = <Matter.Body>this.image.body;
			(<any>this.body).powerupBox = this;

			this.body.isSensor = true;
			this.body.frictionAir = 0.08;

			this.image.applyForce(this.destination.clone().subtract(this.source).scale(0.0015));

			this.scene.add.tween({
				targets: this.telegraph,
				alpha: 0,
				duration: 1000,

				onComplete: () => this.telegraph.destroy()
			})
		}
	}
}

export class PowerupManager {
	boxes = new Array<PowerupBox>();
	lastSpawn = 0;

	constructor(private scene: GameScene) {
	}

	public update(time: number, delta: number) {
		if (time > this.lastSpawn + spawnTime) {
			let x = 100 + Math.random() * (1920 - 200);
			let y = 300 + 1080 / 5 * Math.random() + this.scene.cameras.main.scrollY;

			let sourceX = -50;
			if (x > 1920 / 2) {
				sourceX = 1920 + 50;
			}

			let box  =new PowerupBox(this.scene, new Phaser.Math.Vector2(sourceX, y - 100), new Phaser.Math.Vector2(x, y));
			box.showTelegraph();
			this.boxes.push(box);
			
			this.lastSpawn = time;
		}

		this.boxes.forEach(b => b.update(time, delta));

		for (var i = this.boxes.length - 1; i >= 0; i--) {
			if (this.boxes[i].image && this.boxes[i].image.y - this.scene.cameras.main.scrollY > 1500) {
				this.boxes[i].image.destroy();
				this.boxes.splice(i, 1);
			}
		}
	}

	handleCollision(player: Player, powerupBox: PowerupBox) {
		player.grantPowerup(powerupBox.powerup);
		powerupBox.image.destroy();
		this.boxes.splice(this.boxes.indexOf(powerupBox), 1);
	}
}