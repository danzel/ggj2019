import * as WebFont from 'webfontloader';
declare function require(url: string): string;

export class LoadingScene extends Phaser.Scene {

	private loadedCount = 0;

	constructor() {
		super({ key: 'loading' });
	}

	preload() {
		this.load.image('hook-telegraph', require('../assets/hook/telegraph.png'))
		this.load.image('powerup-telegraph', require('../assets/box/telegraph.png'))
		this.load.image('player-charge-telegraph', require('../assets/player/chargetelegraph.png'))

		this.load.image('player', require('../assets/player/test.png'))
		this.load.image('background', require('../assets/dirt_background.jpg'))

		this.load.image('smoke', require('../assets/smoke.png'))
		this.load.image('small_smoke', require('../assets/small_smoke.png'))

		this.load.spritesheet('home_1', require('../assets/player/home_1.png'), {
			frameWidth: 256,
			frameHeight: 256
		});
		this.load.spritesheet('home_2', require('../assets/player/home_2.png'), {
			frameWidth: 256,
			frameHeight: 256
		});
		this.load.spritesheet('home_3', require('../assets/player/home_3.png'), {
			frameWidth: 256,
			frameHeight: 256
		});
		this.load.spritesheet('home_4', require('../assets/player/home_4.png'), {
			frameWidth: 256,
			frameHeight: 256
		});

		this.load.spritesheet('tracks', require('../assets/player/tracks.png'), {
			frameWidth: 256,
			frameHeight: 256
		});
		this.load.spritesheet('crates', require('../assets/box/crates.png'), {
			frameWidth: 128,
			frameHeight: 128
		});

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