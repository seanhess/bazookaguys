///<reference path="./service"/>
///<reference path="./Shared"/>
///<reference path="./Board"/>
///<reference path="../def/angular.d.ts"/>

module Walls {

  var NUM_WALLS = 20

  export interface IWall extends IPoint {}

  export interface IState {
    all: IWall[];
  }

  export class Service {
    constructor(
      private SharedArray:shared.ArrayService,
      private Board:IBoard,
    ) { }

    connect(gameRef:fire.IRef):IState {
      return {
        all: <any> this.SharedArray.bind(gameRef.child('walls'), wallHash),
      }
    }

    disconnect(walls:IState) {
      this.SharedArray.unbind(<any>walls.all)
    }

    createWalls(walls:IState) {
      this.SharedArray.removeAll(<any>walls.all)
      range(0, NUM_WALLS).map(randomWall(this.Board)).forEach((wall:IWall) => {
        this.SharedArray.push(<any>walls.all, wall)
      })
    }

    // are we synced, AND it's empty?
    isEmpty(walls:IState):bool {
      return this.isConnected(walls) && walls.all.length === 0
    }

    isConnected(walls:IState):bool {
      return this.SharedArray.isSynched(<any>walls.all)
    }

    explodeWall(walls:IState, wall:IWall) {
      this.SharedArray.remove(<any>walls.all, wall)
    }
  }

  function wallHash(wall:Walls.IWall):string {
    return wall.x + "," + wall.y
  }

  function randomWall(Board):() => Walls.IWall {
    return function() {
      var x = Board.randomX()
      var y = Board.randomY()
      return {x:x, y:y}
    }
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

angular.module('services').factory('Walls', toService(Walls.Service))
