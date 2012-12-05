///<reference path="./service"/>
///<reference path="./Shared"/>
///<reference path="./FB"/>
///<reference path="../def/angular.d.ts"/>
///<reference path="../def/signals.d.ts"/>

module Game {

  var GAME_TIMER_DELAY = 80


  // the actual shared game status
  export interface IStatus extends shared.IObject {
    winner: string;
    started: bool;
  }

  export interface IState {

    status: IStatus;

    players: IPlayerState;
    missiles: IMissileState;
    walls: any[];

    timer: number;

    gameOver: signals.ISignal; // finished a game

    boundOnWinner?:fire.ISnapshotCB;
    gameRef:fire.IRef;
  }


  export class Service {
    constructor(
      private Players:IPlayerService, 
      private Missiles:IMissileService, 
      private FB:IFirebaseService,
      private SharedObject:shared.ObjectService,
    ) { }

    connect(gameId:string):Game.IState {
      var gameRef = this.FB.game(gameId)
      var statusRef = gameRef.child("status")
      var players = this.Players.connect(gameRef)
      var missiles = this.Missiles.connect(gameRef, players)

      //state.boundOnWinner = FB.apply((n) => onWinner(state,n))
      //gameRef.child('winner').on('value', state.boundOnWinner)

      // start the game timer

      var timer = setInterval(() => this.onTimer(state), GAME_TIMER_DELAY)

      var state:Game.IState = {
        players:players,
        missiles:missiles,
        walls:[],
        status: this.SharedObject.bind(statusRef),
        gameRef: gameRef,
        gameOver: new signals.Signal(),
        timer: timer,
      }

      return state
    }

    disconnect(game:Game.IState) {
      this.Players.disconnect(game.players)
      this.Missiles.disconnect(game.missiles)
      //game.gameRef.child('winner').off('value', state.boundOnWinner)
      clearInterval(game.timer)
      game.gameOver.dispose()
    }

    // the main game timer
    onTimer(state:Game.IState) {

      // I want to know if there are NO walls

      if (this.isFirstPlayer(state) && !this.isGameStarted(state)) {
        this.startGame(state)
      }

      //console.log("TEST", state.missiles.all)
    }

    // the game timer! If there is only one player, and the game is OFF, then start the game and the walls
    // there will only be one player once.

    isGameStarted(game:Game.IState) {
      return (game.walls.length)
    }

    isFirstPlayer(state:Game.IState) {
      return (state.players.all.length === 1)
    }

    startGame(game:Game.IState) {
      console.log("START GAME")
      game.status.started = true
      game.status.winner = ""
      game.walls.push("Cheese")
      //game.gameRef.child('winner').remove()
      this.SharedObject.set(game.status)
    }

    join(state:Game.IState, player:IPlayer) {
      // if no one else is here, then initialize the walls?
      this.Players.add(state.players, player)
    }

    onWinner(game:Game.IState, name:string) {

      // ignore nulls
      if (!name) {
        game.status.winner = name
        return
      }

      // ignore if it hasn't changed
      if (name == game.status.winner) return

      game.gameOver.dispatch(name)

      game.status.winner = name

      // Now EVERYONE resets the game together. Since we're all setting it to the same state, it's ok.
      setTimeout(() => this.resetGame(game), 1000)
      setTimeout(() => this.startGame(game), 2000)
    }

    // resets game, but does NOT make it playable
    // only resets YOU. any players not paying attention don't get reset. they get REMOVED?
    // at least we can make them be dead
    resetGame(game:Game.IState) {
      //var current = currentPlayer(state)
      //current.x = Board.randomX()
      //current.y = Board.randomY()
      //current.direction = Board.DOWN
      //current.state = STATE.ALIVE
      //current.taunt = ""

      //SharedArray.set(state.playersRef, current)
    }

    checkWin(game:Game.IState) {
      var winner = this.Players.hasWinner(game.players)
      if (!winner) return

      game.gameRef.child("winner").removeOnDisconnect();
      game.gameRef.child("winner").set(winner.name)

      this.Players.scoreWin(game.players, winner)
    }
  }
}

// does this one create the players and the missiles?
angular.module('services').factory('Game', toService(Game.Service))
