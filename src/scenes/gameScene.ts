import { Player } from "./player";
import { Hook } from "./hook";
import { HookManager } from "./hookManager";
import { MissileManager, Missile } from "./missileManager";
import { Depths } from "./depths";
import { PowerupManager, PowerupBox } from "./powerupManager";

const wallVisibleWidth = 50;

interface CollisionBody {
	hook?: Hook;
	missile?: Missile;
	player?: Player;
	powerupBox?: PowerupBox;
}

export class GameScene extends Phaser.Scene {
	sideWalls: Phaser.Physics.Matter.Sprite[];
	topWall: Phaser.Physics.Matter.Sprite;
	players: Player[];


	intensity = 0.1;

	hookManager: HookManager;
	missileManager: MissileManager;
	powerUpManager: PowerupManager;

	forcesToApply = new Array<{
		player: Player,
		force: Phaser.Math.Vector2
	}>();
	backgrounds: Phaser.GameObjects.TileSprite[];
	smokeParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
	smokeEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	houseSmokeParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;

	constructor() {
		super({ key: 'game' });
	}

	create() {
		console.log('create game');


		//this.cameras.main.shake(1000);
		//new Phaser.Cameras.Scene2D.Effects.Shake(this.cameras.main).start(1000);

		this.backgrounds = [
			this.add.tileSprite(0, 0, 1920, 1024, 'background').setOrigin(0, 0).setTileScale(0.5, 0.5).setPosition(0, 1024).setDepth(Depths.background),
			this.add.tileSprite(0, 0, 1920, 1024, 'background').setOrigin(0, 0).setTileScale(0.5, 0.5).setDepth(Depths.background),
			this.add.tileSprite(0, 0, 1920, 1024, 'background').setOrigin(0, 0).setTileScale(0.5, 0.5).setPosition(0, -1024).setDepth(Depths.background),
		]

		this.hookManager = new HookManager(this);
		this.missileManager = new MissileManager(this);
		this.powerUpManager = new PowerupManager(this);

		this.sideWalls = [
			<any>this.matter.add.sprite(0, 1080 / 2, '').setRectangle(wallVisibleWidth * 2, 1080 * 3, {}),
			<any>this.matter.add.sprite(1920, 1080 / 2, '').setRectangle(wallVisibleWidth * 2, 1080 * 3, {})
		];
		this.sideWalls.forEach(w => {
			(<any>w.body).friction = 0;
			(<any>w.body).isStatic = true;
		});

		this.topWall = this.matter.add.sprite(1920 / 2, -20, '');
		this.topWall.setRectangle(1920, 40, {});
		let bWall = <Matter.Body>this.topWall.body;
		bWall.isStatic = true;
		bWall.friction = 0;

		this.houseSmokeParticles = this.add.particles('small_smoke');
		this.houseSmokeParticles.setDepth(Depths.smokeOverlay);

		this.players = [
			new Player(this, 0),
			new Player(this, 1),
			new Player(this, 2),
			new Player(this, 3),
		];

		this.matter.world.on('collisionstart', (ev) => this.collisionStart(ev));


		//debug hack thing
		this.matter.add.mouseSpring({});


		/*this.smokeParticles = this.add.particles('smoke');
		this.smokeEmitter = this.smokeParticles.createEmitter({
			scale: { start: 1, end: 2 },
			alpha: { start: 1, end: 0 }
		});
		this.smokeEmitter.setScale(3);
		//this.smokeEmitter.setBlendMode(Phaser.BlendModes.);
		this.smokeEmitter.setFrequency(100);
		this.smokeEmitter.tint.defaultValue = 0xff0000;*/
	}


	update(time: number, delta: number) {
		if (this.input.gamepad.total == 0) {
			return;
		}
		if (time < 20000){
			this.intensity = 0.5 + time / 40000;
		} else if (time < 40000) {
			this.intensity = 1 + (time - 20000) / 40000;
		} else {
			this.intensity = 1.5 + (time - 40000) / 60000;
		}

		this.backgrounds.forEach(b => {
			if (b.y - this.cameras.main.scrollY > 1080) {
				b.setPosition(0, b.y - (1024 * this.backgrounds.length));
			}
		});


		this.moveScene(time, delta);

		this.hookManager.update(time, delta);
		this.missileManager.update(time, delta);
		this.powerUpManager.update(time, delta);

		this.players.forEach(p => {
			p.update(time, delta);

			if (p.hasRepulser()) {
				const maxDist = 300;
				let pp = new Phaser.Math.Vector2(p.image.x, p.image.y)

				this.players.forEach(o => {
					if (o != p) {

						var diff = new Phaser.Math.Vector2(o.image.x, o.image.y).subtract(pp);
						let length = diff.length();
						let pc = 1 - length / maxDist;
						if (pc > 0) {
							diff.normalize();
							diff.scale(pc * pc * 0.03);
							o.image.applyForce(diff);
						}
					}
				})
				
				this.hookManager.hooks.forEach(o => {
					if (o.image) {

						var diff = new Phaser.Math.Vector2(o.image.x, o.image.y).subtract(pp);
						let length = diff.length();
						let pc = 1 - length / maxDist;
						if (pc > 0) {
							diff.normalize();
							diff.scale(pc * pc * 0.03);
							o.image.applyForce(diff);
						}
					}
				})
			}
		});

		/*while (true) {
			var x = Math.random() * 1920;
			var y = Math.random() * 1080 + this.cameras.main.scrollY;

			var diff = new Phaser.Math.Vector2(x - this.players[0].image.x, y - this.players[0].image.y);

			if (diff.length() > 500) {
				//console.log(x, y);
				this.smokeEmitter.setPosition(x, y);
				//this.smokeEmitter
				//this.smokeParticles.emitParticleAt(x, y);
				break;
			}
		}*/



		this.forcesToApply.forEach(f => {
			f.player.image.applyForce(f.force);
		});
		this.forcesToApply.length = 0;

	}

	lastWallUpdate = 0;

	moveScene(time: number, delta: number) {
		const amount = this.intensity * (delta / 1000) * 100;

		this.cameras.main.scrollY -= amount;


		//Periodically move the walls up
		this.lastWallUpdate += delta;
		if (this.lastWallUpdate > 1000) {

			this.sideWalls.forEach(w => w.setPosition(w.x, this.cameras.main.scrollY));

			this.lastWallUpdate = time;
		}

		this.topWall.setPosition(1920 / 2, this.cameras.main.scrollY - 20);

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

			else if (bodyA.player && bodyB.powerupBox) {
				this.powerUpManager.handleCollision(bodyA.player, bodyB.powerupBox);
			}
			else if (bodyA.powerupBox && bodyB.player) {
				this.powerUpManager.handleCollision(bodyB.player, bodyA.powerupBox);
			}
		});
	}
}