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

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log(data)
    switch(data.type){
        case ("start"):
            let top = data.top;
            let bottom = data.bottom+74;
            let en1 = data.enemy1+20;
            let en2 = data.enemy2+20;
            console.log(top, bottom)
            board[top].contains.pawn = new Pawn();
            board[bottom].contains.pawn = new Pawn();
            board[en1].contains.pawn = new Pawn({enemy: true});
            board[en2].contains.pawn = new Pawn({enemy: true});
            regenBoard()
        break;
        case ("move"):
            console.log(data)
            board[data.end].contains.pawn = board[data.start].contains.pawn
            board[data.start].contains.pawn = null;
            board[data.start].contains.owner = null;
            selected = undefined;
            regenBoard()
        break;
        case ("regenBoard"):
            //console.log(data.board)
            for( let i = 0; i<board.length;i++ ){
                if( data.board[i].contains.pawn != null ){
                    let pawn = new Pawn({ enemy: data.board[i].contains.pawn.enemy, moved: data.board[i].contains.pawn.moved});
                    board[i].contains.pawn = pawn
                    board[i].contains.owner = data.board[i].contains.owner;
                }else{
                    board[i].contains = {pawn: null, owner: null}
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

for(let i=1;i<10;i++){
    for(let j=1;j<10;j++){
        let b = document.createElement("div")
        b.className = "board-space"
        b.id = id;
        b.addEventListener("click", (e) =>{
            spaceClick(e)
        });
        board.push({X:i, Y:j, contains: {pawn: null, owner: null}, button:b, inRange: false,})
        id++;
    }
}

function spaceClick(e) {
    let target = board[e.target.id]
    //console.log(target)

    if(target.contains.pawn != null && selected == undefined){
        selected = target;
        board.forEach(e => {
            let distance = (target.X - e.X)**2 + (target.Y - e.Y)**2
            if (distance <= target.contains.pawn.range**2){
                e.button.className += " inRange"
            }
        });
    }
    else if(target.button.classList.contains("inRange") && target != selected && target.contains.pawn == null && !selected.contains.pawn.moved){
        let x = document.getElementById(selected.button.id);
        if(x.firstChild){
            x.removeChild(x.firstChild)
        }
        selected.contains.pawn.moved = true;
        //chatSocket.send(JSON.stringify({
        //    'type':'move',
        //    'start': selected.button.id,
        //    'end': e.target.id
        //}))
        target.contains.pawn = selected.contains.pawn;
        selected.contains.pawn = null;
        selected = undefined;
        //chatSocket.send(JSON.stringify({
        //    'type':'regenBoard',
        //    'board': board
        //}))
        board.forEach(e => {
            if(e.button.classList.contains("inRange")){
                e.button.classList.remove("inRange")
            }
        });
        sendBoard()
        regenBoard()
    }  else { 
        selected = undefined;
        board.forEach(e => {
            if(e.button.classList.contains("inRange")){
                e.button.classList.remove("inRange")
            }
        });
    }  
}

board.forEach(e => {
    boardContainer.appendChild(e.button)
});

function regenBoard(){
    board.forEach(e => {
        if(e.contains.pawn != null){
            if(!e.button.firstChild){
                e.button.appendChild(e.contains.pawn.getPawn())
            }
        }
    });
}

function sendBoard(){
    let b = []
    board.forEach(e => {
        b.push(e)
    });
    chatSocket.send(JSON.stringify({
        'type':'regenBoard',
        'board': b
    }))
    //console.log(b)
}