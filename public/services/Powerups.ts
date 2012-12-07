///<reference path="../def/angular.d.ts"/>
///<reference path="../def/jquery.d.ts"/>
///<reference path="./Board"/>

interface IPowerup extends IPoint {
  type: string;
}

module Powerup {

  export interface IState {
    all: IPowerup[]; // the ones on the board
  }

  // HACK use blah = IService instead of blah:IService in a function to type this as whatever Keys.Service returns
  export var IService = Service(null, null)
  angular.module('services').factory('Powerups', Service)

  function Service(
    SharedArray:shared.ArrayService,
    Board:IBoard,
  ) {

    return {
      connect: connect,
      disconnect: disconnect,
      tick: tick,
      clear: clear,
    }

    function connect(gameRef:fire.IRef):IState {
      var ref = gameRef.child('powerups')
      var shared = SharedArray.bind(ref, hash)

      return {
        all: <IPowerup[]> <any> shared,
      }
    }

    function disconnect(state:IState) {
      SharedArray.unbind(<any>state.all)
    }

    function clear(state:IState) {
      SharedArray.removeAll(<any>state.all)
    }

    function spawnPowerup(state:IState) {
      console.log("SPAWN POWERUP")
      var powerup = randomPowerup()
      console.log(powerup)
      SharedArray.push(<any>state.all, powerup)
    }

    function randomPowerup():IPowerup {
      return {type:"mines", x: Board.randomX(), y:Board.randomY()}
    }

    // game tick. keep track of TIMMMMMEEE
    function tick(state:IState, msTick:number) {
      var powerupsTick = (POWERUPS_SECOND / 1000) * msTick
      if (Math.random() <= powerupsTick)
        spawnPowerup(state)
    }

    function hash(powerup:IPowerup):string {
      return powerup.x + "," + powerup.y
    }

  }

  // lol, this is PER PLAYER, right now. That's a lot

  var SECONDS_POWERUP = 10
  var POWERUPS_SECOND = 1 / SECONDS_POWERUP
}

