import { GameScene } from "./gameScene";
import { Depths } from "./depths";

export class Boss {
	sprites = new Array<Phaser.GameObjects.Image>();

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
	}

	update(time: number, delta: number){
	
		let frame = Math.floor(time / 50) % 16;

		this.sprites.forEach(s => {
			s.setFrame(frame);
			s.setPosition(s.x, this.scene.cameras.main.scrollY + 1040);
		})
	}
}