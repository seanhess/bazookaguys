///<reference path="./service"/>
///<reference path="./Shared"/>
///<reference path="./FB"/>
///<reference path="./Board"/>
///<reference path="../def/angular.d.ts"/>
///<reference path="../def/signals.d.ts"/>

// Who is canonical for restarting the game? (THE WINNER)
// it's a matter of identifying the people

module Game {

  var GAME_TIMER_DELAY = 80

  // the actual shared game status
  export interface IStatus extends shared.IObject {
    winner: string;
    started: bool;
  }

  export interface IWall extends IPoint {}

  export interface IState {

    status: IStatus;

    players: IPlayerState;
    missiles: IMissileState;
    walls: IWall[];

    timer: number;

    gameOver: signals.ISignal; // finished a game

    boundOnWinner?:fire.ISnapshotCB;
    gameRef:fire.IRef;
  }

  function wallHash(wall:IWall):string {
    return wall.x + "," + wall.y
  }


  function isGameStarted(game:Game.IState) {
    // need to detect that we are synced too!
    // don't want to ALWAYS add walls
    return (game.walls.length)
  }

  function isFirstPlayer(state:Game.IState) {
    return (state.players.all.length === 1)
  }

  // this is dumb, there should be an easier way to do this
  function range(start:number, end:number):number[] {
    var items = []
    for (var i = start; i < end; i++) {
      items.push(i)
    }
    return items
  }

  function randomWall(Board):() => IWall {
    return function() {
      var x = Board.randomX()
      var y = Board.randomY()
      return {x:x, y:y}
    }
  }

  export class Service {
    constructor(
      private Players:IPlayerService, 
      private Missiles:IMissileService, 
      private FB:IFirebaseService,
      private SharedObject:shared.ObjectService,
      private SharedArray:shared.ArrayService,
      private Board:IBoard,
    ) { }

    connect(gameId:string):Game.IState {
      var gameRef = this.FB.game(gameId)
      var statusRef = gameRef.child("status")
      var players = this.Players.connect(gameRef)
      var missiles = this.Missiles.connect(gameRef, players)

      var status = this.SharedObject.bind(statusRef)
      status.updated.add(() => this.onStatus(state))

      var timer = setInterval(() => this.onTimer(state), GAME_TIMER_DELAY)
      players.currentKilled.add(() => this.checkWin(state))

      var state:Game.IState = {
        players:players,
        missiles:missiles,
        walls: <any> this.SharedArray.bind(gameRef.child('walls'), wallHash),
        gameRef: gameRef,
        gameOver: new signals.Signal(),
        timer: timer,
        status: <any> status,
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
    onTimer(game:Game.IState) {

      // I want to know if there are NO walls
      //if (this.isFirstPlayer(game) && !this.isGameStarted(game)) {
        //this.startGame(game)
      //}
    }

    // sets up the game, but doesn't "start" it
    setupGame(game:Game.IState) {
      this.SharedArray.removeAll(<any>game.walls)
      range(0, 5).map(randomWall(this.Board)).forEach((wall:IWall) => {
        this.SharedArray.push(<any>game.walls, wall)
      })
    }

    startGame(game:Game.IState) {
      game.status.started = true
      game.status.winner = ""
      this.SharedObject.set(game.status)
    }

    join(state:Game.IState, player:IPlayer) {
      // if no one else is here, then initialize the walls?
      this.Players.add(state.players, player)
    }

    onStatus(game:Game.IState) {
      if (game.status.winner)
        this.onWinner(game)
    }

    // NEEDS to fire any time winner updates!
    // how do I know?
    onWinner(game:Game.IState) {
      game.gameOver.dispatch(game.status.winner)
      setTimeout(() => this.resetSelf(game), 1000)
    }

    // resets game, but does NOT make it playable
    // only resets YOU. any players not paying attention don't get reset. they get REMOVED?
    // at least we can make them be dead
    resetSelf(game:Game.IState) {
      var current = this.Players.current(game.players)
      this.Players.resetPlayer(game.players, current)
    }

    // only called by the actual player. the winner
    checkWin(game:Game.IState) {
      var winner = this.Players.hasWinner(game.players)
      if (!winner) return

      game.status.winner = winner.name
      this.SharedObject.set(game.status)

      this.Players.scoreWin(game.players, winner)

      // only the winner player
      setTimeout(() => this.setupGame(game), 1000)
      setTimeout(() => this.startGame(game), 2000)
    }
  }
}

// does this one create the players and the missiles?
angular.module('services').factory('Game', toService(Game.Service))