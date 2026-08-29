/* =========================================================
   COIN CATCHER
   Main Game Engine
   ========================================================= */

const GAME_CONFIG = {
    MAX_LIVES: 5,
    STARTING_LIVES: 5,
    MAX_GAME_LEVEL: 100,
    STARTING_PLAYER_LEVEL: 1,
    STARTING_XP: 0,
    STARTING_COINS: 0,
    BASE_FALL_SPEED: 1.8,
    OBJECT_SIZE: 40,
    COMBO_LIMIT: 999,
    XP_PER_LEVEL: 100,
    LEVEL_SCORE_REQUIREMENTS: [
        0,100,250,450,700,1000,1400,1850,2400,3000,3700,4500,5400,
        6400,7500,8700,10000,11400,12900,14500,16200,18000,19900,21900,
        24000,26200,28500,30900,33400,36000,38700,41500,44400,47400,50500,
        53700,57000,60400,63900,67500,71200,75000,78900,82900,87000,91200,
        95500,99900,104400,109000,113700,118500,123400,128400,133500,
        138700,144000,149400,154900,160500,166200,172000,177900,183900,
        190000,196200,202500,208900,215400,222000,228700,235500,242400,
        249400,256500,263700,271000,278400,285900,293500,301200,309000,
        316900,324900,333000,341200,349500,357900,366400,375000,383700,
        392500,401400,410400,419500,428700,438000,447400,457000,466700
    ]
};

const OBJECT_TYPES = {
    coin: { emoji: "🪙", score: 10, coins: 10 },
    diamond: { emoji: "💎", score: 50, coins: 50 },
    golden: { emoji: "🟡", score: 100, coins: 100 },
    heart: { emoji: "❤️", score: 0, coins: 0 },
    bomb: { emoji: "💣", score: -25, coins: 0 }
};

const ACHIEVEMENTS = [
    { id:"first_catch", icon:"🪙", title:"First Catch", description:"Catch your first coin.", reward:50, check:s=>s.totalCoins>=1 },
    { id:"coin_100", icon:"🪙", title:"Coin Collector", description:"Collect 100 coins.", reward:100, check:s=>s.totalCoins>=100 },
    { id:"coin_1000", icon:"💰", title:"Rich", description:"Collect 1,000 coins.", reward:250, check:s=>s.totalCoins>=1000 },
    { id:"diamond_50", icon:"💎", title:"Diamond Hunter", description:"Collect 50 diamonds.", reward:300, check:s=>s.totalDiamonds>=50 },
    { id:"golden_10", icon:"🟡", title:"Golden Hands", description:"Collect 10 golden coins.", reward:500, check:s=>s.totalGoldenCoins>=10 },
    { id:"level_10", icon:"⭐", title:"Rising Star", description:"Reach Game Level 10.", reward:200, check:s=>s.highestLevel>=10 },
    { id:"level_25", icon:"🔥", title:"Getting Serious", description:"Reach Game Level 25.", reward:500, check:s=>s.highestLevel>=25 },
    { id:"level_50", icon:"👑", title:"Halfway Hero", description:"Reach Game Level 50.", reward:1000, check:s=>s.highestLevel>=50 },
    { id:"level_70", icon:"💀", title:"Extreme Survivor", description:"Reach Game Level 70.", reward:2000, check:s=>s.highestLevel>=70 },
    { id:"level_100", icon:"🏆", title:"Legendary", description:"Reach Game Level 100.", reward:5000, check:s=>s.highestLevel>=100 },
    { id:"combo_10", icon:"🔥", title:"Combo Starter", description:"Reach a 10× combo.", reward:100, check:s=>s.bestCombo>=10 },
    { id:"combo_25", icon:"🔥", title:"Combo Master", description:"Reach a 25× combo.", reward:300, check:s=>s.bestCombo>=25 },
    { id:"combo_50", icon:"⚡", title:"Combo Beast", description:"Reach a 50× combo.", reward:1000, check:s=>s.bestCombo>=50 },
    { id:"games_10", icon:"🎮", title:"Regular Player", description:"Play 10 games.", reward:100, check:s=>s.gamesPlayed>=10 },
    { id:"games_100", icon:"🎮", title:"Dedicated", description:"Play 100 games.", reward:1000, check:s=>s.gamesPlayed>=100 },
    { id:"bomb_dodger", icon:"💣", title:"Bomb Dodger", description:"Catch 100 objects without being hit by a bomb.", reward:750, check:s=>s.bestSafeStreak>=100 }
];

const SHOP_ITEMS = [
    { id:"default", name:"Classic Basket", price:0, emoji:"🧺" },
    { id:"blue", name:"Blue Basket", price:1000, emoji:"🪣" },
    { id:"red", name:"Red Basket", price:2000, emoji:"🧺" },
    { id:"gold", name:"Golden Basket", price:7000, emoji:"🏆" },
    { id:"diamond", name:"Diamond Basket", price:15000, emoji:"💎" },
    { id:"legendary", name:"Legendary Basket", price:35000, emoji:"👑" }
];

const REDEEM_CODES = {
    WELCOME100:100,
    GAME50:50,
    ADI7:50000,
    SOMU7:25000
};

