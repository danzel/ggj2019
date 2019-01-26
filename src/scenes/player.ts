import { GameScene } from "./gameScene";
import { Hook } from "./hook";
import { HealthBar } from "./healthBar";

export const chargePrepareTime = 500;
export const chargeCooldown = 500;
export const playerRadius = 50;

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
	gfx: Phaser.GameObjects.Graphics;

	shakeToBreakAmount = 0;

	chargeTelegraph?: Phaser.GameObjects.Image;

	attachedHooks = new Array<Hook>();
	shakeToBreak: Phaser.GameObjects.Text;

	lastControllerPos: Phaser.Math.Vector2;
	shakeBar: HealthBar;

	missilePress = new JustDown();

	missileCount = 1000;
	
	constructor(private scene: GameScene, public padIndex: number) {
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

		this.shakeToBreak = this.scene.add.text(100, 100, "SHAKE TO BREAK", {
			fontFamily: 'ZCOOL KuaiLe',
			fontSize: '40px',
			color: '#ffffff',
			stroke: '#000000',
			strokeThickness: 2,
			//align:'center'
		});
		this.shakeToBreak.setOrigin(0.5, 2);
		this.scene.overlayGroup.add(this.shakeToBreak);
		this.shakeToBreak.setVisible(false);


		this.shakeBar = new HealthBar(this.scene, 0xffffff, 0xff0000);
	}

	vibrate() {
		var pad = this.scene.input.gamepad.getPad(this.padIndex);
		(<any>pad.vibration).playEffect(pad.vibration.type, { duration: 100, strongMagnitude: 1, weakMagnitude: 1});
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


		if (this.attachedHooks.length > 0) {
			this.shakeToBreakAmount += Math.abs(this.lastControllerPos.x - controllerAngle.x);
			
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

		this.shakeToBreak.setVisible(this.attachedHooks.length > 0);
		this.shakeToBreak.setPosition(this.image.x, this.image.y);
		
		this.shakeBar.setVisible(this.attachedHooks.length > 0);
		this.shakeBar.update(this.image.x, this.image.y - 40, this.shakeToBreakAmount / requiredShakeToBreak);
	}
}
