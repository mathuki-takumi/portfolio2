'use strict';

class TextLabel extends Actor {
    constructor(x, y, text) {
        const hitArea = new Rectangle(0, 0, 0, 0);
        super(x, y, hitArea);
        
        this.text = text;
    }

    render(target) {
        const context = target.getContext('2d');
        context.font = '25px sans-serif';
        context.fillStyle = 'white';
        context.fillText(this.text, this.x, this.y);
    }
}

class Bullet extends SpriteActor {
    constructor(x, y) {
        const sprite = new Sprite(assets.get('sprite'), new Rectangle(0, 16, 16, 16));
        const hitArea = new Rectangle(4, 0, 8, 16);
        super(x, y, sprite, hitArea, ['playerBullet']);

        this.speed = 6;
 // 敵に当たったら消える
 this.addEventListener('hit', (e) => {
    if(e.target.hasTag('enemy')) { this.destroy(); } 
 });

    }

    update(gameInfo, input) {
        this.y -= this.speed;
        if(this.isOutOfBounds(gameInfo.screenRectangle)) {
            this.destroy();
        }
    }
}

class Fighter extends SpriteActor {
    constructor(x, y) {
        const sprite = new Sprite(assets.get('sprite'), new Rectangle(0, 0, 16, 16));
        const hitArea = new Rectangle(8, 8, 2, 2);
        super(x, y, sprite, hitArea);

        this._interval = 5;
        this._timeCount = 0;
        this._speed = 3;
        this._velocityX = 0;
        this._velocityY = 0;
        this.maxEnegy=30;
        this.currentEnegy=this.maxEnegy;
        
        // 敵の弾に当たったらdestroyする
        this.addEventListener('hit', (e) => {
           if(e.target.hasTag('enemyBullet')) {
               this.destroy();
           } 
        });
    }
    
    update(gameInfo, input) {
        // キーを押されたら移動する
        this._velocityX = 0;
        this._velocityY = 0;
   
        if(input.getKey('w')) { this._velocityY = -this._speed; }
        if(input.getKey('s')) { this._velocityY = this._speed; }
        if(input.getKey('d')) { this._velocityX = this._speed; }
        if(input.getKey('a')) { this._velocityX = -this._speed; }

        if(input.getKey('ArrowUp')) { this._velocityY = -this._speed; }
        if(input.getKey('ArrowDown')) { this._velocityY = this._speed; }
        if(input.getKey('ArrowRight')) { this._velocityX = this._speed; }
        if(input.getKey('ArrowLeft')) { this._velocityX = -this._speed; }
        
        this.x += this._velocityX;
        this.y += this._velocityY;

        // 画面外に行ってしまったら押し戻す
        const boundWidth = gameInfo.screenRectangle.width - this.width;
        const boundHeight = gameInfo.screenRectangle.height - this.height;
        const bound = new Rectangle(this.width, this.height, boundWidth, boundHeight);
        
        if(this.isOutOfBounds(bound)) {
            this.x -= this._velocityX;
            this.y -= this._velocityY;
        }

        // スペースキーで弾を打つ
        this._timeCount++;
        const isFireReady = this._timeCount > this._interval+(this.y/100);
        if(input.getKey(' '))
        {
            if(isFireReady && this.currentEnegy>=1) {
                const bullet = new Bullet(this.x, this.y);
                this.spawnActor(bullet);
                this.currentEnegy-=1;
                this._timeCount = 0;
                this.dispatchEvent('changeEn', new GameEvent(this));
            }
        }
        else
        {
            if(this.currentEnegy<30)
            {
                this.currentEnegy+=0.1;
                this.dispatchEvent('changeEn', new GameEvent(this));
            }
           
        }
    }
}

class FighterEnegyBar extends Actor {
    constructor(x, y, fighter) {
        const hitArea = new Rectangle(0, 0, 0, 0);
        super(x, y, hitArea);

        this._width = 200;
        this._height = 10;
        
        this._innerWidth = this._width;

        // 敵のHPが変わったら内側の長さを変更する
        fighter.addEventListener('changeEn', (e) => {
            const maxEn = e.target.maxEnegy;
            const En = e.target.currentEnegy;
            this._innerWidth = this._width * (En / maxEn);
        });
    }