const DEFAULT_DATA = {
    coins:0,
    lives:5,
    playerXP:0,
    playerLevel:1,
    currentSkin:"default",
    unlockedSkins:["default"],
    achievements:[],
    stats:{
        bestScore:0,
        gamesPlayed:0,
        totalCoins:0,
        totalDiamonds:0,
        totalGoldenCoins:0,
        bombHits:0,
        bestCombo:0,
        highestLevel:1,
        bestSafeStreak:0,
        totalPlayTime:0
    },
    redeemedCodes:[],
    settings:{
        sound:true,
        music:true,
        vibration:true
    }
};

let playerData = loadPlayerData();

let gameState = {
    running:false,
    paused:false,
    score:0,
    level:1,
    combo:0,
    safeStreak:0,
    earnedCoins:0,
    currentLives:5,
    objects:[],
    spawnTimer:null,
    gameLoop:null,
    lastTime:0,
    elapsedTime:0
};

const screens = {
    home:document.getElementById("homeScreen"),
    game:document.getElementById("gameScreen"),
    achievements:document.getElementById("achievementsScreen"),
    shop:document.getElementById("shopScreen"),
    redeem:document.getElementById("redeemScreen"),
    stats:document.getElementById("statsScreen"),
    settings:document.getElementById("settingsScreen")
};

const overlay = {
    pause:document.getElementById("pauseOverlay"),
    gameOver:document.getElementById("gameOverOverlay"),
    levelUp:document.getElementById("levelUpOverlay"),
    message:document.getElementById("messageOverlay"),
    howToPlay:document.getElementById("howToPlayOverlay")
};

const gameArea = document.getElementById("gameArea");
const basket = document.getElementById("basket");

const STORAGE_KEYS = {
    coins:"cc_coins", lives:"cc_lives", playerXP:"cc_player_xp", playerLevel:"cc_player_level",
    currentSkin:"cc_current_skin", unlockedSkins:"cc_unlocked_skins", achievements:"cc_achievements",
    redeemedCodes:"cc_redeemed_codes", basketX:"cc_basket_x", basketY:"cc_basket_y",
    bestScore:"cc_best_score", gamesPlayed:"cc_games_played", totalCoins:"cc_total_coins",
    totalDiamonds:"cc_total_diamonds", totalGoldenCoins:"cc_total_golden", bombHits:"cc_bomb_hits",
    bestCombo:"cc_best_combo", highestLevel:"cc_highest_level", bestSafeStreak:"cc_best_safe_streak",
    totalPlayTime:"cc_total_play_time", sound:"cc_sound", music:"cc_music", vibration:"cc_vibration"
};

function readNumber(key,fallback){
    const value=localStorage.getItem(key);
    if(value===null)return fallback;
    const n=Number(value);
    return Number.isFinite(n)?n:fallback;
}

function readArray(key,fallback){
    try{
        const value=localStorage.getItem(key);
        if(value===null)return [...fallback];
        const parsed=JSON.parse(value);
        return Array.isArray(parsed)?parsed:[...fallback];
    }catch(_){return [...fallback];}
}

function loadPlayerData(){
    const d=JSON.parse(JSON.stringify(DEFAULT_DATA));
    try{
        d.coins=Math.max(0,readNumber(STORAGE_KEYS.coins,d.coins));
        d.lives=Math.max(0,Math.min(GAME_CONFIG.MAX_LIVES,readNumber(STORAGE_KEYS.lives,d.lives)));
        d.playerXP=Math.max(0,readNumber(STORAGE_KEYS.playerXP,d.playerXP));
        d.playerLevel=Math.max(1,readNumber(STORAGE_KEYS.playerLevel,d.playerLevel));
        d.currentSkin=localStorage.getItem(STORAGE_KEYS.currentSkin)||d.currentSkin;
        d.unlockedSkins=readArray(STORAGE_KEYS.unlockedSkins,d.unlockedSkins);
        if(!d.unlockedSkins.includes("default"))d.unlockedSkins.unshift("default");
        d.achievements=readArray(STORAGE_KEYS.achievements,d.achievements);
        d.redeemedCodes=readArray(STORAGE_KEYS.redeemedCodes,d.redeemedCodes);
        d.stats.bestScore=readNumber(STORAGE_KEYS.bestScore,0);
        d.stats.gamesPlayed=readNumber(STORAGE_KEYS.gamesPlayed,0);
        d.stats.totalCoins=readNumber(STORAGE_KEYS.totalCoins,0);
        d.stats.totalDiamonds=readNumber(STORAGE_KEYS.totalDiamonds,0);
        d.stats.totalGoldenCoins=readNumber(STORAGE_KEYS.totalGoldenCoins,0);
        d.stats.bombHits=readNumber(STORAGE_KEYS.bombHits,0);
        d.stats.bestCombo=readNumber(STORAGE_KEYS.bestCombo,0);
        d.stats.highestLevel=Math.max(1,readNumber(STORAGE_KEYS.highestLevel,1));
        d.stats.bestSafeStreak=readNumber(STORAGE_KEYS.bestSafeStreak,0);
        d.stats.totalPlayTime=readNumber(STORAGE_KEYS.totalPlayTime,0);
        d.settings.sound=localStorage.getItem(STORAGE_KEYS.sound)!=="false";
        d.settings.music=localStorage.getItem(STORAGE_KEYS.music)!=="false";
        d.settings.vibration=localStorage.getItem(STORAGE_KEYS.vibration)!=="false";
    }catch(error){console.error("Coin Catcher load failed:",error);}
    return d;
}

