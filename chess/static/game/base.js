// change to be like in upgrades case cuz json doesn't like functions
let baseKill = {gold: 10}

let baseStats = {'Castle': {range: 0, ATK: 10, maxHP: 25, sPrice: 0},
                'Pawn': {range: 4, ATK: 5, maxHP: 10, sPrice: 30},
                'Settler': {range: 3, ATK: 0, maxHP: 5, sPrice: 90},
                'Archer': {range: 3, ATK: 5, maxHP: 5, sPrice: 40},
                'Cavalry': {range: 6, ATK: 8, maxHP: 8, sPrice: 50},}

let allUnits = {
    "Castle": {dispName: "Castle", name: "Castle", type: "Building", sPrice: null, base: false,
                    IMG: {'top': window.staticUrls.castle, 'bottom': "#"}},
    "Pawn":   {dispName: "Pawn", name: "Pawn", type: "Pawn", sPrice: baseStats.Pawn.sPrice, base: true,
                    IMG: {'top': window.staticUrls.pawn_icon, 'bottom': "#"}},
    "Settler": {dispName: "Settler", name: "Settler", type: "Pawn", sPrice: baseStats.Settler.sPrice, base: true,
                    IMG: {'top': window.staticUrls.pawn_icon, 'bottom': '#'}},
    "Archer": {dispName: "Archer", name: "Archer", type: "Pawn", sPrice: baseStats.Archer.sPrice, base: true,
                    IMG: {'top': window.staticUrls.pawn_icon, 'bottom': '#'}},
    "Cavalry": {dispName: "Cavalry", name: "Cavalry", type: "Pawn", sPrice: baseStats.Cavalry.sPrice, base: false,
                    IMG: {'top': window.staticUrls.pawn_icon, 'bottom': '#'}},
}

let baseUnits = Object.values(allUnits).filter(unit => unit.base === true);

let allUpgrades = {
    "Mining Permission": {name: "Mining Permission", gold: 0, sPrice: 40, gPrice: 0, bought: 0, base: true, buyEffect: true,
        description: "30 additional gold at the end of each round.", effect: (e)=>addUpgrade(e, "Gold Mine", "Mining Permission")},
    "Gold Mine": {name: "Gold mine", gold: 60, sPrice: 90, gPrice: 20, bought: 0, base: false, buyEffect: false,
        description: "30 additional gold at the end of each round.", effect: false},
    "Stables": {name: "Stables", gold: 0, sPrice: 20, gPrice: 0, bought: 0, base: true, buyEffect: true,
        description: "Testing", effect: (e)=>addUnit(e, "Cavalry", "Stables")},
    "Armor Smith": {name: "Armor Smith", gold: 0, sPrice: 20, gPrice: 0, bought: 0, base: true, buyEffect: true,
        description: "Testing", effect: (e)=>addStats(e, {maxHP: 1})},
}

let baseUpgrades = Object.values(allUpgrades).filter(upgrade => upgrade.base === true);

function addUnit(e, unit, building) {
    e.Units.push(allUnits[unit]);
    e.Upgrades = e.Upgrades.filter(upgrade => upgrade.name !== building);
}

function addStats(e, stats) {
    e.statGains.ATK += stats.ATK
    e.statGains.maxHP += stats.maxHP
    e.getRelevant()
}

function addUpgrade(e, toAdd, toRemove) {
    e.Upgrades.push(allUpgrades[toAdd]);
    e.Upgrades = e.Upgrades.filter(upgrade => upgrade.name !== toRemove);
}