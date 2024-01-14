// change to be like in upgrades case cuz json doesn't like functions
let baseKill = {gold: 10}

let baseStats = {'Castle': {range: 0, ATK: 15, maxHP: 35, sPrice: 0, regen: 5},
                'Pawn': {range: 4, ATK: 3, maxHP: 4, sPrice: 30, regen: 1},
                'Settler': {range: 3, ATK: 0, maxHP: 5, sPrice: 90, regen: 1},
                'Archer': {range: 3, ATK: 6, maxHP: 3, sPrice: 40, regen: 1},
                'Cavalry': {range: 5, ATK: 6, maxHP: 6, sPrice: 50, regen: 1},
                'HCavalry': {range: 5, ATK: 10, maxHP: 15, sPrice: 80, regen: 2},
                'Knight': {range: 3, ATK: 5, maxHP: 25, sPrice: 80, regen: 4},
                'Priest': {range: 3, ATK: 20, maxHP: 7, sPrice: 80, regen: 1},
            }

let allUnits = {
    "Castle": {dispName: "Castle", name: "Castle", type: "Building", sPrice: null, base: false, requirements: ["Unobtainable"],
                    IMG: {'top': window.staticUrls.castle, 'bottom': window.staticUrls.castle}},
    "Pawn":   {dispName: "Pawn", name: "Pawn", type: "Pawn", sPrice: baseStats.Pawn.sPrice, base: true,
                    IMG: {'top': window.staticUrls.pawn_icon, 'bottom': window.staticUrls.pawn_icon}},
    "Settler": {dispName: "Settler", name: "Settler", type: "Pawn", sPrice: baseStats.Settler.sPrice, base: true,
                    IMG: {'top': window.staticUrls.settler_icon, 'bottom': window.staticUrls.settler_icon}},
    "Archer": {dispName: "Archer", name: "Archer", type: "Pawn", sPrice: baseStats.Archer.sPrice, base: true,
                    IMG: {'top': window.staticUrls.archer_icon, 'bottom': window.staticUrls.archer_icon}},
    "Cavalry": {dispName: "Cavalry", name: "Cavalry", type: "Pawn", sPrice: baseStats.Cavalry.sPrice, base: false, requirements: ["Stables"],
                    IMG: {'top': window.staticUrls.cavalry_icon, 'bottom': window.staticUrls.cavalry_icon}},
    "HCavalry": {dispName: "Heavy Cavalry", name: "HCavalry", type: "Pawn", sPrice: baseStats.Cavalry.sPrice, base: false, requirements: ["Stables", "Armor Smith", "Weapon Smith"],
                    IMG: {'top': window.staticUrls.hcavalry_icon, 'bottom': window.staticUrls.hcavalry_icon}},
    "Knight": {dispName: "Knight", name: "Knight", type: "Pawn", sPrice: baseStats.Cavalry.sPrice, base: false, requirements: ["Armor Smith", "Weapon Smith"],
                    IMG: {'top': window.staticUrls.knight_icon, 'bottom': window.staticUrls.knight_icon}},
    "Priest": {dispName: "Priest", name: "Priest", type: "Pawn", sPrice: baseStats.Cavalry.sPrice, base: false, requirements: ["Armor Smith", "Weapon Smith", "Gold Mine"],
                    IMG: {'top': window.staticUrls.priest_icon, 'bottom': window.staticUrls.priest_icon}},
}

let baseUnits = Object.values(allUnits).filter(unit => unit.base === true);

let allUpgrades = {
    "Mining Permission": {name: "Mining Permission", gold: 0, sPrice: 40, gPrice: 0, bought: 0, base: true, buyEffect: true,
        description: "Allows for construction of other buildings.", effect: (e)=>addUpgrades(e, ["Gold Mine", "Smeltery"], "Mining Permission")},
    "Smeltery": {name: "Smeltery", gold: 0, sPrice: 30, gPrice: 0, bought: 0, base: false, buyEffect: true,
        description: "Allows for construction of other buildings.", effect: (e)=>addUpgrades(e, ["Armor Smith", "Weapon Smith"], "Smeltery")},
    "Gold Mine": {name: "Gold Mine", gold: 60, sPrice: 90, gPrice: 20, bought: 0, base: false, buyEffect: true,
        description: "30 additional gold at the end of each round.", effect: (e)=>addUnlock(e, "Gold Mine", false)},
    "Stables": {name: "Stables", gold: 0, sPrice: 20, gPrice: 0, bought: 0, base: true, buyEffect: true,
        description: "Unlock horses.", effect: (e)=>addUnlock(e, "Stables")},
    "Armor Smith": {name: "Armor Smith", gold: 0, sPrice: 20, gPrice: 10, bought: 0, base: false, buyEffect: true,
        description: "Unlock armor and +1 HP.", effect: (e)=>{addStats(e, {maxHP: 1}); addUnlock(e, "Armor Smith", false)}},
    "Weapon Smith": {name: "Weapon Smith", gold: 0, sPrice: 20, gPrice: 10, bought: 0, base: false, buyEffect: true,
        description: "Unlock weapons and +1 ATK.", effect: (e)=>{addStats(e, {ATK: 1}); addUnlock(e, "Weapon Smith", false)}},
    "Healer's Hut": {name: "Healer's Hut", gold: 0, sPrice: 150, gPrice: 100, bought: 0, base: false, buyEffect: true,
        description: "+1 HP regen", effect: (e)=>{addStats(e, {regen: 1})}},
}

let baseUpgrades = Object.values(allUpgrades).filter(upgrade => upgrade.base === true);

function addUnlock(e, building, remove=false) {
    if (!e.Unlocks.includes(building)) e.Unlocks.push(building);
    Object.values(allUnits).forEach(unit => {
        if (unit.base) return;
        if (unit.requirements.every(req => e.Unlocks.includes(req)) && !e.Units.some(e => e.name === unit.name)) e.Units.push(unit);
    });

    if(!remove) return;
    e.Upgrades = e.Upgrades.filter(upgrade => upgrade.name !== building);
}

function addStats(e, stats) {
    e.statGains.ATK += stats.ATK
    e.statGains.maxHP += stats.maxHP
    e.statGains.regen += stats.regen
    e.getRelevant()
}

function addUpgrades(e, toAdd, toRemove) {
    toAdd.forEach(building => {
        e.Upgrades.push(allUpgrades[building])
    })
    e.Upgrades = e.Upgrades.filter(upgrade => upgrade.name !== toRemove);
}