//player factory function
const Player = function (mark, name, type) {
  function getMark() {
    return mark;
  }
  function getName() {
    return name;
  }
  function setName(newName) {
    name = newName;
  }
  function getType() {
    return type;
  }
  function setType(newType) {
    type = newType;
  }
  return { getMark, getName, setName, getType, setType };
};

//players
const playerX = Player("X", "PlayerX", "Person");
const playerO = Player("O", "PlayerO", "Person");

//gameboard module
const Gameboard = (function (Player1, Player2) {
  const board = [];
  let currentPlayer = Math.floor(Math.random() * 2) === 0 ? Player1 : Player2; //selects random first player
  let turns = 0;
  let over = false;
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
      DomHandler.showDialog(currentPlayer.getName() + " ", "wins");
      return board[i][j];
    }
    if (turns === 9) {
      //tie
      endGame();
      console.log("Tie");
      DomHandler.showDialog("", "Tie");
      return board[i][j];
    }
    currentPlayer = currentPlayer === Player1 ? Player2 : Player1; //toggle current player
    DomHandler.highlightPlayer(currentPlayer.getMark());
    console.log(`Its now ${currentPlayer.getName()}'s turn...`);
    return board[i][j]; //return mark string ("X" or "O")
  }
  //checks if win conditions have been mets
  function checkWin(i, j, mark) {
    let win = false;
    let winningSquares = [];
    //check main diagonal win condition
    if (win === false && i === j) {
      //check if mark is in a main diagonal square
      win = true;
      for (let k = 0; k < 3; k++) {
        if (board[k][k] !== mark) win = false;
      }
      if (win === true) {
        for (let k = 0; k < 3; k++) {
          winningSquares.push([]);
          winningSquares[winningSquares.length - 1].push(k);
          winningSquares[winningSquares.length - 1].push(k);
        }
      }
    }
    //check off diagonal win condition
    if (win === false && j === 2 - i) {
      //check if new mark is in an off diagonal square
      win = true;
      for (let k = 0; k < 3; k++) {
        if (board[k][2 - k] !== mark) win = false;
      }
      if (win === true) {
        for (let k = 0; k < 3; k++) {
          winningSquares.push([]);
          winningSquares[winningSquares.length - 1].push(k);
          winningSquares[winningSquares.length - 1].push(2 - k);
        }
      }
    }
    //check row win condition
    if (win === false) {
      win = true;
      for (let k = 0; k < 3; k++) {
        if (board[i][k] !== mark) win = false;
      }
      if (win === true) {
        for (let k = 0; k < 3; k++) {
          winningSquares.push([]);
          winningSquares[winningSquares.length - 1].push(i);
          winningSquares[winningSquares.length - 1].push(k);
        }
      }
    }
    //check column win condition
    if (win === false) {
      win = true;
      for (let k = 0; k < 3; k++) {
        if (board[k][j] !== mark) win = false;
      }
      if (win === true) {
        for (let k = 0; k < 3; k++) {
          winningSquares.push([]);
          winningSquares[winningSquares.length - 1].push(k);
          winningSquares[winningSquares.length - 1].push(j);
        }
      }
    }
    DomHandler.highlightWin(winningSquares);
    return win;
  }
  function startGame() {
    turns = 0; //reset turns
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        board[i][j] = " "; //reset all marks in board
      }
    }
    if (over) DomHandler.restartBoard();
    over = false;
    //choose random starting player again
    currentPlayer = Math.floor(Math.random() * 2) === 0 ? Player1 : Player2;
    DomHandler.highlightPlayer(currentPlayer.getMark());
    makeMoveBot();
  }
  function endGame() {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if(board[i][j] === ' ') board[i][j] = "-"; //occupy all empty squares so bot doesn't make move
        }
      }
    DomHandler.freezeBoard();
    over = true;
  }
  //So the updated current player can be accessed
  function makeMoveBot() {
    console.log(currentPlayer.getType());
    if (currentPlayer.getType() === "Bot") Bot.makeMove();
  }

  initialize();
  display();

  return { board, makeMark, display, currentPlayer, startGame, makeMoveBot };
})(playerX, playerO);

