import * as WebFont from 'webfontloader';
declare function require(url: string): string;

export class LoadingScene extends Phaser.Scene {

	private loadedCount = 0;

	constructor() {
		super({ key: 'loading' });
	}

	preload() {
		this.load.image('phaser', require('../assets/phaser.png'))

		this.load.image('hook-telegraph', require('../assets/hook/telegraph.png'))
		this.load.image('player-charge-telegraph', require('../assets/player/chargetelegraph.png'))

		WebFont.load({
			custom: {
				families: ['ZCOOL KuaiLe']
			},
			active: () => this.haveLoaded()
		})
		//this.loadedCount = 1;
	}

	create() {
		this.haveLoaded();
	}

	private haveLoaded() {
		console.log('haveLoaded')
		this.loadedCount++;

		if (this.loadedCount == 2) {
			this.scene.start('game');
		}
	}
}