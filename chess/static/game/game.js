const boardContainer = document.querySelector(".board-container")
const unitContainer = document.querySelector(".unitContainer")
let selected = undefined;
let unit = null;
let panel = false;
let hovering = true;
let board = [];
let id = 0;

// get the user name of the player
const username = JSON.parse(document.getElementById('username').textContent);

// change when logging in is possible
let player = {user: username, team: "Bottom", gold: 100, turn: false}
let player2 = {gold: 100}

// get the game ID and log in console
const gameId = JSON.parse(document.getElementById('game_id').textContent);
    console.log(gameId)

// connecting to the web socket with the game ID
const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/game/'
    + gameId
    + '/'
);

// if you click outside of the board, all hilights should be romoved and the side panel cleared and closed
// unless you are spawning a unit
document.addEventListener('click',(e)=>{
    if (e.target.classList != '') return
    if (selected == undefined) return
    if (unit) return
    removeHilight()
    if (panel){
        let bPanel = document.querySelector(".buildingMenu")
        let uPanel = document.querySelector(".unitsMenu")
        let detailsPanel = document.querySelector(".detailsPanel")
        detailsPanel.style.left = '-30%'
        bPanel.innerHTML = ''
        uPanel.innerHTML = ''
    }
    
    selected = undefined
})

document.addEventListener('mousemove', (e)=> {
    if (!unit) return
    unitContainer.style.left = e.clientX + 'px'
    unitContainer.style.top = e.clientY + 'px'
})

// generating the starting, empty board 9x9
for(let i=1;i<10;i++){
    for(let j=1;j<10;j++){
        let b = document.createElement("div")
        b.className = "board-space"
        b.id = id;
        b.addEventListener("click", (e) =>{
            spaceClick(e)
        });
        b.onmouseover = (e) => {mouseEnterTile(e)};
        b.onmouseleave = (e) => {mouseLeaveTile(e)};
        //change 
        board.push({X:j, Y:i, contains: null, button: b, id:id})

        // id is added to the buttons and board list elements to find board list element by button id in click event
        id++;
    }
}

// this handles all web socket messages
chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    //console.log(data)

    // switch for all types of messages
    switch(data.type){
        // debug to check whose turn it is
        case ("whoseTurn"):
            console.log(data.turn)
        break;
        // first message sent by web socket after succesfully connecting
        case ("connected"):
            console.log(data)
            player.team = data[player.user]
            player.gold = data.gold[player.user]
            player.turn = data.turn == player.team
            chatSocket.send(JSON.stringify({
                'type':'start',
                'id': gameId
            }))
        break;

        // after connecting
        // web socket recives all starting positions of pawns + cities
        // it just sends the id of the tile so it needs to be filled by "Pawn" or "Castle"
        case ("start"):
            console.log(data)
            // change to support multiple board sizes
            let top = data.top;
            let bottom = data.bottom;
            let en1 = data.enemy1;
            let en2 = data.enemy2;
            
            console.log(player)
            console.log(top, bottom)

            // change to support multiple pawn/castle types
            board[top].contains = new Pawn({owner: "top"});
            board[bottom].contains = new Pawn({owner: "bottom"});

            // currently "bots" are not working and are just standard pawn marked as an "enemy" to change their sprite's
            board[en1].contains = new Pawn({enemy: true, owner: "Bot"});
            board[en2].contains = new Pawn({enemy: true, owner: "Bot"});

            board[0].contains = new Castle({owner: "top"});
            board[board.length - 1].contains = new Castle({owner: "bottom"});
            
            if (player.team == 'top') {
                player.turn = true;
            }
            else player.turn = false

            regenBoard()
            sendBoard()
        break;

        // web socket event when a player ends their turn
        // it sends the team that ended their turn
        case ("newTurn"):
            console.log("New turn message: ")
            console.log(data)
            if(data.player != player.team) {
                player.turn = true;
                startTurn();
            }else {player.turn = false}
            // console.log("New Turn: " + data.player)
        break;

        // web socket event for when a web socket recives a new board
        // it then sends the board back to both players
        // below the board is loaded from json to a board list
        // since json doesn't have our classes, class objects like "Pawn" have to be remade with parameters from json
        case ("regenBoard"):
            // can stay for now
            for( let i = 0; i<board.length;i++ ){
                if( data.board[i].contains != null ){
                    let classConstructor = eval(data.board[i].contains.Name)
                    let instance = new classConstructor(data.board[i].contains.relevantStats)
                    board[i].contains = instance
                }
                else{
                    board[i].contains = null
                    let x = document.getElementById(i);
                    if(x.firstChild){
                        x.removeChild(x.firstChild)
                    }
                }
            }
            // in this event we also recive our, and the other players gold ammount
            // so we change those from our localy saved to those from the server
            if(data.player == player.user) player.gold = data.gold
            else player2.gold = data.gold

            // regen board to apply changes
            regenBoard()
        break;
    }
};

