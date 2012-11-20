///<reference path="../def/angular.d.ts"/>
///<reference path="../def/mixpanel.d.ts"/>

// just match the interface of mixpanel for now
interface IMetrics {
  track(event:string, info?:any);
  identify(userId:string);

  login();
  logout();
  gameOver(gameId:string, winner:string, numPlayers:number);
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
    gameOver: (gameId:string, winner:string, numPlayers:number) => track('gameOver', {gameId:gameId, winner:winner, numPlayers:numPlayers}),
    join: (gameId:string, name:string, avatar:string) => track('join', {name:name, avatar:avatar, gameId:gameId}),
    chat: (name:string, message:string) => track('chat', {name:name, message:message}),
    invite: (name:string, gameId:string) => track('invite', {name:name, gameId:gameId}),
  }

  function track(event:string, info?:any) {
    mixpanel.track(event, info)
  }

  function identify(userId:string) {
    mixpanel.track("identified", {name: userId})
    mixpanel.identify(userId)
  }
})
