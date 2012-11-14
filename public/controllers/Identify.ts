///<reference path="../def/angular.d.ts"/>

///<reference path="../services/Players"/>
///<reference path="../services/CurrentPlayer"/>
///<reference path="../services/Auth"/>

console.log("Register: IdentifyCtrl")

interface IdentifyScope extends ng.IScope {
  intro:string;
  error:string;

  version:string;
  gameId:string;
  players:IPlayerState;
  avatars:string [];
  freeAvatars:string [];

  user:IAuthUser;
  twitterAuthUrl:string;
  logout();

  playerName:string;
  playerAvatar:string;

  avatarIsFree(name:string): bool;
  avatarIsAvailable(name:string): bool;
  avatarIsLocked(name:string): bool;
  join(): void;
  selectAvatar(name: string): void;
  isPlayerAvatar(name:string): bool;
}

angular.module('controllers')
.controller('IdentifyCtrl', function($scope: IdentifyScope, $location: ng.ILocationService, Players:IPlayerService, CurrentPlayer: any, AppVersion: string, Auth:IAuth) {

    // HACKY way to do the transition
    $scope.intro = "intro"

    // hacky way to do this. cssTransitionEnd would be better
    setTimeout(function() {
        $scope.$apply(function() {
          $scope.intro = "show"
        })
    }, 1200)

    $scope.version = AppVersion

    $scope.user = Auth.getUser() // gets the currently logged in user
    $scope.twitterAuthUrl = Auth.twitterAuthUrl

    // see if they have a preferred name and gameId
    var prefs = CurrentPlayer.loadPreferences()
    $scope.playerAvatar = prefs.avatar || 'player2'
    $scope.gameId = prefs.gameId || "global"

    // [ ] detect which game to join ("global")
    var players = Players.connect($scope.gameId, "Identify")
    $scope.players = players

    // available avatars
    $scope.avatars = ['player2', 'player5', 'player3','player1', 'player4', 'player6']
    $scope.freeAvatars = ['player1','player2']

    $scope.logout = function() {
      Auth.logout($scope.user)
    }

    // TODO Move these into a service!
    // an unlocking / avatar service or something?
    $scope.avatarIsFree = function (avatarName) {
      return ($scope.freeAvatars.indexOf(avatarName) != -1);
    }

    $scope.avatarIsAvailable = function (avatarName) {
      return (players.isPaid || $scope.avatarIsFree(avatarName));
    }

    $scope.avatarIsLocked = function (avatarName) {
      return ($scope.avatarIsAvailable(avatarName) != true);
    }

    $scope.join = function() {
      // Join can't be called until user.username is set
      CurrentPlayer.savePreferences($scope.user.username, $scope.playerAvatar, $scope.gameId)
      $location
        .path("/game/" + $scope.gameId)
        .search({avatar:$scope.playerAvatar, name:$scope.user.username})
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


