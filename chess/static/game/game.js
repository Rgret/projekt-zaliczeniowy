const boardContainer = document.querySelector(".board-container")
let selected = undefined;
let board = [];
let id = 0;

const gameId = JSON.parse(document.getElementById('game_id').textContent);
    console.log(gameId)
const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/game/'
    + gameId
    + '/'
);

for(let i=1;i<10;i++){
    for(let j=1;j<10;j++){
        let b = document.createElement("div")
        b.className = "board-space"
        b.id = id;
        b.addEventListener("click", (e) =>{
            spaceClick(e)
        });
        //change
        board.push({X:i, Y:j, contains: null, button: b, id:id})
        id++;
    }
}

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    //console.log(data)
    switch(data.type){
        case ("start"):
            //change
            let top = data.top;
            let bottom = data.bottom+71;
            let en1 = data.enemy1+20;
            let en2 = data.enemy2+20;
            console.log(top, bottom)
            board[top].contains = new Pawn({owner: "Top"});
            board[bottom].contains = new Pawn({owner: "Bottom"});
            board[en1].contains = new Pawn({enemy: true, owner: "Bot"});
            board[en2].contains = new Pawn({enemy: true, owner: "Bot"});
            regenBoard()
        break;
        case ("move"):
            //change
            board[data.end].contains = board[data.start].contains
            board[data.start].contains = null;
            selected = undefined;
            regenBoard()
        break;
        case ("regenBoard"):
            //change
            for( let i = 0; i<board.length;i++ ){
                if( data.board[i].contains != null ){
                    let pawn = new Pawn({ enemy: data.board[i].contains.enemy, 
                                        moved: data.board[i].contains.moved,
                                        attacked: data.board[i].contains.attacked,
                                        stats: data.board[i].contains.stats,
                                        owner: data.board[i].contains.owner,
                                    });
                    board[i].contains = pawn
                }else{
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

//change
function spaceClick(e) {
    let target = board[e.target.id];
    console.log(target)
    // fill pawns inRange if empty
    if(target.contains != null && selected == undefined){
        selected = target;
        if (selected.contains.inRange == null){
            let inRange = [];
            board.forEach(e => {
                let distance = (target.X - e.X)**2 + (target.Y - e.Y)**2
                // can move/attack
                if (distance <= (selected.contains.range**2 * !selected.contains.moved)){
                    if (e.contains == null || e.contains.owner == selected.contains.owner) inRange.push({id: e.id, distance: distance, target: false, attackOnly: false})
                    else if(e.contains.owner != selected.contains.owner && distance > 2) inRange.push({id: e.id, distance: distance, target: true, attackOnly: false})
                    else if (distance < 2) inRange.push({id: e.id, distance: distance, target: true, attackOnly: true})
                }
                // can attack only
                else if (distance < 2){
                    inRange.push({id: e.id, distance: distance, target: true, attackOnly: true})
                }
            });
            selected.inRange = inRange;
        }
        hilight(selected.inRange);
    }

    // move
    else if(target.button.classList.contains("inRange") && target != selected && target.contains == null && !selected.contains.moved){
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
        target.contains.hit(selected.contains.stats.ATK)        
        console.log("att")
        let atkLabel = target.button.querySelector(".HP")
        atkLabel.text = target.contains.currentHP

        if(target.contains.currentHP <= 0){
            delete target.contains
        }

        selected.contains.attacked = true;
        regenBoard()
    }

    // 
    else { 
        selected = undefined;
        removeHilight()
    } 
    regenBoard()
    sendBoard()
}

function hilight(range) {
    for (let i=0;i<range.length;i++){
        if(range[i].target) {board[range[i].id].button.classList += " toAttack";}
        if(!range[i].target) {board[range[i].id].button.classList += " inRange";}
        if(range[i].attackOnly) {board[range[i].id].button.classList += " attackOnly";}       
    }
}

function getNeighbours(tile) {
    return([tile.id-10, tile.id-9, tile.id-8, tile.id-1, tile.id+1, tile.id+10, tile.id+9, tile.id+8])
}

function removeHilight(){
    board.forEach(e => {
        e.button.classList.remove("inRange")
        e.button.classList.remove("toAttack")
        e.button.classList.remove("attackOnly")
    });
}

//stay
board.forEach(e => {
    boardContainer.appendChild(e.button)
});


//slight change
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


//stay
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