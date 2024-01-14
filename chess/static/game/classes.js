// base entity code
// has basic information about all in game entities
// needs to be inherited by all in game entities
class Entity {
    Type = null
    Name = null
    DOM = null
    IMG = null
    atkLabel = null
    hpLabel = null
    moved = false
    attacked = false
    inRange = null
    attkRange = null
    friendlyFire = false
    winCon = false
    Die = {gold: baseKill.gold}
    stats = null
    relevantStats = {owner: this.owner,
        stats: this.stats,
        enemy: this.enemy,
        moved: this.moved,
        attacked: this.attacked,
    }
    constructor(options = {}){
        this.stats = this.initializeStats();
        Object.assign(this, options);
        let container = document.createElement('div')
        container.className += "image"

        let img = document.createElement('img');
        img.src = allUnits[this.constructor.name].IMG[this.owner]
        img.classList += " image"
        img.classList += " " + this.owner
        this.IMG = img;

        let atk = document.createElement('a');
        atk.className += "ATKLabel";
        atk.classList += " ATK"
        atk.text = this.stats.ATK;
        this.atkLabel = atk
        let atkIcon = document.createElement('img');
        atkIcon.className += "ATK";
        atkIcon.classList += " ATKIcon";
        atkIcon.src = window.staticUrls.atk_icon

        let hp = document.createElement('a');
        hp.className += "HPLabel";
        hp.classList += " HP"
        hp.text = this.stats.currentHP;
        this.hpLabel = hp
        let hpIcon = document.createElement('img');
        hpIcon.className += "HP";
        hpIcon.classList += " HPIcon";
        hpIcon.src = window.staticUrls.hp_icon

        container.appendChild(hpIcon)
        container.appendChild(atkIcon)
        container.appendChild(img)
        container.appendChild(atk)
        container.appendChild(hp)

        this.DOM = container;

        this.getRelevant()
    }
    get range() {
        return this.stats.range
    }
    get DOM() {
        this.hpLabel.text = this.stats.currentHP;
        this.atkLabel.text = this.stats.ATK;
        return this.DOM
    }
    initializeStats() {
        return {
            range: baseStats[this.constructor.name].range,
            maxHP: baseStats[this.constructor.name].maxHP,
            ATK: baseStats[this.constructor.name].ATK,
            currentHP: baseStats[this.constructor.name].maxHP,
            regen: baseStats[this.constructor.name].regen,
        };
    }
    hit(dmg){
        this.stats.currentHP -= dmg;
    }
    endTurn(){
        return false;
    }
    getRelevant(){
        this.relevantStats = {owner: this.owner,
            stats: this.stats,
            enemy: this.enemy,
            moved: this.moved,
            attacked: this.attacked,
            regen: this.regen,
        }
    }
}

// basic starter unit
class Pawn extends Entity{
    Type = "Pawn"
    Name = "Pawn"

    constructor(options = {}){
        super(options)
        this.stats = this.initializeStats();
        Object.assign(this, options);
        this.getRelevant()
    }

    InitRange(tile) {
        this.inRange = movementRange(tile, this.stats.range, true, {movable: !this.moved});
        this.attkRange = rangeSelector(tile, true, {attackOnly: !this.attacked, range: 2});
    }
    attackPattern(tile, selected = null) {
        return tile
    }
}

class Priest extends Entity{
    Type = "Pawn"
    Name = "Priest"

    constructor(options = {}){
        super(options)
        this.stats = this.initializeStats();
        Object.assign(this, options);
        this.getRelevant()
    }

    InitRange(tile) {
        this.inRange = movementRange(tile, this.stats.range, true, {movable: !this.moved});
        this.attkRange = lineSelector(tile, true, {attackOnly: !this.attacked});
    }
    attackPattern(tile, selected = null) {
        return directionalLinestSelector(tile, selected)
    }
}

class Knight extends Entity{ 
    Type = "Pawn"
    Name = "Knight"

    constructor(options = {}){
        super(options)
        this.stats = this.initializeStats();
        Object.assign(this, options);
        this.getRelevant()
    }

    InitRange(tile) {
        this.inRange = movementRange(tile, this.stats.range, true, {movable: !this.moved});
        this.attkRange = rangeSelector(tile, true, {attackOnly: !this.attacked, range: 4});
    }
    attackPattern(tile, selected = null) {
        return tile
    }
}

// 
class Archer extends Entity{
    Type = "Pawn"
    Name = "Archer"

