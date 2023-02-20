class GAME extends PIXI.Container{
    constructor(){
        super(0,0);
        this.state = APP_STATE.LOADING;    

        this.setup();
        
        this.score = this.comboTimer =  this.comboChain = this.endScore = 0;     
        this.fruitDisposal = [];
        this.splatDisposal = [];

        this.showMenu();
        
    }

    setup(){
        if(this.state != APP_STATE.LOADING)  
            return;

        this.splatLayer = new PIXI.Container();
        this.fruitLayer = new PIXI.Container();
        this.uiLayer = new PIXI.Container();        
        
        this.bg = PIXI.Sprite.from('media/game_bg.jpg');    
        
        this.flash = new PIXI.Graphics().beginFill(0xFFFFFF).drawRect(0,0, window.innerHeight, window.innerWidth);
        this.flash.alpha = GAME_SETTINGS.FLASH_ALPHA;

        this.tutorial = new PIXI.Container();
        let _tutorialContainer = PIXI.Sprite.from('media/board.png');        
        _tutorialContainer.anchor.set(0.5);
        let _tutorialStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: "#983601",
            align: "center",
        });        
        let _tutorialText = new PIXI.Text("CLICK ON A FRUIT TO SLICE.\n\nTRY TO SLICE ALL THE FRUITS\nBEFORE THE TIME RUNS OUT!", _tutorialStyle);  
        _tutorialText.anchor.set(0.5);
        this.tutorial.addChild(_tutorialContainer); 
        this.tutorial.addChild(_tutorialText); 

        this.playButton = PIXI.Sprite.from('media/play.png'); 
        this.playButton.anchor.set(0.5);
        this.playButton.on('pointerdown',this.playButtonPressed.bind(this));
    

        let _scoreStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 50,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ffffff', '#00ff99'],
            stroke: '#4a1850',
            strokeThickness: 5,
        });                
        this.scoreText = new PIXI.Text("0", _scoreStyle);

        let _timerStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 100,
            fontWeight: 'bold',
            fill: ['#ffffff'],
            stroke: '#000000',
            strokeThickness: 5,
        });                
        this.timerText = new PIXI.Text("0", _timerStyle);
        this.timerText.anchor.set(0.5);


        this.endPopup = new PIXI.Container();
        let _endPopupContainer = PIXI.Sprite.from('media/board.png');        
        _endPopupContainer.anchor.set(0.5);

        let _endHeaderStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 50,
            fontWeight: 'bold',
            fill: "#983601",
            align: "center",
        });    
        let _endHeaderText = new PIXI.Text("YOU GOT:", _endHeaderStyle);  
        _endHeaderText.anchor.set(0.5);
        _endHeaderText.y = -75;

        let _endScoreStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 90,
            fontWeight: 'bold',
            fill: "#983601",
            align: "center",
        });               
        this.endScoreText = new PIXI.Text("0", _endScoreStyle);
        this.endScoreText.anchor.set(0.5);
        this.endScoreText.y = 25;

        this.endPopup.addChild(_endPopupContainer); 
        this.endPopup.addChild(_endHeaderText);
        this.endPopup.addChild(this.endScoreText);
        
        this.homeButton = PIXI.Sprite.from('media/restart.png');
        this.homeButton.anchor.set(0.5);
        this.homeButton.on('pointerdown',this.homeButtonPressed.bind(this));

        this.uiLayer.addChild(this.tutorial);
        this.uiLayer.addChild(this.scoreText);
        this.uiLayer.addChild(this.timerText);
        this.uiLayer.addChild(this.endPopup);

        this.uiLayer.addChild(this.playButton);
        this.uiLayer.addChild(this.homeButton);
        
        this.tutorial.visible = this.scoreText.visible = this.endPopup.visible = false;     

        this.addChild(this.bg);
        this.addChild(this.splatLayer)
        this.addChild(this.fruitLayer);
        this.addChild(this.flash);
        this.addChild(this.uiLayer);

    }

    update(ms){

        if(this.state == APP_STATE.END_TRANSITION)
        {
            if(this.endScore < this.score)
                this.endScore += ms * this.endScoreTickRate;

            if(this.endScore >= this.score)
                {
                    this.endScore = this.score;
                    this.state = APP_STATE.END;
                    this.uiControl();
                }

            this.endScoreText.text = Math.floor(this.endScore).toString().padStart(GAME_SETTINGS.SCORE_STRING_LENGTH,"0");
        }

        if(this.state == APP_STATE.GAME)
        {
            
            if(this.time && this.time>0)
                this.time -= ms;

            let _timeString = Math.round(this.time / 1000).toString().padStart(2,"0");
            
            this.timerText.x = app.gameWidth * 0.5;
            this.timerText.text = _timeString;

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
        }

        if(this.fruits)
            this.fruits.forEach(fruit => {   
                if(fruit.wasSliced)  
                {
                    this.spawnSplat(fruit.x, fruit.y, fruit.splat);

                    this.flash.alpha = 0.75;        
                    
                    if(this.comboChain >= GAME_SETTINGS.COMBO_CHAIN_MAX)
                        this.comboChain--;

                    this.score+= fruit.value * ++this.comboChain;

                    this.scoreText.text = this.score.toString().padStart(GAME_SETTINGS.SCORE_STRING_LENGTH,"0");

                    this.comboTimer = GAME_SETTINGS.COMBO_TIMER;
                }

                if( !fruit.update(ms) )
                {
                    this.fruitDisposal.push(fruit);
                }
            });

        while(this.fruitDisposal.length >0)
        {
            let _fruit = this.fruitDisposal.pop();
            this.fruits.splice( this.fruits.indexOf(_fruit), 1);
            _fruit.dispose();
        }


        if(this.splatter)
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

        this.bg.width = this.flash.width = app.gameWidth;
        this.bg.height = this.flash.height = app.gameHeight;
    }

    uiControl(){
        
        this.playButton.x = this.tutorial.x = window.innerWidth * 0.5;
        this.tutorial.y = 300;
        this.playButton.y = 700;
        this.playButton.visible = this.tutorial.visible = this.playButton.interactive =  (this.state == APP_STATE.TITLE);

        this.scoreText.x = 50;
        this.scoreText.y = 50;
        this.timerText.x = window.innerWidth * 0.5;
        this.timerText.y = 100;
        this.scoreText.visible = this.timerText.visible = (this.state == APP_STATE.GAME);  
        
        this.homeButton.x = this.endPopup.x = window.innerWidth * 0.5;
        this.endPopup.y = window.innerHeight * 0.5;
        this.homeButton.y = (window.innerHeight * 0.5) + 300;
        this.endPopup.visible = ((this.state == APP_STATE.END) || (this.state == APP_STATE.END_TRANSITION));
        this.homeButton.visible = this.homeButton.interactive =  (this.state == APP_STATE.END);

    }

    showMenu(){

        this.state = APP_STATE.TITLE;   
        this.uiControl();

    }

    playButtonPressed(){
        if( this.state != APP_STATE.TITLE)
            return;


        this.gameStart();
        this.uiControl();
    }

    gameStart(){        
        if( this.state != APP_STATE.TITLE)
            return;

        this.time = GAME_SETTINGS.TIME_LIMIT;
        this.fruits = [];
        this.splatter = [];

        this.spawnTimer = this.comboTimer = this.comboChain = this.score = this.endScore = 0;
        this.endScoreTickRate = 1;

        this.scoreText.text = this.score.toString().padStart(GAME_SETTINGS.SCORE_STRING_LENGTH,"0");

        this.spawnWaveSize = GAME_SETTINGS.BASE_WAVE_COUNT;
        this.spawnWave();

        this.progTimer = GAME_SETTINGS.PROGRESSION_TIMER;
        
        this.state = APP_STATE.GAME;   
    }
    
    gameOver(){

        if(this.state != APP_STATE.GAME)
            return;

            
        if(this.fruits)
        this.fruits.forEach(fruit => {   
            fruit.forceSlice();
        });
        
        this.endScoreTickRate = this.score / 1500;

        this.state = APP_STATE.END_TRANSITION;
        this.uiControl(); 
    }

    homeButtonPressed(){
        if(this.state != APP_STATE.END)
            return;

        this.showMenu();
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

/*
To Do:
        - Temp Loader
        - Game States and Flow ( Title, In-Game, End Screen)
        - Fruit Slicing
        - Fruit Replacement
        - Scoring System and UI
        - Timer UI

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
- Fruit Disposal





*/



