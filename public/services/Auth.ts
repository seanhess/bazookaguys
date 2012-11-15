///<reference path="../def/angular.d.ts"/>

interface IAuthUser {
  username:string;
}

interface IAuth {
  //isLoggedIn:
  // needs things you can bind to.. no?
  getUser():IAuthUser;
  fakeUser(name:string):IAuthUser;
  logout(user:IAuthUser);
  twitterAuthUrl:string;
}

angular.module('services')
.factory('Auth', function($http:any, $location:ng.ILocationService):IAuth {

    // 1 // need to log in

    return {
      getUser:getUser,
      fakeUser:fakeUser,
      logout: logout,
      twitterAuthUrl: "/api/auth/twitter/login",
    }

    function fakeUser(name:string) {
      return {username: name}
    }

    // "promise" oriented status fetcher
    function getUser():IAuthUser {
      var user:IAuthUser = {username: null}

      $http.get("/api/auth/user")

      .success(function(data:IAuthUser) {
        console.log("SUCCESS!!!", data)
        user.username = data.username
      })

      return user
    }

    function logout(user:IAuthUser) {
      user.username = null
      $http.post('/api/auth/logout')
    }
})