function savePlayerData(){
    try{
        localStorage.setItem(STORAGE_KEYS.coins,String(Math.max(0,Math.floor(playerData.coins))));
        localStorage.setItem(STORAGE_KEYS.lives,String(Math.max(0,Math.floor(playerData.lives))));
        localStorage.setItem(STORAGE_KEYS.playerXP,String(Math.max(0,Math.floor(playerData.playerXP))));
        localStorage.setItem(STORAGE_KEYS.playerLevel,String(Math.max(1,Math.floor(playerData.playerLevel))));
        localStorage.setItem(STORAGE_KEYS.currentSkin,playerData.currentSkin||"default");
        localStorage.setItem(STORAGE_KEYS.unlockedSkins,JSON.stringify(playerData.unlockedSkins||["default"]));
        localStorage.setItem(STORAGE_KEYS.achievements,JSON.stringify(playerData.achievements||[]));
        localStorage.setItem(STORAGE_KEYS.redeemedCodes,JSON.stringify(playerData.redeemedCodes||[]));
        localStorage.setItem(STORAGE_KEYS.basketX,String(Number.isFinite(Number(basketX))?basketX:0));
        localStorage.setItem(STORAGE_KEYS.basketY,String(Number.isFinite(Number(basketY))?basketY:0));
        const s=playerData.stats||{};
        localStorage.setItem(STORAGE_KEYS.bestScore,String(Math.floor(s.bestScore||0)));
        localStorage.setItem(STORAGE_KEYS.gamesPlayed,String(Math.floor(s.gamesPlayed||0)));
        localStorage.setItem(STORAGE_KEYS.totalCoins,String(Math.floor(s.totalCoins||0)));
        localStorage.setItem(STORAGE_KEYS.totalDiamonds,String(Math.floor(s.totalDiamonds||0)));
        localStorage.setItem(STORAGE_KEYS.totalGoldenCoins,String(Math.floor(s.totalGoldenCoins||0)));
        localStorage.setItem(STORAGE_KEYS.bombHits,String(Math.floor(s.bombHits||0)));
        localStorage.setItem(STORAGE_KEYS.bestCombo,String(Math.floor(s.bestCombo||0)));
        localStorage.setItem(STORAGE_KEYS.highestLevel,String(Math.max(1,Math.floor(s.highestLevel||1))));
        localStorage.setItem(STORAGE_KEYS.bestSafeStreak,String(Math.floor(s.bestSafeStreak||0)));
        localStorage.setItem(STORAGE_KEYS.totalPlayTime,String(Math.floor(s.totalPlayTime||0)));
        localStorage.setItem(STORAGE_KEYS.sound,String(!!playerData.settings.sound));
        localStorage.setItem(STORAGE_KEYS.music,String(!!playerData.settings.music));
        localStorage.setItem(STORAGE_KEYS.vibration,String(!!playerData.settings.vibration));
        /* Compatibility backup for older builds. */
        localStorage.setItem("coinCatcherSave_v1",JSON.stringify(playerData));
    }catch(error){console.error("Coin Catcher save failed:",error);}
}

function showScreen(screenName){
    Object.values(screens).forEach(screen=>{
        if(screen)screen.classList.remove("active");
    });
    const target=screens[screenName];
    if(target)target.classList.add("active");
    updateAllUI();
}

function openHome(){showScreen("home");}
function openPage(page){showScreen(page);}

function updateAllUI(){
    updateHomeUI();
    updateGameUI();
    updateStatsUI();
    updateAchievementsUI();
    updateShopUI();
    updateSettingsUI();
}

function updateHomeUI(){
    setText("coinBalance",formatNumber(playerData.coins));
    setText("lifeBalance",playerData.lives);
    setText("playerLevel",playerData.playerLevel);

    const xpProgress=document.getElementById("xpProgress");
    const xpText=document.getElementById("xpText");

    if(xpProgress){
        const xp=playerData.playerXP%GAME_CONFIG.XP_PER_LEVEL;
        xpProgress.style.width=`${(xp/GAME_CONFIG.XP_PER_LEVEL)*100}%`;
    }

    if(xpText){
        const xp=playerData.playerXP%GAME_CONFIG.XP_PER_LEVEL;
        xpText.textContent=`${xp} / ${GAME_CONFIG.XP_PER_LEVEL} XP`;
    }
}

function updateGameUI(){
    setText("score",formatNumber(gameState.score));
    setText("gameLevel",gameState.level);
    setText("gameCoins",formatNumber(gameState.earnedCoins));
    setText("comboCount",gameState.combo);

    const gameLives=document.getElementById("gameLives");
    const comboDisplay=document.getElementById("comboDisplay");

    if(gameLives)gameLives.textContent=createLivesDisplay(gameState.currentLives);
    if(comboDisplay)comboDisplay.classList.toggle("active",gameState.combo>=2);
}

