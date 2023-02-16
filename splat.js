let splatPool = [];
class SPLAT extends PIXI.Container{    
    
    constructor(x,y, path){
        super(x,y);

        this.recycle(x,y, path);

    }

    recycle(x,y, path){

        this.x =x;
        this.y =y;
        this.display = PIXI.Sprite.from('media/'+path);
        this.display.anchor.set(0.5);
        this.display.angle = Math.random() * 360;
        this.display.alpha =1;
        this.addChild(this.display);

    }

    dispose(){
        this.removeChildren();
        this.splatPool.push(this);
    }


    update(ms){
        this.display.alpha -= GAME_SETTINGS.SPLAT_DECAY_RATE * ms;
    }
}