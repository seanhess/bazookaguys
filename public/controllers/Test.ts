///<reference path="../def/angular.d.ts"/>
///<reference path="../services/Shared.ts"/>
///<reference path="../services/FB.ts"/>
///<reference path="../services/Id.ts"/>

angular.module('controllers')
.controller('TestCtrl', function($scope, SharedArray:shared.ArrayService, FB:IFirebaseService, Id:IdService) {

  $scope.message = "hello"

  //var testRef = FB.ref("/test/fake2")
  //var so = SharedObject.object(testRef)
  //$scope.person = so.value

  var sa = SharedArray.bind(FB.ref("/test/people"))
  $scope.people = sa

  $scope.addPerson = function() {
    SharedArray.push(sa.ref, {name:Id.randomId()})
  }

  $scope.remove = function(person) {
    SharedArray.remove(sa.ref, person)
  }

  $scope.select = function(person) {
    $scope.person = person
  }

  $scope.save = function(person) {
    SharedArray.set(sa.ref, person, ["age"])
  }
})
