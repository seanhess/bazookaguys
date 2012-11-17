///<reference path="../def/angular.d.ts"/>
///<reference path="../services/Shared.ts"/>
///<reference path="../services/FB.ts"/>
///<reference path="../services/Id.ts"/>

angular.module('controllers')
.controller('TestCtrl', function($scope, Shared:shared.Service, FB:IFirebaseService, Id:IdService) {
  $scope.message = "hello"

  //var testRef = FB.ref("/test/fake2")
  //var so = SharedObject.object(testRef)
  //$scope.person = so.value

  var sa = Shared.bindArray(FB.ref("/test/people"))
  $scope.people = sa.value

  $scope.addPerson = function() {
    Shared.add(sa.ref, {id:Id.randomId()})
  }

  $scope.remove = function(person) {
    Shared.remove(sa.ref, person)
  }

  $scope.select = function(person) {
    $scope.person = person
  }

  $scope.save = function(person) {
    Shared.setChild(sa.ref, person)
  }

  // Well, when it comes to the array, like the players, I just want them to all update magically.
  // without me having to rebind to any of them.
  // yeah.

  // but I DO want to be able to UPDATE them
  // you need a standard id system. So you can just say: shared array, update this object
  // and it will do so based on ITS saved ref
  // I don't need to access the individual refs

})
