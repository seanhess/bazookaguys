///<reference path="../def/angular.d.ts"/>

interface IAuthUser {
  username:string;
}

interface IAuth {
  //isLoggedIn:
  // needs things you can bind to.. no?
  getUser():IAuthUser;
  logout(user:IAuthUser);
  twitterAuthUrl:string;
}

angular.module('services')
.factory('Auth', function($http:any, $location:ng.ILocationService):IAuth {

    // 1 // need to log in

    return {
      getUser:getUser,
      logout: logout,
      twitterAuthUrl: "/auth/twitter/login",
    }

    // "promise" oriented status fetcher
    function getUser():IAuthUser {
      var user:IAuthUser = {username: null}

      $http.get("/auth/user")

      .success(function(data:IAuthUser) {
        console.log("SUCCESS!!!", data)
        user.username = data.username
      })

      return user
    }

    function logout(user:IAuthUser) {
      user.username = null
      $http.post('/auth/logout')
    }
})
