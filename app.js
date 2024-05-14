//player factory function
const Player = function (mark, name) {
  function getMark() {
    return mark;
  }
  function getName() {
    return name;
  }

  return { getMark, getName };
};

//players
const playerX = Player("X", "PlayerX");
const playerO = Player("O", "PlayerO");

//gameboard module
const Gameboard = (function () {
  const board = [];
  function initialize() {
    for (let i = 0; i < 3; i++) {
      board.push([]);
      for (let j = 0; j < 3; j++) {
        board[board.length - 1].push(" ");
      }
    }
  }
  function display() {
    for (let i = 0; i < 3; i++) {
      console.log(`Row ${i}: ${board[i].join("|")}`);
      console.log("       _____");
    }
  }
  function makeMark(i, j, value) {
    board[i][j] = value;
    display();
    if (checkWin(i, j, value)) console.log("Game Won");
  }
  function checkWin(i, j, mark) {
    let win = false;
    //check main diagonal win condition
    if (win === false && i === j) {
      //check if mark is in a main diagonal square
      win = true;
      for (let k = 0; k < 3; k++) {
        if (board[k][k] !== mark) win = false;
      }
    }
    //check off diagonal win condition
    if (win === false && j === 2 - i) {
      //check if new mark is in an off diagonal square
      win = true;
      for (let k = 0; k < 3; k++) {
        if (board[k][2 - k] !== mark) win = false;
      }
    }
    //check row win condition
    if (win === false) {
      win = true;
      for (let k = 0; k < 3; k++) {
        if (board[i][k] !== mark) win = false;
      }
    }
    //check column win condition
    if (win === false) {
      win = true;
      for (let k = 0; k < 3; k++) {
        if (board[k][j] !== mark) win = false;
      }
    }
    return win;
  }
  function startGame() {
    let args = [];
    let input = "";
    initialize();
    display();
    // while(input !== "done") {
    //     args.push(prompt("Enter Row: "));
    //     args.push(prompt("Enter Column: "));
    //     args.push(prompt("Enter Mark: "));
    //     input = "done";
    //     makeMark(parseInt(args[0]), parseInt(args[1]), args[2]);    //take input and make mark
    //     display();                                                  //display board
    //     if (checkWin(parseInt(args[1]), parseInt(args[2]), args[2]) === true) {     //check if game won
    //         console.log(`Game Over`);
    //         break;
    //     }
    //     input = args[2];
    //     args.splice(0, 3);                                          //clear input array
    //     console.log('cleared');
    // }
  }

  startGame();

  return { board, makeMark, display };
})();

const DomHandler = (function () {
  const board = document.querySelector("#board");
  const boardArray = [];

  function initialize() {
    for (let i = 0; i < 3; i++) {
      boardArray.push([]);
      for (let j = 0; j < 3; j++) {
        let newSquare = document.createElement("div");
        newSquare.id = `${i}-${j}`;
        setOnPush(newSquare);
        boardArray[boardArray.length - 1].push(newSquare); //add square to row array inside board matrix
        board.appendChild(newSquare); //add square to dom
      }
    }
  }
  function setOnPush(square) {
    square.addEventListener("click", (e) => {
      square.innerHTML = "X";
      let ij = square.id.split("-");
      Gameboard.makeMark(parseInt(ij[0]), parseInt(ij[1]), "X");
    });
  }

  initialize();

  return { boardArray };
})();