// all code relevant to clicking any tile on the board
function spaceClick(e) {
    let target = board[e.target.id];

    // fill pawns inRange if empty
    // inRnage hold a list of tiles and in what range are they
    // ie. in movement or in attack range or both
    // also has information if the tile has an enemy unit inside
    // it's all used to hilight the tiles correctly
    // this if also sets the curently clicked pawn as "selected"
    if(target.contains != null && selected == undefined && target.contains.owner == player.team){
        selected = target;
        if (selected.contains.inRange == null){
            selected.contains.InitRange(selected)
        }
        if(selected.contains.inRange != undefined) hilight(selected.contains.inRange);
        hilight(selected.contains.attkRange);
    }

    // we can't move, or attack if we haven't "selected" a pawn to do that with so we return
    if (selected == undefined) return

    // if we have a pawn "selected" we check if it's "Type" is "Pawn" - so a unit that can move/attack
    // or if it's a "Building" - so can't move, but has a building menu and can spawn units
    switch (selected.contains.Type) {
        case "Pawn":
            // move
            if(target.button.classList.contains("inRange") && target != selected && target.contains == null && !selected.contains.moved && selected.contains.owner == player.team && selected.contains.Type != "Building" && player.turn){
                let x = document.getElementById(selected.button.id);
                if(x.firstChild){
                    x.removeChild(x.firstChild)
                }
                selected.contains.moved = true;
                selected.contains.inRange = null;
                target.contains = selected.contains;
                selected.contains = null;
                selected = undefined;
            
                removeHilight()
                regenBoard()
            }
        
            // attack
            else if(target.button.classList.contains("hoverOverTargets") && player.turn) {
                if(selected.contains.attkRange == null) selected.contains.InitRange(selected);
                let targets = selected.contains.attackPattern(target, selected)
                //console.log(targets)
                if(targets.length > 1){
                    targets.forEach(t => {
                        let e = board[t.id];
                        if(e.contains != null && (e.contains.owner != selected.contains.owner || selected.contains.friendlyFire)){
                            e.contains.hit(selected.contains.stats.ATK)     
                            let hpLabel = e.button.querySelector(".HP")
                            hpLabel.text = e.contains.currentHP
        
                            if(e.contains.currentHP <= 0){
                                delete e.contains
                            }
                        }
                    });
                }else {
                    if(target.contains != null && (target.contains.owner != selected.contains.owner || selected.contains.friendlyFire)){
                        target.contains.hit(selected.contains.stats.ATK)     
                        let hpLabel = target.button.querySelector(".HP")
                        hpLabel.text = target.contains.currentHP
        
                        if(target.contains.currentHP <= 0){
                            player.gold += target.contains.Die.gold
                            delete target.contains
                        }
                    }
                }
            
                selected.contains.attacked = true;
                selected.contains.InitRange(selected)
                removeHilight()
                regenBoard()
            }else if(target != selected) { 
                selected = undefined;
                removeHilight()
            } 
        break;
        case "Building":
            let bPanel = document.querySelector(".buildingMenu")
            let uPanel = document.querySelector(".unitsMenu")
            let detailsPanel = document.querySelector(".detailsPanel")
            if (bPanel.innerHTML == ''){   
                detailsPanel.style.left = '0px'
                detailsPanel.querySelector(".detailsAtk").innerHTML = selected.contains.stats.ATK;
                detailsPanel.querySelector(".detailsHPCurrent").innerHTML = selected.contains.currentHP;
                detailsPanel.querySelector(".detailsHPMax").innerHTML = selected.contains.stats.maxHP;
                genBuildabels()
                genSpawnables()
                panel = true
            }
            else if (target.button.classList.contains("spawnableTile") && board[target.button.id].contains == null){
                if(unit != null){
                    board[target.button.id].contains = unit
                    unit = null
                    document.querySelector(".detailsPanel").style.left = '0px'
                    unitContainer.style.opacity = '0'
                }
            }else if(target != selected && !unit) { 
                detailsPanel.style.left = '-30%'
                selected = undefined;
                bPanel.innerHTML = ''
                uPanel.innerHTML = ''
                panel = false
                removeHilight()
            }
        break;
        default:
            { 
                selected = undefined;
                removeHilight()
            } 
        break;
    }
    regenBoard()
    sendBoard()
}

