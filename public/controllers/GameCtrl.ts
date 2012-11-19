///<reference path="../def/angular.d.ts"/>
///<reference path="../def/underscore.d.ts"/>

///<reference path="../services/Missiles"/>
///<reference path="../services/Players"/>
///<reference path="../services/Board"/>
///<reference path="../services/SoundEffects"/>
///<reference path="../services/AppVersion"/>

///<reference path="../filters/position.ts"/>
///<reference path="../directives/keys.ts"/>
///<reference path="../directives/sprite.ts"/>

angular.module('controllers')
.controller('GameCtrl', function ($scope, Players:IPlayerService, Missiles:IMissileService, $routeParams:any, $location, Board:IBoard, SoundEffects:ISoundEffectsService, AppVersion:string) {

  $scope.version = AppVersion
  $scope.gameId = $routeParams.gameId

  var name = $routeParams.name
  var avatar = $routeParams.avatar

  // not going to help! The person is still in the game!
  //if (AppVersion != Player.latestVersion()) {
    //alert("Your version " + AppVersion + " is out of date. Reloading...")
    //window.location.reload()
    //return
  //}

  var players = Players.connect($scope.gameId, "Game")
  Players.join(players, name, avatar)
  $scope.players = players

  var missiles = Missiles.connect($scope.gameId, players)
  $scope.missiles = missiles

  $scope.latestAlert = "Welcome to Your Underwater Adventure"

  $scope.$on("kill", function(e, player) {
    $scope.latestAlert = player.killer + " blew up " + player.name
    SoundEffects.explosion()
  })

  $scope.$on("missile", function(e, player) {
    SoundEffects.rocket()
  })


  // AUDIO
  SoundEffects.music()

  $scope.test = function() {
    //SoundEffects.rocket()
  }

  var LEFT = 37,
      UP = 38,
      RIGHT = 39, 
      DOWN = 40,
      SPACE = 32

  function keyCodeToDirection(code:number):string {
    if (code == LEFT) return Board.LEFT
    else if (code == RIGHT) return Board.RIGHT
    else if (code == DOWN) return Board.DOWN
    else if (code == UP) return Board.UP
    return null
  }

  // ignore ALL key presses if they are dead
  $scope.keypress = function (e) {

    var current = Players.current(players)

    console.log(current)

    // you can do ANYTHING if you are dead, or if the game is currently OVER
    if (!Players.isAlive(current)) return
    if (players.winner) return

    if (e.keyCode === 32)
      return Missiles.fireMissile(missiles, current)

    var direction = keyCodeToDirection(e.keyCode)
    if (!direction) return

    var position = Board.move(current, direction)
    if (!position) return
      
    // the x and y change
    current.x = position.x
    current.y = position.y
    current.direction = position.direction
    Players.move(players, current);

      // WILL I HIT ANY OTHER PLAYERS?

      //var collision = false;
      //Players.alivePlayers(players.all).forEach(function(p:IPlayer){
        //if (p.name != players.current.name && p.state != "dead") {
          //if (location.axis == "x") {
            //if (p.x == location.location && p.y == players.current.y) collision = true;
          //}
          //if (location.axis == "y") {
            //if (p.y == location.location && p.x == players.current.x) collision = true;
          //}
        //}
      //});
      //if (!collision) {
  }

  $scope.$on('$destroy', function() {
    Players.disconnect(players)
  });
})
