class GAME extends PIXI.Container{
    constructor(){
        super(0,0);
        this.state = APP_STATE.LOADING;    

        this.splatLayer = new PIXI.Container();
        this.fruitLayer = new PIXI.Container();
        this.uiLayer = new PIXI.Container();
        
        this.flash = new PIXI.Graphics().beginFill(0xFFFFFF).drawRect(0,0, GAME_SETTINGS.GAME_WIDTH, GAME_SETTINGS.GAME_HEIGHT);
        this.flash.alpha = GAME_SETTINGS.FLASH_ALPHA;
        
        this.addChild(this.splatLayer);
        this.addChild(this.fruitLayer);
        this.addChild(this.flash);
        this.addChild(this.uiLayer);

        this.score =0;
    }

    update(ms){
        if(this.time && this.time>0)
            this.time -= ms;

        if(this.time <= 0 )
        {
            if(this.state != APP_STATE.END)
            {
                this.gameOver();
                this.state = APP_STATE.END
            }

        }
        else{
            if(this.progTimer)
            {
                this.progTimer -= ms;
                if(this.progTimer <= 0)
                    this.levelProgress();
            }

            if(this.spawnTimer)
            {
                this.spawnTimer -= ms;
                if(this.spawnTimer <= 0)
                    this.spawnWave();

            }
        }

        let _fruitDisposal = [];
        this.fruits.forEach(fruit => {   
            if(fruit.wasSliced)  
            {
                this.spawnSplat(fruit.x, fruit.y, fruit.splat);

                this.flash.alpha = 0.75;        
                this.score+= GAME_SETTINGS.SCORE_INCREMENT;
            }

            fruit.update(ms);

            //if fruit ready for disposal
                //add to disposal queue

        });

        while(_fruitDisposal.length >0)
        {
            let _fruit = _fruitDisposal.pop();
            _fruit.dispose();

        }

        if(this.flash.alpha >0)
        {
            this.flash.alpha -= GAME_SETTINGS.FLASH_DECAY_RATE * ms;
        }
    }

    gameStart(){
        this.time = GAME_SETTINGS.TIME_LIMIT;
        this.fruits = [];

        this.spawnTimer = 0;
        this.spawnWaveSize = GAME_SETTINGS.BASE_WAVE_COUNT;
        this.spawnWave();

        this.progTimer = GAME_SETTINGS.PROGRESSION_TIMER;
    }
    
    gameOver(){

    }

    levelProgress(){
        this.spawnWaveSize += GAME_SETTINGS.WAVE_COUNT_MODIFIER;
        
        this.spawnTimer -= GAME_SETTINGS.SPAWN_TIMER_MODIFIER;
        if(this.spawnTimer < GAME_SETTINGS.SPAWN_TIMER_MIN)
            this.spawnTimer = GAME_SETTINGS.SPAWN_TIMER_MIN;

        this.progTimer = GAME_SETTINGS.PROGRESSION_TIMER;
    }

    spawnWave(){
        let j = Math.floor(this.spawnWaveSize);
        for(let i = 0; i<j; i++)
            this.spawnFruit();

        this.spawnTimer = GAME_SETTINGS.BASE_SPAWN_TIMER;
        console.log("Spawning Wave");
        
    }

    spawnFruit(){
        if(this.fruits.length >= GAME_SETTINGS.ACTIVE_FRUIT_LIMIT)
            return;

        let _fruit;
        let _fruitX = GAME_SETTINGS.GAME_WIDTH * Math.random();
        // let fruitY = GAME_SETTINGS.GAME_HEIGHT * Math.random();
        let _fruitY= GAME_SETTINGS.GAME_HEIGHT + (GAME_SETTINGS.FRUIT_Y_SPAWN_MAX_OFFSET * Math.random());
        if(fruitPool.length > 0)
        {
            _fruit = fruitPool.pop();
            _fruit.recycle(_fruitX, _fruitY);
        }
        else
            _fruit = new FRUIT(_fruitX, _fruitY);

        this.fruits.push(_fruit);
        this.fruitLayer.addChild(_fruit);
        _fruit.launch();
    }

    spawnSplat(x,y,path){
        console.log(path);

        let _splat;
        this.splatLayer.add(_splat);

    }
}


let app = new PIXI.Application({ width: GAME_SETTINGS.GAME_WIDTH, height: GAME_SETTINGS.GAME_HEIGHT });
document.body.appendChild(app.view);

let assetsList = [
'media/board.png',
'media/game_bg.jpg',
'media/game_fruit_blue.png',
'media/game_fruit_blue_l.png',
'media/game_fruit_blue_r.png',
'media/game_fruit_blue_s.png',
'media/game_fruit_green.png',
'media/game_fruit_green_l.png',
'media/game_fruit_green_r.png',
'media/game_fruit_green_s.png',
'media/game_fruit_orange.png',
'media/game_fruit_orange_l.png',
'media/game_fruit_orange_r.png',
'media/game_fruit_orange_s.png',
'media/game_fruit_purple.png',
'media/game_fruit_purple_l.png',
'media/game_fruit_purple_r.png',
'media/game_fruit_purple_s.png',
'media/game_fruit_red.png',
'media/game_fruit_red_l.png',
'media/game_fruit_red_r.png',
'media/game_fruit_red_s.png',
'media/game_fruit_yellow.png',
'media/game_fruit_yellow_l.png',
'media/game_fruit_yellow_r.png',
'media/game_fruit_yellow_s.png'
];
assetsList.forEach(element => {
    PIXI.Sprite.from(element);
});

const sfx = new Audio('media/sword-unsheathing.mp3');

app.bg = PIXI.Sprite.from('media/game_bg.jpg');
app.stage.addChild(app.bg);


let elapsed = 0.0;
app.ticker.add((delta) => {
    elapsed += delta;
    let _ms = app.ticker.elapsedMS;
    if(_ms >= 250)
        return;

    if(app && app.game)
        app.game.update(_ms);
});


app.game = new GAME();
app.stage.addChild(app.game);
app.game.gameStart();

/*
To Do:
        - Temp Loader
- Game States and Flow ( Title, In-Game, End Screen)
        - Fruit Slicing
        - Fruit Replacement
- Scoring System and UI

Optional:
- Retry
- Splatter effect
- Vanishing Disposal
        - Fruit Rotation
- Proper Loader
- Drag Input and Collision Detection
- Object Pool with Disposal
- Fix audio bug, or implement a soundmanager???
- X Spawn limiter


Font Options:
https://fonts.google.com/specimen/Julee
https://fonts.google.com/specimen/Kaushan+Script
https://fonts.google.com/specimen/Press+Start+2P

*/



