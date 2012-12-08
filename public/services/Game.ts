///<reference path="./service"/>
///<reference path="./Shared"/>
///<reference path="./FB"/>
///<reference path="./Board"/>
///<reference path="./Walls"/>
///<reference path="./Players"/>
///<reference path="./Missiles"/>
///<reference path="./Powerups"/>
///<reference path="../def/angular.d.ts"/>
///<reference path="../def/signals.d.ts"/>

// Who is canonical for restarting the game? (THE WINNER)
// it's a matter of identifying the people

module Game {

  var MS_TICK = 80

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
    walls: walls.IState;
    powerups: Powerup.IState; 

    timer: number;

    gameOver: signals.ISignal; // finished a game
  }

  // HACK: you can type this dependency as function(Game = Game.IService) instead of function(Game:Game.IService)
  // later if we add an interface for it, we'll use the normal syntax
  export var IService = Service(null, null, null, null, null, null, null)
  angular.module('services').factory('Game', Service)

  function Service(
    Players:IPlayerService, 
    Missiles:IMissileService, 
    FB:IFirebaseService,
    SharedObject:shared.ObjectService,
    SharedArray:shared.ArrayService,
    Board:IBoard,
    Powerups = Powerup.IService,
    Walls = walls.IService,
  ) { 

    return {
      connect: connect,
      disconnect: disconnect,
      join: join,
    }

    function connect(gameId:string):Game.IState {
      var gameRef = FB.game(gameId)
      var statusRef = gameRef.child("status")
      var walls = Walls.connect(gameRef)
      var players = Players.connect(gameRef)
      var missiles = Missiles.connect(gameRef, players, walls)
      var powerups = Powerups.connect(gameRef)

      var status = SharedObject.bind(statusRef)
      status.updated.add(() => onStatus(state))

      var timer = setInterval(() => onTimer(state), MS_TICK)
      players.currentKilled.add(() => checkWin(state))

      var state:Game.IState = {
        players:players,
        missiles:missiles,
        walls:walls,
        powerups:powerups,
        gameOver: new signals.Signal(),
        timer: timer,
        status: <any> status,
        connected: false,
      }

      return state
    }

    function disconnect(game:Game.IState) {
      Players.disconnect(game.players)
      Missiles.disconnect(game.missiles)
      Walls.disconnect(game.walls)
      Powerups.disconnect(game.powerups)
      clearInterval(game.timer)
      game.gameOver.dispose()
      SharedObject.unbind(game.status)
    }

    // if you enter the room and it is empty, then initialize it, no?
    // when you first join, it will ALWAYS be empty, because it hasn't synced yet!
    // if it shows YOU in there, and only YOU, and no walls, then initialize the game

    // the main game timer
    function onTimer(game:Game.IState) {
      if (game.connected === false && isGameSynched(game)) {
        game.connected = true
        onConnect(game)
      }

      // POWERUPS
      Powerups.tick(game.powerups, MS_TICK)
    }

    // the first time I'm fully connected to everything
    function onConnect(game:Game.IState) {
      console.log("CONNECTED")

      if (Players.alivePlayers(game.players.all).length === 1) {
        setupGame(game)
        startGame(game)
      }
    }

    function isGameSynched(game:Game.IState):bool {
      // we don't really care about missiles yet
      return Walls.isConnected(game.walls) && Players.isConnected(game.players)
    }

    // sets up the game, but doesn't "start" it
    function setupGame(game:Game.IState) {
      console.log("SETUP GAME")
      Walls.createWalls(game.walls)
      Powerups.clear(game.powerups)
    }

    function startGame(game:Game.IState) {
      game.status.started = true
      game.status.winner = ""
      SharedObject.set(game.status)

      // clean it up too
      Players.deadPlayers(game.players.all).forEach((p:IPlayer) => {
        Players.removePlayer(game.players, p)
      })
    }

    function join(state:Game.IState, player:IPlayer) {
      // if no one else is here, then initialize the walls?
      Players.add(state.players, player)
    }

    function onStatus(game:Game.IState) {
      if (game.status.winner)
        onWinner(game)
    }

    function onWinner(game:Game.IState) {
      game.gameOver.dispatch(game.status.winner)
      setTimeout(() => resetSelf(game), 1000)
    }

    // resets game, but does NOT make it playable
    // only resets YOU. any players not paying attention don't get reset. they get REMOVED?
    // at least we can make them be dead
    function resetSelf(game:Game.IState) {
      var current = Players.current(game.players)
      Players.resetPlayer(game.players, current)
    }

    // ONLY called by the actual player. the winner
    function checkWin(game:Game.IState) {
      var winner = Players.hasWinner(game.players)
      if (!winner) return

      game.status.winner = winner.name
      SharedObject.set(game.status)

      Players.scoreWin(game.players, winner)

      setTimeout(() => setupGame(game), 1000)
      setTimeout(() => startGame(game), 2000)
    }
  }

}
