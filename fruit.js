let fruitPool = [];
class FRUIT extends PIXI.Container{    
    
    constructor(x,y){
        super(x,y);
        this.body = new PIXI.Container();
        this.addChild(this.body);
        this.state =  FRUIT_STATE.NONE;

        this.recycle(x,y);

    }

    recycle(x,y){

        this.x = x;
        this.y = y;
        
        let _rand = Math.floor(Math.random() * FRUIT_TYPE.length);
        this.type = FRUIT_TYPE[_rand];
        this.value = (_rand+1) * GAME_SETTINGS.SCORE_INCREMENT;
        this.mainPiece ="game_fruit_"+this.type+".png";
        this.sliceLeft = "game_fruit_"+this.type+"_l.png";
        this.sliceRight = "game_fruit_"+this.type+"_r.png";
        this.splat = "game_fruit_"+this.type+"_s.png";
        
        this.isLaunched = false;
        this.wasSliced = false;
        this.velX = this.velY = 0;


        this.display = PIXI.Sprite.from('media/'+this.mainPiece);
        this.display.anchor.set(0.5);
        this.body.addChild(this.display); 

        this.displaySLeft = PIXI.Sprite.from('media/'+this.sliceLeft);
        this.displaySLeft.anchor.set(1, 0.5);
        this.body.addChild(this.displaySLeft); 

        
        this.displaySRight = PIXI.Sprite.from('media/'+this.sliceRight);
        this.displaySRight.anchor.set(0, 0.5);
        this.body.addChild(this.displaySRight); 

        this.display.visible = true;
        this.displaySLeft.visible = this.displaySRight.visible = false;
        this.displaySLeft.x = this.displaySRight.x = 0;

        this.body.angle = (Math.random() * 90) -45;

        this.state = FRUIT_STATE.WHOLE;
    }

    dispose(){

        this.isLaunched = false;
        this.velX = this.velY = 0;

        this.removeChildren();
        fruitPool.push(this);
    }

    launch(){
        this.velY = (GAME_SETTINGS.FRUIT_LAUNCH_SPEED_MIN + (GAME_SETTINGS.FRUIT_LAUNCH_SPEED_BUFFER * Math.random())) * -1;
        this.velX = (app.gameWidth/3000) * Math.random();
        if(Math.random() < 0.5)
            this.velX *= -1;
        this.isLaunched = true;
        this.interactive = true;
        this.on('pointerdown',this.slice.bind(this));
        
    }
    
    slice(){
        if(this.state != FRUIT_STATE.WHOLE)
            return;

        if(this.value > 0)
        {
            this.wasSliced = true;
            let _sfx = new Audio('media/sword-unsheathing.mp3');   
            _sfx.play();
        }
        
        this.display.visible = false;
        this.displaySLeft.visible = this.displaySRight.visible = true;

        
        this.removeAllListeners();
        this.interactive = false;

        this.state = FRUIT_STATE.SLICED;
       
    }

    forceSlice(){
        this.value = 0;
        this.slice();

    }

    update(ms){
        this.y += (this.velY * ms);
        this.x += (this.velX * ms);
        this.velY += GAME_SETTINGS.GRAVITY * ms;

    
        if(this.state == FRUIT_STATE.WHOLE)
        this.body.angle += GAME_SETTINGS.FRUIT_ANGLE_SPEED * ms;

        if(this.state == FRUIT_STATE.SLICED)
        {
            this.displaySLeft.x -= GAME_SETTINGS.FRUIT_SLICED_X_SPEED * ms;
            this.displaySRight.x += GAME_SETTINGS.FRUIT_SLICED_X_SPEED * ms;
        }
        
        this.wasSliced = false;
        
        let  _toDispose = false;
        //disposal check
        //return false if disposing

        return true;
    }
}