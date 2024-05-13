//gameboard module
const Gameboard = (function() {
    const board = [];
    function initialize() {
        for (let i = 0; i < 3; i++) {
            board.push([]);
            for(let j = 0; j < 3; j++) {
                board[board.length - 1].push(' ');
            }
        }
    }
    function display() {
        for(let i = 0; i < 3; i++) {
            console.log(`Row ${i}: ${board[i].join('|')}`);
            console.log("       _____");
        }
    }
    function makeMark(i, j, value) {
        board[i][j] = value;
    }
    function startGame() {
        let args = [];
        initialize();
        display();
        for(let i = 0; i < 9; i++) {
            setTimeout(10000);
            args.push(prompt("Enter Row: "));
            args.push(prompt("Enter Column: "));
            args.push(prompt("Enter Mark: "));
            makeMark(parseInt(args[0]), parseInt(args[1]), args[2]);
            args.splice(0, 3);
            display();
        }
    }

    startGame();

    return { board, makeMark, display };
})();