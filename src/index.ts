import "phaser";
import './index.css';
import { LoadingScene } from "./scenes/loadingScene";
import { GameScene } from "./scenes/gameScene";

class Game extends Phaser.Game {
	constructor() {
		super({
			width: 1920,
			height: 1080,
			type: Phaser.AUTO,
			input: {
				gamepad: true
			},
			render: {
				autoResize: true
			},
			parent: 'game',
			scene: [LoadingScene, GameScene],
			physics: {
				default: 'matter',
				matter: {
					debug: true,
					gravity: {
						x: 0,
						y: 0
					},
					enableSleeping: false
				}
			}
		});
	}
}

window.addEventListener('load', () => {
	(<any>window).game = new Game();
})