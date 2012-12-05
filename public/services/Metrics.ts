///<reference path="../def/angular.d.ts"/>
///<reference path="../def/mixpanel.d.ts"/>

///<reference path="./Auth.ts"/>

// just match the interface of mixpanel for now
interface IMetrics {
  track(event:string, info?:any);
  identify(user:IAuthUser);

  login();
  logout();
  gameOver(gameId:string, player:string, winner:string, numPlayers:number);
  join(gameId:string, name:string, avatar:string);
  chat(name:string, message:string);
  invite(name:string, gameId:string);
}

angular.module('services')
.factory('Metrics', function():IMetrics {

  return {
    track: track,
    identify: identify,

    // individual metrics / events
    login: () => track('login'),
    logout: () => track('logout'),
    gameOver: (gameId:string, player:string, winner:string, numPlayers:number) => track('gameOver', {gameId:gameId, player:player, winner:winner, numPlayers:numPlayers}),
    join: (gameId:string, name:string, avatar:string) => track('join', {name:name, avatar:avatar, gameId:gameId}),
    chat: (name:string, message:string) => track('chat', {name:name, message:message}),
    invite: (name:string, gameId:string) => track('invite', {name:name, gameId:gameId}),
  }

  function track(event:string, info?:any) {
    console.log("TRACK", event, info)
    mixpanel.track(event, info)
  }

  function identify(user:IAuthUser) {
    console.log("IDENTIFY", user.username)
    mixpanel.track("identified", user)
    mixpanel.identify(user.username)
    mixpanel.name_tag(user.username)
    mixpanel.people.identify(user.username)
    mixpanel.people.set({
      $name: user.name,
      $username: user.username,
    })
  }
})
