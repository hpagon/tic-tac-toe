//player factory function
const Player = function (mark, name) {
  function getMark() {
    return mark;
  }
  function getName() {
    return name;
  }
  function setName(newName) {
    name = newName;
  }

  return { getMark, getName, setName };
};

//players
const playerX = Player("X", "PlayerX");
const playerO = Player("O", "PlayerO");

//gameboard module
const Gameboard = (function (Player1, Player2) {
  const board = [];
  let currentPlayer = Math.floor(Math.random() * 2) === 0 ? Player1 : Player2; //selects random first player
  let turns = 0;
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
    if (board[i][j] !== " ") return board[i][j]; //check if square has been used, then exit
    board[i][j] = currentPlayer.getMark(); //insert value into board
    turns++;
    display();
    if (checkWin(i, j, currentPlayer.getMark())) {
      //win
      console.log(`${currentPlayer.getName()} won the game!`);
      endGame();
      return board[i][j];
    }
    if (turns === 9) {
      //tie
      endGame();
      console.log("Tie");
      return board[i][j];
    }
    currentPlayer = currentPlayer === Player1 ? Player2 : Player1; //toggle current player
    console.log(`Its now ${currentPlayer.getName()}'s turn...`);
    return board[i][j]; //return mark string ("X" or "O")
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
  function endGame() {
    DomHandler.freezeBoard();
  }

  startGame();

  return { board, makeMark, display, currentPlayer };
})(playerX, playerO);

//dom handler module
const DomHandler = (function () {
  const board = document.querySelector("#board");
  const boardControls = document.querySelector("#board-controls");
  const playButton = document.querySelector("#play");
  const form = document.querySelector("form");
  const boardArray = [];

  function initialize() {
    playButton.addEventListener("click", submitHandler);
    initializeBoard();
  }

  function initializeBoard() {
    for (let i = 0; i < 3; i++) {
      boardArray.push([]);
      for (let j = 0; j < 3; j++) {
        let newSquare = document.createElement("div");
        newSquare.id = `${i}-${j}`;
        newSquare.addEventListener("click", setMark);
        console.log(newSquare);
        boardArray[boardArray.length - 1].push(newSquare); //add square to row array inside board matrix
        board.appendChild(newSquare); //add square to dom
      }
    }
    board.style.visibility = "hidden";
    boardControls.style.visibility = "hidden";
  }

  function submitHandler(e) {
    e.preventDefault();
    console.log(this);
    board.style.visibility = "visible";
    boardControls.style.visibility = "visible";
    form.style.visibility = "hidden";
    let player1name = form.children[0].children[1].value;
    let player2name = form.children[1].children[1].value;
    playerX.setName(player1name ? player1name : "Player 1");
    playerO.setName(player2name ? player2name : "Player 2");
    boardControls.children[0].children[0].children[0].innerHTML = playerX.getName();    //set name in board controls
    boardControls.children[1].children[0].children[0].innerHTML = playerO.getName();
  }
  //sends indices of selected square to Gameboard module and updates UI with marking on square
  function setMark(e) {
    let ij = e.target.id.split("-");
    e.target.innerHTML = Gameboard.makeMark(parseInt(ij[0]), parseInt(ij[1]));
  }
  //removes event listeners from squares
  function freezeBoard() {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        boardArray[i][j].removeEventListener("click", setMark);
      }
    }
  }

  function resetBoard() {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        boardArray[i][j].innerHTML = "";
      }
    }
  }

  function restartBoard() {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        boardArray[i][j].addEventListener("click", setMark);
      }
    }
  }

  initialize();

  return { boardArray, resetBoard, restartBoard, freezeBoard };
})();
