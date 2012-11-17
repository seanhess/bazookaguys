///<reference path="../def/angular.d.ts"/>
///<reference path="../services/SharedObject.ts"/>
///<reference path="../services/FB.ts"/>

angular.module('controllers')
.controller('TestCtrl', function($scope, SharedObject:SharedObjectService, FB:IFirebaseService) {
  $scope.message = "hello"
  var testRef = FB.ref("/test/fake2")
  var so = SharedObject.object(testRef)
  $scope.object = so.value

  $scope.save = function() {
    SharedObject.set(so) 
  }
})
