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
const Gameboard = (function (Player1, Player2) {
  const board = [];
  let currentPlayer = Math.floor(Math.random() * 2) === 0 ? Player1 : Player2; //selects random first player
  console.log(currentPlayer.getName());
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
  function makeMark(i, j) {
    board[i][j] = currentPlayer.getMark(); //insert value into board
    display();
    if (checkWin(i, j, currentPlayer.getMark()))
      console.log(`${currentPlayer.getName()} won the game!`);
    currentPlayer = currentPlayer === Player1 ? Player2 : Player1;     //toggle current player
    console.log(`Its now ${currentPlayer.getName()}'s turn...`);
    return board[i][j];
  }
  //checks if win conditions have been mets
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
    initialize();
    display();
  }

  startGame();

  return { board, makeMark, display, currentPlayer };
})(playerX, playerO);

const DomHandler = (function () {
  const board = document.querySelector("#board");
  const boardArray = [];
  let currPlayer = Gameboard.currentPlayer;

  function initialize() {
    for (let i = 0; i < 3; i++) {
      boardArray.push([]);
      for (let j = 0; j < 3; j++) {
        let newSquare = document.createElement("div");
        newSquare.id = `${i}-${j}`;
        setOnPush(newSquare);
        // newSquare.setAttribute('onclick', "this.innerHTML = Gameboard.currentPlayer.getMark(); let ij = this.id.split('-');Gameboard.makeMark(parseInt(ij[0]),parseInt(ij[1]),Gameboard.currentPlayer.getMark());currPlayer = Gameboard.currentPlayer;");
        console.log(newSquare);
        boardArray[boardArray.length - 1].push(newSquare); //add square to row array inside board matrix
        board.appendChild(newSquare); //add square to dom
      }
    }
  }
  function setOnPush(square) {
    square.addEventListener("click", setMark);
  }

  function setMark(e) {
    // e.target.innerHTML = Gameboard.currentPlayer.getMark(); //put current players mark in square
    let ij = e.target.id.split("-");
    e.target.innerHTML = Gameboard.makeMark(parseInt(ij[0]), parseInt(ij[1]));
    // currPlayer = Gameboard.currentPlayer;
  }

  initialize();

  return { boardArray, currPlayer };
})();