// reset "Pawn"'s and others to start a new turn
function startTurn() {
    console.log("Turn started for " + player.user)
    board.forEach(e => {
        if(e.contains){
            if (e.contains.moved) e.contains.moved = false;
            if (e.contains.attacked) e.contains.attacked = false;
        }
    })
}


// ends the player turn, sends a message to the web socket
// adds gold for the player depending onthe players buildings and upgrades
function endTurn(){
    console.log("Turn ended.")
    if (!player.turn) return;
    chatSocket.send(JSON.stringify({
        'type':'endTurn',
        'player': player.team
    }))
    board.forEach(e => {
        if(e.contains != null && e.contains.owner == player.team){
            let gains = e.contains.gains 
            if(gains){
                player.gold += gains.gold;
                console.log("Player Gold: " + player.gold)
            }      
        }
    });
}

// get list of buildables for "selected" "Building"
function genBuildabels() {
    let buildables = selected.contains.getBuildablesDOM()
    let bPanel = document.querySelector(".buildingMenu")
    buildables.forEach(e => {
        bPanel.appendChild(e)
    })
}

// get list of spawnable "Pawn"'s for "selected" "Building"
function genSpawnables() {
    let spawnables = selected.contains.getSpawnablesDOM()
    let uPanel = document.querySelector(".unitsMenu")
    spawnables.forEach(e => {
        uPanel.appendChild(e)
    })
}

// hilight a tile you hover over if it's a target you can attack
function mouseEnterTile(e) {
    let target = board[e.target.id];
    if(selected != undefined && target.button.classList.contains("attackOnly")){
        //target.button.classList.contains("attackOnly") && !selected.contains.attacked && selected.contains.owner != target.contains.owner
        if(!selected.contains.attacked) {
            let targets = [];
            targets = selected.contains.attackPattern(target, selected)
            if(targets.length > 1){  
                targets.forEach(e => {
                    board[e.id].button.classList += " hoverOverTargets";
                });
            }else {
                board[target.id].button.classList += " hoverOverTargets";
            }
        }
        hovering = true;
    }
}

// remove the hilight from hovering over a tile
function mouseLeaveTile(target) {
    if ( hovering) {
        board.forEach(e => {
            e.button.classList.remove("hoverOverTargets")
        });
    }
    hovering = false;
}

// add relevant hilights to tiles depenfing on a list that's passed in
function hilight(range) {
    // console.log(range)
    if (selected != null) selected.button.classList += " selected"
    for (let i=0;i<range.length;i++){
        if(range[i].target) {board[range[i].id].button.classList += " toAttack";}
        if(range[i].movable) {board[range[i].id].button.classList += " inRange";}
        if(range[i].attackOnly) {board[range[i].id].button.classList += " attackOnly";}
        if(range[i].spawnableTile) {board[range[i].id].button.classList += " spawnableTile";}        
    }
}

