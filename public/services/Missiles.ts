///<reference path="../def/angular.d.ts"/>
///<reference path="./Shared"/>
///<reference path="./Walls"/>
///<reference path="./Players"/>
///<reference path="./FB"/>
// This service keeps track of the missiles

// this is GAY. use a real event instead!
// TODO broadcast for sound effect! $rootScope.$broadcast("missile", missile)

interface IMissileState {
  all: IMissile[];

  // private stuff
  ref:fire.IRef;
}

interface IMissile extends IDirectional {
  name: string;
}

interface IMissileService {
  connect(gameRef:fire.IRef):IMissileState;
  disconnect(state:IMissileState);
  fireMissile(state:IMissileState, player:IPlayer);
  moveMissiles(state:IMissileState, players:IPlayerState, walls:walls.IState);
}

angular.module('services')

// TODO use signals / events instead of rootScope stuff
.factory('Missiles', function($rootScope:ng.IRootScopeService, FB:IFirebaseService, Board:IBoard, Players:IPlayerService, SharedArray:shared.ArrayService, Walls = walls.IService):IMissileService {

    var MISSILE_DELAY = 80

    return {
      connect: connect,
      disconnect: disconnect,
      fireMissile: fireMissile,
      moveMissiles: moveMissiles,
    }

    function missileName(missile:IMissile) {
      return missile.name
    }

    function connect(gameRef:fire.IRef):IMissileState {
      var missilesRef = gameRef.child('missiles')

      var all = []
      var shared = <any> SharedArray.bind(missilesRef, missileName)

      var state = {
        ref:missilesRef,
        all: <IMissile[]> shared,
      }

      return state
    }

    function disconnect(state:IMissileState) {
      SharedArray.unbind(<any>state.all)
    }

    // this does NOT check for deadness. Do that somewhere else
    function fireMissile(state:IMissileState, player:IPlayer) {

      // can only fire one at a time
      if (playerHasMissile(state.all, player)) return

      var missile = {
        x: player.x,
        y: player.y,
        direction: player.direction,
        name: player.name
      }

      SharedArray.push(<any>state.all, missile)
    }

    // everyone moves all missiles
    // only the defending player checks for missile hits

    // TODO use a SINGLE timer for ALL missiles (observer?)
    // TODO do any missiles collide with each other?

    function moveMissiles(state:IMissileState, players:IPlayerState, walls:walls.IState) {
      $rootScope.$apply(function() {
        state.all.forEach((m:IMissile) => moveMissile(state, players, walls, m))
      })
    }

    function moveMissile(state:IMissileState, players:IPlayerState, walls:walls.IState, missile:IMissile) {
      var position = Board.move(missile, missile.direction)
      if (!position) return explodeMissile(state, missile)

      missile.x = position.x
      missile.y = position.y
      missile.direction = position.direction

      // Check to see if the missile hits anyone
      var hitPlayer = <IPlayer> Board.findHit(Players.alivePlayers(players.all), missile)
      var current = Players.current(players)

      if (hitPlayer && hitPlayer.name != current.name) {
        explodeMissile(state, missile) // if you see it hit, then remove it

        // if it's YOUR missile, blow them up!
        if (missile.name == players.current.name)
          Players.killPlayer(players, hitPlayer, missile.name)
      }

      var hitMissile = <IMissile> Board.findHit(state.all.filter((m) => m.name != missile.name), missile)

      if (hitMissile) {
        explodeMissile(state, missile)
        explodeMissile(state, hitMissile)
      }

      var hitWall = <walls.IWall> Board.findHit(walls.all, missile)

      if (hitWall) {
        explodeMissile(state, missile)
        Walls.hitWall(walls, hitWall)
      }
    }

    // how to do this? should I client-side predict?
    function explodeMissile(state:IMissileState, missile:IMissile) {
      var idx = state.all.indexOf(missile)
      if (idx != -1) state.all.splice(idx,1)
      SharedArray.remove(<any>state.all, missile)
    }

    function missileByPlayerName(missiles:IMissile[], name:string) {
      return missiles.filter(function(m:IMissile) {
        return (m.name == name)
      })[0]
    }

    function playerHasMissile(missiles:IMissile[], player:IPlayer) {
      return missileByPlayerName(missiles, player.name)
    }
})
