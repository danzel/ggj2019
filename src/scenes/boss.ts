import { GameScene } from "./gameScene";
import { Depths } from "./depths";

export class Boss {
	sprites = new Array<Phaser.GameObjects.Image>();
	dirtEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

	constructor(private scene: GameScene){

		const left = 165 - 18;
		this.sprites.push(scene.add.image(left, 0, 'boss_fingers'))
		this.sprites.push(scene.add.image(left + (163 * 2), 0, 'boss_fingers'))
		this.sprites.push(scene.add.image(left + (163 * 4), 0, 'boss_fingers'))
		this.sprites.push(scene.add.image(left + (163 * 6), 0, 'boss_fingers'))
		this.sprites.push(scene.add.image(left + (163 * 8), 0, 'boss_fingers'))
		this.sprites.push(scene.add.image(left + (163 * 10), 0, 'boss_fingers'))


		this.sprites.forEach(s => {
			s.setDepth(Depths.bossFingers);
		});

		
		this.dirtEmitter = this.scene.dirtParticles.createEmitter(<any>{
			alpha: { start: 1, end: 0, ease: Phaser.Math.Easing.Cubic.In },
			lifespan: { min: 100, max: 3000 },
			emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, 10) },
			//speed: { min: 0, max: 200 },
			//angle: { min: 270 - 10, max: 270 + 10 },
			scale: { min: 0.5, max: 2 },
			frame: {
				frames: ['dirt_01', 'dirt_02', 'dirt_03']
			},

			tint: 0xc7b896,

			blendMode: Phaser.BlendModes.DARKEN
		});
		this.dirtEmitter.frequency = -1;
	}

	update(time: number, delta: number){
	
		let frame = Math.floor(time / 50) % 16;

		this.sprites.forEach(s => {
			s.setFrame(frame);
			s.setPosition(s.x, this.scene.cameras.main.scrollY + 1040);

			s.setOrigin(0.5/*0.49 + Math.random() * 0.02*/, 0.49 + Math.random() * 0.02);
		})

		for (var i = 0; i < 10; i++) {
			this.dirtEmitter.emitParticleAt(1920 * Math.random(), 950 + this.scene.cameras.main.scrollY, 1);
		}
	}
}