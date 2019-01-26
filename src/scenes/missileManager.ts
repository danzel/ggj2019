import { GameScene } from "./gameScene";
import { Player } from "./player";

export class Missile {
	constructor(public player: Player, public image: Phaser.Physics.Matter.Image, public body: Matter.Body, public angle: Phaser.Math.Vector2, public spawnTime: number) {

	}

}

export class MissileManager {
	missiles = new Array<Missile>();

	constructor(private scene: GameScene) {
	}

	fireMissile(player: Player, angle: Phaser.Math.Vector2) {
		let image = this.scene.matter.add.image(player.image.x, player.image.y, 'missile');
		this.scene.normalGroup.add(image);
		image.setCircle(10, {});
		var body = <Matter.Body>image.body;
		const missile = new Missile(player, image, body, angle.clone().normalize(), this.scene.time.now);
		(<any>body).missile = missile;

		body.isSensor = true;
		body.frictionAir = 0;

		image.applyForce(angle.clone().normalize().scale(0.008));

		this.missiles.push(missile);
	}

	handleCollision(player: Player, missile: Missile) {
		if (player == missile.player) {
			return;
		}

		var force = new Phaser.Math.Vector2(player.image.x, player.image.y).subtract(new Phaser.Math.Vector2(missile.image.x, missile.image.y));
		force.normalize();
		force.scale(1);
		this.scene.forcesToApply.push({ player, force });

		missile.spawnTime = -9999999; //to get it destroyed in update
	}


	update(time: number, delta: number) {
		for (var i = this.missiles.length - 1; i >= 0; i--) {
			let m = this.missiles[i];
			m.image.applyForce(m.angle.clone().scale(0.0002));

			if (time > m.spawnTime + 5000) {
				m.image.destroy();
				this.missiles.splice(i, 1);
			}
		}
	}
}