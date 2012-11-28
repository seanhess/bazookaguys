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

  // TODO no reset, make a NEW game
  resetGame(state:IPlayerState);
}

// does this one create the players and the missiles?
angular.module('services')
.factory('Game', function(Players:IPlayerService, Missiles:IMissileService):IGameService {

  return {
    connect:connect,
    disconnect:disconnect,
  }

  function connect(gameId:string):IGameState {
    var players = Players.connect(gameId)
    var missiles = Missiles.connect(gameId, players)

    return {
      players:players,
      missiles:missiles,
      walls:{},
    }
  }

  function disconnect(game:IGameState) {
    Players.disconnect(game.players)
    Missiles.disconnect(game.missiles)
  }

})
