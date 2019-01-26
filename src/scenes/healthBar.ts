import { GameScene } from "./gameScene";
import { Depths } from "./depths";

export class HealthBar {
	bgGfx: Phaser.GameObjects.Graphics;
	gfx: Phaser.GameObjects.Graphics;

	constructor(private scene: GameScene, bgColor: number, fgColor: number, private width: number) {
		this.bgGfx = scene.add.graphics({
			fillStyle: {
				color: bgColor
			}
		});
		this.bgGfx.fillRect(-width / 2, -6, width, 12);
		this.bgGfx.setDepth(Depths.overlay);


		this.gfx = scene.add.graphics({
			fillStyle: {
				color: fgColor
			}
		});
		this.gfx.fillRect(-(width / 2) - 1, -5, width - 2, 10);
		this.gfx.setDepth(Depths.overlay);
	}

	setVisible(visible: boolean) {
		this.bgGfx.setVisible(visible);
		this.gfx.setVisible(visible);
	}

	update(x: number, y: number, percent: number) {
		this.bgGfx.setPosition(x, y);
		this.gfx.setPosition(x - (1 - percent) * (this.width - 2) / 2, y);

		this.gfx.setScale(percent, 1);
	}
}