    constructor(options = {}){
        super(options)
        this.stats = this.initializeStats();
        Object.assign(this, options);
        this.getRelevant()
    }

    InitRange(tile) {
        this.inRange = movementRange(tile, this.stats.range, true, {movable: !this.moved});
        this.attkRange = rangeSelector(tile, this.moved, {attackOnly: !this.attacked, range: 13});
    }
    attackPattern(tile, selected = null) {
        if (tile.contains == null) return
        return rangeSelector(tile, true, {attackOnly: !this.attacked, range: 2, onSelf: true});
    }
}

class Cavalry extends Entity{
    Type = "Pawn"
    Name = "Cavalry"

    constructor(options = {}){
        super(options)
        this.stats = this.initializeStats();
        Object.assign(this, options);
        this.getRelevant()
    }

    InitRange(tile) {
        let list1 = lineSelector(tile, true, {movable: !this.moved})
        let list2 = rangeSelector(tile, true, {movable: !this.moved, range: 5});

        const combinedList = list1.concat(list2);

        const uniqueList = combinedList.filter((item, index) => {
            return combinedList.indexOf(item) === index;
        });

        this.inRange = uniqueList
        this.attkRange = rangeSelector(tile, this.moved, {attackOnly: !this.attacked, range: 5});
    }
    attackPattern(tile, selected = null) {
        return tile
    }
}

class HCavalry extends Entity{
    Type = "Pawn"
    Name = "HCavalry"

    constructor(options = {}){
        super(options)
        this.stats = this.initializeStats();
        Object.assign(this, options);
        this.getRelevant()
    }

    InitRange(tile) {
        let list1 = lineSelector(tile, true, {movable: !this.moved})
        let list2 = rangeSelector(tile, true, {movable: !this.moved, range: 5});

        const combinedList = list1.concat(list2);

        const uniqueList = combinedList.filter((item, index) => {
            return combinedList.indexOf(item) === index;
        });

        this.inRange = uniqueList
        this.attkRange = rangeSelector(tile, this.moved, {attackOnly: !this.attacked, range: 5});
    }
    attackPattern(tile, selected = null) {
        return tile
    }
}

// 
class Settler extends Entity{
    Type = "Pawn"
    Name = "Settler"

    constructor(options = {}){
        super(options)
        this.stats = this.initializeStats();
        Object.assign(this, options);
        this.getRelevant()
    }

    InitRange(tile) {
        this.inRange = movementRange(tile, this.stats.range, true, {movable: !this.moved});
        this.attkRange = {};
    }
    attackPattern(tile, selected = null) {
        return {}
    }
    skill(tile) {
        if (getNeighbours(tile).some(e => e.contains === 'Building')) return;
        board[tile.id].contains = null
        board[tile.id].button.innerHTML = ''
        tile.contains = new Castle({owner: this.owner})
        player.cities += 1
        regenBoard()
        sendBoard()
        selected = undefined
        removeHilight()
        delete this
    }
    skillIcon() {
        let img = document.createElement('img')
        img.src = window.staticUrls.castle
        img.style.width = '50px'
        img.style.height = '50px'
        img.classList += " skillIcon"
        img.addEventListener('click', e => {useSkill(this)})
        return img
    }
}

// for now the only building
// represents player's "capital"
// win condition
class Castle extends Entity {
    Type = "Building"
    Name = "Castle"
    winCon = true

    relevantStats = {owner: this.owner,
        stats: this.stats,
        enemy: this.enemy,
        moved: this.moved,
        regen: this.regen,
        attacked: this.attacked,
        gains: this.gains,
        Upgardes: this.Upgrades,
        Units: this.Units,
    }

    Upgrades = baseUpgrades
    Units = baseUnits
    Unlocks = []

    statGains = {ATK: 0, maxHP: 0, regen: 0}
    gains = {
        base: Math.round(30 / player.cities),
        gold: 0
    }
    constructor(options = {}){
        super(options)
        this.stats = this.initializeStats();
        Object.assign(this, options);
        this.IMG.src = allUnits.Castle.IMG[this.owner]
        this.DOM.classList += " Castle"
    }
    getSpawnablesDOM(player) {
        let spawnables = []

        this.Units.forEach(e => {
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
            
            button.innerHTML = e.sPrice
            button.dataset.sPrice = e.sPrice
            button.dataset.name = e.name
            label.text = e.dispName
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

        this.Upgrades.forEach(e => {
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
            statGains: this.statGains,
            Upgrades: this.Upgrades,
            Units: this.Units,
            Unlocks: this.Unlocks,
        }
    }
}