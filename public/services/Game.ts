///<reference path="./FB"/>
///<reference path="../def/angular.d.ts"/>
///<reference path="../def/signals.d.ts"/>

interface IGameState {

  winner: string;

  players: IPlayerState;
  missiles: IMissileState;
  walls: any;

  gameOver: signals.ISignal; // finished a game

  boundOnWinner?:fire.ISnapshotCB;
  gameRef:fire.IRef;
}

interface IGameService {
  connect(gameId:string):IGameState;
  disconnect(game:IGameState);
  join(game:IGameState, player:IPlayer);

  // TODO no reset, make a NEW game
  resetGame(game:IGameState);
}

// does this one create the players and the missiles?
angular.module('services')
.factory('Game', function(Players:IPlayerService, Missiles:IMissileService, FB:IFirebaseService):IGameService {

  return {
    connect:connect,
    disconnect:disconnect,
    resetGame: resetGame,
    join: join,
  }

  function connect(gameId:string):IGameState {
    var gameRef = FB.game(gameId)
    var players = Players.connect(gameRef)
    var missiles = Missiles.connect(gameRef, players)

    //state.boundOnWinner = FB.apply((n) => onWinner(state,n))
    //gameRef.child('winner').on('value', state.boundOnWinner)

    return {
      players:players,
      missiles:missiles,
      walls:{},
      winner: null,
      gameRef: gameRef,
      gameOver: new signals.Signal(),
    }
  }

  function disconnect(game:IGameState) {
    Players.disconnect(game.players)
    Missiles.disconnect(game.missiles)
    //game.gameRef.child('winner').off('value', state.boundOnWinner)
    game.gameOver.dispose()
  }

  function join(state:IGameState, player:IPlayer) {
    Players.add(state.players, player)
  }

  function onWinner(state:IGameState, name:string) {

    // ignore nulls
    if (!name) {
      state.winner = name
      return
    }

    // ignore if it hasn't changed
    if (name == state.winner) return

    state.gameOver.dispatch(name)

    state.winner = name

    // Now EVERYONE resets the game together. Since we're all setting it to the same state, it's ok.
    setTimeout(() => resetGame(state), 1000)
    setTimeout(() => startGame(state), 2000)
  }

  // resets game, but does NOT make it playable
  // only resets YOU. any players not paying attention don't get reset. they get REMOVED?
  // at least we can make them be dead
  function resetGame(game:IGameState) {
    //var current = currentPlayer(state)
    //current.x = Board.randomX()
    //current.y = Board.randomY()
    //current.direction = Board.DOWN
    //current.state = STATE.ALIVE
    //current.taunt = ""

    //SharedArray.set(state.playersRef, current)
  }

  // makes the game playable
  function startGame(game:IGameState) {
    game.gameRef.child('winner').remove()
  }

  function checkWin(game:IGameState) {
    var winner = Players.hasWinner(game.players)
    if (!winner) return

    game.gameRef.child("winner").removeOnDisconnect();
    game.gameRef.child("winner").set(winner.name)

    Players.scoreWin(game.players, winner)
  }



})
