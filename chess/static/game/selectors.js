// movement range
function selectInRange(tile, range, allInRange = false, options = {movable: false, target: false, attackOnly: false, spawnableTile: false, onSelf: false}){
    let selected = []
    board.forEach(e => {
        let distance = (tile.X - e.X)**2 + (tile.Y - e.Y)**2
        if (distance <= (range**2) && e != tile){
            if (allInRange) selected.push({id: e.id, movable: options.movable, target: options.target, attackOnly: options.attackOnly, spawnableTile: options.spawnableTile});
            else if ( e.contains != null) selected.push({id: e.id, movable: options.movable, target: options.target, attackOnly: options.attackOnly, spawnableTile: options.spawnableTile});
        }
    });
    return selected
}

// change to support multiple board sizes
// Get nerby tiles 
// + + +
// + t +
// + + +
function getNeighbours(tile, allInRange = false, options = {movable: false, target: false, attackOnly: false, spawnableTile: false, onSelf: false}) {
    let neighbours = []
    board.forEach(e=>{
        let distance = (tile.X - e.X)**2 + (tile.Y - e.Y)**2;
        if (distance <= 2 && e.id != tile.id){
            if (e.contains != null || allInRange) neighbours.push({id: e.id, movable: options.movable, target: options.target, attackOnly: options.attackOnly, spawnableTile: options.spawnableTile});
        }
    });
    return neighbours
}

// - + -
// + t +
// - + -
function crossSelector(tile, allInRange = false, options = {movable: false, target: false, attackOnly: false, spawnableTile: false, onSelf: false}){
    let selected = []
    board.forEach(e=>{
        let distance = (tile.X - e.X)**2 + (tile.Y - e.Y)**2;
        if (distance < 2 && (e.id != tile.id || options.onSelf)){
            if (!tile.contains.attacked){
                if (e.contains != null && e.contains.owner != tile.contains.owner) selected.push({id: e.id, movable: options.movable, target: options.target, attackOnly: options.attackOnly, spawnableTile: options.spawnableTile});
                else if (allInRange) selected.push({id: e.id, target: allInRange});
            }else if (allInRange) selected.push({id: e.id, target: allInRange}); 
        }
    });
    return selected
}