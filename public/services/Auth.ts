///<reference path="../def/angular.d.ts"/>
///<reference path="../def/mixpanel.d.ts"/>
///<reference path="../services/Id"/>

interface IAuthUser {
  username: string;
  avatarUrl?: string;
  name?:string;
  description?:string;
}

interface IAuth {
  //isLoggedIn:
  // needs things you can bind to.. no?
  getUser(cb?:(user:IAuthUser)=>void):IAuthUser;
  fakeUser(name:string):IAuthUser;
  logout(user:IAuthUser);
  twitterAuthUrl(gameId:string):string;
}

angular.module('services')
.factory('Auth', function($http:any, $location:ng.ILocationService, Id:IdService):IAuth {

    // 1 // need to log in

    return {
      getUser:getUser,
      fakeUser:fakeUser,
      logout: logout,
      twitterAuthUrl: twitterAuthUrl,
    }

    function twitterAuthUrl(gameId:string):string {
      var url = "/api/auth/twitter/login"
      if (gameId) url += "?gameId=" + gameId
      return url
    }

    function fakeUser(name:string) {
      return {username: Id.sanitize(name)}
    }

    // "promise" oriented status fetcher
    function getUser(cb?:(user:IAuthUser)=>void):IAuthUser {
      var user:IAuthUser = {username: null}

      $http.get("/api/auth/user")

      .success(function(data:IAuthUser) {
        user.username = data.username
        user.name = data.name
        user.description = data.description
        user.avatarUrl = data.avatarUrl
        if (cb) cb(user)
      })

      return user
    }

    function logout(user:IAuthUser) {
      user.username = null
      $http.post('/api/auth/logout')
    }
})
