const boardContainer = document.querySelector(".board-container")
let selected_id = undefined;
let board = [];
let id = 0;

for(let i=1;i<10;i++){
    for(let j=1;j<10;j++){
        let b = document.createElement("div")
        b.className = "board-space"
        b.id = id;
        b.addEventListener("click", (e) =>{
            spaceClick(e)
        });
        board.push({X:i, Y:j, contains: null, button:b, inRange: false,})
        id++;
    }
}

console.log(board)

board.forEach(e => {
    boardContainer.appendChild(e.button)
});

function isSelected(obj){
    return obj.button.id === selected_id
}

function spaceClick(e){
    if(selected_id != undefined) {
        selected_id = e.target.id;
        let selected = board.find(isSelected)
        if(!selected.inRange){
            board.forEach(e => {
                e.button.classList.remove("inRange")
                e.button.classList.remove("selected")
                e.inRange = false
            })
            selected_id = undefined
        }else {
            console.log("move")
        }
    }
    else {
        selected_id = e.target.id;
        let selected = board.find(isSelected)
        selected.button.className += " selected"
        board.forEach(e => {
            if(((e.X - selected.X)**2 + (e.Y - selected.Y)**2)<=10) {
                e.button.className += " inRange"
                e.inRange = true
            }
        })
    }
}