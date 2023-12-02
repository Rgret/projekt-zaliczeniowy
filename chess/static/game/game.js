const boardContainer = document.querySelector(".board-container")
let selected = undefined;
let mode = null;
let hovering = true;
let board = [];
let id = 0;

// change when logging in is possible
player = {team: "Bottom", gold: 100, turn: true}

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
        // all "start" type socket events likely need a change
        case ("start"):
            // change to support multiple board sizes
            let top = data.top;
            let bottom = data.bottom+71;
            let en1 = data.enemy1+20;
            let en2 = data.enemy2+20;
            console.log(top, bottom)

            // change to support multiple pawn/castle types
            board[top].contains = new Pawn({owner: "Top"});
            board[bottom].contains = new Pawn({owner: "Bottom"});
            board[en1].contains = new Pawn({enemy: true, owner: "Bot"});
            board[en2].contains = new Pawn({enemy: true, owner: "Bot"});
            board[0].contains = new Castle({owner: "Top"});
            board[board.length - 1].contains = new Castle({owner: "Bottom"});
            regenBoard()
        break;
        case ("move"):
            // can stay for now
            board[data.end].contains = board[data.start].contains
            board[data.start].contains = null;
            selected = undefined;
            regenBoard()
        break;
        case ("regenBoard"):
            // can stay for now
            for( let i = 0; i<board.length;i++ ){
                if( data.board[i].contains != null ){
                    switch(data.board[i].contains.Type){
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
//  is good now
//#
function spaceClick(e) {
    let target = board[e.target.id];
    console.log(target)
    switch (mode){
        default:
            // fill pawns inRange if empty
            if(target.contains != null && selected == undefined && target.contains.owner == player.team){
                selected = target;
                if (selected.contains.inRange == null){
                    selected.contains.InitRange(selected)
                }
                if(selected.contains.inRange != undefined) hilight(selected.contains.inRange);
                hilight(selected.contains.attkRange);
            }

            // move
            else if(target.button.classList.contains("inRange") && target != selected && target.contains == null && !selected.contains.moved && selected.contains.owner == player.team && selected.contains.Type != "Castle"){
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
            else if(target.button.classList.contains("attackOnly") && !selected.contains.attacked && selected.contains.owner != target.contains.owner) {
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
                removeHilight()
                regenBoard()
            }

            // 
            else { 
                selected = undefined;
                removeHilight()
            } 
            regenBoard()
            sendBoard()
        break;
    }
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