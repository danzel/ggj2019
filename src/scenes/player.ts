import { GameScene } from "./gameScene";

export const chargePrepareTime = 500;
export const chargeCooldown = 500;
export const playerRadius = 50;

export class Player {
	image: Phaser.Physics.Matter.Image;
	body: Matter.Body;
	chargeAngle: Phaser.Math.Vector2;
	preparingToCharge = false;
	haveCharged = false;
	chargeStartTime = 0;
	gfx: Phaser.GameObjects.Graphics;

	chargeTelegraph?: Phaser.GameObjects.Image;
	
	constructor(private scene: GameScene, private padIndex: number) {
		this.image = scene.matter.add.image(200 * (1 + padIndex), 100, 'todo');
		this.image.setCircle(playerRadius, {});
		scene.normalGroup.add(this.image);

		this.gfx = scene.add.graphics({ x: 100, y: 100 });
		this.gfx.lineStyle(5, 0xff0000, 1.0);
		this.gfx.fillStyle(0x00ff00, 1.0);
		this.gfx.beginPath();
		this.gfx.lineTo(0, 0);
		this.gfx.lineTo(0, 60);
		this.gfx.closePath();
		this.gfx.strokePath();
		
		this.body = <Matter.Body>this.image.body;
		(<any>this.body).player = this;

		this.body.frictionAir = 0.1;
		this.body.friction = 1;
		this.body.restitution = 1;
	}

	update(time: number, delta: number) {
		this.gfx.setPosition(this.image.x, this.image.y);
		let p = this.scene.input.gamepad.getPad(this.padIndex);
		if (!p) {
			return;
		}
		p.setAxisThreshold(0);
		let controllerAngle = new Phaser.Math.Vector2(p.axes[0].getValue(), p.axes[1].getValue());
		let isDirectional = true;
		if (controllerAngle.length() < 0.3) {
			controllerAngle.x = 0;
			controllerAngle.y = 0;
			isDirectional = false;
		}

		if (isDirectional) {
			this.gfx.setAngle(Phaser.Math.RadToDeg(controllerAngle.angle()) - 90);
		}


		if (p.R1) {
			if (!this.preparingToCharge) {
				this.preparingToCharge = true;
				this.chargeStartTime = time;
				this.chargeAngle = controllerAngle.clone();

				this.chargeTelegraph = this.scene.add.image(this.image.x, this.image.y, 'player-charge-telegraph');
				this.chargeTelegraph.alpha = 0.5;
				this.chargeTelegraph.setOrigin(0.5, 1.5);
			}
		}

		if (this.preparingToCharge && !this.haveCharged && time > this.chargeStartTime + chargePrepareTime) {
			this.image.applyForce(controllerAngle.clone().scale(1.1));
			this.haveCharged = true;
			this.chargeTelegraph.destroy();
		}
		if (this.haveCharged && time > this.chargeStartTime + chargePrepareTime + chargeCooldown) {
			this.preparingToCharge = false;
			this.haveCharged = false;
			this.chargeStartTime = 0;
		}
		if (!this.preparingToCharge) {
			this.image.applyForce(controllerAngle.clone().scale(0.02));
		}

		if (this.chargeTelegraph) {
			this.chargeTelegraph.setPosition(this.image.x, this.image.y);
			if (isDirectional) {
				this.chargeTelegraph.setAngle(Phaser.Math.RadToDeg(controllerAngle.angle()) + 90);
			}
		}
	}
}
