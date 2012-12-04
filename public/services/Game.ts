///<reference path="./service"/>
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


// don't bother with interfaces right now, this syntax is simpler
class Game {
  constructor(
    private Players:IPlayerService, 
    private Missiles:IMissileService, 
    private FB:IFirebaseService,
  ) { }

  connect(gameId:string):IGameState {
    var gameRef = this.FB.game(gameId)
    var players = this.Players.connect(gameRef)
    var missiles = this.Missiles.connect(gameRef, players)

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

  disconnect(game:IGameState) {
    this.Players.disconnect(game.players)
    this.Missiles.disconnect(game.missiles)
    //game.gameRef.child('winner').off('value', state.boundOnWinner)
    game.gameOver.dispose()
  }

  join(state:IGameState, player:IPlayer) {
    this.Players.add(state.players, player)
  }

  onWinner(state:IGameState, name:string) {

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
    setTimeout(() => this.resetGame(state), 1000)
    setTimeout(() => this.startGame(state), 2000)
  }

  // resets game, but does NOT make it playable
  // only resets YOU. any players not paying attention don't get reset. they get REMOVED?
  // at least we can make them be dead
  resetGame(game:IGameState) {
    //var current = currentPlayer(state)
    //current.x = Board.randomX()
    //current.y = Board.randomY()
    //current.direction = Board.DOWN
    //current.state = STATE.ALIVE
    //current.taunt = ""

    //SharedArray.set(state.playersRef, current)
  }

  // makes the game playable
  startGame(game:IGameState) {
    game.gameRef.child('winner').remove()
  }

  checkWin(game:IGameState) {
    var winner = this.Players.hasWinner(game.players)
    if (!winner) return

    game.gameRef.child("winner").removeOnDisconnect();
    game.gameRef.child("winner").set(winner.name)

    this.Players.scoreWin(game.players, winner)
  }
}

// does this one create the players and the missiles?
angular.module('services').factory('Game', toService(Game))
