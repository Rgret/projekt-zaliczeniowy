const boardContainer = document.querySelector(".board-container")
const unitContainer = document.querySelector(".unitContainer")
const playerBarTop = document.querySelector(".playerTop")
const playerBarBottom = document.querySelector(".playerBottom")
const turnNotif = document.querySelector(".turnNotif")
const skillContainer = document.querySelector(".skillContainer")
const loadingScreen = document.querySelector(".loadingScreen")

const goldIcons = document.querySelectorAll(".goldIcon")

let selected = undefined;
let unit = null;
let panel = false;
let hovering = true;
let board = [];
let boardSize = 10;
let id = 0;
let turn = 0;

// get the user name of the player
const username = JSON.parse(document.getElementById('username').textContent);

// change when logging in is possible
let player = {user: username, team: "bottom", gold: 100, turn: false, cities: 1, gains: 30}
let player2 = {user: null, team: null, gold: 100, turn: false, cities: 1, gains: 30}

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

function loaded() {
    console.log("loaded")
    goldIcons.forEach(e=>{
        e.src = window.staticUrls.gold_icon
    })
    reset_animation('.timer')
    loadingScreen.style.opacity = '0'
    loadingScreen.style.pointerEvents = 'none';
}

document.addEventListener('mousemove', (e)=> {
    if (!unit) return
    unitContainer.style.left = e.clientX + 'px'
    unitContainer.style.top = e.clientY + 'px'
})

function reset_animation(query) {
    var el = document.querySelector(query);
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = null; 
  }

// generating the starting, empty board
for(let i=1;i<=boardSize;i++){
    for(let j=1;j<=boardSize;j++){
        let b = document.createElement("div")
        b.className = "board-space"
        b.style.minWidth = 675/boardSize + "px";
        b.style.minHeight = 675/boardSize + "px";
        b.id = id;
        b.addEventListener("click", (e) =>{
            spaceClick(e)
        });
        b.onmouseover = (e) => {mouseEnterTile(e)};
        b.onmouseleave = (e) => {mouseLeaveTile(e)};

        board.push({X:j, Y:i, contains: null, button: b, id:id})

        // id is added to the buttons and board list elements to find board list element by button id in click event
        id++;
    }
}

//document.getElementsByClassName("board-space").style.minWidth = 450/boardSize + "px";
//document.getElementsByClassName("board-space").style.minHeight = 450/boardSize + "px";
//        
//document.querySelectorAll(".image").style.maxWidth = Math.floor(450/boardSize*0.9) + "px";
//document.querySelectorAll(".image").style.maxHeight = Math.floor(450/boardSize*0.9) + "px";

function redirect(){
    window.location.href = window.staticUrls.home
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
        // game ended
        case ("gameEnd"):
            let modal = document.querySelector('.endModal')
            modal.style.display = 'block'
            document.querySelector(".endNotif").textContent = `Player ${data.winner} has won!`
        break;
        // first message sent by web socket after succesfully connecting
        case ("connected"):
            console.log(data)
            //player.team = data[player.user]
            if (player.user == data.top) {
                player.team = 'top'
                player2.team = 'bottom'

                player2.user = data.bottom
            }
            else {
                player.team = 'bottom'
                player2.team = 'top'

                player2.user = data.top
            }

            player.gold = data.gold[player.user]
            player2.gold = data.gold[player2.user]

            player.turn = data.turn == player.team
            player2.turn = data.turn == player2.team
            chatSocket.send(JSON.stringify({
                'type':'start',
                'id': gameId
            }))

            playerBarTop.querySelector(".user").textContent = player.team == 'top' ? player.user : player2.user
            playerBarBottom.querySelector(".user").textContent = player.team == 'bottom' ? player.user : player2.user

            playerBarTop.querySelector(".gold").textContent = player.team == 'top' ? player.gold : player2.gold
            playerBarBottom.querySelector(".gold").textContent = player.team == 'bottom' ? player.gold : player2.gold

            playerBarTop.querySelector(".goldGains").textContent = "+".concat(player.team == 'top' ? player.gains : player2.gains)
            playerBarBottom.querySelector(".goldGains").textContent = "+".concat(player.team == 'bottom' ? player.gains : player2.gains)
        break;

        // after connecting
        // web socket recives all starting positions of pawns + cities
        // it just sends the id of the tile so it needs to be filled by "Pawn" or "Castle"
        case ("start"):
            console.log(data)

            let top = data.top;
            let bottom = data.bottom;
            
            console.log(player)
            console.log(top, bottom)

            // change to support multiple pawn/castle types
            board[top].contains = new Pawn({owner: "top"});
            board[board.length - 2].contains = new Pawn({owner: "bottom"});

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
            reset_animation('.timer')

            turn = data.turn_nr
            
            if(data.hasTurn == player.team) {
                player.turn = true;
                turnNotif.querySelector(".user").textContent = player.user
                reset_animation('.turnNotif')
                startTurn();
            }else {
                player.turn = false
                turnNotif.querySelector(".user").textContent = player2.user
                reset_animation('.turnNotif')
                // start the timer for 32s
                setTimeout(e => {timer(turn)} ,32000)
            }
            // console.log("New Turn: " + data.player)
        break;

        // web socket event for when a web socket recives a new board
        // it then sends the board back to both players
        // below the board is loaded from json to a board list
        // since json doesn't have our classes, class objects like "Pawn" have to be remade with parameters from json
        case ("regenBoard"):
            // can stay for now
            for( let i = 0; i<board.length; i++ ){
                turn = data.turn_nr
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
            player.gold = data[player.user]
            player2.gold = data[player2.user]

            // regen board to apply changes
            regenBoard()
        break;
    }
};

