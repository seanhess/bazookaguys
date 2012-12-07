///<reference path="../def/angular.d.ts"/>
///<reference path="../def/jquery.d.ts"/>
///<reference path="./Board"/>

module Keys {

  function Service($rootScope:ng.IScope, Board:IBoard) {

    var LEFT = 37,
        UP = 38,
        RIGHT = 39, 
        DOWN = 40,
        SPACE = 32,
        ENTER = 13

    return {
      keyCodeToDirection: keyCodeToDirection,
      connect: connect,
      disconnect: disconnect,
      ENTER: ENTER,
      SPACE: SPACE,
    }

    function connect(onPress:Function) {
      $(document).bind("keydown", function(e) {
        $rootScope.$apply(function() {
          onPress(e)
        })
      })
    }

    function disconnect() {
      $(document).unbind("keydown")
    }

    function keyCodeToDirection(code:number):string {
      if (code == LEFT) return Board.LEFT
      else if (code == RIGHT) return Board.RIGHT
      else if (code == DOWN) return Board.DOWN
      else if (code == UP) return Board.UP
      return null
    }
  }

  // HACK use blah = IService instead of blah:IService in a function to type this as whatever Keys.Service returns
  export var IService = Service(null, null)
  angular.module('services').factory('Keys', Service)

}
