///<reference path="../def/angular.d.ts"/>
///<reference path="../def/underscore.d.ts"/>

///<reference path="../services/Game"/>
///<reference path="../services/Missiles"/>
///<reference path="../services/Players"/>
///<reference path="../services/Board"/>
///<reference path="../services/SoundEffects"/>
///<reference path="../services/AppVersion"/>

///<reference path="../filters/position.ts"/>
///<reference path="../directives/keys.ts"/>
///<reference path="../directives/sprite.ts"/>

interface GameRouteParams {
  name?: string;
  gameId?: string;
  avatar?: string;
}

angular.module('controllers')
.controller('GameCtrl', function ($scope, Players:IPlayerService, Missiles:IMissileService, $routeParams:GameRouteParams, $location, Board:IBoard, SoundEffects:ISoundEffectsService, AppVersion:string, Metrics:IMetrics, Game:Game.Service) {

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

  // Who decides where the walls are? Each player? no
  // Need some concept of a game host, no?
  // SOMEONE needs to "start" the game
  // the first player in the list alphabetically. that can be calculated

  var game = Game.connect($scope.gameId)
  var player = Players.newPlayer(name, avatar)
  Game.join(game, player)
  Metrics.join($scope.gameId, name, avatar)

  $scope.status = game.status
  $scope.players = game.players
  $scope.missiles = game.missiles
  $scope.walls = game.walls

  $scope.latestAlert = "Welcome to Your Underwater Adventure"

  // DOESN'T WORK: need a way to die into observing changes
  //game.players.killed.add(function(player:IPlayer) {
    //$scope.latestAlert = player.killer + " blew up " + player.namea
    //SoundEffects.explosion()
  //})

  game.gameOver.add(function(winner:string) {
    Metrics.gameOver($scope.gameId, name, winner, game.players.all.length)
  })

  $scope.$on("amissile", function(e, player) {
    SoundEffects.rocket()
  })


  // AUDIO
  //var music = SoundEffects.music()

  $scope.test = function() {
    //SoundEffects.rocket()
  }

  $scope.isCurrentPlayer = function(player) {
    return (player.name == name)
  }

  var LEFT = 37,
      UP = 38,
      RIGHT = 39, 
      DOWN = 40,
      SPACE = 32,
      ENTER = 13

  function keyCodeToDirection(code:number):string {
    if (code == LEFT) return Board.LEFT
    else if (code == RIGHT) return Board.RIGHT
    else if (code == DOWN) return Board.DOWN
    else if (code == UP) return Board.UP
    return null
  }

  // ignore ALL key presses if they are dead
  $scope.keypress = function (e) {

    var current = Players.current(game.players)

    // TODO dead-person headstone. allow you to chat when dead
    if (e.keyCode == ENTER) {
      $scope.chatting = true
      $scope.taunt = " "
    }

    // you can do ANYTHING if you are dead, or if the game is currently OVER
    if (!Players.isAlive(current)) return
    if (game.status.winner) return

    if (e.keyCode === SPACE)
      return Missiles.fireMissile(game.missiles, current)


    // otherwise it's movement
    var direction = keyCodeToDirection(e.keyCode)

    if (!direction) return

    Players.move(game.players, game.walls, current, direction)
  }

  $scope.sendTaunt = function() {
    $scope.chatting = false
    var current = Players.current(game.players)
    Players.taunt(game.players, current, $scope.taunt)
    Metrics.chat(current.name, $scope.taunt)
  }

  $scope.$on('$destroy', function() {
    Game.disconnect(game)
    //SoundEffects.pause(music)
  });
})
