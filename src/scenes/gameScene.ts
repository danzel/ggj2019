import { Player } from "./player";
import { Hook } from "./hook";
import { HookManager } from "./hookManager";
import { MissileManager, Missile } from "./missileManager";
import { Depths } from "./depths";
import { PowerupManager, PowerupBox } from "./powerupManager";
import { Boss } from "./boss";

const wallVisibleWidth = 50;

interface CollisionBody {
	deathWall?: boolean;
	hook?: Hook;
	missile?: Missile;
	player?: Player;
	powerupBox?: PowerupBox;
}

interface ThingToMove {
	go: Phaser.GameObjects.Sprite;
	x: number;
	y: number;
}

export class GameScene extends Phaser.Scene {
	sideWalls: Phaser.Physics.Matter.Sprite[];
	topWall: Phaser.Physics.Matter.Sprite;
	deathWall: Phaser.Physics.Matter.Sprite;
	players: Player[];


	intensity: number;

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

	startTime: number;
	timerText: Phaser.GameObjects.Text;

	gameIsOver: boolean;

	keepOnScreenThings: Array<ThingToMove>;
	boss: Boss;

	staticShapeParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
	dirtParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
	overParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;

	playerDirtEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	boxDirtEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	hookDirtEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	winningPlayerImage: Phaser.GameObjects.Image;
	hookHitEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	winningPlayerTracksImage: Phaser.GameObjects.Image;

	constructor() {
		super({ key: 'game' });
	}

