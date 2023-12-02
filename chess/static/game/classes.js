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
}


class Pawn extends Entity{
    Type = "Pawn"
    stats = {
        range: 6,
        maxHP: 10,
        ATK: 5,
        currentHP: 10,
    }

    constructor(options = {}){
        super(options)
        Object.assign(this, options);
    }

    InitRange(tile) {
        this.inRange = selectInRange(tile, this.stats.range, true, {movable: !this.moved});
        this.attkRange = crossSelector(tile, !this.attacked, {attackOnly: !this.attacked});
    }
    attackPattern(tile) {
        return tile
    }
}

class Castle extends Entity {
    Type = "Castle"
    constructor(options = {}){
        super(options)
        Object.assign(this, options);
        this.IMG.src = ""
        this.DOM.classList += " Castle"
    }
    InitRange(tile) {
        this.inRange = undefined;
        this.attkRange = getNeighbours(tile, !this.attacked, {attackOnly: !this.attacked, spawnableTile: true});
    }
    attackPattern(tile) {
        return tile
    }
}