// round timer
function timer(nr){
    if (player.turn) return
    if (nr != turn) return
    chatSocket.send(JSON.stringify({
        'type':'switchTurn',
        'player': player.team
    }))
}


// all code relevant to clicking any tile on the board
function spaceClick(e) {
    let target = board[e.target.id];
    // fill pawns inRange if empty
    // inRange hold a list of tiles and in what range are they
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

    //
    //if (!player.turn) {removeHilight(); return;}

    // check if it has a skill and show skill button
    if (typeof selected.contains.skill === 'function' && !skillContainer.firstChild) {
        skillContainer.appendChild(selected.contains.skillIcon())
        skillContainer.style.left = '10px'
    }

    // if we have a pawn "selected" we check if it's "Type" is "Pawn" - so a unit that can move/attack
    // or if it's a "Building" - so can't move, but has a building menu and can spawn units
    switch (selected.contains.Type) {
        case "Pawn":
            // move
            if(player.turn && target.button.classList.contains("inRange") && target != selected && target.contains == null && !selected.contains.moved){
                let x = document.getElementById(selected.button.id);

                if(x.firstChild) x.removeChild(x.firstChild)

                selected.contains.moved = true;
                selected.contains.inRange = null;
                target.contains = selected.contains;
                selected.contains = null;
                selected = undefined;
            
                removeHilight()
                regenBoard()
            }
        
            // attack
            else if(player.turn && target.button.classList.contains("hoverOverTargets") && player.turn) {
                if(selected.contains.attkRange == null) selected.contains.InitRange(selected);
                let targets = selected.contains.attackPattern(target, selected)
                //console.log(targets)
                if(targets.length > 1){
                    targets.forEach(t => {
                        let e = board[t.id];
                        if(e.contains == null) return;
                        if(e.contains.owner == selected.contains.owner) return;

                        e.contains.hit(selected.contains.stats.ATK)     
                        let hpLabel = e.button.querySelector(".HPLabel")
                        hpLabel.text = e.contains.stats.currentHP
    
                        if(e.contains.stats.currentHP <= 0){
                            player.gold += target.contains != null ? target.contains.Die.gold : 0
                            if (e.contains.winCon) player2Proxy.cities = player2.cities - 1;

                            delete e.contains
                        }                 
                    });
                }else {
                    if(target.contains == null && (target.contains.owner == selected.contains.owner || !selected.contains.friendlyFire)) return;
                    
                    target.contains.hit(selected.contains.stats.ATK)     
                    let hpLabel = target.button.querySelector(".HP")
                    hpLabel.text = target.contains.stats.currentHP
    
                    if(target.contains.stats.currentHP <= 0){
                        player.gold += target.contains != null ? target.contains.Die.gold : 0
                        if (target.contains.winCon) player2Proxy.cities = player2.cities - 1;
                        delete target.contains
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
                detailsPanel.querySelector(".detailsHPCurrent").innerHTML = selected.contains.stats.currentHP;
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
            if ((e.contains.stats.currentHP + e.contains.stats.regen) > e.contains.stats.maxHP) {
                e.contains.stats.currentHP = e.contains.stats.maxHP
            }else {e.contains.stats.currentHP += e.contains.stats.regen}
        }
    })
    regenBoard()
    sendBoard()
    setTimeout(e=>{ timer2(turn) }, 34000)
}
function timer2(t) {
    if (player.turn == false) return
    if (turn != t) return
    endTurn()
}

// ends the player turn, sends a message to the web socket
// adds gold for the player depending onthe players buildings and upgrades
function endTurn(){
    console.log("Turn ended.")
    if (!player.turn) return;
    player.gold += player.gains
    playerBarTop.querySelector(".gold").textContent = player.team == 'top' ? player.gold : player2.gold
    playerBarBottom.querySelector(".gold").textContent = player.team == 'bottom' ? player.gold : player2.gold
    chatSocket.send(JSON.stringify({
        'type':'endTurn',
        'player': player.user,
        'gold': player.gold
    }))
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
    skillContainer.style.left = '-50%'
    skillContainer.innerHTML = ''
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
    player.cities = 0
    board.forEach(e => {
        if(e.contains != null){
            if(!e.button.firstChild){
                e.button.appendChild(e.contains.DOM)
            }
            e.button.querySelector(".HPLabel").text = e.contains.stats.currentHP;
            e.button.querySelector(".ATKLabel").text = e.contains.stats.ATK; 
            if (e.contains.Type == 'Building' && e.contains.owner === player.team) player.cities += 1;
            e.contains.owner == player.team ? e.button.style.outlineColor = 'green' : e.button.style.outlineColor = 'red'
            e.button.style.outlineWidth = '2px'
        }
        if(e.contains == null) {
            e.button.style.outlineColor = 'gray'
            e.button.style.outlineWidth = '1px'
        }
    });

    recalcGains()

    playerBarTop.querySelector(".gold").textContent = player.team == 'top' ? player.gold : player2.gold
    playerBarBottom.querySelector(".gold").textContent = player.team == 'bottom' ? player.gold : player2.gold
    playerBarTop.querySelector(".goldGains").textContent = "+".concat(player.team == 'top' ? player.gains : player2.gains)
    playerBarBottom.querySelector(".goldGains").textContent = "+".concat(player.team == 'bottom' ? player.gains : player2.gains)
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
        if (upgrade.gold) {
            selected.contains.gains.gold += upgrade.gold
            recalcGains()
        }
        if (upgrade.statGains){
            selected.contains.statGains.ATK += upgrade.statGains.ATK
            selected.contains.statGains.maxHP += upgrade.statGains.maxHP
        }
        if (upgrade.buyEffect) {
            allUpgrades[upgrade.name].effect(selected.contains)
            document.querySelector(".buildingMenu").innerHTML = ''
            document.querySelector(".unitsMenu").innerHTML = ''
            genBuildabels()
            genSpawnables()
        }
    }
    selected.contains.getRelevant()
    sendBoard()
}