function updateStatsUI(){
    const s=playerData.stats;
    setText("bestScore",formatNumber(s.bestScore));
    setText("gamesPlayed",formatNumber(s.gamesPlayed));
    setText("totalCoins",formatNumber(s.totalCoins));
    setText("totalDiamonds",formatNumber(s.totalDiamonds));
    setText("totalGoldenCoins",formatNumber(s.totalGoldenCoins));
    setText("bombHits",formatNumber(s.bombHits));
    setText("bestCombo",formatNumber(s.bestCombo));
    setText("highestLevel",formatNumber(s.highestLevel));
}

function setText(id,value){
    const element=document.getElementById(id);
    if(element)element.textContent=value;
}

function formatNumber(number){
    return Number(number||0).toLocaleString("en-IN");
}

function createLivesDisplay(lives){
    let result="";
    for(let i=0;i<GAME_CONFIG.MAX_LIVES;i++)result+=i<lives?"❤️ ":"🖤 ";
    return result.trim();
}

function startGame(){
    closeAllOverlays();
    clearGameTimers();
    clearFallingObjects();

    gameState.running=true;
    gameState.paused=false;
    gameState.score=0;
    gameState.level=1;
    gameState.combo=0;
    gameState.safeStreak=0;
    gameState.earnedCoins=0;
    gameState.currentLives=GAME_CONFIG.STARTING_LIVES;
    gameState.objects=[];
    gameState.elapsedTime=0;

    playerData.lives=gameState.currentLives;
    savePlayerData();

    showScreen("game");
    resetBasketPosition();
    updateAllUI();
    startGameLoop();

    /* Spawn immediately so the game can never open with an empty field. */
    const initialCount=getDifficulty(gameState.level).maxObjects;
    for(let i=0;i<initialCount;i++)spawnObject();

    scheduleNextSpawn();
}

function startGameLoop(){
    gameState.lastTime=performance.now();
    gameState.gameLoop=requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp){
    if(!gameState.running)return;

    if(gameState.paused){
        gameState.lastTime=timestamp;
        gameState.gameLoop=requestAnimationFrame(gameLoop);
        return;
    }

    const delta=Math.min((timestamp-gameState.lastTime)/16.67,3);
    gameState.lastTime=timestamp;

    updateObjects(delta);
    checkLevelProgress();

    gameState.gameLoop=requestAnimationFrame(gameLoop);
}

function getDifficulty(level){
    let maxObjects,speedMultiplier,spawnInterval,bombChance;
    if(level<=20){maxObjects=3; speedMultiplier=0.85+(level-1)*0.025; spawnInterval=1000-(level-1)*8; bombChance=level<=5?2:4+(level-5)*0.8;}
    else if(level<=40){maxObjects=4; speedMultiplier=1.35+(level-20)*0.035; spawnInterval=820-(level-20)*7; bombChance=8+(level-20)*0.55;}
    else if(level<=60){maxObjects=5; speedMultiplier=2.10+(level-40)*0.045; spawnInterval=680-(level-40)*6; bombChance=19+(level-40)*0.65;}
    else if(level<=70){maxObjects=6; speedMultiplier=3.00+(level-60)*0.06; spawnInterval=540-(level-60)*5; bombChance=32+(level-60)*1.0;}
    else if(level<=80){maxObjects=7; speedMultiplier=3.70+(level-70)*0.075; spawnInterval=460-(level-70)*4; bombChance=48+(level-70)*1.0;}
    else if(level<=90){maxObjects=8; speedMultiplier=4.55+(level-80)*0.085; spawnInterval=420-(level-80)*3; bombChance=58+(level-80)*0.55;}
    else{maxObjects=10; speedMultiplier=5.45+(level-90)*0.10; spawnInterval=390-(level-90)*3; bombChance=63+(level-90)*0.5;}
    return {maxObjects,speedMultiplier,spawnInterval:Math.max(180,spawnInterval),bombChance:Math.min(68,bombChance)};
}

function scheduleNextSpawn(){
    if(!gameState.running||gameState.paused)return;

    const difficulty=getDifficulty(gameState.level);

    gameState.spawnTimer=setTimeout(()=>{
        spawnObject();
        scheduleNextSpawn();
    },difficulty.spawnInterval);
}

function spawnObject(){
    if(!gameState.running||gameState.paused)return;

    const difficulty=getDifficulty(gameState.level);
    if(gameState.objects.length>=difficulty.maxObjects)return;

    const type=chooseObjectType(difficulty.bombChance);
    const object=document.createElement("div");

    object.className=`falling-object ${type}`;
    object.textContent=OBJECT_TYPES[type].emoji;

    const areaWidth=gameArea.clientWidth;
    const minX=8;
    const maxX=Math.max(minX,areaWidth-GAME_CONFIG.OBJECT_SIZE-8);
    const x=randomBetween(minX,maxX);
    const startY=-50;

    object.style.position="absolute";
    object.style.left=`${x}px`;
    object.style.top=`${startY}px`;
    object.style.transform="rotate(0deg)";

    gameArea.appendChild(object);

    gameState.objects.push({
        element:object,
        type,
        x,
        y:startY,
        speed:GAME_CONFIG.BASE_FALL_SPEED*difficulty.speedMultiplier*randomBetween(.9,1.12),
        rotation:randomBetween(-8,8)
    });
}

