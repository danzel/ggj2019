import { GameScene } from "./gameScene";
import { Depths } from "./depths";

export class HealthBar {
	bgGfx: Phaser.GameObjects.Graphics;
	gfx: Phaser.GameObjects.Graphics;

	constructor(private scene: GameScene, bgColor: number, fgColor: number) {
		this.bgGfx = scene.add.graphics({
			fillStyle: {
				color: bgColor
			}
		});
		this.bgGfx.fillRect(-20, -6, 40, 12);
		this.bgGfx.setDepth(Depths.overlay);


		this.gfx = scene.add.graphics({
			fillStyle: {
				color: fgColor
			}
		});
		this.gfx.fillRect(-19, -5, 38, 10);
		this.gfx.setDepth(Depths.overlay);
	}

	setVisible(visible: boolean) {
		this.bgGfx.setVisible(visible);
		this.gfx.setVisible(visible);
	}

	update(x: number, y: number, percent: number) {
		this.bgGfx.setPosition(x, y);
		this.gfx.setPosition(x - (1 - percent) * 38 / 2, y);

		this.gfx.setScale(percent, 1);
	}
}