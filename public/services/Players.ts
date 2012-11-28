// TODO player collisions

// And I like passing the state around instead of making it internal
// but keep it minimal (use state.all instead of state)

///<reference path="../def/angular.d.ts"/>
///<reference path="../def/signals.d.ts"/>
///<reference path="./FB"/>
///<reference path="./AppVersion"/>
///<reference path="./Board"/>
///<reference path="./Shared"/>

interface IPlayer extends shared.IArrayItem {
  x:number;
  y:number;
  direction:string;

  wins:number;
  losses:number;
  version:string;
  name:string;
  avatar:string;

  taunt?:string;
  killer?:string;

  // alive or dead
  state:string;
}

// only variables
interface IPlayerState {
  current: IPlayer;
  isPaid: bool;
  all: IPlayer [];

  // signals
  killed: signals.ISignal;

  // private stuff. not for binding
  myname:string;
  playersRef:fire.IRef;
  sharedPlayers:shared.IArray;
}

// only methods
interface IPlayerService {

  isAlive(p:IPlayer):bool;
  alivePlayers(players:IPlayer[]):IPlayer[];
  playerByName(players:IPlayer[], name:string):IPlayer;
  latestVersion(players:IPlayer[]):string;

  connect(gameId:string):IPlayerState;
  disconnect(state:IPlayerState);
  join(state:IPlayerState, name:string, avatar:string);
  killPlayer(state:IPlayerState, player:IPlayer, killerName:string);
  move(state:IPlayerState, player:IPlayer, direction:string);
  taunt(state:IPlayerState, player:IPlayer, taunt:string);

  current(state:IPlayerState):IPlayer;
}


// Need a way to add type-class like functionality
// Player behaves as an Object
// This is the only way I can think of
class Player implements IPlayer {
  x:number;
  y:number;
  direction:string;
  wins:number;
  losses:number;
  version:string;
  name:string;
  avatar:string;
  taunt:string;
  killer:string;
  state:string;

  toString():string {
    return this.name + ": " + this.x + "," + this.y
  }
}

angular.module('services')