function chooseObjectType(bombChance){
    const random=Math.random()*100;
    if(random<bombChance)return"bomb";

    const roll=Math.random()*100;

    if(gameState.level>=10&&roll<6)return"golden";
    if(gameState.level>=5&&roll<18)return"diamond";
    if(gameState.level>=15&&roll<23)return"heart";

    return"coin";
}

function updateObjects(delta){
    if(!gameState.objects.length)return;

    const basketRect=basket.getBoundingClientRect();
    const areaRect=gameArea.getBoundingClientRect();

    const basketLeft=basketRect.left-areaRect.left;
    const basketRight=basketLeft+basketRect.width;
    const basketTop=basketRect.top-areaRect.top;

    for(let i=gameState.objects.length-1;i>=0;i--){
        const obj=gameState.objects[i];

        obj.y+=obj.speed*delta;
        obj.rotation+=.5*delta;

        obj.element.style.transform=`translateY(${obj.y}px) rotate(${obj.rotation}deg)`;

        const objectLeft=obj.x;
        const objectRight=obj.x+GAME_CONFIG.OBJECT_SIZE;
        const objectBottom=obj.y+GAME_CONFIG.OBJECT_SIZE;

        if(objectBottom>=basketTop&&obj.y<=basketTop+basketRect.height&&objectRight>=basketLeft&&objectLeft<=basketRight){
            handleObjectCatch(obj);
            removeObject(i);
            continue;
        }

        if(obj.y>gameArea.clientHeight+60){
            handleObjectMiss(obj);
            removeObject(i);
        }
    }
}

function handleObjectCatch(obj){
    const data=OBJECT_TYPES[obj.type];

    if(obj.type==="bomb"){
        handleBomb();
        return;
    }

    if(obj.type==="heart"){
        handleHeart();
        return;
    }

    gameState.combo++;
    gameState.safeStreak++;

    if(gameState.combo>playerData.stats.bestCombo)playerData.stats.bestCombo=gameState.combo;

    let score=data.score;
    const coinReward=data.coins;

    if(gameState.combo>=5)score=Math.round(score*1.10);
    if(gameState.combo>=10)score=Math.round(score*1.25);
    if(gameState.combo>=20)score=Math.round(score*1.50);
    if(gameState.combo>=30)score=Math.round(score*2);

    gameState.score+=score;
    gameState.earnedCoins+=coinReward;
    playerData.coins+=coinReward;
    playerData.stats.totalCoins+=coinReward;

    if(obj.type==="diamond")playerData.stats.totalDiamonds++;
    if(obj.type==="golden")playerData.stats.totalGoldenCoins++;

    if(gameState.safeStreak>playerData.stats.bestSafeStreak)playerData.stats.bestSafeStreak=gameState.safeStreak;

    addXP(1);

    showFloatingScore(obj.x,obj.y,`+${score}`);
    createParticles(obj.x,obj.y);
    vibrate([20]);

    checkAchievements();
    updateAllUI();
    savePlayerData();
}

function handleBomb(){
    gameState.currentLives--;
    gameState.combo=0;
    gameState.safeStreak=0;
    playerData.stats.bombHits++;

    vibrate([80,40,80]);
    showFloatingScore(basket.offsetLeft,basket.offsetTop-20,"-1 ❤️");

    document.body.classList.add("bomb-hit");
    setTimeout(()=>document.body.classList.remove("bomb-hit"),250);

    if(gameState.currentLives<=0){
        gameState.currentLives=0;
        updateAllUI();
        endGame();
        return;
    }

    updateAllUI();
    savePlayerData();
}

function handleHeart(){
    if(gameState.currentLives<GAME_CONFIG.MAX_LIVES){
        gameState.currentLives++;
        showFloatingScore(basket.offsetLeft,basket.offsetTop-20,"+1 ❤️");
        vibrate([25]);
    }else{
        showFloatingScore(basket.offsetLeft,basket.offsetTop-20,"FULL ❤️");
    }

    updateAllUI();
    savePlayerData();
}

function handleObjectMiss(obj){
    if(obj.type==="coin"){
        playerData.coins=Math.max(0,playerData.coins-10);
        gameState.earnedCoins-=10;
        showFloatingScore(obj.x,obj.y,"-10 🪙");
    }else if(obj.type==="diamond"||obj.type==="golden"){
        playerData.coins=Math.max(0,playerData.coins-15);
        gameState.earnedCoins=Math.max(0,gameState.earnedCoins-15);
        showFloatingScore(obj.x,obj.y,"-15 🪙");
    }
    gameState.combo=0;
    savePlayerData();
    updateAllUI();
}

function removeObject(index){
    const obj=gameState.objects[index];
    if(!obj)return;

    if(obj.element&&obj.element.parentNode)obj.element.remove();
    gameState.objects.splice(index,1);
}

function clearFallingObjects(){
    gameState.objects.forEach(obj=>{
        if(obj.element&&obj.element.parentNode)obj.element.remove();
    });
    gameState.objects=[];
}