    render(target) {
        const context = target.getContext('2d');
        context.strokeStyle = 'white';
        context.fillStyle = 'blue';
        
        context.strokeRect(this.x, this.y, this._width, this._height);
        context.fillRect(this.x, this.y, this._innerWidth, this._height);
    }
}

class EnemyBullet extends SpriteActor {
    constructor(x, y, velocityX, velocityY) {
        const sprite = new Sprite(assets.get('sprite'), new Rectangle(16, 16, 16, 16));
        const hitArea = new Rectangle(4, 4, 8, 8);
        super(x, y, sprite, hitArea, ['enemyBullet']);

        this.velocityX = velocityX;
        this.velocityY = velocityY;
    }

    update(gameInfo, input) {
        this.x += this.velocityX;
        this.y += this.velocityY;

        if(this.isOutOfBounds(gameInfo.screenRectangle)) {
            this.destroy();
        }
    }
}


class FireworksBullet extends EnemyBullet {
    constructor(x, y, velocityX, velocityY, explosionTime) {
        super(x, y, velocityX, velocityY);

        this._eplasedTime = 0;
        this.explosionTime = explosionTime;
    }

    // degree度の方向にspeedの速さで弾を発射する
    shootBullet(degree, speed) {
        const rad = degree / 180 * Math.PI;
        const velocityX = Math.cos(rad) * speed;
        const velocityY = Math.sin(rad) * speed;

        const bullet = new EnemyBullet(this.x, this.y, velocityX, velocityY);
        this.spawnActor(bullet);
    }

    // num個の弾を円形に発射する
    shootCircularBullets(num, speed) {
        const degree = 360 / num;
        for(let i = 0; i < num; i++) {
            this.shootBullet(degree * i, speed);
        }
    }

    update(gameInfo, input) {
        super.update(gameInfo, input);

        // 経過時間を記録する
        this._eplasedTime++;
        
        // 爆発時間を超えたら弾を生成して自身を破棄する
        if(this._eplasedTime > this.explosionTime) {
            this.shootCircularBullets(5, 2);
            this.destroy();
        }
    }
}

class Enemy extends SpriteActor {
    constructor(x, y) {
        const sprite = new Sprite(assets.get('sprite'), new Rectangle(16, 0, 16, 16));
        const hitArea = new Rectangle(0, 0, 16, 16);
        super(x, y, sprite, hitArea, ['enemy']);

        this.maxHp = 40;
        this.currentHp = this.maxHp;

        this._interval = 100;
        this._timeCount = 0;
        this._timeCount2 = 0;
        this._velocityX = 0.3;

        // プレイヤーの弾に当たったらHPを減らす
        this.addEventListener('hit', (e) => {
           if(e.target.hasTag('playerBullet')) {
               this.currentHp--;
               this.dispatchEvent('changehp', new GameEvent(this));
           }
        });
    }

    // degree度の方向にspeedの速さで弾を発射する
    shootBullet(degree, speed) {
        const rad = degree / 180 * Math.PI;
        const velocityX = Math.cos(rad) * speed;
        const velocityY = Math.sin(rad) * speed;
        
        const bullet = new EnemyBullet(this.x, this.y, velocityX, velocityY);
        this.spawnActor(bullet);
    }

    // num個の弾を円形に発射する
    shootCircularBullets(num, speed) {
        const degree = 360 / num;
        for(let i = 0; i < num; i++) {
            
            this.shootBullet(degree * i, speed);
            if(this.currentHp<=30)
            {
                this.shootBullet(degree * i+10, speed-0.5);
            }
            if(this.currentHp<=20)
            {
                this.shootBullet(degree * i+20, speed+1);
            }
            
        }
    }

    update(gameInfo, input) {
        // 左右に移動する
        this.x += this._velocityX;
        if(this.x <= 100 || this.x >= 200) { this._velocityX *= -1; }
        
        // インターバルを経過していたら弾を撃つ
        this._timeCount++;
        this._timeCount2++;
        if(this._timeCount > this._interval) {
            this.shootCircularBullets(15, 1);
            this._timeCount = 0;
        }
        if(this._timeCount > 90) {
            if(this.currentHp<=20)
            {
                const spdX = Math.random() * 4 - 2; // -2〜+2
                const spdY = Math.random() * 4 - 2;
                const explosionTime = 50;
                const bullet = new FireworksBullet(this.x, this.y, spdX, spdY, explosionTime);
                this.spawnActor(bullet);
                
            }
            this._timeCount2 = 0;
        }

        // HPがゼロになったらdestroyする
        if(this.currentHp <= 0) {
            this.destroy();
        }
    }
}

