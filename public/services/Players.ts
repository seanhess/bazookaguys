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

interface ISharedPlayers {
  [index: number]: IPlayer;
}

// only variables
interface IPlayerState {

  current: IPlayer;
  isPaid: bool;
  all: IPlayer[];

  // signals
  killed: signals.ISignal;

  // private stuff. not for binding
  myname:string;
  playersRef:fire.IRef;
}

// only methods
interface IPlayerService {

  isAlive(p:IPlayer):bool;
  alivePlayers(players:IPlayer[]):IPlayer[];
  playerByName(players:IPlayer[], name:string):IPlayer;
  latestVersion(players:IPlayer[]):string;

  connect(gameRef:fire.IRef):IPlayerState;
  disconnect(state:IPlayerState);
  add(state:IPlayerState, player:IPlayer);
  killPlayer(state:IPlayerState, player:IPlayer, killerName:string);
  move(state:IPlayerState, player:IPlayer, direction:string);
  taunt(state:IPlayerState, player:IPlayer, taunt:string);

  current(state:IPlayerState):IPlayer;
  newPlayer(name:string, avatar:string);

  scoreWin(state:IPlayerState, player:IPlayer);
  hasWinner(state:IPlayerState):IPlayer;
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

    scoreWin: scoreWin,
    hasWinner: hasWinner,
    newPlayer: newPlayer,

    connect: connect,
    add: add,
    killPlayer: killPlayer,
    move: move,
    taunt: taunt,
    disconnect: disconnect,
    current: currentPlayer,
  }

  function connect(gameRef:fire.IRef):IPlayerState {
    var playersRef = gameRef.child('players')
    var sharedPlayers = SharedArray.bind(playersRef)

    var state:IPlayerState = {
      myname:null,
      gameRef:gameRef,
      playersRef:playersRef,

      killed: new signals.Signal(),

      current: null,
      isPaid: isPaid(),
      all: <IPlayer[]> <any> sharedPlayers,
    }

    return state
  }

  function disconnect(state:IPlayerState) {
    SharedArray.unbind(<any>state.all)
    state.killed.dispose()
  }

  function isAlive(p:IPlayer):bool {
    return (p.state == STATE.ALIVE)
  }

  function alivePlayers(players:IPlayer[]):IPlayer[] {
    return players.filter(isAlive)
  }

  function newPlayer(name:string, avatar:string) {
    name = Id.sanitize(name)

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

    return player
  }

  function add(state:IPlayerState, player:IPlayer) {
    state.myname = player.name
    SharedArray.push(<any>state.all, player)
  }

  // events. still need an update event, etc

  // This ONLY is called by the killer
  function killPlayer(state:IPlayerState, player:IPlayer, killerName:string) {
    player.state = STATE.DEAD
    player.losses += 1
    player.killer = killerName
    SharedArray.set(<any>state.all, player)

    // TODO when someone dies, check wins!
    //checkWin(state)
  }

  // returns winner or null
  function hasWinner(state:IPlayerState):IPlayer {
    var alive = alivePlayers(state.all)
    if (alive.length > 1) return
    var winner = alive[0]
    return winner
  }

  function scoreWin(state:IPlayerState, winner:IPlayer) {
    // only if it is ME, then give yourself a point and taunt
    if (winner.name == state.current.name) {
      winner.wins += 1
      winner.taunt = TAUNT_LIST[Math.floor(Math.random()*TAUNT_LIST.length)];
      FB.update(state.playersRef.child(winner.name), winner)
    }
  }

  function move(state:IPlayerState, player:IPlayer, direction:string) {
    var position = Board.move(player, direction)
    if (!position) return
      
    var hit = Board.findHit(alivePlayers(state.all), position)
    if (hit) return

    player.x = position.x
    player.y = position.y
    player.direction = position.direction

    SharedArray.set(<any>state.all, player, ["x","y", "direction"])
  }

  // taunt, then make it go away in 5 seconds
  function taunt(state:IPlayerState, player:IPlayer, taunt:string) {
    if (!taunt || !taunt.match(/\w/)) return
    player.taunt = taunt
    SharedArray.set(<any>state.all, player, ["taunt"])
    setTimeout(function() {
        player.taunt = ""
        SharedArray.set(<any>state.all, player, ["taunt"])
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

