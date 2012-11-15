///<reference path="../def/angular.d.ts"/>

///<reference path="../services/Players"/>
///<reference path="../services/Auth"/>
///<reference path="../services/Id"/>

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
  showHangoutButton:bool;

  inviteUrl:string;
  inviteText:string;

  playerAvatar:string;

  avatarIsFree(name:string): bool;
  avatarIsAvailable(name:string): bool;
  avatarIsLocked(name:string): bool;
  join();
  invite();
  selectAvatar(name: string);
  isPlayerAvatar(name:string): bool;
}

interface IdentifyRouteParams {
  name?: string;
  gameId?: string;
  hangout?: bool;
}

angular.module('controllers')
.controller('IdentifyCtrl', function($scope: IdentifyScope, $location: ng.ILocationService, Players:IPlayerService, AppVersion: string, Auth:IAuth, $routeParams:IdentifyRouteParams, Id:IdService) {

    // HACKY way to do the transition
    $scope.intro = "intro"

    // hacky way to do this. cssTransitionEnd would be better
    setTimeout(function() {
        $scope.$apply(function() {
          $scope.intro = "show"
        })
    }, 1200)

    $scope.version = AppVersion

    if ($routeParams.name)
      $scope.user = Auth.fakeUser($routeParams.name)
    else
      $scope.user = Auth.getUser() // gets the currently logged in user

    $scope.showHangoutButton = $routeParams.hangout

    $scope.twitterAuthUrl = Auth.twitterAuthUrl

    $scope.playerAvatar = 'player2'
    $scope.gameId = Id.sanitize($routeParams.gameId || "global")
    //console.log("GAME", $scope.gameId)
    //console.log("PLAYER", $scope.user.username)

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

    $scope.invite = function() {
      $scope.gameId = Id.randomId()
        $scope.invite
      $scope.inviteText = "Come play bazooka guys now!"
      $scope.inviteUrl = "http%3A%2F%2Fbazookaguys.com%2F%23%2Fidentify%3FgameId%3D" + $scope.gameId
      //$scope.inviteUrl = "https://twitter.com/intent/tweet?original_referer=http://bazookaguys.com&source=tweetbutton&text=Come play bazooka guys with me. Right now.&url=http%3A%2F%2Fbazookaguys.com%2F%23%2Fidentify%3FgameId%3DId}}"
      // then, the click resolves itself
    }

    $scope.join = function() {
      // Join can't be called until user.username is set
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