function getRequiredScore(level){
    if(level<=0)return 0;

    if(level<GAME_CONFIG.LEVEL_SCORE_REQUIREMENTS.length){
        return GAME_CONFIG.LEVEL_SCORE_REQUIREMENTS[level];
    }

    const last=GAME_CONFIG.LEVEL_SCORE_REQUIREMENTS[GAME_CONFIG.LEVEL_SCORE_REQUIREMENTS.length-1];
    return last+(level-99)*10000;
}

function calculateLevel(score){
    let level=1;

    for(let i=1;i<=GAME_CONFIG.MAX_GAME_LEVEL;i++){
        if(score>=getRequiredScore(i))level=i;
        else break;
    }

    return level;
}

function checkLevelProgress(){
    if(!gameState.running||gameState.level>=GAME_CONFIG.MAX_GAME_LEVEL)return;

    const newLevel=calculateLevel(gameState.score);

    if(newLevel>gameState.level)levelUp(newLevel);
}

function levelUp(newLevel){
    const oldLevel=gameState.level;
    gameState.level=Math.min(GAME_CONFIG.MAX_GAME_LEVEL,newLevel);

    if(gameState.level>playerData.stats.highestLevel){
        playerData.stats.highestLevel=gameState.level;
    }

    addXP(10);

    setText("oldLevel",oldLevel);
    setText("newLevel",gameState.level);

    openOverlay(overlay.levelUp);
    vibrate([40,30,80]);

    setTimeout(()=>closeOverlay(overlay.levelUp),1300);

    checkAchievements();
    savePlayerData();
    updateAllUI();
}

function addXP(amount){
    playerData.playerXP+=amount;

    const newLevel=Math.floor(playerData.playerXP/GAME_CONFIG.XP_PER_LEVEL)+1;

    if(newLevel>playerData.playerLevel){
        playerData.playerLevel=newLevel;
        showMessage("⭐","Player Level Up!",`You reached Player Level ${newLevel}.`);
    }
}

function endGame(){
    if(!gameState.running)return;

    gameState.running=false;
    gameState.paused=false;

    clearGameTimers();
    cancelAnimationFrame(gameState.gameLoop);
    clearFallingObjects();

    playerData.stats.gamesPlayed++;
    playerData.lives=gameState.currentLives;

    addXP(Math.max(5,Math.floor(gameState.score/50)));

    let isNewRecord=false;

    if(gameState.score>playerData.stats.bestScore){
        playerData.stats.bestScore=gameState.score;
        isNewRecord=true;
    }

    if(gameState.level>playerData.stats.highestLevel){
        playerData.stats.highestLevel=gameState.level;
    }

    setText("finalScore",formatNumber(gameState.score));
    setText("finalLevel",gameState.level);
    setText("earnedCoins",formatNumber(gameState.earnedCoins));
    setText("finalBestScore",formatNumber(playerData.stats.bestScore));

    const newRecord=document.getElementById("newRecord");

    if(newRecord)newRecord.classList.toggle("active",isNewRecord);

    checkAchievements();
    savePlayerData();
    updateAllUI();
    openOverlay(overlay.gameOver);
}

function pauseGame(){
    if(!gameState.running)return;

    gameState.paused=true;
    clearTimeout(gameState.spawnTimer);
    openOverlay(overlay.pause);
}

function resumeGame(){
    if(!gameState.running)return;

    gameState.paused=false;
    closeOverlay(overlay.pause);
    gameState.lastTime=performance.now();
    scheduleNextSpawn();
}

function exitGame(){
    gameState.running=false;
    gameState.paused=false;
    clearGameTimers();
    clearFallingObjects();
    closeAllOverlays();
    openHome();
}

function clearGameTimers(){
    if(gameState.spawnTimer){
        clearTimeout(gameState.spawnTimer);
        gameState.spawnTimer=null;
    }

    if(gameState.gameLoop){
        cancelAnimationFrame(gameState.gameLoop);
        gameState.gameLoop=null;
    }
}

let basketX=0;
let pointerActive=false;

function resetBasketPosition(){
    const width=gameArea.clientWidth;
    basketX=width/2-basket.offsetWidth/2;
    applyBasketPosition();
}

function applyBasketPosition(){
    const max=gameArea.clientWidth-basket.offsetWidth;
    basketX=Math.max(0,Math.min(max,basketX));
    basket.style.left=`${basketX+basket.offsetWidth/2}px`;
}

function moveBasket(clientX){
    const rect=gameArea.getBoundingClientRect();
    basketX=clientX-rect.left-basket.offsetWidth/2;
    applyBasketPosition();
}

gameArea.addEventListener("pointerdown",event=>{
    if(!gameState.running||gameState.paused)return;
    pointerActive=true;
    moveBasket(event.clientX);
    gameArea.setPointerCapture?.(event.pointerId);
});

gameArea.addEventListener("pointermove",event=>{
    if(!pointerActive||!gameState.running||gameState.paused)return;
    moveBasket(event.clientX);
});

gameArea.addEventListener("pointerup",()=>pointerActive=false);
gameArea.addEventListener("pointercancel",()=>pointerActive=false);