function recalcGains() {
    let castlesTop = board.filter(e => e.contains!=null && e.contains.owner == player.team && e.contains.Type == 'Building')
    player.gains = 0;
    castlesTop.forEach(e => {
        player.gains += e.contains.gains.base
        player.gains += e.contains.gains.gold
    })

    let castlesBottom = board.filter(e => e.contains!=null && e.contains.owner == player2.team && e.contains.Type == 'Building')
    player2.gains = 0;
    castlesBottom.forEach(e => {
        player2.gains += e.contains.gains.base
        player2.gains += e.contains.gains.gold
    })

    playerBarTop.querySelector(".goldGains").textContent = "+".concat(player.team == 'top' ? player.gains : player2.gains)
    playerBarBottom.querySelector(".goldGains").textContent = "+".concat(player.team == 'bottom' ? player.gains : player2.gains)
}

function calcFunction(x) {
    // Ensure x is greater than 0
    if (x <= 0) {
      return undefined; // or handle appropriately based on your requirements
    }
  
    // When x is between 0 and 3 (inclusive), set y to 1
    if (x <= 3) {
      return 1;
    }
  
    // When x is greater than 3, make y approach 0 exponentially
    const exponentialPart = Math.exp((-x - 3)); // Exponential decay
    const y = exponentialPart;
  
    return y;
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
    player.gold -= target.dataset.sPrice
    document.querySelector(".unitImage").src = allUnits[target.dataset.name].IMG[selected.contains.owner]
    unitContainer.style.opacity = '0.3'
    sendBoard()
}

// creates class instances of a unit of a given name
// the "unitName" is the name of the unit and name of the Class of the unit
// "statGains" are taken from the building that creates the unit
function createUnit(statGains, unitName){
    // Access the class constructor by its name
    const classConstructor = eval(unitName);

    // get unit's base stats
    let base = baseStats[unitName]

    // check if the class constructor exists
    if (typeof classConstructor === "function") {
        // create an instance of the class
        let instance = new classConstructor({owner: player.team,
                            stats: {
                                range: base.range,
                                maxHP: base.maxHP + statGains.maxHP,
                                ATK: base.ATK + statGains.ATK,
                                currentHP: base.maxHP + statGains.maxHP,
                                regen: base.regen + statGains.regen,
                            }});
        console.log(instance)
        return instance
    } else {
        console.error(`Class '${unitName}' not found`);
        return 0
    }
}

function useSkill(e) {
    if (!player.turn) return
    console.log("skill used")
    e.skill(selected)
    skillContainer.style.left = '-50%'
    skillContainer.innerHTML = ''
}

let player2Proxy = new Proxy(player2, {
    set: function(target, property, value) {
        // Intercept property assignment
        if (property === "cities") {
                chatSocket.send(JSON.stringify({
                    'type':'cityRuined',
                    'player': player.user,
                    'player2': player2.user,
                    'cities': value
                }))
            }

        // Perform the default operation
        target[property] = value;

        // Indicate success
        return true;
    }
});

// dev function to clear all boards that the server has in it's memory
function devClear() {
    chatSocket.send(JSON.stringify({
        'type':'clear',
    }))

    return "Cleared all boards."
}

// dev function to ask the server whose function it is
function askTurn() {
    chatSocket.send(JSON.stringify({
        'type':'askTurn',
    }))
    return "Asking..."
}