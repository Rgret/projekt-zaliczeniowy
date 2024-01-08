// change to be like in upgrades case cuz json doesn't like functions
let baseKill = {gold: 10}

let baseStats = {'Pawn': {range: 4, ATK: 5, maxHP: 10, sPrice: 30},
                'Laser': {range: 6, ATK: 6, maxHP: 15, sPrice: 50}}

let allUnits = {
    "Pawn":   {dispName: "Pawn", name: "Pawn", type: "Pawn", sPrice: baseStats.Pawn.sPrice, base: true,
                    IMG: {'top': window.staticUrls.pawn_icon, 'bottom': window.staticUrls.pawn_icon}},
    "Laser":    {dispName: "Laser Bearer" ,name: "Laser", type: "Pawn", sPrice: baseStats.Laser.sPrice, base: false}
}

let baseUnits = Object.values(allUnits).filter(unit => unit.base === true);



let allUpgrades = {
    "Gold Mine": {name: "Gold mine", gold: 30, sPrice: 90, gPrice: 20, bought: 0, base: true, buyEffect: false,
        description: "30 additional gold at the end of each round.", effect: false},
    "Lasers": {name: "Lasers", gold: 0, sPrice: 90, gPrice: 20, bought: 0, base: true, buyEffect: true,
        description: "Testing", effect: (e)=>addUnit(e, "Laser", "Lasers")},
    "Stables": {name: "Stables", gold: 0, sPrice: 10, gPrice: 0, bought: 0, base: true, buyEffect: true,
        description: "Testing", effect: (e)=>addStats(e, {ATK: 1, maxHP: 1})},
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