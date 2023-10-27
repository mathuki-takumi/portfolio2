'use strict';

class Title extends Actor {
    constructor(x, y) {
        const hitArea = new Rectangle(0, 0, 0, 0);
        super(x, y, hitArea);
    }

    render(target) {
        const context = target.getContext('2d');
        context.font = '25px sans-serif';
        context.fillStyle = 'white';
        context.fillText('HTMLSTG', this.x-10, this.y);
    }
}

class Fighter extends SpriteActor {
    constructor(x, y) {
        const sprite = new Sprite(assets.get('sprite'), new Rectangle(0, 0, 16, 16));
        const hitArea = new Rectangle(8, 8, 2, 2);
        super(x, y, sprite, hitArea);
        
        this.speed = 2;
    }
    
    update(gameInfo, input) {
        if(input.getKey('ArrowUp')) { this.y -= this.speed; }
        if(input.getKey('ArrowDown')) { this.y += this.speed; }
        if(input.getKey('ArrowRight')) { this.x += this.speed; }
        if(input.getKey('ArrowLeft')) { this.x -= this.speed; }
    }
}

class DanmakuStgMainScene extends Scene {
    constructor(renderingTarget) {
        super('メイン', 'black', renderingTarget);
        const fighter = new Fighter(200, 400);
        this.add(fighter);
    }
}

class DanmakuStgTitleScene extends Scene {
    constructor(renderingTarget) {
        super('タイトル', 'black', renderingTarget);
        const title = new Title(140, 200);
        this.add(title);
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
        super('弾幕STG', 400, 690, 60);
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