document.addEventListener("keydown",event=>{
    if(!gameState.running||gameState.paused)return;

    const moveAmount=35;

    if(event.key==="ArrowLeft"||event.key.toLowerCase()==="a"){
        basketX-=moveAmount;
        applyBasketPosition();
        event.preventDefault();
    }

    if(event.key==="ArrowRight"||event.key.toLowerCase()==="d"){
        basketX+=moveAmount;
        applyBasketPosition();
        event.preventDefault();
    }

    if(event.key==="Escape")pauseGame();
});

function updateAchievementsUI(){
    const list=document.getElementById("achievementList");
    if(!list)return;

    list.innerHTML="";

    ACHIEVEMENTS.forEach(achievement=>{
        const unlocked=playerData.achievements.includes(achievement.id);
        const card=document.createElement("div");

        card.className=`achievement-card ${unlocked?"unlocked":"locked"}`;

        card.innerHTML=`
            <div class="achievement-icon">${unlocked?achievement.icon:"🔒"}</div>
            <div class="achievement-info">
                <strong>${achievement.title}</strong>
                <p>${achievement.description}</p>
            </div>
            <div class="achievement-status">${unlocked?"✓":`+${achievement.reward} 🪙`}</div>
        `;

        list.appendChild(card);
    });

    setText("achievementCount",`${playerData.achievements.length} / ${ACHIEVEMENTS.length}`);
}

function checkAchievements(){
    let changed=false;

    ACHIEVEMENTS.forEach(achievement=>{
        if(playerData.achievements.includes(achievement.id))return;

        let unlocked=false;

        try{
            unlocked=achievement.check(playerData.stats);
        }catch(error){
            unlocked=false;
        }

        if(!unlocked)return;

        playerData.achievements.push(achievement.id);
        playerData.coins+=achievement.reward;
        addXP(20);
        changed=true;

        showMessage("🏆","Achievement Unlocked!",`${achievement.title} — +${achievement.reward} Coins`);
    });

    if(changed){
        savePlayerData();
        updateAllUI();
    }
}

function updateShopUI(){
    const grid=document.getElementById("shopGrid");
    if(!grid)return;

    setText("shopCoins",formatNumber(playerData.coins));
    grid.innerHTML="";

    SHOP_ITEMS.forEach(item=>{
        const unlocked=playerData.unlockedSkins.includes(item.id);
        const selected=playerData.currentSkin===item.id;

        const card=document.createElement("div");

        card.className="shop-item";

        let buttonText;

        if(selected)buttonText="EQUIPPED";
        else if(unlocked)buttonText="EQUIP";
        else buttonText=`${formatNumber(item.price)} 🪙`;

        card.innerHTML=`
            <div class="shop-preview">${item.emoji}</div>
            <strong>${item.name}</strong>
            <small>${selected?"Currently equipped":unlocked?"Owned":"Cosmetic skin"}</small>
            <button class="shop-buy-button ${selected||unlocked?"owned":""}" data-shop-id="${item.id}">
                ${buttonText}
            </button>
        `;

        grid.appendChild(card);
    });

    document.querySelectorAll("[data-shop-id]").forEach(button=>{
        button.addEventListener("click",()=>purchaseOrEquipSkin(button.dataset.shopId));
    });
}

function purchaseOrEquipSkin(skinId){
    const item=SHOP_ITEMS.find(shopItem=>shopItem.id===skinId);
    if(!item)return;

    if(playerData.unlockedSkins.includes(skinId)){
        playerData.currentSkin=skinId;
        applyCurrentSkin();
        savePlayerData();
        updateShopUI();
        return;
    }

    if(playerData.coins<item.price){
        showMessage("🪙","Not Enough Coins",`You need ${formatNumber(item.price)} coins.`);
        return;
    }

    playerData.coins-=item.price;
    playerData.unlockedSkins.push(skinId);
    playerData.currentSkin=skinId;

    applyCurrentSkin();
    savePlayerData();
    updateAllUI();

    showMessage("🛒","Item Unlocked!",`${item.name} is now equipped.`);
}

function applyCurrentSkin(){
    const item=SHOP_ITEMS.find(shopItem=>shopItem.id===playerData.currentSkin);
    if(!item)return;

    const basketBody=basket?.querySelector(".basket-body");
    if(basketBody)basketBody.textContent=item.emoji;
}

function redeemCode(){
    const input=document.getElementById("redeemInput");
    const message=document.getElementById("redeemMessage");

    if(!input||!message)return;

    const code=input.value.trim().toUpperCase();
    message.className="redeem-message";

    if(!code){
        message.textContent="Please enter a code.";
        message.classList.add("error");
        return;
    }

    if(playerData.redeemedCodes.includes(code)){
        message.textContent="This code has already been used.";
        message.classList.add("error");
        return;
    }

    if(!Object.prototype.hasOwnProperty.call(REDEEM_CODES,code)){
        message.textContent="Invalid or expired code.";
        message.classList.add("error");
        return;
    }

    const reward=REDEEM_CODES[code];

    playerData.coins+=reward;
    playerData.redeemedCodes.push(code);

    savePlayerData();
    updateAllUI();

    input.value="";
    message.textContent=`Success! You received ${formatNumber(reward)} coins.`;
    message.classList.add("success");

    vibrate([30,30,60]);
}