class EnemyHpBar extends Actor {
    constructor(x, y, enemy) {
        const hitArea = new Rectangle(0, 0, 0, 0);
        super(x, y, hitArea);

        this._width = 200;
        this._height = 10;
        
        this._innerWidth = this._width;

        // 敵のHPが変わったら内側の長さを変更する
        enemy.addEventListener('changehp', (e) => {
            const maxHp = e.target.maxHp;
            const hp = e.target.currentHp;
            this._innerWidth = this._width * (hp / maxHp);
        });
    }

    render(target) {
        const context = target.getContext('2d');
        context.strokeStyle = 'white';
        context.fillStyle = 'red';
        
        context.strokeRect(this.x, this.y, this._width, this._height);
        context.fillRect(this.x, this.y, this._innerWidth, this._height);
    }
}

class DanmakuStgEndScene extends Scene {
    constructor(renderingTarget) {
        super('クリア', 'black', renderingTarget);
        const text = new TextLabel(60, 200, 'ゲームクリア！');
        this.add(text);
    }
    update(gameInfo, input) {
        super.update(gameInfo, input);
        if(input.getKeyDown(' ')) {
            const mainScene = new DanmakuStgTitleScene(this.renderingTarget);
            this.changeScene(mainScene);
        }
    }
}

class DanmakuStgGameOverScene extends Scene {
    constructor(renderingTarget) {
        super('ゲームオーバー', 'black', renderingTarget);
        const text = new TextLabel(50, 200, 'ゲームオーバー');
        this.add(text);
    }
    update(gameInfo, input) {
        super.update(gameInfo, input);
        if(input.getKeyDown(' ')) {
            const mainScene = new DanmakuStgTitleScene(this.renderingTarget);
            this.changeScene(mainScene);
        }
    }
}

class DanmakuStgMainScene extends Scene {
    constructor(renderingTarget) {
        super('メイン', 'black', renderingTarget);
        const fighter = new Fighter(150, 300);
        const enemy = new Enemy(150, 100);
        const hpBar = new EnemyHpBar(50, 20, enemy);
        const EnBar=new FighterEnegyBar(fighter.x,600,fighter);
        this.add(fighter);
        this.add(enemy);
        this.add(hpBar);
        this.add(EnBar);

        
       
        
        // 自機がやられたらゲームオーバー画面にする
        fighter.addEventListener('destroy', (e) => {
            const scene = new DanmakuStgGameOverScene(this.renderingTarget);
            this.changeScene(scene);
        });

        // 敵がやられたらクリア画面にする
        enemy.addEventListener('destroy', (e) => {
            const scene = new DanmakuStgEndScene(this.renderingTarget);
            this.changeScene(scene);
        });
    }
}

class DanmakuStgTitleScene extends Scene {
    constructor(renderingTarget) {
        super('タイトル', 'black', renderingTarget);
        const title = new TextLabel(120, 200, 'HTMLSTG');
        this.add(title);
        const Move = new TextLabel(110, 250, '移動:WASD or ←↑↓→');
        this.add(Move);
        const Shot = new TextLabel(110, 300, '射撃:SPACE');
        this.add(Shot);
        const Menu = new TextLabel(110, 500, 'Push Space');
        this.add(Menu);
    }

    update(gameInfo, input) {
        super.update(gameInfo, input);
        if(input.getKeyDown(' ')) {
            const mainScene = new DanmakuStgMainScene(this.renderingTarget);
            this.changeScene(mainScene);
        }
    }
}

class DanamkuStgGame extends Game {
    constructor() {
        super('弾幕STG',  400, 690, 60);
        const titleScene = new DanmakuStgTitleScene(this.screenCanvas);
        this.changeScene(titleScene);
    }
}

assets.addImage('sprite', 'sprite.png');
assets.loadAll().then((a) => {
    const game = new DanamkuStgGame();
    document.body.appendChild(game.screenCanvas);
    game.start();
});