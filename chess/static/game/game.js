const boardContainer = document.querySelector(".board-container")
let selected = undefined;
let mode = null;
let turn = true;
let hovering = true;
let board = [];
let id = 0;

const username = JSON.parse(document.getElementById('username').textContent);

// change when logging in is possible
let player = {user: username, team: "Bottom", gold: 100, turn: false}

const gameId = JSON.parse(document.getElementById('game_id').textContent);
    console.log(gameId)
const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/game/'
    + gameId
    + '/'
);

// change to support multiple board sizes
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
        board.push({X:i, Y:j, contains: null, button: b, id:id})
        id++;
    }
}

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    //console.log(data)
    switch(data.type){
        case ("connected"):
            player.team = data[player.user]
            chatSocket.send(JSON.stringify({
                'type':'start',
                'id': gameId
            }))
        break;
        case ("start"):
            console.log(data)
            // change to support multiple board sizes
            let top = data.top;
            let bottom = data.bottom+71;
            let en1 = data.enemy1+20;
            let en2 = data.enemy2+20;
            
            console.log(player)
            console.log(top, bottom)

            // change to support multiple pawn/castle types
            board[top].contains = new Pawn({owner: "top"});
            board[bottom].contains = new Pawn({owner: "bottom"});
            board[en1].contains = new Pawn({enemy: true, owner: "Bot"});
            board[en2].contains = new Pawn({enemy: true, owner: "Bot"});
            board[0].contains = new Castle({owner: "top"});
            board[board.length - 1].contains = new Castle({owner: "bottom"});
            
            regenBoard()
            sendBoard()
        break;
        case ("newTurn"):
            if(data.player != player.team) turn = true;
        break;
        case ("regenBoard"):
            // can stay for now
            for( let i = 0; i<board.length;i++ ){
                if( data.board[i].contains != null ){
                    switch(data.board[i].contains.Name){
                        case "Pawn":
                            let pawn = new Pawn({ enemy: data.board[i].contains.enemy, 
                                moved: data.board[i].contains.moved,
                                attacked: data.board[i].contains.attacked,
                                stats: data.board[i].contains.stats,
                                owner: data.board[i].contains.owner,
                            });
                            board[i].contains = pawn
                        break;
                        case "Castle":
                            let castle = new Castle({ enemy: data.board[i].contains.enemy, 
                                moved: data.board[i].contains.moved,
                                attacked: data.board[i].contains.attacked,
                                stats: data.board[i].contains.stats,
                                owner: data.board[i].contains.owner,
                                gains: data.board[i].contains.gains,
                            });
                            board[i].contains = castle
                        break;
                    }
                }
                else{
                    board[i].contains = null
                    let x = document.getElementById(i);
                    if(x.firstChild){
                        x.removeChild(x.firstChild)
                    }
                }
            }
            regenBoard()
        break;
    }
};

//#
//  is kinda good now
//#
function spaceClick(e) {
    let target = board[e.target.id];
    //console.log(target)
    // fill pawns inRange if empty
    if(target.contains != null && selected == undefined && target.contains.owner == player.team){
        selected = target;
        if (selected.contains.inRange == null){
            selected.contains.InitRange(selected)
        }
        if(selected.contains.inRange != undefined) hilight(selected.contains.inRange);
        hilight(selected.contains.attkRange);
    }
    switch (selected.contains.Type) {
        case "Pawn":
            // move
            if(turn && target.button.classList.contains("inRange") && target != selected && target.contains == null && !selected.contains.moved && selected.contains.owner == player.team && selected.contains.Type != "Building"){
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
            else if(turn && target.button.classList.contains("attackOnly") && !selected.contains.attacked && selected.contains.owner != target.contains.owner ) {
                if(selected.contains.attkRange == null) selected.contains.InitRange(selected);
                let targets = selected.contains.attackPattern(target)
                console.log(targets)
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
            let detailsPanel = document.querySelector(".detailsPanel")
            if (bPanel.innerHTML == ''){   
                detailsPanel.style.left = '0px'
                detailsPanel.querySelector(".detailsAtk").innerHTML = selected.contains.stats.ATK;
                detailsPanel.querySelector(".detailsHPCurrent").innerHTML = selected.contains.currentHP;
                detailsPanel.querySelector(".detailsHPMax").innerHTML = selected.contains.stats.maxHP;
                genBuildabels()
            }
            else if (target.button.classList.contains("spawnableTile")){
                console.log("castle")
            }else if(target != selected) { 
                detailsPanel.style.left = '-30%'
                selected = undefined;
                bPanel.innerHTML = ''
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

function endTurn(){
    if (!turn) return;
    turn = false;
    chatSocket.send(JSON.stringify({
        'type':'endTurn',
        'player': player.team
    }))
    board.forEach(e => {
        if(e.contains != null && e.contains.owner == player.team){
            let gains = e.contains.endTurn ()  
            if(gains){
                player.gold += gains.gold;
                console.log(player.gold)
            }      
        }
    });
}

function genBuildabels() {
    let buildables = selected.contains.getBuildablesDOM()
    let bPanel = document.querySelector(".buildingMenu")
    buildables.forEach(e => {
        bPanel.appendChild(e)
    })
}

// on mouse over an attack target
function mouseEnterTile(e) {
    let target = board[e.target.id];
    if(selected != undefined && target.contains != null){
        if(target.button.classList.contains("attackOnly") && !selected.contains.attacked && selected.contains.owner != target.contains.owner) {
            let targets = [];
            if(targets.length > 1){
                targets = selected.contains.attackPattern(target)
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

function mouseLeaveTile(target) {
    if ( hovering) {
        board.forEach(e => {
            e.button.classList.remove("hoverOverTargets")
        });
    }
    hovering = false;
}

// might need a change to support more types of hilights with less work
function hilight(range) {
    // console.log(range)
    for (let i=0;i<range.length;i++){
        if(range[i].target) {board[range[i].id].button.classList += " toAttack";}
        if(range[i].movable) {board[range[i].id].button.classList += " inRange";}
        if(range[i].attackOnly) {board[range[i].id].button.classList += " attackOnly";}
        if(range[i].spawnableTile) {board[range[i].id].button.classList += " spawnableTile";}        
    }
}

// might need a change to support more types of hilights with less work
function removeHilight(){
    board.forEach(e => {
        e.button.classList.remove("inRange")
        e.button.classList.remove("toAttack")
        e.button.classList.remove("attackOnly")
        e.button.classList.remove("spawnableTile")
        e.button.classList.remove("hoverOverTargets")
    });
}

// move some-place else in the code for clarity
board.forEach(e => {
    boardContainer.appendChild(e.button)
});


// slight change needed in the future
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

// move some-place else in the code for clarity
function sendBoard(){
    let b = []
    board.forEach(e => {
        b.push(e)
    });
    chatSocket.send(JSON.stringify({
        'type':'regenBoard',
        'board': b
    }))
}

function buyUpgrade(e) {
    let target = e.target
    if(player.team == target.dataset.owner && player.gold >= parseInt(target.innerHTML)) {
        player.gold -= parseInt(target.innerHTML)
        target.dataset.bought = parseInt(target.dataset.bought) + 1
        target.innerHTML = parseInt(target.dataset.sPrice) + parseInt(target.dataset.gPrice) * parseInt(target.dataset.bought)
    }
}