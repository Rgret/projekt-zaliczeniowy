// base entity code
// has basic information about all in game entities
// needs to be inherited by all in game entities
class Entity {
    Type = null
    owner = null
    DOM = null
    IMG = null
    atkLabel = null
    hpLabel = null
    moved = false
    attacked = false
    inRange = null
    attkRange = null
    friendlyFire = false
    stats = {
        range: 0,
        maxHP: 10,
        ATK: 5,
        currentHP: 10,
    }
    constructor(options = {}){
        Object.assign(this, options);
        let container = document.createElement('div')
        container.className += "image"

        let img = document.createElement('img');
        img.src = "https://w7.pngwing.com/pngs/96/435/png-transparent-world-chess-championship-pawn-chess-piece-chess-engine-cheess-game-king-queen-thumbnail.png"
        img.width = "45";
        img.height = "45";
        this.IMG = img;

        let atk = document.createElement('a');
        atk.className += "ATK";
        atk.text = this.stats.ATK;
        this.atkLabel = atk

        let hp = document.createElement('a');
        hp.className += "HP";
        hp.text = this.stats.currentHP;
        this.hpLabel = hp

        if(this.owner == "Bot"){
            img.src = "https://w7.pngwing.com/pngs/438/667/png-transparent-chess-piece-pawn-rook-chess-king-pin-sports-thumbnail.png"
        }
        if(this.owner == "Top"){
            img.src = "https://cdn-icons-png.flaticon.com/512/647/647924.png"
        }
        container.appendChild(img)
        container.appendChild(atk)
        container.appendChild(hp)

        this.DOM = container;

        this.getRelevant()
    }
    get range() {
        return this.stats.range
    }
    get currentHP() {
        return this.stats.currentHP
    }
    set currentHP(value) {
        this.stats.currentHP = value
    }
    set owner(value){
        this.owner = value
    }
    get owner() {
        return this.owner
    }
    get moved() {
        return this.moved
    }
    set moved(value) {
        this.moved = value
    }
    get attacked() {
        return this.attacked
    }
    set attacked(value) {
        this.attacked = value
    }
    get inRange() {
        return this.inRange;
    }
    get attkRange() {
        return this.attkRange;
    }
    get hpLabel() {
        return this.hpLabel
    }
    get friendlyFire() {
        return this.friendlyFire;
    }
    get DOM() {
        this.hpLabel.text = this.stats.currentHP;
        this.atkLabel.text = this.stats.ATK;
        return this.DOM
    }
    get Type(){
        return this.Type
    }
    hit(dmg){
        this.stats.currentHP -= dmg;
    }
    endTurn(){
        return false;
    }
    getRelevant(){
        return 1
    }
}

// need it here cuz will be needed elsewhere in the code
// base stats and "on death" effects of units
let baseKill = {gold: 10, effect: () => {return 0}}
let baseStats = {'Pawn': {range: 4, ATK: 5, maxHP: 10, sPrice: 30},
                'Cavlary': {range: 6, ATK: 6, maxHP: 15, sPrice: 50}}


// basic starter unit
class Pawn extends Entity{
    Type = "Pawn"
    Name = "Pawn"
    Die = {gold: baseKill.gold, effect: baseKill.effect}

    relevantStats = {owner: this.owner,
        stats: this.stats,
        enemy: this.enemy,
        moved: this.moved,
        attacked: this.attacked,
    }

    stats = {
        range: baseStats.Pawn.range,
        maxHP: baseStats.Pawn.maxHP,
        ATK: baseStats.Pawn.ATK,
        currentHP: baseStats.Pawn.maxHP,
    }

    constructor(options = {}){
        super(options)
        Object.assign(this, options);
        this.IMG = "https://w7.pngwing.com/pngs/96/435/png-transparent-world-chess-championship-pawn-chess-piece-chess-engine-cheess-game-king-queen-thumbnail.png"
        this.getRelevant()
    }

    InitRange(tile) {
        this.inRange = selectInRange(tile, this.stats.range, true, {movable: !this.moved});
        this.attkRange = crossSelector(tile, true, {attackOnly: !this.attacked});
    }
    attackPattern(tile, selected = null) {
        return tile
    }
    getRelevant(){
        this.relevantStats = {owner: this.owner,
            stats: this.stats,
            enemy: this.enemy,
            moved: this.moved,
            attacked: this.attacked,
        }
    }
}


// for now the only building
// represents player's "capital"
// win condition
class Castle extends Entity {
    Type = "Building"
    Name = "Castle"

    relevantStats = {owner: this.owner,
        stats: this.stats,
        enemy: this.enemy,
        moved: this.moved,
        attacked: this.attacked,
        gains: this.gains,
        Upgardes: this.Upgrades,
        Units: this.Units,
    }

    Upgrades = [
        {name: "Gold mine", gold: 30, sPrice: 90, gPrice: 20, bought: 0, 
            description: "30 additional gold at the end of each round."},
    ]
    Units = [
        {name: "Pawn", type: "Pawn", sPrice: baseStats.Pawn.sPrice},
    ]
    statGains = {ATK: 0, maxHP: 0,}
    gains = {
        gold: 10
    }
    constructor(options = {}){
        super(options)
        Object.assign(this, options);
        this.IMG.src = ""
        this.DOM.classList += " Castle"
    }
    getSpawnablesDOM(player) {
        let spawnables = []

        let container = document.createElement('div')
        container.classList += " spawnablesContainer"

        let button = document.createElement('button')
        button.classList += " buyUnit"
        container.appendChild(button)

        let label = document.createElement('a')
        label.classList += " spawnablesLabel"
        container.appendChild(label)
        
        let desc = document.createElement('p')
        desc.classList += " unitDesc"
        container.appendChild(desc)

        this.Units.forEach(e => {
            button.innerHTML = e.sPrice
            button.dataset.sPrice = e.sPrice
            button.dataset.name = e.name
            label.text = e.name
            desc.text = e.description
            button.addEventListener("click", e=> {
                buyUnit(e)
            });
            spawnables.push(container)
        });
        return spawnables
    }
    getBuildablesDOM(player) {
        let buildables = []

        let container = document.createElement('div')
        container.classList += " upgradeContainer"

        let button = document.createElement('button')
        button.classList += " buyUpgrade"
        container.appendChild(button)

        let label = document.createElement('a')
        label.classList += " upgradeLabel"
        container.appendChild(label)

        let desc = document.createElement('p')
        desc.classList += " buildingDesc"
        container.appendChild(desc)

        this.Upgrades.forEach(e => {
            button.innerHTML = e.sPrice + e.gPrice * e.bought
            button.dataset.name = e.name
            button.dataset.sPrice = e.sPrice
            button.dataset.gPrice = e.gPrice
            button.dataset.bought = e.bought
            button.dataset.owner = this.owner
            label.text = e.name
            desc.innerHTML = e.description
            button.addEventListener("click", (e) => {
                buyUpgrade(e)
            });
            buildables.push(container)
        })
        return buildables
    }
    InitRange(tile) {
        this.inRange = undefined;
        this.attkRange = getNeighbours(tile, !this.attacked, {attackOnly: !this.attacked, spawnableTile: true});
    }
    attackPattern(tile) {
        return tile
    }
    endTurn() {
        return gains
    }
    getRelevant(){
        this.relevantStats = {owner: this.owner,
            stats: this.stats,
            enemy: this.enemy,
            moved: this.moved,
            attacked: this.attacked,
            gains: this.gains,
            Upgardes: this.Upgrades,
            Units: this.Units,
        }
    }
}