function updateSettingsUI(){
    updateToggle(document.getElementById("soundToggle"),playerData.settings.sound);
    updateToggle(document.getElementById("musicToggle"),playerData.settings.music);
    updateToggle(document.getElementById("vibrationToggle"),playerData.settings.vibration);
}

function updateToggle(element,active){
    if(element)element.classList.toggle("active",active);
}

function resetProgress(){
    const ok=confirm("Reset all Coin Catcher progress?");
    if(!ok)return;
    Object.values(STORAGE_KEYS).forEach(key=>localStorage.removeItem(key));
    localStorage.removeItem("coinCatcherSave_v1");
    playerData=loadPlayerData();
    clearGameTimers();
    clearFallingObjects();
    gameState.running=false;
    gameState.paused=false;
    closeAllOverlays();
    openHome();
    updateAllUI();
}

function openOverlay(element){
    if(element)element.classList.add("active");
}

function closeOverlay(element){
    if(element)element.classList.remove("active");
}

function closeAllOverlays(){
    Object.values(overlay).forEach(element=>{
        if(element)element.classList.remove("active");
    });
}

function showMessage(icon,title,text){
    setText("messageIcon",icon);
    setText("messageTitle",title);
    setText("messageText",text);
    openOverlay(overlay.message);
}

function showFloatingScore(x,y,text){
    const element=document.createElement("div");

    element.className="floating-score";
    element.textContent=text;
    element.style.left=`${x}px`;
    element.style.top=`${y}px`;

    gameArea.appendChild(element);

    setTimeout(()=>element.remove(),800);
}

function createParticles(x,y){
    for(let i=0;i<5;i++){
        const particle=document.createElement("div");

        particle.className="particle";
        particle.style.left=`${x+18}px`;
        particle.style.top=`${y+18}px`;

        const angle=Math.random()*Math.PI*2;
        const distance=randomBetween(20,50);

        particle.style.setProperty("--particle-x",`${Math.cos(angle)*distance}px`);
        particle.style.setProperty("--particle-y",`${Math.sin(angle)*distance}px`);

        gameArea.appendChild(particle);

        setTimeout(()=>particle.remove(),700);
    }
}

function vibrate(pattern){
    if(!playerData.settings.vibration)return;
    if(navigator.vibrate)navigator.vibrate(pattern);
}

/* Buttons */

document.getElementById("playButton")?.addEventListener("click",startGame);
document.getElementById("achievementsButton")?.addEventListener("click",()=>openPage("achievements"));
document.getElementById("shopButton")?.addEventListener("click",()=>openPage("shop"));
document.getElementById("redeemButton")?.addEventListener("click",()=>openPage("redeem"));
document.getElementById("statsButton")?.addEventListener("click",()=>openPage("stats"));
document.getElementById("settingsButton")?.addEventListener("click",()=>openPage("settings"));

document.getElementById("pauseButton")?.addEventListener("click",pauseGame);
document.getElementById("resumeButton")?.addEventListener("click",resumeGame);
document.getElementById("exitGameButton")?.addEventListener("click",exitGame);
document.getElementById("pauseExitButton")?.addEventListener("click",exitGame);

document.getElementById("playAgainButton")?.addEventListener("click",startGame);

document.getElementById("gameOverHomeButton")?.addEventListener("click",()=>{
    closeAllOverlays();
    openHome();
});

document.getElementById("redeemSubmit")?.addEventListener("click",redeemCode);

document.getElementById("redeemInput")?.addEventListener("keydown",event=>{
    if(event.key==="Enter")redeemCode();
});

document.querySelectorAll("[data-back]").forEach(button=>{
    button.addEventListener("click",()=>{
        if(button.dataset.back==="homeScreen")openHome();
    });
});

document.getElementById("messageCloseButton")?.addEventListener("click",()=>closeOverlay(overlay.message));

document.getElementById("howToPlayButton")?.addEventListener("click",()=>openOverlay(overlay.howToPlay));

document.getElementById("howToPlayClose")?.addEventListener("click",()=>closeOverlay(overlay.howToPlay));

document.getElementById("soundToggle")?.addEventListener("click",()=>{
    playerData.settings.sound=!playerData.settings.sound;
    savePlayerData();
    updateSettingsUI();
});

document.getElementById("musicToggle")?.addEventListener("click",()=>{
    playerData.settings.music=!playerData.settings.music;
    savePlayerData();
    updateSettingsUI();
});

document.getElementById("vibrationToggle")?.addEventListener("click",()=>{
    playerData.settings.vibration=!playerData.settings.vibration;
    savePlayerData();
    updateSettingsUI();
});

document.getElementById("resetProgressButton")?.addEventListener("click",resetProgress);

window.addEventListener("resize",()=>{
    if(gameState.running){
        const max=gameArea.clientWidth-basket.offsetWidth;
        basketX=Math.max(0,Math.min(max,basketX));
        applyBasketPosition();
    }
});

document.addEventListener("visibilitychange",()=>{ savePlayerData(); });

setInterval(savePlayerData,5000);
window.addEventListener("pagehide",savePlayerData);
window.addEventListener("beforeunload",savePlayerData);

function initializeGame(){
    applyCurrentSkin();
    updateAllUI();
    resetBasketPosition();
}

initializeGame();
