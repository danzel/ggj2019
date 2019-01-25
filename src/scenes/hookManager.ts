import { GameScene } from "./gameScene";
import { Hook } from "./hook";

const timeBetweenHooks = 1000;

export class HookManager {
	lastHook = 0;
	hooks = new Array<Hook>();

	constructor(private scene: GameScene){

	}

	update(time: number, delta: number) {
		this.hooks.forEach(h => h.update(time, delta));

		if (this.hooks.length == 0 || time > this.lastHook + timeBetweenHooks / this.scene.intensity) {
			this.lastHook = time;

			let sourceX = 200 + (Math.random() * (1920 - 400));
			let source = new  Phaser.Math.Vector2(sourceX, 1080 + this.scene.cameras.main.scrollY);
			
			let destX = 200 + (Math.random() * (1920 - 400));
			let dest = new  Phaser.Math.Vector2(destX, this.scene.cameras.main.scrollY);

			//let hook = new Hook(this.scene, new Phaser.Math.Vector2(500, 1080), new Phaser.Math.Vector2(this.players[0].image.x, this.players[1].image.y));
			let hook = new Hook(this.scene, source, dest);
			hook.showTelegraph();
			this.hooks.push(hook);
		}
	}

	
}