.factory('Players', function($rootScope:ng.IScope, FB:IFirebaseService, Board:IBoard, AppVersion:string, SharedArray:shared.ArrayService, Id:IdService):IPlayerService {
  // the big cheese. Does the deed
  // you can make fancy bindings here, no?

  return {
    isAlive: isAlive,
    alivePlayers: alivePlayers,
    playerByName: playerByName,
    latestVersion: latestVersion,

    connect: connect,
    join: join,
    killPlayer: killPlayer,
    move: move,
    taunt: taunt,
    resetGame: resetGame,
    disconnect: disconnect,
    current: currentPlayer,
  }

  function connect(gameId:string):IPlayerState {

    var gameRef = FB.game(gameId)
    var playersRef = gameRef.child('players')

    var sharedPlayers = SharedArray.bind(playersRef, Player)

    var state:IPlayerState = {
      myname:null,
      gameRef:gameRef,
      playersRef:playersRef,

      killed: new signals.Signal(),
      gameOver: new signals.Signal(),

      current: null,
      sharedPlayers: sharedPlayers,
      winner: null,
      isPaid: isPaid(),
      all: <IPlayer[]> sharedPlayers.value,
    }

    state.boundOnWinner = FB.apply((n) => onWinner(state,n))

    gameRef.child('winner').on('value', state.boundOnWinner)

    return state
  }

  function disconnect(state:IPlayerState) {
    SharedArray.unbind(state.sharedPlayers)
    state.gameRef.child('winner').off('value', state.boundOnWinner)
    state.killed.dispose()
    state.gameOver.dispose()
  }

  function isAlive(p:IPlayer):bool {
    return (p.state == STATE.ALIVE)
  }

  function alivePlayers(players:IPlayer[]):IPlayer[] {
    return players.filter(isAlive)
  }

  // you need to define the functions in here, so they have access to the state!
  // hmm... how do I know which one is me?
  // well, I should bind to a function instead
  function join(state:IPlayerState, name:string, avatar:string) {

    // strip baddies
    name = Id.sanitize(name)

    state.myname = name

    var player:IPlayer = {
      name: name,
      avatar: avatar,
      x: Board.randomX(),
      y: Board.randomY(),
      direction: Board.DOWN,
      state: STATE.ALIVE,
      wins: 0,
      losses: 0,
      taunt: "",
      version: AppVersion,
    }

    SharedArray.push(state.playersRef, player)
  }

  function onWinner(state:IPlayerState, name:string) {

    // ignore nulls
    if (!name) {
      state.winner = name
      return
    }

    // ignore if it hasn't changed
    if (name == state.winner) return

    state.gameOver.dispatch(name)

    state.winner = name

    // Now EVERYONE resets the game together. Since we're all setting it to the same state, it's ok.
    setTimeout(() => resetGame(state), 1000)
    setTimeout(() => startGame(state), 2000)
  }

  // resets game, but does NOT make it playable
  // only resets YOU. any players not paying attention don't get reset. they get REMOVED?
  // at least we can make them be dead
  function resetGame(state:IPlayerState) {
    var current = currentPlayer(state)
    current.x = Board.randomX()
    current.y = Board.randomY()
    current.direction = Board.DOWN
    current.state = STATE.ALIVE
    current.taunt = ""

    SharedArray.set(state.playersRef, current)
  }

  // makes the game playable
  function startGame(state:IPlayerState) {
    state.gameRef.child('winner').remove()
  }

  // killPlayer ONLY happens from the current player's perspective. yOu can only kill yourself
  function killPlayer(state:IPlayerState, player:IPlayer, killerName:string) {
    player.state = STATE.DEAD
    player.losses += 1
    player.killer = killerName
    SharedArray.set(state.playersRef, player)

    // TODO when someone dies, check wins!
    checkWin(state)
  }

  // EVERYONE sets winner / game state to over
  // but only the winner can add his score if he's paying attention
  function checkWin(state:IPlayerState) {
    var alive = alivePlayers(state.all)
    if (alive.length > 1) return

    var winner = alive[0]
    //if (state.current == null || winner != state.current) return

    // Game is OVER, set the winner
    state.gameRef.child("winner").removeOnDisconnect();
    state.gameRef.child("winner").set(winner.name)

    // only if it is ME, then give yourself a point and taunt
    if (winner.name == state.current.name) {
      winner.wins += 1
      winner.taunt = TAUNT_LIST[Math.floor(Math.random()*TAUNT_LIST.length)];
      FB.update(state.playersRef.child(winner.name), winner)
    }
  }

  function move(state:IPlayerState, player:IPlayer, direction:string) {
    console.log("MOVE", player, player.toString())

    var position = Board.move(player, direction)
    if (!position) return
      
    var hit = Board.findHit(alivePlayers(state.all), position)
    if (hit) return

    player.x = position.x
    player.y = position.y
    player.direction = position.direction

    SharedArray.update(state.playersRef, player, ["x","y", "direction"])
  }

  // taunt, then make it go away in 5 seconds
  function taunt(state:IPlayerState, player:IPlayer, taunt:string) {
    if (!taunt || !taunt.match(/\w/)) return
    player.taunt = taunt
    SharedArray.update(state.playersRef, player, ["taunt"])
    setTimeout(function() {
        player.taunt = ""
        SharedArray.update(state.playersRef, player, ["taunt"])
    }, 3000)
  }
  
  // just make them class members?
  // your function stuff is CRAP if you don't pass it in. no better than a class
  // property of PLAYERS
  function playerByName(players:IPlayer[], name:string):IPlayer {
    return players.filter((p:IPlayer) => (p.name == name))[0]
  }

  function latestVersion(players:IPlayer[]):string {
    return _.max(players, (player) => player.version)
  }

  // TODO move me into another service
  function isPaid():bool {
    return (localStorage.getItem("payment_status") == "paid");
    //return FB.apply(function () {return (localStorage.getItem("payment_status") == "paid")});
  }

  // caches the current player if it doesn't exist yet
  function currentPlayer(state:IPlayerState):IPlayer {
    if (!state.current)
      state.current = playerByName(state.all, state.myname)

    return state.current
  }

})

// CONSTANTS

var TAUNT_LIST = [ 
  "Oooh yeah!"
  , "I fart in your general direction."
  , "Your mother was a hamster and your father smelt of elderberries."
  , "All your base are belong to us!"
  , "OK, next round, try it WITH your glasses on."
  , "If your daddy's aim is as bad as yours, I'm surprised you're here at all!"
  , "Boom!"
]

var STATE = {
  DEAD: "dead",
  ALIVE: "alive"
}

