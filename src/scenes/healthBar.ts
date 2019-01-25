import { GameScene } from "./gameScene";

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
		scene.overlayGroup.add(this.bgGfx);

		this.gfx = scene.add.graphics({
			fillStyle: {
				color: fgColor
			}
		});
		this.gfx.fillRect(-19, -5, 38, 10);
		scene.overlayGroup.add(this.gfx);
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