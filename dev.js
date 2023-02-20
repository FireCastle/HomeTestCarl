const GAME_SETTINGS = {
    GRAVITY:0.0009807, 
    TIME_LIMIT: 60000,  
    SCORE_STRING_LENGTH: 5,
    SCORE_INCREMENT: 5,
    BASE_WAVE_COUNT: 3,
    WAVE_COUNT_MODIFIER: 0.35,
    PROGRESSION_TIMER: 10000,
    COMBO_TIMER: 0,
    COMBO_CHAIN_MAX: 1,

    FLASH_ALPHA: 0.75,
    FLASH_DECAY_RATE: 0.006, // 0.75 over 125ms

    ACTIVE_FRUIT_LIMIT: 99999,

    FRUIT_LAUNCH_SPEED_MIN: 1.2,
    FRUIT_LAUNCH_SPEED_BUFFER: 0.8,
    BASE_SPAWN_TIMER: 1000,   
    SPAWN_TIMER_MIN: 500,
    SPAWN_TIMER_MODIFIER: -100, 
    FRUIT_Y_SPAWN_MAX_OFFSET: 600,
    FRUIT_X_SPAWN_BUFFER: 0.2, //percentage per side
    FRUIT_SLICED_X_SPEED: 0.12,    

    FRUIT_ANGLE_SPEED:0.045,

    SPLAT_DECAY_RATE:0.00015,



}

const APP_STATE = {
    LOADING:0,
    TITLE:1,
    GAME:2,
    END_TRANSITION:3,
    END:4
}

const FRUIT_TYPE =[
    "green",
    "yellow",
    "purple",
    "orange",
    "red",
    "blue"
]

const FRUIT_STATE ={
    NONE:0,
    WHOLE:1,
    SLICED:2,
    INACTIVE:3
}