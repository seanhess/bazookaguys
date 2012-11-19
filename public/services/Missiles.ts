///<reference path="../def/angular.d.ts"/>
///<reference path="./Shared"/>
// This service keeps track of the missiles

// this is GAY. use a real event instead!
// TODO broadcast for sound effect! $rootScope.$broadcast("missile", missile)

interface IMissileState {
  all: IMissile[];

  // private stuff
  ref:fire.IRef;
  shared:shared.IArray;
  timer:number;
}

interface IMissile extends IPoint {
  x: number;
  y: number;
  direction: string;
  name: string;
}

interface IMissileService {
  connect(gameId:string, players:IPlayerState):IMissileState;
  disconnect(state:IMissileState);
  fireMissile(state:IMissileState, player:IPlayer);
}

angular.module('services')


// TODO use signals / events instead of rootScope stuff
.factory('Missiles', function($rootScope:ng.IRootScopeService, FB:IFirebaseService, Board:IBoard, Players:IPlayerService, SharedArray:shared.ArrayService):IMissileService {

    var MISSILE_DELAY = 80

    return {
      connect: connect,
      disconnect: disconnect,
      fireMissile: fireMissile,
    }

    function connect(gameId:string, players:IPlayerState):IMissileState {
      var missilesRef = FB.game(gameId).child('missiles')

      var all = []
      var shared = SharedArray.bind(missilesRef)
      var timer = setInterval(() => moveMissiles(state, players), MISSILE_DELAY)

      var state = {
        ref:missilesRef,
        shared:shared,
        all: <IMissile[]> shared.value,
        timer: timer,
      }

      return state
    }

    function disconnect(state:IMissileState) {
      SharedArray.unbind(state.shared)
      clearInterval(state.timer)
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

      SharedArray.push(state.ref, missile)
    }

    // everyone moves all missiles
    // only the defending player checks for missile hits

    // TODO use a SINGLE timer for ALL missiles (observer?)
    // TODO do any missiles collide with each other?

    function moveMissiles(state:IMissileState, players:IPlayerState) {
      $rootScope.$apply(function() {
        state.all.forEach((m:IMissile) => moveMissile(state, players, m))
      })
    }

    function moveMissile(state:IMissileState, players:IPlayerState, missile:IMissile) {
      var position = Board.move(missile, missile.direction)
      if (!position) return explodeMissile(state, missile)

      missile.x = position.x
      missile.y = position.y
      missile.direction = position.direction

      // Check to see if the missile hits anyone
      var hitPlayer = <IPlayer> Board.findHit(players.all, missile)

      if (hitPlayer) {
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
    }

    // how to do this? should I client-side predict?
    function explodeMissile(state:IMissileState, missile:IMissile) {
      var idx = state.all.indexOf(missile)
      if (idx != -1) state.all.splice(idx,1)
      SharedArray.remove(state.ref, missile)
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
