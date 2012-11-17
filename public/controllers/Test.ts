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
    Shared.push(sa.ref, {id:Id.randomId()})
  }

  $scope.remove = function(person) {
    Shared.remove(sa.ref, person)
  }

  $scope.select = function(person) {
    $scope.person = person
  }

  $scope.save = function(person) {
    Shared.setChild(sa.ref, person)
    //Shared.updateChild(sa.ref, person, "name")
  }
})
