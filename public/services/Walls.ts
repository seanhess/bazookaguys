///<reference path="./service"/>
///<reference path="./Shared"/>
///<reference path="./Board"/>
///<reference path="../def/angular.d.ts"/>

module Wall {

  var NUM_WALLS = 20

  export interface IWall extends IPoint {
    strength: number;
  }

  export interface IState {
    all: IWall[];
  }

  export var IService = Service(null, null)
  angular.module('services').factory('Walls', Service)

  function Service(
    SharedArray:shared.ArrayService,
    Board:IBoard,
  ) {

    return {
      connect: connect,
      disconnect: disconnect,
      createWalls: createWalls,
      hitWall: hitWall,
      isConnected: isConnected,
    }

    function connect(gameRef:fire.IRef):IState {
      return {
        all: <any> SharedArray.bind(gameRef.child('walls'), wallHash),
      }
    }

    function disconnect(walls:IState) {
      SharedArray.unbind(<any>walls.all)
    }

    function createWalls(walls:IState) {
      SharedArray.removeAll(<any>walls.all)
      range(0, NUM_WALLS).map(randomWall).forEach((wall:IWall) => {
        SharedArray.push(<any>walls.all, wall)
      })
    }

    // are we synced, AND it's empty?
    function isEmpty(walls:IState):bool {
      return isConnected(walls) && walls.all.length === 0
    }

    function isConnected(walls:IState):bool {
      return SharedArray.isSynched(<any>walls.all)
    }

    function hitWall(walls:IState, wall:IWall) {
      wall.strength -= 1
      if (wall.strength === 0)
        SharedArray.remove(<any>walls.all, wall)
    }

    function wallHash(wall:IWall):string {
      return wall.x + "," + wall.y
    }

    function randomWall():IWall {
      var x = Board.randomX()
      var y = Board.randomY()
      return {x:x, y:y, strength:3}
    }

    // this is dumb, there should be an easier way to do this
    function range(start:number, end:number):number[] {
      var items = []
      for (var i = start; i < end; i++) {
        items.push(i)
      }
      return items
    }
  }
}