//dom handler module
const DomHandler = (function () {
  const board = document.querySelector("#board");
  const boardControls = document.querySelector("#board-controls");
  const playButton = document.querySelector("#play");
  const form = document.querySelector("form");
  const boardArray = [];
  const dialog = document.querySelector("dialog");
  const themeButton = document.querySelector("#theme-button");
  const closeButton = document.querySelector("#close-button");

  function initialize() {
    playButton.addEventListener("click", submitHandler);
    boardControls.children[2].addEventListener("click", () => {
      //restart button event handler
      resetBoard();
      Gameboard.startGame();
    });
    boardControls.children[3].addEventListener("click", () => {
      //home button event handler
      board.style.display = "none";
      boardControls.style.display = "none";
      form.style.display = "block";
    });
    dialog.children[0].children[1].children[0].addEventListener("click", () => {
      dialog.close();
      resetBoard();
      Gameboard.startGame();
    });
    themeButton.addEventListener("click", () => {
      toggleTheme();
    });
    closeButton.addEventListener("click", () => {
      dialog.close();
    });
    //scroll event listeners for player names.
    boardControls.children[0].addEventListener("click", scrollForward);
    boardControls.children[1].addEventListener("click", scrollForward);
    form.children[0].children[0].children[3].addEventListener(
      "click",
      switchPlayerType
    );
    form.children[0].children[1].children[3].addEventListener(
      "click",
      switchPlayerType
    );
    initializeBoard();
    highlightPlayer(Gameboard.currentPlayer.getMark());
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
    board.style.display = "none";
    boardControls.style.display = "none";
  }
  //play button event listener
  function submitHandler(e) {
    e.preventDefault();
    console.log(this);
    board.style.display = "grid";
    boardControls.style.display = "grid";
    form.style.display = "none";
    let player1name = form.children[0].children[0].children[1].value;
    let player2name = form.children[0].children[1].children[1].value;
    playerX.setName(player1name ? player1name : "Player 1");
    playerO.setName(player2name ? player2name : "Player 2");
    boardControls.children[0].children[0].children[0].innerHTML =
      playerX.getName(); //set name in board controls
    boardControls.children[1].children[0].children[0].innerHTML =
      playerO.getName();
  }
  //sends indices of selected square to Gameboard module and updates UI with marking on square
  function setMark(e) {
    let ij = e.target.id.split("-");
    e.target.innerHTML = Gameboard.makeMark(parseInt(ij[0]), parseInt(ij[1]));
    //tell bot to make move if it is the next player
    Gameboard.makeMoveBot();
  }
  function setMarkBot(i, j) {
    boardArray[i][j].innerHTML = Gameboard.makeMark(i, j);
    //chains bot moves
    Gameboard.makeMoveBot();
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
        boardArray[i][j].classList.remove("highlight");
      }
    }
  }
  //highlights the winning combination of squares
  function highlightWin(winningSquares) {
    console.log(winningSquares);
    for (let square of winningSquares) {
      boardArray[square[0]][square[1]].classList.add("highlight");
    }
  }
  //applies and removes player hightlighting based on whose turn it is
  function highlightPlayer(mark) {
    switch (mark) {
      case "X":
        boardControls.children[0].classList.add("highlight");
        boardControls.children[1].classList.remove("highlight");
        break;
      case "O":
        boardControls.children[1].classList.add("highlight");
        boardControls.children[0].classList.remove("highlight");
        break;
    }
  }

  function showDialog(winner, result) {
    dialog.children[0].children[0].children[0].children[0].innerHTML = winner;
    dialog.children[0].children[0].children[0].children[1].innerHTML = result;
    dialog.showModal();
  }

  function toggleTheme() {
    const root = document.documentElement;
    themeButton.src =
      root.className === "dark"
        ? "images/dark_mode.svg"
        : "images/light_mode.svg";
    root.className = root.className === "dark" ? "light" : "dark";
  }

  function scrollForward(e) {
    //calculate length of p + extra fluff
    length = this.children[0].scrollWidth + 150;
    for (let i = 0; i < length; i++) {
      setTimeout(scrollDiv, i * 5, this);
    }
    setTimeout(scrollBack, length * 5 + 500, this);
    //prevent function from being called while scrolling
    this.removeEventListener("click", scrollForward);
    //add event listener back after done scrolling
    setTimeout(addScroll, length * 5 + 550, this);
  }

  function scrollDiv(div) {
    div.scrollLeft += 1;
  }

  function scrollBack(div) {
    div.scrollLeft = 0;
  }

  function addScroll(div) {
    div.addEventListener("click", scrollForward);
  }
  //switches player type in js and html (for later use by user and Gameboard module)
  function switchPlayerType() {
    if (this.id === "player1type") {
      playerX.setType(playerX.getType() === "Person" ? "Bot" : "Person");
    } else {
      playerO.setType(playerO.getType() === "Person" ? "Bot" : "Person");
    }
    this.src =
      this.dataset.type === "Person"
        ? "images/smart_toy.svg"
        : "images/person.svg";
    this.dataset.type = this.dataset.type === "Person" ? "Bot" : "Person";
  }

  initialize();
  toggleTheme();

  return {
    boardArray,
    resetBoard,
    restartBoard,
    freezeBoard,
    highlightWin,
    showDialog,
    highlightPlayer,
    setMarkBot,
  };
})();

const Bot = (function () {
  function makeMove() {
    let defendingSquares = [];
    const availableSquares = [];
    console.log("BOt made a move");
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (Gameboard.board[i][j] === " ") availableSquares.push([i, j]);
      }
    }
    //pick random available square
    if (availableSquares.length > 0) {
      let randomIndex = Math.floor(Math.random() * availableSquares.length);
      console.log(randomIndex);
      DomHandler.setMarkBot(
        availableSquares[randomIndex][0],
        availableSquares[randomIndex][1]
      );
    }
  }
  return { makeMove };
})();
