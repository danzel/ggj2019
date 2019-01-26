import { Player } from "./player";
import { Hook } from "./hook";
import { HookManager } from "./hookManager";
import { MissileManager, Missile } from "./missileManager";

const wallVisibleWidth = 50;

interface CollisionBody {
	hook?: Hook;
	missile?: Missile;
	player?: Player;
}

export class GameScene extends Phaser.Scene {
	sideWalls: Matter.Body[];
	players: Player[];


	intensity = 1;

	shadowGroup: Phaser.GameObjects.Group;
	telegraphGroup: Phaser.GameObjects.Group;
	normalGroup: Phaser.GameObjects.Group;
	hookManager: HookManager;
	overlayGroup: Phaser.GameObjects.Group;
	missileManager: MissileManager;

	forcesToApply = new Array<{
		player: Player,
		force: Phaser.Math.Vector2
	}>();
	backgrounds: Phaser.GameObjects.TileSprite[];

	constructor() {
		super({ key: 'game' });
	}

	create() {
		console.log('create game');


		//this.cameras.main.shake(1000);
		//new Phaser.Cameras.Scene2D.Effects.Shake(this.cameras.main).start(1000);
		
		this.backgrounds = [
			this.add.tileSprite(0, 0, 1920, 1024, 'background').setOrigin(0,0).setTileScale(0.5, 0.5).setPosition(0, 1024),
			this.add.tileSprite(0, 0, 1920, 1024, 'background').setOrigin(0,0).setTileScale(0.5, 0.5),
			this.add.tileSprite(0, 0, 1920, 1024, 'background').setOrigin(0,0).setTileScale(0.5, 0.5).setPosition(0, -1024),
		]

		this.shadowGroup = this.add.group();
		this.normalGroup = this.add.group();
		this.telegraphGroup = this.add.group();
		this.overlayGroup = this.add.group();

		this.hookManager = new HookManager(this);
		this.missileManager = new MissileManager(this);

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
		];

		this.matter.world.on('collisionstart', (ev) => this.collisionStart(ev));


		//debug hack thing
		this.matter.add.mouseSpring({});
	}


	update(time: number, delta: number) {
		if (this.input.gamepad.total == 0) {
			return;
		}

		this.backgrounds.forEach(b => {
			if (b.y - this.cameras.main.scrollY > 1080) {
				b.setPosition(0, b.y - (1024 * this.backgrounds.length));
			}
		})


		this.moveScene(time, delta);

		this.hookManager.update(time, delta);
		this.missileManager.update(time, delta);

		this.players.forEach(p => {
			p.update(time, delta);
		});

		

		this.forcesToApply.forEach(f => {
			f.player.image.applyForce(f.force);
		});
		this.forcesToApply.length = 0;

	}

	lastWallUpdate = 0;

	moveScene(time: number, delta: number) {
		const amount = (delta / 1000) * 100;

		this.cameras.main.scrollY -= amount;


		//Periodically move the walls up
		this.lastWallUpdate += delta;
		if (this.lastWallUpdate > 1000) {

			this.sideWalls.forEach(w => this.matter.world.remove(w, false));
			this.sideWalls = [
				<any>this.matter.add.rectangle(0, 1080 / 2 + this.cameras.main.scrollY, wallVisibleWidth * 2, 1080 * 3, {}),
				<any>this.matter.add.rectangle(1920, 1080 / 2 + this.cameras.main.scrollY, wallVisibleWidth * 2, 1080 * 3, {})
			];

			this.lastWallUpdate = time;
		}

	}

	collisionStart(ev: Matter.IEventCollision<Matter.Engine>) {

		ev.pairs.forEach(p => {
			let bodyA = <CollisionBody>p.bodyA;
			let bodyB = <CollisionBody>p.bodyB;

			if (bodyA.hook && bodyB.player) {
				bodyA.hook.connectToPlayer(bodyB.player);
			}
			else if (bodyA.player && bodyB.hook) {
				bodyB.hook.connectToPlayer(bodyA.player);
			}

			else if (bodyA.player && bodyB.missile) {
				this.missileManager.handleCollision(bodyA.player, bodyB.missile);
			}
			else if (bodyA.missile && bodyB.player) {
				this.missileManager.handleCollision(bodyB.player, bodyA.missile);
			}
		});
	}
}