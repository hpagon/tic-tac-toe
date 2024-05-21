//player factory function
const Player = function (mark, name, type, botDifficulty) {
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
  function getBotDifficulty() {
    return botDifficulty;
  }
  function setBotDifficulty(newDifficulty) {
    botDifficulty = newDifficulty;
  }
  return {
    getMark,
    getName,
    setName,
    getType,
    setType,
    getBotDifficulty,
    setBotDifficulty,
  };
};

//players
const playerX = Player("X", "PlayerX", "Person", 0);
const playerO = Player("O", "PlayerO", "Person", 0);

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
    //check anti diagonal win condition
    if (win === false && j === 2 - i) {
      //check if new mark is in an anti diagonal square
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
        if (board[i][j] === " ") board[i][j] = "-"; //occupy all empty squares so bot doesn't make move
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
  function getCurrentPlayer() {
    return currentPlayer;
  }
  function getTurns() {
    return turns;
  }

  initialize();
  display();

  return {
    board,
    makeMark,
    display,
    currentPlayer,
    startGame,
    makeMoveBot,
    getCurrentPlayer,
    getTurns,
  };
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
    //hide bot difficulty descriptors
    form.children[0].children[0].children[3].children[1].style.display = "none";
    form.children[0].children[1].children[3].children[1].style.display = "none";
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
    //if current player was changed to bot, make the bot play immediately
    if (Gameboard.getCurrentPlayer().getType() === "Bot") Bot.makeMove();
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
    // if (this.children[0].id === "player1type") {
    //   playerX.setType(playerX.getType() === "Person" ? "Bot" : "Person");
    // } else {
    //   playerO.setType(playerO.getType() === "Person" ? "Bot" : "Person");
    // }
    // this.children[0].src =
    //   this.children[0].dataset.type === "Person"
    //     ? "images/smart_toy.svg"
    //     : "images/person.svg";
    // this.children[0].dataset.type =
    //   this.children[0].dataset.type === "Person" ? "Bot" : "Person";
    // console.log(this.children[1]);
    //toggle bot difficulty descriptors
    switch (this.children[1].innerHTML) {
      case "Human":
        //change type to bot
        if (this.children[0].id === "player1type") {
          playerX.setType("Bot");
        } else {
          playerO.setType("Bot");
        }
        this.children[0].src = "images/smart_toy.svg";
        this.children[1].innerHTML = "Easy";
        this.children[1].style.display = "block";
        console.log("from human to easy");
        break;
      case "Easy":
        console.log("from easy to medium");
        this.children[1].innerHTML = "Medium";
        if (this.children[0].id === "player1type") {
          playerX.setBotDifficulty(1);
        } else {
          playerO.setBotDifficulty(1);
        }
        break;
      case "Medium":
        console.log("from medium to hard");
        this.children[1].innerHTML = "Hard";
        if (this.children[0].id === "player1type") {
          playerX.setBotDifficulty(2);
        } else {
          playerO.setBotDifficulty(2);
        }
        break;
      case "Hard":
        //change type back to human
        if (this.children[0].id === "player1type") {
          playerX.setType("Person");
        } else {
          playerO.setType("Person");
        }
        this.children[0].src = "images/person.svg";
        this.children[1].innerHTML = "Human";
        this.children[1].style.display = "none";
        console.log("from hard to human");
        if (this.children[0].id === "player1type") {
          playerX.setBotDifficulty(0);
        } else {
          playerO.setBotDifficulty(0);
        }
        break;
    }
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
//bot module
const Bot = (function () {
  function makeMove() {
    const defendingSquares = [];
    const availableSquares = [];
    let centerPieceAvailable = false;
    const connect2Squares = [];
    const corners = [];
    const middlePieces = [];
    console.log("BOt made a move");
    console.log(`The bot is ${Gameboard.getCurrentPlayer().getName()}`);
    console.log(`Their mark is ${Gameboard.getCurrentPlayer().getMark()}`);
    console.log(`It is turn number ${Gameboard.getTurns()}`);
    let tempAvailableSquare = [];
    let playerMarkCount = 0;
    let opponentMarkCount = 0;
    //check rows & available squares
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (Gameboard.board[i][j] === " ") {
          availableSquares.push([i, j]);
          tempAvailableSquare.push([i, j]);
        } else {
          Gameboard.board[i][j] === Gameboard.getCurrentPlayer().getMark()
            ? playerMarkCount++
            : opponentMarkCount++;
        }
      }
      if (
        playerMarkCount === 2 &&
        opponentMarkCount === 0 &&
        Gameboard.getCurrentPlayer().getBotDifficulty() >= 1
      ) {
        //make move if win condition
        console.log("Going for the win");
        DomHandler.setMarkBot(
          tempAvailableSquare[0][0],
          tempAvailableSquare[0][1]
        );
        return;
      }
      if (opponentMarkCount === 2 && playerMarkCount === 0)
        defendingSquares.push(tempAvailableSquare.pop());
      playerMarkCount = 0;
      opponentMarkCount = 0;
      tempAvailableSquare.splice(0, tempAvailableSquare.length);
    }
    //check columns
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (Gameboard.board[j][i] === " ") {
          tempAvailableSquare.push([j, i]);
        } else if (
          Gameboard.board[j][i] === Gameboard.getCurrentPlayer().getMark()
        ) {
          playerMarkCount++;
        } else {
          opponentMarkCount++;
        }
      }
      if (
        playerMarkCount === 2 &&
        opponentMarkCount === 0 &&
        Gameboard.getCurrentPlayer().getBotDifficulty() >= 1
      ) {
        //go for the win
        DomHandler.setMarkBot(
          tempAvailableSquare[0][0],
          tempAvailableSquare[0][1]
        );
        return;
      }
      if (opponentMarkCount === 2 && playerMarkCount === 0)
        defendingSquares.push(tempAvailableSquare.pop());
      playerMarkCount = 0;
      opponentMarkCount = 0;
      tempAvailableSquare.splice(0, tempAvailableSquare.length);
    }
    //check diagonal
    for (let i = 0; i < 3; i++) {
      if (Gameboard.board[i][i] === " ") {
        tempAvailableSquare.push([i, i]);
      } else if (
        Gameboard.board[i][i] === Gameboard.getCurrentPlayer().getMark()
      ) {
        playerMarkCount++;
      } else {
        opponentMarkCount++;
      }
    }
    if (
      playerMarkCount === 2 &&
      opponentMarkCount === 0 &&
      Gameboard.getCurrentPlayer().getBotDifficulty() >= 1
    ) {
      //go for the win
      DomHandler.setMarkBot(
        tempAvailableSquare[0][0],
        tempAvailableSquare[0][1]
      );
      return;
    }
    if (opponentMarkCount === 2 && playerMarkCount === 0)
      defendingSquares.push(tempAvailableSquare.pop());
    playerMarkCount = 0;
    opponentMarkCount = 0;
    tempAvailableSquare.splice(0, tempAvailableSquare.length);
    //check anti diagional
    for (let i = 0; i < 3; i++) {
      if (Gameboard.board[i][2 - i] === " ") {
        console.log(`im in the off diagonal at coordinates [${i}, ${2 - i}]`);
        tempAvailableSquare.push([i, 2 - i]);
      } else if (
        Gameboard.board[i][2 - i] === Gameboard.getCurrentPlayer().getMark()
      ) {
        playerMarkCount++;
      } else {
        opponentMarkCount++;
      }
    }
    if (
      playerMarkCount === 2 &&
      opponentMarkCount === 0 &&
      Gameboard.getCurrentPlayer().getBotDifficulty() >= 1
    ) {
      //go for the win
      DomHandler.setMarkBot(
        tempAvailableSquare[0][0],
        tempAvailableSquare[0][1]
      );
      return;
    }
    if (opponentMarkCount === 2 && playerMarkCount === 0)
      defendingSquares.push(tempAvailableSquare.pop());
    playerMarkCount = 0;
    opponentMarkCount = 0;
    tempAvailableSquare.splice(0, tempAvailableSquare.length);
    //check if centerpiece is available
    if (Gameboard.board[1][1] === " ") centerPieceAvailable = true;
    //check if corners available
    if (Gameboard.board[0][0] === " ") corners.push([0, 0]);
    if (Gameboard.board[0][2] === " ") corners.push([0, 2]);
    if (Gameboard.board[2][0] === " ") corners.push([2, 0]);
    if (Gameboard.board[2][2] === " ") corners.push([2, 2]);
    //check if middle pieces available
    // if (Gameboard.board[0][1] === " ") middlePieces.push([0, 1]);
    // if (Gameboard.board[1][0] === " ") middlePieces.push([1, 0]);
    // if (Gameboard.board[1][2] === " ") middlePieces.push([1, 2]);
    // if (Gameboard.board[2][1] === " ") middlePieces.push([2, 1]);
    //pick defending square if available
    if (
      defendingSquares.length !== 0 &&
      Gameboard.getCurrentPlayer().getBotDifficulty() >= 1
    ) {
      console.log("defending");
      DomHandler.setMarkBot(defendingSquares[0][0], defendingSquares[0][1]);
      return;
    }
    //hard algorithm strategy
    if (Gameboard.getCurrentPlayer().getBotDifficulty() === 2) {
      //pick corner if first
      if (corners.length > 0 && Gameboard.getTurns() === 0) {
        let randomIndex = Math.floor(Math.random() * corners.length);
        DomHandler.setMarkBot(corners[randomIndex][0], corners[randomIndex][1]);
        return;
      }
      //if second turn or third turn
      if (Gameboard.getTurns() === 1 || Gameboard.getTurns() === 2) {
        //pick corner if centerpiece taken
        if (!centerPieceAvailable) {
          let randomIndex = Math.floor(Math.random() * corners.length);
          DomHandler.setMarkBot(
            corners[randomIndex][0],
            corners[randomIndex][1]
          );
          return;
        } else {
          // else pick centerpiece
          DomHandler.setMarkBot(1, 1);
          return;
        }
      }
      //if it is the fourth turn and centerpiece is ours
      if (
        Gameboard.getTurns() === 3 &&
        Gameboard.board[1][1] === Gameboard.getCurrentPlayer().getMark()
      ) {
        //if there are corners on opposite ends place mark on non corner edge
        if (corners.length === 2) {
          DomHandler.setMarkBot(0, 1);
          return;
        }
        //if fork place mark on corner between fork
        if (corners.length === 3) {
          let opponentCorner;
          if (Gameboard.board[0][0] !== " ") opponentCorner = [0, 0];
          if (Gameboard.board[0][2] !== " ") opponentCorner = [0, 2];
          if (Gameboard.board[2][0] !== " ") opponentCorner = [2, 0];
          if (Gameboard.board[2][2] !== " ") opponentCorner = [2, 2];
          let oppositeCorner = [
            opponentCorner[0] === 0 ? 2 : 0,
            opponentCorner[1] === 0 ? 2 : 0,
          ];
          console.log(
            `The original corner is [${opponentCorner[0]}, ${opponentCorner[1]}]`
          );
          console.log(
            `Opposite corner is found to be [${oppositeCorner[0]}, ${oppositeCorner[1]}]`
          );
          let fork1 = [1, oppositeCorner[1]];
          let fork2 = [oppositeCorner[0], 1];
          if (Gameboard.board[1][oppositeCorner[1]] !== " ") {
            DomHandler.setMarkBot(
              oppositeCorner[0] === 0 ? 2 : 0,
              oppositeCorner[1]
            );
            console.log(
              `Found corner needed to be covered at [${
                oppositeCorner[0] === 0 ? 2 : 0
              }, ${oppositeCorner[1]}]`
            );
            return;
          }
          if (Gameboard.board[oppositeCorner[0]][1] !== " ") {
            DomHandler.setMarkBot(
              oppositeCorner[0],
              oppositeCorner[1] === 0 ? 2 : 0
            );
            console.log(
              `Found corner needed to be covered at [${oppositeCorner[0]}, ${
                oppositeCorner[1] === 0 ? 2 : 0
              }]`
            );
            return;
          }
        }
      } 
      //if this is the fourth turn and the center piece is the opponent's
      if(Gameboard.getTurns() === 3) {
            //if triangle being setup mark, then mark one of the remaining corners
            if(corners.length === 2) {
                DomHandler.setMarkBot(corners[0][0], corners[0][1]);
                console.log("prevented a triangle");
                return;
            }
      }
    }

    //pick middle piece if available
    // if (middlePieces.length > 0 && Gameboard.getCurrentPlayer().getBotDifficulty() == 2) {
    //     let randomIndex = Math.floor(Math.random() * middlePieces.length);
    //     DomHandler.setMarkBot(middlePieces[randomIndex][0], middlePieces[randomIndex][1]);
    //     return;
    //   }
    //pick random available square as last case scenario (for all difficulties)
    if (availableSquares.length > 0) {
      let randomIndex = Math.floor(Math.random() * availableSquares.length);
      console.log(randomIndex);
      DomHandler.setMarkBot(
        availableSquares[randomIndex][0],
        availableSquares[randomIndex][1]
      );
    }
  }
  //   function checkFork() {
  //     let row1taken = board === ;
  //     let row3taken = false;
  //     let column1taken = false;
  //     let column3taken = false;
  //   }
  return { makeMove };
})();
