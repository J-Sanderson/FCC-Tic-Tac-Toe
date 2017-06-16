function play(playerMark, compMark, firstGo) {
  //set move counter
  var moveCount = 0;
  //set board
  var board = ["", "", "", "", "", "", "", "", ""];
  console.log("Board created: " + board);
  //clear all squares
  $("td").empty();

  //computer to move, if it goes first
  if (firstGo === "computer") {
    moveCount++;
    compMove(compMark, playerMark);
  }

  //player's move (a computer move always follows)
  $("td").on("click", function() {
    //get id of clicked square as int
    var cell = parseInt(event.target.id);
    //only move if there's nothing in the target square
    if (board[cell] === "") {
      moveCount++;
      board[cell] = playerMark;
      $(this).append(playerMark);
      //check for win conditions
      if (winCheck(playerMark, board)) {
        cleanup("player");
        //check for draw
      } else if (drawCheck()) {
        cleanup("draw");
      } else {
        //computer to move if player has not won in last move
        moveCount++;
        //computer moves
        compMove(compMark, playerMark);
        //check for winning condition
        if (winCheck(compMark, board)) {
          cleanup("computer");
        } else if (drawCheck()) {
          cleanup("draw");
        }
      }
    }
  });

  //computer deciding where to move
  function compMove(compMark, playerMark) {
    //small chance that the computer won't move perfectly
    if (Math.random() > 0.9) {
      //move randomly
      var moveMade = false;
      while (!moveMade) {
        //pick cell number at random (0-8)
        var cellNum = Math.floor(Math.random() * 9);
        //add mark if cell is empty
        if (board[cellNum] === "") {
          $("td").eq(cellNum).append(compMark);
          //mark corresponding slot in board array
          board[cellNum] = compMark;
          moveMade = true;
        }
      }
    } else {
      //make strategic move
      //check for winning moves next turn
      var canCompWin = findWinningMove("computer");
      var canPlayerWin = findWinningMove("player");
      //can the computer win next turn?
      if (canCompWin >= 0) {
        //make that move
        $("td").eq(canCompWin).append(compMark);
        board[canCompWin] = compMark;
        //can the player win next turn?
      } else if (canPlayerWin >= 0) {
        //block the player
        $("td").eq(canPlayerWin).append(compMark);
        board[canPlayerWin] = compMark;
      } else {
        //no winning moves next turn - try to take a good square
        //are any of the corners (0, 2, 6, 8) free?
        if (
          board[0] === "" ||
          board[2] === "" ||
          board[6] === "" ||
          board[8] === ""
        ) {
          //array of corner index #s
          var corners = [0, 2, 6, 8];
          //pick random corner
          var moveMade = false;
          while (!moveMade) {
            var cornerIndex = Math.floor(Math.random() * 4);
            //is that corner free?
            if (board[corners[cornerIndex]] === "") {
              //mark it
              $("td").eq(corners[cornerIndex]).append(compMark);
              board[corners[cornerIndex]] = compMark;
              moveMade = true;
            }
          }
          //is the centre (4) free?
        } else if (board[4] === "") {
          $("td").eq(4).append(compMark);
          board[4] = compMark;
        } else {
          //take any remaining side space (1, 3, 5, 7)
          var sides = [1, 3, 5, 7];
          //pick random side (same logic as corners)
          var moveMade = false;
          while (!moveMade) {
            var sideIndex = Math.floor(Math.random() * 4);
            if (board[sides[sideIndex]] === "") {
              $("td").eq(sides[sideIndex]).append(compMark);
              board[sides[sideIndex]] = compMark;
              moveMade = true;
            }
          }
        }
      }
    }
  }

  //computer checks for winning move (itself or player)
  function findWinningMove(who) {
    //who = 'player' or 'computer'
    //which mark are we looking at? (user or computer)
    var mark = who === "player" ? playerMark : compMark;
    //make a copy of the board
    var testBoard = board;
    for (var i = 0; i < board.length; i++) {
      //make a "move" on the test board if clear
      if (testBoard[i] === "") {
        testBoard[i] = mark;
        //will that move win?
        if (winCheck(mark, testBoard)) {
          //return position of that move (0 or greater)
          return i;
        } else {
          //clear that space
          testBoard[i] = "";
        }
      }
    }
    //nothing found, no winning move
    return -1;
  }

  //draw condition checking
  //return true if all moves are used up
  function drawCheck() {
    if (moveCount >= 9) {
      return true;
    }
  }

  //win condition checking
  //board may be the "real" board or a test
  function winCheck(mark, board) {
    //return true if any win conditions apply
    if (
      (board[0] === mark && board[1] === mark && board[2] === mark) || //top
      (board[3] === mark && board[4] === mark && board[5] === mark) || //middle
      (board[6] === mark && board[7] === mark && board[8] === mark) || //bottom
      (board[0] === mark && board[3] === mark && board[6] === mark) || //left
      (board[1] === mark && board[4] === mark && board[7] === mark) || //centre
      (board[2] === mark && board[5] === mark && board[8] === mark) || //right
      (board[0] === mark && board[4] === mark && board[8] === mark) || //diag-l
      (board[2] === mark && board[4] === mark && board[6] === mark) //diag-r
    ) {
      return true;
    }
  }

  //game over - change classes, restart game
  function cleanup(winner) {
    console.log("Cleanup function started");
    //hide table
    $("table").addClass("hidden");
    //display continue div
    $("body").append("<div id='continue'></div>");
    $("#continue").addClass("animated fadeInDown");

    //choose who will go first next round
    var firstGo = Math.round(Math.random()) === 1 ? "player" : "computer";
    var firstGoMess = firstGo === "player" ? "You" : "The computer";

    //get winning message
    var winMess;
    if (winner === "player") {
      winMess = "You win!";
    } else if (winner === "computer") {
      winMess = "The computer wins!";
    } else {
      winMess = "It's a draw!";
    }

    //get who goes first

    $("#continue").append(
      "<p class='toss'>" +
        winMess +
        " Try again?<br><br>" +
        firstGoMess +
        " will go first next time!<p><br><button id='go2'>Go!</button>"
    );

    //player clicks go button
    $("#go2").click(function() {
      console.log("Subsequent game started");
      $("#continue").addClass("animated fadeOutUp");
      $("#continue").remove();
      //display table
      $("table").removeClass("hidden").addClass("animated fadeIn");
      play(playerMark, compMark, firstGo);
    });
  }
} //end of play function

$(document).ready(function() {
  //fade in start notification
  $("#startnote").addClass("animated fadeIn");
  //player clicks either x or o to begin
  $(".start").click(function() {
    //hide start notification
    $("#startcontents").addClass("animated fadeOut");
    $("#startcontents").remove();
    //set player ID to chosen button
    var playerMark = this.id;
    //set computer ID to opposite
    var compMark = playerMark === "X" ? "O" : "X";
    //randomly choose who goes first
    var firstGo = Math.round(Math.random()) === 1 ? "player" : "computer";
    var firstMess = firstGo === "player"
      ? "you will go first!"
      : "the computer will go first!";
    //notify
    $("#startnote").append(
      "<p class='toss'>You've chosen to play as " +
        playerMark +
        ", so the computer will play as " +
        compMark +
        "!<br><br>The coin has been tossed and " +
        firstMess +
        "</p><button id='go'>Go!</button>"
    );
    //player clicks go button
    $("#go").click(function() {
      //remove the start message
      $("#startnote").addClass("animated fadeOutUp");
      $("#startnote").remove();
      //display table
      $("table").removeClass("hidden").addClass("animated fadeIn");
      play(playerMark, compMark, firstGo);
    });
  });
});
