///<reference path="../def/angular.d.ts"/>
///<reference path="../def/jquery.d.ts"/>
///<reference path="../def/underscore.d.ts"/>
///<reference path="./Board"/>

module keys {

  // HACK use blah = IService instead of blah:IService in a function to type this as whatever Keys.Service returns
  export var IService = Service(null, null)
  angular.module('services').factory('Keys', Service)

  function Service($rootScope:ng.IScope, Board:IBoard) {

    var LEFT = 37,
        UP = 38,
        RIGHT = 39, 
        DOWN = 40,
        SPACE = 32,
        ENTER = 13,
        SHIFT = 16

    var pressed = []

    return {
      keyCodeToDirection: keyCodeToDirection,
      connect: connect,
      disconnect: disconnect,
      last: last,
      pop: pop,
      ENTER: ENTER,
      SPACE: SPACE,
    }

    //function connect(onPress:Function) {
      //$(document).bind("keydown", function(e) {
        //$rootScope.$apply(function() {
          //onPress(e)
        //})
      //})
    //}

    // gives the last pressed key
    function last() {
      return pressed[pressed.length-1]
    }

    function pop() {
      var key = last()
      pressed = []
      return key
    }

    function connect() {
      $(document).bind("keydown", function(e) {
        if (last() == e.keyCode) return
        pressed.push(e.keyCode)
        //console.log("DOWN", pressed)
      })

      $(document).bind("keyup", function(e) {
        pressed = _.without(pressed, e.keyCode)
        //console.log("UP", pressed)
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

}
