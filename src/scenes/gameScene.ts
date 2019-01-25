import { Player } from "./player";
import { Hook } from "./hook";

interface CollisionBody {
	hook?: Hook;
	player?: Player;
}

export class GameScene extends Phaser.Scene {
	sideWalls: Matter.Body[];
	players: Player[];

	hooks = new Array<Hook>();
	
	shadowGroup: Phaser.GameObjects.Group;
	telegraphGroup: Phaser.GameObjects.Group;
	normalGroup: Phaser.GameObjects.Group;

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

		this.shadowGroup = this.add.group();
		this.normalGroup = this.add.group();
		this.telegraphGroup = this.add.group();

		const wallVisibleWidth = 50;
		this.sideWalls = [
			<any>this.matter.add.rectangle(0, 1080 / 2, wallVisibleWidth * 2, 1080 * 1000, {}),
			<any>this.matter.add.rectangle(1920, 1080 / 2, wallVisibleWidth * 2, 1080 * 1000, {})
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
		];

		this.matter.world.on('collisionstart', (ev, bodyA, bodyB) => this.collisionStart(ev, bodyA, bodyB));
	}


	update(time: number, delta: number) {
		if (this.input.gamepad.total == 0) {
			return;
		}

		this.moveScene(time, delta);

		if (this.hooks.length == 0) {
			this.matter.add.mouseSpring({});
			let hook = new Hook(this, new Phaser.Math.Vector2(500, 1080), new Phaser.Math.Vector2(this.players[0].image.x, this.players[1].image.y));
			hook.showTelegraph();
			this.hooks.push(hook);
		}

		this.players.forEach(p => {
			p.update(time, delta);
		});

		this.hooks.forEach(h => h.update(time, delta));
	}

	moveScene(time: number, delta: number) {
		const amount = (delta / 1000) * 100;

		this.cameras.main.scrollY -= amount;

		//this.sideWalls.forEach(w => w. w.position.y -= amount);

	}

	collisionStart(ev: any, bodyA: CollisionBody, bodyB: CollisionBody) {
		console.log('col', ev, bodyA, bodyB);

		if (bodyA.hook && bodyB.player) {
			bodyA.hook.connectToPlayer(bodyB.player);
		}
		if (bodyA.player && bodyB.hook) {
			bodyB.hook.connectToPlayer(bodyA.player);
		}
	}
}