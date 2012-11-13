///<reference path="../def/angular.d.ts"/>

///<reference path="../services/Players"/>
///<reference path="../services/CurrentPlayer"/>

console.log("Register: IdentifyCtrl")

interface IdentifyScope extends ng.IScope {
  intro:string;
  error:string;

  version:string;
  gameId:string;
  players:IPlayerState;
  avatars:string [];
  freeAvatars:string [];

  playerName:string;
  playerAvatar:string;

  avatarIsFree(name:string): bool;
  avatarIsAvailable(name:string): bool;
  avatarIsLocked(name:string): bool;
  join(): void;
  selectAvatar(name: string): void;
  isPlayerAvatar(name:string): bool;
}

angular.module('controllers').controller('IdentifyCtrl', function($scope: IdentifyScope, $location: any, Players:IPlayerService, CurrentPlayer: any, AppVersion: string) {

    // HACKY way to do the transition
    $scope.intro = "intro"

    // hacky way to do this. cssTransitionEnd would be better
    setTimeout(function() {
        $scope.$apply(function() {
          $scope.intro = "show"
        })
    }, 1200)

    $scope.version = AppVersion

    // see if they have a preferred name and gameId
    var prefs = CurrentPlayer.loadPreferences()
    $scope.playerAvatar = prefs.avatar
    $scope.playerName = prefs.name
    $scope.gameId = prefs.gameId || "global"

    // [ ] detect which game to join ("global")
    var players = Players.connect($scope.gameId, "Identify")
    $scope.players = players

    // available avatars
    $scope.avatars = ['player2', 'player5', 'player3','player1', 'player4', 'player6']
    $scope.freeAvatars = ['player1','player2']
    $scope.avatarIsFree = function (avatarName) {
      return ($scope.freeAvatars.indexOf(avatarName) != -1);
    }

    $scope.avatarIsAvailable = function (avatarName) {
      return (players.isPaid || $scope.freeAvatars.indexOf(avatarName) != -1);
    }

    $scope.avatarIsLocked = function (avatarName) {
      return ($scope.avatarIsAvailable(avatarName) != true);
    }

    // [ ] Pick a name and avatar
    // set a service with the currently selected player. the name and avatar, etc
    // must be set by the time you get to game

    // If game doesn't have a current player, then go back to the identify/matchmaking screen!

    $scope.join = function() {
      if (!$scope.playerAvatar || !$scope.playerName) {
        $scope.error = "Please select a valid name and an avatar"
        return
      }

      if (Players.playerByName(players.all, $scope.playerName)) {
        $scope.error = '"' + $scope.playerName + '" is already taken'
        return
      }

      CurrentPlayer.savePreferences($scope.playerName, $scope.playerAvatar, $scope.gameId)
      $location
        .path("/game/" + $scope.gameId)
        .search({avatar:$scope.playerAvatar, name:$scope.playerName})
    }

    $scope.selectAvatar = function(name) {
      if ($scope.avatarIsAvailable(name)) {
        $scope.playerAvatar = name
      } else {
        window.location.href = "https://spb.io/s/osgtq3F3kS";
      }
    }

    $scope.isPlayerAvatar = function(name) {
      return ($scope.playerAvatar == name)
    }

    $scope.$on('$destroy', function() {
      Players.disconnect(players)
    });

})


