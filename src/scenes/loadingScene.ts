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

		this.load.image('small_smoke', require('../assets/small_smoke.png'))
		this.load.image('zoom', require('../assets/zoom.png'))

		this.load.spritesheet('boss_fingers', require('../assets/boss_fingers.png'), {
			frameWidth: 512,
			frameHeight: 512
		});
		
		this.load.spritesheet('spin_break', require('../assets/spin_break.png'), {
			frameWidth: 256,
			frameHeight: 256
		});

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
		this.load.spritesheet('harpoon', require('../assets/harpoon.png'), {
			frameWidth: 256,
			frameHeight: 256
		});

		this.load.image('chain', require('../assets/chain.png'));
		this.load.image('chain_tile', require('../assets/chain_tile.png'));

		this.load.atlas('shapes', require('../assets/particles/shapes.png'), require('../assets/particles/shapes.json'));


		this.load.audio('death_1', require('../assets/sound/death_1.mp3'));
		this.load.audio('death_2', require('../assets/sound/death_2.mp3'));
		this.load.audio('death_3', require('../assets/sound/death_3.mp3'));

		this.load.audio('hit_1', require('../assets/sound/hit_1.mp3'));

		this.load.audio('chain_1', require('../assets/sound/chain_1.mp3'));
		this.load.audio('chain_2', require('../assets/sound/chain_2.mp3'));
		this.load.audio('chain_3', require('../assets/sound/chain_3.mp3'));
		this.load.audio('chain_4', require('../assets/sound/chain_4.mp3'));
		
		this.load.audio('shoot_1', require('../assets/sound/shoot_1.mp3'));
		this.load.audio('shoot_2', require('../assets/sound/shoot_2.mp3'));
		this.load.audio('shoot_3', require('../assets/sound/shoot_3.mp3'));

		this.load.audio('engine', require('../assets/sound/engine.wav'));

		this.load.audio('collision', require('../assets/sound/collision.mp3'));


		WebFont.load({
			custom: {
				families: ['Staatliches']
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