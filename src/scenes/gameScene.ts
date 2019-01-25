const chargePrepareTime = 500;
const chargeCooldown = 500;

class Player {
	image: Phaser.Physics.Matter.Image;
	body: Matter.Body;

	chargeAngle: Phaser.Math.Vector2;
	preparingToCharge = false;
	haveCharged = false;
	chargeStartTime = 0;
	gfx: Phaser.GameObjects.Graphics;

	constructor(private scene: Phaser.Scene, private padIndex: number) {
		this.image = scene.matter.add.image(200 * (1 + padIndex), 100, 'todo');
		this.image.setCircle(50, {});

		this.gfx = scene.add.graphics({ x: 100, y: 100 });
		this.gfx.lineStyle(5, 0xff0000, 1.0);
		this.gfx.fillStyle(0x00ff00, 1.0);
		this.gfx.beginPath();
		this.gfx.lineTo(0, 0);
		this.gfx.lineTo(0, 60);
		this.gfx.closePath();
		this.gfx.strokePath();

		this.body = <Matter.Body>this.image.body;
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

		p.setAxisThreshold(0.3);
		let controllerAngle = new Phaser.Math.Vector2(
			p.axes[0].getValue(),
			p.axes[1].getValue()
		);
		this.gfx.setAngle(Phaser.Math.RadToDeg(controllerAngle.angle()) - 90);


		if (p.R1) {

			if (!this.preparingToCharge) {
				this.preparingToCharge = true;
				this.chargeStartTime = time;

				this.chargeAngle = controllerAngle.clone();
			}
		}

		if (this.preparingToCharge && !this.haveCharged && time > this.chargeStartTime + chargePrepareTime) {
			this.image.applyForce(controllerAngle.clone().scale(1.1));

			this.haveCharged = true;
		}

		if (this.haveCharged && time > this.chargeStartTime + chargePrepareTime + chargeCooldown) {
			this.preparingToCharge = false;
			this.haveCharged = false;
			this.chargeStartTime = 0;
		}

		//console.log(p.axes[0].getValue(), p.axes[1].getValue());
		if (!this.preparingToCharge) {
			this.image.applyForce(controllerAngle.clone().scale(0.02));
		}
	}
}

export class GameScene extends Phaser.Scene {
	sideWalls: Matter.Body[];
	players: Player[];

	constructor() {
		super({ key: 'game' });
	}


	create() {
		console.log('create game');
		/*
		this.add.sprite(300, 200, 'phaser');

		this.add.text(100, 100, "test2", {
			fontFamily: 'ZCOOL KuaiLe',
			fontSize: '40px',
			color: '#ff0000'
		});*/

		//this.cameras.main.shake(1000);
		//new Phaser.Cameras.Scene2D.Effects.Shake(this.cameras.main).start(1000);

		const wallVisibleWidth = 50;
		this.sideWalls = [
			<any>this.matter.add.rectangle(0, 1080 / 2, wallVisibleWidth * 2, 1080 * 3, {}),
			<any>this.matter.add.rectangle(1920, 1080 / 2, wallVisibleWidth * 2, 1080 * 3, {})
		];
		this.sideWalls.forEach(w => {
			w.friction = 0;
			w.isStatic = true;
		});

		this.players = [
			new Player(this, 0),
			new Player(this, 1),
			new Player(this, 2),
			new Player(this, 3),
		]
	}


	update(time: number, delta: number) {
		if (this.input.gamepad.total == 0) {
			return;
		}

		this.players.forEach(p => {
			p.update(time, delta);
		})

	}
}