	create() {
		console.log('create game');

		this.intensity = 0;
		this.gameIsOver = false;
		this.keepOnScreenThings = new Array<ThingToMove>();


		this.forcesToApply.length = 0;

		//this.cameras.main.shake(1000);
		//new Phaser.Cameras.Scene2D.Effects.Shake(this.cameras.main).start(1000);

		this.backgrounds = [
			this.add.tileSprite(0, 0, 1920, 1024, 'background').setOrigin(0, 0).setTileScale(0.5, 0.5).setPosition(0, 1024).setDepth(Depths.background),
			this.add.tileSprite(0, 0, 1920, 1024, 'background').setOrigin(0, 0).setTileScale(0.5, 0.5).setDepth(Depths.background),
			this.add.tileSprite(0, 0, 1920, 1024, 'background').setOrigin(0, 0).setTileScale(0.5, 0.5).setPosition(0, -1024).setDepth(Depths.background),
		]

		this.dirtParticles = this.add.particles('shapes');
		this.dirtParticles.setDepth(Depths.dirtOverTracks);

		this.staticShapeParticles = this.add.particles('shapes');
		this.staticShapeParticles.setDepth(Depths.smokeOverlay);

		this.houseSmokeParticles = this.add.particles('small_smoke');
		this.houseSmokeParticles.setDepth(Depths.smokeOverlay);

		this.overParticles = this.add.particles('shapes');
		this.overParticles.setDepth(Depths.smokeOverlay);

		this.playerDirtEmitter = this.dirtParticles.createEmitter(<any>{
			alpha: { start: 1, end: 0, ease: Phaser.Math.Easing.Cubic.In },
			lifespan: { min: 100, max: 3000 },
			emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, 10) },
			//speed: { min: 0, max: 200 },
			//angle: { min: 270 - 10, max: 270 + 10 },
			scale: { min: 0.3, max: 0.4 },
			frame: {
				frames: ['dirt_01', 'dirt_02', 'dirt_03']
			},

			tint: 0xc7b896,

			blendMode: Phaser.BlendModes.DARKEN
		});
		this.playerDirtEmitter.frequency = -1;


		this.boxDirtEmitter = this.dirtParticles.createEmitter(<any>{
			alpha: { start: 0.4, end: 0, ease: Phaser.Math.Easing.Cubic.In },
			lifespan: { min: 100, max: 3000 },
			emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, 10) },
			//speed: { min: 0, max: 200 },
			//angle: { min: 270 - 10, max: 270 + 10 },
			scale: { min: 1, max: 2 },
			frame: {
				frames: ['dirt_01', 'dirt_02', 'dirt_03']
			},

			tint: 0xc7b896,

			blendMode: Phaser.BlendModes.DARKEN
		});
		this.boxDirtEmitter.frequency = -1;

		this.hookDirtEmitter = this.dirtParticles.createEmitter(<any>{
			alpha: { start: 0.4, end: 0, ease: Phaser.Math.Easing.Cubic.In },
			lifespan: { min: 100, max: 3000 },
			emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, 10) },
			//speed: { min: 0, max: 200 },
			//angle: { min: 270 - 10, max: 270 + 10 },
			scale: { min: 0.3, max: 0.7 },
			frame: {
				frames: ['dirt_01', 'dirt_02', 'dirt_03']
			},

			tint: 0xc7b896,

			blendMode: Phaser.BlendModes.DARKEN
		});
		this.hookDirtEmitter.frequency = -1;




		this.hookHitEmitter = this.overParticles.createEmitter(<any>{
			alpha: { start: 0.5, end: 0, ease: Phaser.Math.Easing.Cubic.In },
			lifespan: { min: 100, max: 3000 },
			emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, 50) },
			speed: { min: 0, max: 40 },
			//angle: { min: 270 - 10, max: 270 + 10 },
			scale: { min: 3, max: 5 },
			frame: {
				frames: ['scorch_01', 'scorch_02', 'scorch_03']
			},

			//tint: 0xc7b896,

			blendMode: Phaser.BlendModes.HARD_LIGHT
		});
		this.hookHitEmitter.frequency = -1;


		this.hookManager = new HookManager(this);
		this.missileManager = new MissileManager(this);
		this.powerUpManager = new PowerupManager(this);
		this.boss = new Boss(this);

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

		this.deathWall = this.matter.add.sprite(1920 / 2, 1080 + 20, '');
		this.deathWall.setRectangle(1920, 40, {});
		bWall = <Matter.Body>this.deathWall.body;
		bWall.isStatic = true;
		bWall.friction = 0;
		this.deathWall.setSensor(true);
		(<any>bWall).deathWall = true;



		this.players = [
			new Player(this, 0),
			new Player(this, 1),
			new Player(this, 2),
			new Player(this, 3),
		];

		this.matter.world.on('collisionstart', (ev) => this.collisionStart(ev));


		//debug hack thing
		this.matter.add.mouseSpring({});

		this.startTime = 0;
		this.timerText = this.add.text(1920 / 2, 40, "TODO", {
			fontFamily: 'Staatliches',
			fontSize: '60px',
			color: '#ffffff',
			stroke: '#000000',
			strokeThickness: 4,
		});
		this.timerText.setOrigin(0.5, 0.5);
		this.timerText.setDepth(Depths.mostOverlay);


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

		if (this.startTime == 0) {
			this.startTime = time;
		}

		let elapsed = (time - this.startTime);

		if (elapsed < 2000) {
			this.intensity = 0;
		} else if (elapsed < 20000) {
			this.intensity = 0.5 + elapsed / 40000;
		} else if (elapsed < 40000) {
			this.intensity = 1 + (elapsed - 20000) / 40000;
		} else {
			this.intensity = 1.5 + (elapsed - 40000) / 60000;
		}

		this.backgrounds.forEach(b => {
			if (b.y - this.cameras.main.scrollY > 1080) {
				b.setPosition(0, b.y - (1024 * this.backgrounds.length));
			}
		});

		this.timerText.text = ((time - this.startTime) / 1000).toFixed(1);


		this.moveScene(time, delta);

		this.hookManager.update(time, delta);
		this.missileManager.update(time, delta);
		this.powerUpManager.update(time, delta);
		this.boss.update(time, delta);

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

		if (!this.gameIsOver) {
			let deadSum = this.players.map(p => p.isDead ? 1 : 0).reduce((a, b) => a + b, 0);

			this.gameIsOver = (deadSum >= 3);
			if (deadSum == 3) {
				let w = this.players.findIndex(p => !p.isDead);

				let text = '';
				switch (w) {
					case 0:
						text = "Blue Home";
						break;
					case 1:
						text = "Red Home";
						break;
					case 2:
						text = "Green Home";
						break;
					case 3:
						text = "Purple Home";
						break;
				}

				let winText = this.add.text(1920 / 2, 400, text + " wins!", {
					fontFamily: 'Staatliches',
					fontSize: '90px',
					color: '#ffffff',
					stroke: '#000000',
					strokeThickness: 8,
				});
				winText.setOrigin(0.5, 0.5);
				winText.setDepth(Depths.gameOverOverlay);
				this.keepOnScreenThings.push({ go: <any>winText, x: 1920 / 2, y: 400 });



				this.winningPlayerTracksImage = this.add.image(1920, 500, 'tracks')
				this.winningPlayerTracksImage.setScale(2);
				this.winningPlayerTracksImage.setDepth(Depths.gameOverOverlay);
				this.keepOnScreenThings.push({
					go: <any>this.winningPlayerTracksImage, x: 1920 / 2, y: 700 + 40
				});

				this.winningPlayerImage = this.add.image(1920, 500, 'home_' + (w + 1))
				this.winningPlayerImage.setScale(2);
				this.winningPlayerImage.setDepth(Depths.gameOverOverlay);
				this.keepOnScreenThings.push({
					go: <any>this.winningPlayerImage, x: 1920 / 2, y: 700
				});


			} else if (deadSum == 4) {

				let winText = this.add.text(1920 / 2, 400, "Draw!", {
					fontFamily: 'Staatliches',
					fontSize: '90px',
					color: '#ffffff',
					stroke: '#000000',
					strokeThickness: 8,
				});
				winText.setOrigin(0.5, 0.5);
				winText.setDepth(Depths.gameOverOverlay);
				this.keepOnScreenThings.push({ go: <any>winText, x: 1920 / 2, y: 400 });
			}

			if (this.gameIsOver) {

				let g = this.add.graphics({
					fillStyle: {
						color: 0x000000
					}
				});
				g.alpha = 0;
				g.fillRect(0, 0, 1920, 1080);
				g.setDepth(Depths.mostOverlay);

				this.add.tween({
					targets: g,
					alpha: 1,
					duration: 5000,
				})
				this.keepOnScreenThings.push({
					go: <any>g,
					x: 0, y: 0
				})

				setTimeout(() => {
					this.scene.start('game');
				}, 6000);
			}
		}

		if (this.winningPlayerImage) {
			this.winningPlayerImage.setFrame(Math.floor(time / 60) % (4 * 8));
			this.winningPlayerTracksImage.setFrame(Math.floor(time / 60) % (4 * 8));
		}

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
		this.deathWall.setPosition(1920 / 2, this.cameras.main.scrollY + 1080 + 20);

		this.timerText.setPosition(1920 / 2, this.cameras.main.scrollY + 30);

		this.keepOnScreenThings.forEach(t => {
			t.go.setPosition(t.x, this.cameras.main.scrollY + t.y);
		});
		this.staticShapeParticles.setPosition(0, this.cameras.main.scrollY);

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

			else if (bodyA.player && bodyB.deathWall) {
				bodyA.player.die();
			}
			else if (bodyB.player && bodyA.deathWall) {
				bodyB.player.die();
			}
		});
	}
}