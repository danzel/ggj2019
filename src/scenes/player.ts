import { GameScene } from "./gameScene";
import { Hook } from "./hook";
import { HealthBar } from "./healthBar";
import { Depths } from "./depths";
import { Powerup } from "./powerupManager";

export const chargePrepareTime = 500;
export const chargeCooldown = 500;
export const playerRadius = 50;
export const timeTurboLastsFor = 5000;

export const requiredShakeToBreak = 50;

class JustDown {
	held = false;

	isJustDown(value: boolean) {
		var res = value && !this.held;
		this.held = value;
		return res;
	}
}

export class Player {
	image: Phaser.Physics.Matter.Image;
	body: Matter.Body;
	chargeAngle: Phaser.Math.Vector2;
	preparingToCharge = false;
	haveCharged = false;
	chargeStartTime = 0;

	shakeToBreakAmount = 0;

	chargeTelegraph?: Phaser.GameObjects.Image;

	attachedHooks = new Array<Hook>();
	shakeToBreak: Phaser.GameObjects.Text;

	lastControllerPos: Phaser.Math.Vector2;
	shakeBar: HealthBar;

	missilePress = new JustDown();

	missileCount = 10;
	smokeEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	lastDirectionalPos: Phaser.Math.Vector2;
	tracks: Phaser.GameObjects.Image;

	turboTime = -99999;

	constructor(private scene: GameScene, public padIndex: number) {
		this.tracks = scene.add.image(200 * (1 + padIndex), 100, 'tracks');
		this.tracks.setDepth(Depths.tracks);

		this.image = scene.matter.add.image(350 * (1 + padIndex), 100, 'home_1');
		this.image.setCircle(playerRadius, {});
		this.image.setDepth(Depths.normal);

		this.body = <Matter.Body>this.image.body;
		(<any>this.body).player = this;

		this.body.frictionAir = 0.1;
		this.body.friction = 1;
		this.body.restitution = 1;

		this.shakeToBreak = this.scene.add.text(100, 100, "SHAKE TO BREAK", {
			fontFamily: 'ZCOOL KuaiLe',
			fontSize: '40px',
			color: '#ffffff',
			stroke: '#000000',
			strokeThickness: 2,
			//align:'center'
		});
		this.shakeToBreak.setOrigin(0.5, 2);
		this.shakeToBreak.setDepth(Depths.overlay);
		this.shakeToBreak.setVisible(false);


		this.shakeBar = new HealthBar(this.scene, 0xffffff, 0xff0000);

		this.smokeEmitter = scene.houseSmokeParticles.createEmitter({
			scale: { start: 1, end: 3 },
			alpha: { start: 1, end: 0 },
			speedX: { min: -10, max: 10 },
			angle: { min: 0, max: 360 },
			lifespan: 5000
			//y: 1000
		});
		this.smokeEmitter.setSpeedY(-60);
		//this.smokeEmitter.setSpeedX([-10, 10]);
		this.smokeEmitter.setFrequency(100);
		this.smokeEmitter.setAngle([0, 360]);
	}

	vibrate() {
		var pad = this.scene.input.gamepad.getPad(this.padIndex);
		(<any>pad.vibration).playEffect(pad.vibration.type, { duration: 100, strongMagnitude: 1, weakMagnitude: 1 });

		this.scene.cameras.main.shake(100, 0.02);
	}

	grantPowerup(powerup: Powerup) {
		switch (powerup) {
			case Powerup.Turbo:
				this.turboTime = this.scene.time.now;
				break;
			default:
				throw new Error("Implement powerup");
		}
	}

	update(time: number, delta: number) {
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

		this.image.setAngle(0);

		if (isDirectional) {
			let frame = (Math.floor(Phaser.Math.RadToDeg(controllerAngle.angle()) / 360 * 4 * 8) + 8 + 16) % (4 * 8);
			this.image.setFrame(frame);
			this.tracks.setFrame(frame);
			this.lastDirectionalPos = controllerAngle.clone();
		}

		if (this.attachedHooks.length > 0) {
			this.shakeToBreakAmount += this.lastControllerPos.clone().subtract(controllerAngle).length();

			if (this.shakeToBreakAmount > requiredShakeToBreak) {
				this.shakeToBreakAmount = 0;

				this.attachedHooks.shift().detachFromPlayer();
			}
		} else {
			this.shakeToBreakAmount = 0;
		}
		this.lastControllerPos = controllerAngle.clone();

		//Charging
		if (p.R1) {
			if (!this.preparingToCharge) {
				this.preparingToCharge = true;
				this.chargeStartTime = time;
				this.chargeAngle = controllerAngle.clone();

				this.chargeTelegraph = this.scene.add.image(this.image.x, this.image.y, 'player-charge-telegraph');
				this.chargeTelegraph.setDepth(Depths.telegraph);

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
			let force = controllerAngle.clone().scale(0.012);
			if (time < this.turboTime + timeTurboLastsFor) {
				force.scale(3);
			}
			this.image.applyForce(force);
		}

		if (this.missilePress.isJustDown(p.A) && this.missileCount > 0 && isDirectional) {
			this.missileCount--;

			this.scene.missileManager.fireMissile(this, controllerAngle);
		}

		//Graphics updates
		if (this.chargeTelegraph) {
			this.chargeTelegraph.setPosition(this.image.x, this.image.y);
			if (isDirectional) {
				this.chargeTelegraph.setAngle(Phaser.Math.RadToDeg(controllerAngle.angle()) + 90);
			}
		}

		if (this.lastDirectionalPos) {
			var angle = this.lastDirectionalPos.clone().normalize().scale(10)

			this.smokeEmitter.setPosition(this.image.x - angle.y, this.image.y - 100 + angle.x);
		} else {
			this.smokeEmitter.setPosition(this.image.x, this.image.y - 90);
		}

		this.shakeToBreak.setVisible(this.attachedHooks.length > 0);
		this.shakeToBreak.setPosition(this.image.x, this.image.y);

		this.shakeBar.setVisible(this.attachedHooks.length > 0);
		this.shakeBar.update(this.image.x, this.image.y - 40, this.shakeToBreakAmount / requiredShakeToBreak);

		this.tracks.setPosition(this.image.x, this.image.y + 20);
	}
}
