import { GameScene } from "./gameScene";
import { Player, playerRadius } from "./player";

const telegraphTime = 1000;

const radius = 50;

export class Hook {
	telegraph: Phaser.GameObjects.Image;
	startedTelegraph?: number;
	image: Phaser.Physics.Matter.Image;
	body: import("c:/Users/danzel/Desktop/Code/ggj2019/matter").Body;


	constructor(private scene: GameScene, private source: Phaser.Math.Vector2, private destination: Phaser.Math.Vector2) {
	}

	showTelegraph() {
		this.telegraph = this.scene.add.image((this.source.x + this.destination.x) / 2, (this.source.y + this.destination.y) / 2, 'hook-telegraph');
		//TODO this.telegraph.blendMode = Phaser.BlendModes.COLOR_BURN;
		this.scene.telegraphGroup.add(this.telegraph);
		this.telegraph.alpha = 0.2;

		this.telegraph.angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.BetweenPoints(this.source, this.destination)) - 90;


		this.startedTelegraph = this.scene.time.now;
	}


	update(time: number, delta: number) {
		if (this.startedTelegraph && this.scene.time.now > this.startedTelegraph + telegraphTime) {
			this.startedTelegraph = undefined;

			this.image = this.scene.matter.add.image(this.source.x, this.source.y, 'hook');
			this.image.setCircle(radius, {});
			this.scene.normalGroup.add(this.image);

			this.body = <Matter.Body>this.image.body;
			(<any>this.body).hook = this;

			//this.body.isSensor = true;
			this.body.frictionAir = 0.05;

			this.image.applyForce(this.destination.clone().subtract(this.source).scale(0.0015));

			this.scene.add.tween({
				targets: this.telegraph,
				alpha: 0,
				duration: 1000,

				onComplete: () => this.telegraph.destroy()
			})
		}
	}

	connectToPlayer(player: Player) {
		var distance = Phaser.Math.Distance.Between(this.image.x, this.image.y, this.source.x, this.source.y);

		const defaultPieceLength = 50;
		const ropeWidth = 20;
		const pieceCount = Math.floor(distance / defaultPieceLength);
		const pieceLength = distance / pieceCount;

		const pieceLengthWithOverlap = pieceLength + 20;

		let angleVector = new Phaser.Math.Vector2(this.image.x, this.image.y).subtract(this.source).normalize();
		let halfLengthVector = angleVector.clone().scale(pieceLength / 2);
		let lengthVector = angleVector.clone().scale(pieceLength);

		let angle = Phaser.Math.RadToDeg(angleVector.angle()) - 90;

		let chainGroup = this.scene.matter.world.nextGroup(true);

		//https://labs.phaser.io/edit.html?src=src\physics\matterjs\bridge.js

		//initial anchor
		var previous = <Matter.Body>this.scene.matter.add.rectangle(this.source.x, this.source.y, 10, 10, {});
		previous.isStatic = true;

		let connectPoint = angleVector.clone().scale(pieceLength / 2);
		let playerConnectPoint = angleVector.clone().scale(playerRadius);

		var start = this.source.clone();
		for (var i = 0; i < pieceCount; i++) {
			let center = start.clone().add(halfLengthVector);

			let rope = this.scene.matter.add.image(center.x, center.y, 'rope');

			rope.setRectangle(ropeWidth, pieceLengthWithOverlap, {
				chamfer: 5,
				collisionFilter: { group: chainGroup } //don't collide with each other
			});
			let body = <Matter.Body>rope.body;
			rope.angle = angle;

			//Connect them to each other (and the anchor)
			this.scene.matter.add.constraint(previous, rope, 0, 0.5, {
				pointA: { x: connectPoint.x, y: connectPoint.y },
				pointB: { x: -connectPoint.x, y: -connectPoint.y }
			});


			start = start.add(lengthVector);
			previous = body;
		}


		//Connect them to the player
		this.scene.matter.add.constraint(previous, player.body, 0, 0.5, {
			pointA: { x: connectPoint.x, y: connectPoint.y },
			pointB: { x: -playerConnectPoint.x, y: -playerConnectPoint.y }
		});


		//destroy the hook
		this.image.destroy();
	}
}