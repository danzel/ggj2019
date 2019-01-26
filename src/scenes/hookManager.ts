import { GameScene } from "./gameScene";
import { Hook } from "./hook";

const timeBetweenHooks = 1000;

export class HookManager {
	lastHook = 0;
	hooks = new Array<Hook>();
	darkSmokeEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	emitter: Phaser.GameObjects.Particles.ParticleEmitter;

	constructor(private scene: GameScene) {
		this.darkSmokeEmitter = this.scene.staticShapeParticles.createEmitter(<any>{
			alpha: { start: 1, end: 0, ease: Phaser.Math.Easing.Cubic.In },
			lifespan: { min: 500, max: 1000 },
			emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 50, 30) },
			//speed: { min: 0, max: 200 },
			angle: { min: 270 - 10, max: 270 + 10 },
			scale: 2,
			frame: {
				frames: ['smoke_01', 'smoke_02', 'smoke_03', 'smoke_04']
			},

			blendMode: Phaser.BlendModes.DARKEN
		});
		this.darkSmokeEmitter.frequency = -1;

		this.emitter = this.scene.staticShapeParticles.createEmitter(<any>{
			alpha: { start: 1, end: 0, ease: Phaser.Math.Easing.Cubic.In },
			frame: {
				frames: ['muzzle_01']
			},
			scale: 4,

			tint: 16283470,
			blendMode: Phaser.BlendModes.ADD
		});
		this.emitter.frequency = -1;
	}

	emit(x: number, y: number, angle: number){
		//this.cameras.main.scrollY 
		this.emitter.setAngle({ min: angle, max: angle });
		this.darkSmokeEmitter.emitParticleAt(x, y, 10);
		let p = this.emitter.emitParticleAt(x, y, 1);
		p.angle = angle;
	}

	update(time: number, delta: number) {
		this.hooks.forEach(h => h.update(time, delta));


		//if (this.hooks.length < 5) { 
		if (this.scene.intensity > 0 && (this.hooks.length == 0 || time > this.lastHook + timeBetweenHooks / this.scene.intensity)) {

			this.lastHook = time;

			let sourceX = 200 + (Math.random() * (1920 - 400));
			//let sourceX = 200 + this.hooks.length * 200;
			let source = new Phaser.Math.Vector2(sourceX, 1080 + this.scene.cameras.main.scrollY);

			let destX = 200 + (Math.random() * (1920 - 400));
			let dest = new Phaser.Math.Vector2(destX, this.scene.cameras.main.scrollY);
			//let dest = new Phaser.Math.Vector2(400, this.scene.cameras.main.scrollY);

			//let hook = new Hook(this.scene, new Phaser.Math.Vector2(500, 1080), new Phaser.Math.Vector2(this.players[0].image.x, this.players[1].image.y));
			let hook = new Hook(this.scene, source, dest);
			hook.showTelegraph();
			this.hooks.push(hook);
		}

		for (var i = this.hooks.length - 1; i >= 0; i--) {
			if (this.hooks[i].isExpired()) {
				this.hooks[i].destroy();
				this.hooks.splice(i, 1);
			}
		}
	}
}