import { GameScene } from "./gameScene";
import { Player, playerRadius } from "./player";
import { Depths } from "./depths";

const telegraphTime = 1300;

const radius = 30;

export class Hook {
	telegraph: Phaser.GameObjects.Image;
	startedTelegraph?: number;
	image: Phaser.Physics.Matter.Image;
	body: import("c:/Users/danzel/Desktop/Code/ggj2019/matter").Body;
	constraintToPlayer: MatterJS.Constraint;

	lastRope: Phaser.Physics.Matter.Image;
	ropePieces = new Array<Phaser.Physics.Matter.Image>();

	constructor(private scene: GameScene, private source: Phaser.Math.Vector2, private destination: Phaser.Math.Vector2) {
	}

	showTelegraph() {
		this.telegraph = this.scene.add.image((this.source.x + this.destination.x) / 2, (this.source.y + this.destination.y) / 2, 'hook-telegraph');
		//TODO this.telegraph.blendMode = Phaser.BlendModes.COLOR_BURN;
		this.telegraph.setDepth(Depths.telegraph);
		this.telegraph.alpha = 0.2;

		this.telegraph.angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.BetweenPoints(this.source, this.destination)) - 90;


		this.startedTelegraph = this.scene.time.now;
	}


	update(time: number, delta: number) {
		if (this.startedTelegraph && this.scene.time.now > this.startedTelegraph + telegraphTime) {
			this.startedTelegraph = undefined;

			this.image = this.scene.matter.add.image(this.source.x, this.source.y, 'harpoon');
			let frame = (Math.round((this.telegraph.angle + 270) / 360 * 4 * 8) + 8 + 16) % (4 * 8);
			this.image.setFrame(frame);


			this.image.setCircle(radius, {});
			this.image.setDepth(Depths.normal);

			this.body = <Matter.Body>this.image.body;
			(<any>this.body).hook = this;

			this.body.isSensor = true;
			this.body.frictionAir = 0.08;

			this.image.applyForce(this.destination.clone().subtract(this.source).scale(0.0025 / 5 + this.scene.intensity * 0.0003));

			this.scene.add.tween({
				targets: this.telegraph,
				alpha: 0,
				duration: 1000,

				onComplete: () => this.telegraph.destroy()
			})
		}

	}

	connectToPlayer(player: Player) {
		player.attachedHooks.push(this);
		player.vibrate();

		const velocity = new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y).length();
		if (!player.isDead) {
			this.scene.forcesToApply.push({
				force: new Phaser.Math.Vector2(0, -1).scale(velocity / 30),
				player
			});
		}

		this.source.y += 1000;

		var distance = Phaser.Math.Distance.Between(this.image.x, this.image.y, this.source.x, this.source.y);

		const defaultPieceLength = 50;
		const ropeWidth = 4;
		const pieceCount = Math.floor(distance / defaultPieceLength);// * 1.4;
		const pieceLength = distance / pieceCount;

		const pieceLengthWithOverlap = pieceLength + 20;

		let angleVector = new Phaser.Math.Vector2(this.image.x, this.image.y).subtract(this.source).normalize();
		let halfLengthVector = angleVector.clone().scale(pieceLength / 2);
		let lengthVector = angleVector.clone().scale(pieceLength);

		let angle = Phaser.Math.RadToDeg(angleVector.angle()) - 90;

		let chainGroup = this.scene.matter.world.nextGroup(true);

		//https://labs.phaser.io/edit.html?src=src\physics\matterjs\bridge.js

		//initial anchor
		var previous = <Matter.Body>this.scene.matter.add.circle(this.source.x, this.source.y, 50, {}, undefined);
		previous.frictionAir = 0.08;
		//previous.isStatic = true;

		let connectPoint = angleVector.clone().scale(pieceLength / 2);
		let playerConnectPoint = angleVector.clone().scale(playerRadius);

		var start = this.source.clone();
		for (var i = 0; i < pieceCount; i++) {
			let center = start.clone().add(halfLengthVector);

			let rope = this.scene.matter.add.image(center.x, center.y, 'rope');
			rope.setDepth(Depths.normal);

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

			this.ropePieces.push(rope);
			this.lastRope = rope;
		}

		
		//Connect them to the player
		this.constraintToPlayer = this.scene.matter.add.constraint(previous, player.body, 0, 0.5, {
			pointA: { x: connectPoint.x, y: connectPoint.y },
			pointB: { x: -playerConnectPoint.x, y: -playerConnectPoint.y }
		});

		//TODO: Push the player away from the hook


		//destroy the hook
		this.image.destroy();
		this.image = undefined;
	}

	detachFromPlayer() {
		this.scene.matter.world.removeConstraint(this.constraintToPlayer, false);
	}

	isExpired(): boolean {
		if (this.image) {
			return (this.image.y - this.scene.cameras.main.scrollY) > 1500;
		}

		if (this.lastRope) {
			return (this.lastRope.y - this.scene.cameras.main.scrollY) > 1500;
		}
	}

	destroy() {
		if (this.image) {
			this.image.destroy();
		}

		this.ropePieces.forEach(r => r.destroy());
		this.ropePieces.length = 0;
	}
}