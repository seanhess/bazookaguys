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
  nomusic?: bool;
}

angular.module('controllers')
.controller('GameCtrl', function ($scope, Players:IPlayerService, Missiles:IMissileService, $routeParams:GameRouteParams, $location:ng.ILocationService, Board:IBoard, SoundEffects:ISoundEffectsService, AppVersion:string, Metrics:IMetrics, Game = games.IService) {

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
  $scope.powerups = game.powerups

  $scope.latestAlert = "Welcome to Your Underwater Adventure"


  // DOESN'T WORK: need a way to die into observing changes
  //game.players.killed.add(function(player:IPlayer) {
    //$scope.latestAlert = player.killer + " blew up " + player.namea
    //SoundEffects.explosion()
  //})

  game.gameOver.add(function(winner:string) {
    Metrics.gameOver($scope.gameId, name, winner, game.players.all.length)
  })

  $scope.$on("missile", function(e, player) {
    SoundEffects.rocket()
  })


  // AUDIO

  if ($routeParams.nomusic)
    var music = null
  else
    var music = SoundEffects.music()


  $scope.test = function() {
    //SoundEffects.rocket()
  }

  $scope.isCurrentPlayer = function(player) {
    return (player.name == name)
  }

  $scope.sendTaunt = function() {
    $scope.chatting = false
    var current = Players.current(game.players)
    Players.taunt(game.players, current, $scope.taunt)
    Metrics.chat(current.name, $scope.taunt)
  }

  $scope.turnOffMusic = function() {
    $location.search("nomusic","true")
    SoundEffects.pause(music)
  }

  $scope.$on('$destroy', function() {
    Game.disconnect(game)
    SoundEffects.pause(music)
    //Keys.disconnect()
  });
})