// remove all hilights from all board tiles
function removeHilight(){
    board.forEach(e => {
        e.button.classList.remove("inRange")
        e.button.classList.remove("toAttack")
        e.button.classList.remove("selected")
        e.button.classList.remove("attackOnly")
        e.button.classList.remove("spawnableTile")
        e.button.classList.remove("hoverOverTargets")
    });
}

// add the board list elements as buttons(tiles) to the board container
board.forEach(e => {
    boardContainer.appendChild(e.button)
});


// regen board to apply changes
function regenBoard(){
    //console.log("regenBoard")
    board.forEach(e => {
        if(e.contains != null){
            if(!e.button.firstChild){
                e.button.appendChild(e.contains.DOM)
            }
            e.button.querySelector(".HP").text = e.contains.currentHP;          
        }
    });
}

// send the current board to the web socket
function sendBoard(){
    let entities = board.filter(e=> {return e.contains != null})
    entities.forEach(e=>{
        board[e.id].contains.getRelevant()
    })
    chatSocket.send(JSON.stringify({
        'type':'regenBoard',
        'board': board,
        'player': player.user,
        'team': player.team,
        'gold': player.gold,
    }))
}

// buy upgrade from the "Building"'s building panel
function buyUpgrade(e) {
    if (!player.turn) return
    let target = e.target
    upgrade = selected.contains.Upgrades.find(upgrade => upgrade.name === target.dataset.name)
    console.log(upgrade)
    if(player.team == target.dataset.owner && player.gold >= parseInt(target.innerHTML)) {
        player.gold -= parseInt(target.innerHTML)
        target.dataset.bought = parseInt(target.dataset.bought) + 1
        upgrade.bought += 1
        target.innerHTML = parseInt(target.dataset.sPrice) + parseInt(target.dataset.gPrice) * parseInt(target.dataset.bought)
        if (upgrade.gold) selected.contains.gains.gold += upgrade.gold
        if (upgrade.statGains){
            selected.contains.statGains.ATK += upgrade.statGains.ATK
            selected.contains.statGains.maxHP += upgrade.statGains.maxHP
        }
    }
    sendBoard()
}

// buy "Pawn"'s(units) from the "Building"'s building panel
function buyUnit(e) {
    if (!player.turn) return
    let target = e.target
    if (player.gold < target.dataset.sPrice) return
    document.querySelector(".detailsPanel").style.left = '-30%'
    statGains = selected.contains.statGains
    unit = createUnit(statGains, target.dataset.name)
    if (!unit) return;
    document.querySelector(".unitImage").src = unit.IMG
    unitContainer.style.opacity = '0.3'
    sendBoard()
}

// creates class instances of a unit of a given name
// the "unitName" is the name of the unit and name of the Class of the unit
// "statGains" are taken from the building that creates the unit
function createUnit(statGains, unitName){
    // Access the class constructor by its name
    const classConstructor = eval(unitName);

    let base = baseStats[unitName]

    // Check if the class constructor exists
    if (typeof classConstructor === "function") {
        // Create an instance of the class
        let instance = new classConstructor({owner: player.team,
                            stats: {
                                range: base.range,
                                maxHP: base.maxHP + statGains.maxHP,
                                ATK: base.ATK + statGains.ATK,
                                currentHP: base.maxHP,
                            }});
        console.log(instance)
        return instance
    } else {
        console.error(`Class '${unitName}' not found`);
        return 0
    }
}

// dev function to clear all boards that the server has in it's memory
function devClear() {
    chatSocket.send(JSON.stringify({
        'type':'clear',
    }))
}

// dev function to ask the server whose function it is
function askTurn() {
    chatSocket.send(JSON.stringify({
        'type':'askTurn',
    }))
    return "Asking..."
}