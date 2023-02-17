class GAME extends PIXI.Container{
    constructor(){
        super(0,0);
        this.state = APP_STATE.LOADING;    

        this.splatLayer = new PIXI.Container();
        this.fruitLayer = new PIXI.Container();
        this.uiLayer = new PIXI.Container();
        
        this.flash = new PIXI.Graphics().beginFill(0xFFFFFF).drawRect(0,0, window.innerHeight, window.innerWidth);
        this.flash.alpha = GAME_SETTINGS.FLASH_ALPHA;
        
        this.bg = PIXI.Sprite.from('media/game_bg.jpg');

      

        this.addChild(this.bg);
        this.addChild(this.splatLayer)
        this.addChild(this.fruitLayer);
        // this.fruitLayer.addChild(this.splatLayer);
        this.addChild(this.flash);
        this.addChild(this.uiLayer);

        this.score = this.comboTimer =  this.comboChain = 0;      
        
        this.fruitDisposal = [];
        this.splatDisposal = [];

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 50,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ffffff', '#00ff99'],
            stroke: '#4a1850',
            strokeThickness: 5,
        });
        
        
        this.scoreText = new PIXI.Text("0", style);
        this.scoreText.x = 50;
        this.scoreText.y = 50;
        
        this.uiLayer.addChild(this.scoreText);
        
    }

    setLayers(){

    }

    setVisuals(){
        
    }

    update(ms){
        if(this.time && this.time>0)
            this.time -= ms;

        if(this.time <= 0 )
        {
            if(this.state != APP_STATE.END)
            {
                this.gameOver();
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

        if(this.comboTimer > 0)
        {
            this.comboTimer -= ms;

            if(this.comboTimer <= 0)
                this.comboTimer = this.comboChain = 0;
        }

        this.fruits.forEach(fruit => {   
            if(fruit.wasSliced)  
            {
                this.spawnSplat(fruit.x, fruit.y, fruit.splat);

                this.flash.alpha = 0.75;        
                
                if(this.comboChain >= GAME_SETTINGS.COMBO_CHAIN_MAX)
                    this.comboChain--;

                this.score+= GAME_SETTINGS.SCORE_INCREMENT * ++this.comboChain;

                this.scoreText.text = this.score.toString().padStart(GAME_SETTINGS.SCORE_STRING_LENGTH,"0");

                this.comboTimer = GAME_SETTINGS.COMBO_TIMER;
            }

            if( !fruit.update(ms) )
            {
                //if fruit ready for disposal
                    //add to disposal queue
                console.log("fruit is no longer fruit");

            }


        });

        while(this.fruitDisposal.length >0)
        {
            let _fruit = this.fruitDisposal.pop();
            this.fruits.splice( this.fruits.indexOf(_fruit), 1);
            _fruit.dispose();

        }


        this.splatter.forEach(splat => {
            splat.update(ms);
            
            if(splat.alpha <= 0)
                this.splatDisposal.push(splat);
            
        });

        while(this.splatDisposal.length >0)
        {
            let _splat = this.splatDisposal.pop();
            this.splatter.splice( this.splatter.indexOf(_splat), 1);

            _splat.dispose();

        }


        if(this.flash.alpha >0)
        {
            this.flash.alpha -= GAME_SETTINGS.FLASH_DECAY_RATE * ms;
        }

        // this.bg.width = this.flash.width = app.gameWidth;
        // this.bg.height = this.flash.height = app.gameHeight;
        this.bg.width = app.gameWidth;
        this.bg.height = app.gameHeight;
    }

    showMenu(){

        this.state = APP_STATE.TITLE;   
        this.gameStart();
    }

    gameStart(){
        this.time = GAME_SETTINGS.TIME_LIMIT;
        this.fruits = [];
        this.splatter = [];

        this.spawnTimer = this.comboTimer = this.comboChain = this.score = 0;

        this.scoreText.text = this.score.toString().padStart(GAME_SETTINGS.SCORE_STRING_LENGTH,"0");

        this.spawnWaveSize = GAME_SETTINGS.BASE_WAVE_COUNT;
        this.spawnWave();

        this.progTimer = GAME_SETTINGS.PROGRESSION_TIMER;
        
        this.state = APP_STATE.GAME;   
    }
    
    gameOver(){

        this.state = APP_STATE.END;   
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
        let _bufferSize = app.gameWidth * GAME_SETTINGS.FRUIT_X_SPAWN_BUFFER;
        let _spawnAreaWidth = app.gameWidth - (_bufferSize *2);  //Remove Buffer from both sides.
        let _fruitX = (_spawnAreaWidth* Math.random()) + _bufferSize;       //Apply left buffer after getting random point



        let _fruitY= app.gameHeight + (GAME_SETTINGS.FRUIT_Y_SPAWN_MAX_OFFSET * Math.random());
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

        let _splat; 
        if(splatPool.length > 0)
        {
            _splat = splatPool.pop();
            _splat.recycle(x,y,path);
        }
        else
            _splat = new SPLAT(x,y,path);


        this.splatter.push(_splat);
        this.splatLayer.addChild(_splat);

    }
}


let app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight });
document.body.appendChild(app.view);
app.resizeTo = window;

const assetsList = [
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




let elapsed = 0.0;
app.ticker.add((delta) => {
    elapsed += delta;
    let _ms = app.ticker.elapsedMS;
    if(_ms >= 250)
        return;

    app.gameWidth = window.innerWidth;
    app.gameHeight = window.innerHeight;

    if(app && app.game)
        app.game.update(_ms);
});


app.game = new GAME();
app.stage.addChild(app.game);
app.game.showMenu();

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
- Fix Responsiveness




*/



