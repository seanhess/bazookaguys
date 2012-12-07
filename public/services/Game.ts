///<reference path="./service"/>
///<reference path="./Shared"/>
///<reference path="./FB"/>
///<reference path="./Board"/>
///<reference path="./Walls"/>
///<reference path="./Players"/>
///<reference path="./Missiles"/>
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

  export interface IState {

    status: IStatus;
    connected: bool;

    players: IPlayerState;
    missiles: IMissileState;
    walls: Walls.IState;

    timer: number;

    gameOver: signals.ISignal; // finished a game
  }

  export class Service {
    constructor(
      private Players:IPlayerService, 
      private Missiles:IMissileService, 
      private Walls:Walls.Service, 
      private FB:IFirebaseService,
      private SharedObject:shared.ObjectService,
      private SharedArray:shared.ArrayService,
      private Board:IBoard,
    ) { }

    connect(gameId:string):Game.IState {
      var gameRef = this.FB.game(gameId)
      var statusRef = gameRef.child("status")
      var walls = this.Walls.connect(gameRef)
      var players = this.Players.connect(gameRef)
      var missiles = this.Missiles.connect(gameRef, players, walls)

      var status = this.SharedObject.bind(statusRef)
      status.updated.add(() => this.onStatus(state))

      var timer = setInterval(() => this.onTimer(state), GAME_TIMER_DELAY)
      players.currentKilled.add(() => this.checkWin(state))

      var state:Game.IState = {
        players:players,
        missiles:missiles,
        walls:walls,
        gameOver: new signals.Signal(),
        timer: timer,
        status: <any> status,
        connected: false,
      }

      return state
    }

    disconnect(game:Game.IState) {
      this.Players.disconnect(game.players)
      this.Missiles.disconnect(game.missiles)
      this.Walls.disconnect(game.walls)
      clearInterval(game.timer)
      game.gameOver.dispose()
      this.SharedObject.unbind(game.status)
    }

    // if you enter the room and it is empty, then initialize it, no?
    // when you first join, it will ALWAYS be empty, because it hasn't synced yet!
    // if it shows YOU in there, and only YOU, and no walls, then initialize the game

    // the main game timer
    onTimer(game:Game.IState) {
      if (game.connected === false && this.isGameSynched(game)) {
        game.connected = true
        this.onConnect(game)
      }
    }

    // the first time I'm fully connected to everything
    onConnect(game:Game.IState) {
      console.log("CONNECTED")

      if (this.Players.alivePlayers(game.players.all).length === 1) {
        this.setupGame(game)
        this.startGame(game)
      }
    }

    isGameSynched(game:Game.IState):bool {
      // we don't really care about missiles yet
      return this.Walls.isConnected(game.walls) && this.Players.isConnected(game.players)
    }

    // sets up the game, but doesn't "start" it
    setupGame(game:Game.IState) {
      console.log("SETUP GAME")
      this.Walls.createWalls(game.walls)
    }

    startGame(game:Game.IState) {
      game.status.started = true
      game.status.winner = ""
      this.SharedObject.set(game.status)

      // clean it up too
      this.Players.deadPlayers(game.players.all).forEach((p:IPlayer) => {
        this.Players.removePlayer(game.players, p)
      })
    }

    join(state:Game.IState, player:IPlayer) {
      // if no one else is here, then initialize the walls?
      this.Players.add(state.players, player)
    }

    onStatus(game:Game.IState) {
      if (game.status.winner)
        this.onWinner(game)
    }

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

    // ONLY called by the actual player. the winner
    checkWin(game:Game.IState) {
      var winner = this.Players.hasWinner(game.players)
      if (!winner) return

      game.status.winner = winner.name
      this.SharedObject.set(game.status)

      this.Players.scoreWin(game.players, winner)

      setTimeout(() => this.setupGame(game), 1000)
      setTimeout(() => this.startGame(game), 2000)
    }
  }
}

// does this one create the players and the missiles?
angular.module('services').factory('Game', toService(Game.Service))


// OPTIONS
// - make a new "match". only those with the right match id?
// - remove any dead players after 2s
