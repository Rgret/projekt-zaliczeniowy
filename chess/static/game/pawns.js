class Pawn {
    inRange = []
    range = 3
    moved = false
    enemy = false
    constructor(options = {}){
        Object.assign(this, options);
        this.img = document.createElement('img');
        this.img.src = "https://w7.pngwing.com/pngs/96/435/png-transparent-world-chess-championship-pawn-chess-piece-chess-engine-cheess-game-king-queen-thumbnail.png"
        this.img.style.height = '45px';
        this.img.style.width = '45px';
        this.img.className +="image";
        if(this.enemy){
            this.img.src = "https://w7.pngwing.com/pngs/438/667/png-transparent-chess-piece-pawn-rook-chess-king-pin-sports-thumbnail.png"
        }
    }
    getPawn(){
        return(this.img)
    }
    get range() {
        return this.range**2
    }
    get moved() {
        return this.moved
    } 
}