// Objects.ts
// controls walls, and other such objects

///<reference path="./Shared"/>
///<reference path="./Board"/>


// OBJECTS: are represented on the board visually. May block movement
interface IGameObject extends IPoint {
  blocking: bool;
  type: string;
}


/*
PROBLEMS
[ ] land mines, powerups and walls all need different html/css
[ ] powerups are non-blocking, walls are blocking
[ ] powerups need to add to the character when he walks over them
[ ] land mines need to observe the character movement and blow them up
[ ] nuke needs to go off and blow people up
[ ] when invulnerable, the player can't be killed

TYPE PROPERTY
object.type: "person", "powerup", etc...  This could correspond to an exact class for serialization.
object._type. "Person" -- you DO need this if you have types at all

makes it easy to filter by type.
makes it easy to filter by behavior? 

you could do instanceof

  function isBlocking(o:IObject)
    return o.blocking

DIFFERENT NODES / SHARED ARRAYS
you know each array/node has all the same type of thing. There's not really anything too hard about combigning them. Group based on behavior?

players
passive objects: walls / powerups (inert, they don't act) you may collide with them or pick them up.
active objects: everything else. like missiles, nukes, etc. they can act in a specific way, depending on the type. Each one is a FUNCTION that gets called with the game state every tick?
  - missiles: called with the game state. they know where THEY are. did they hit? move.
  - land mines: are there any players near? detonate and blow them up.
  - missiles: which things can they blow up? other missiles. land mines BOOM. walls BLOCK. powerups PASS.

  Each thing gets called with the game state and can modify it
  So it needs to be able to see which things of the types it cares about are there. If none, it exits.
  For Each of the things, do X



the game timer. has all the game logic in it. acts on different kinds of objects each tick

powerups
missiles
players
walls

Will you refer to them all together more often, or separately? (separately) (so put them in separate arrays)

When you 

what invisible things are there?
- the game winner

this is badso, pretty much EVERYTHING is visible

actlab






BIAS FOR ACTION
actlab
motion lab
action lab

Learn by doing. Do by learning.

do lab
causelab
createlab
effectlab
affectlab
make lab
up lab
rise lab

up


It's more of a database approach. SELECT ALL

[ ] shield needs to stay in front of character

LAND MINES - (monitor) if they get within a space they blow up
HEAT SEEKING MISSILES - (monitor) you fire them, they have their own controller
PET MONSTER - (monitor) moves around like a crazy thing
INVULNERABILITY - (hook) override missile code? or killPlayer. Can't be killed!
NUKE - (monitor) goes off and kills everyone
TELEPORT - (move) moves you somewhere
SHIELD - blocks missiles and movement


... needs to know about other objects, etc
... scan through the objects list?

will Missiles need to know about all SHIELDS too? that's LAME
... no. shields can BEHAVE as an OBJECT on the board
... all OBJECTS behave the same way. They're displayed visually. t a location. Missiles effect them in different ways. Player collisions affect them in different ways.



REALLY: i only need one list of objects. Players + Missiles + Walls, etc. They're all in the same one

  (but then you can't connect to them separately (not really important. you won't die if you connect to the whole game to show the players!))
  (game menu: shows you who is in the game)

  Templating? Each object type might have different html yo. You could do it dynamically I guess.



OBJECTS: represents physical things on the board. They are displayed visually, they may or may not block missiles. They may or may not block players. They may do something fancy in reaction to the board
  IObject: properties and functions that let it do stuff

  how to attach those: each thing in the collection


WALLS - block movement and missiles (Missiles.moveMissile(playerState, walls))
POWERUPS - 


HOW WOULD YOU MODEL THIS IN HASKELL?
+ a typeclass

the typeclass describes how an object behaves when treated as something. Then ANYTHING can be a member of that typeclass. You can write functions that handle members of that typeclass


interface IGameObject
  x: number
  y: number


then you also need a set of functions that work on it

you could make them actual member functions so anybody can implement it

how do they work normally. in haskell?

it MUST work differently depending on the type. And how the heck do I know the type?
  -- he attaches to the prototype

so you have to worry about things being the right objects. Unless you KNOW what thing to send it to for a given thing.

but the problem is you DON'T know which is which. You just know that they all implement 

PATTERN MATCHING? like, if there are 50 things you can do

yeah, classes are the way to go. For sure. 

it should be easy enough to cast objects though. in a cheater way?

well, I need a way to copy everything... pish posh

class Player
  constructor(obj:any)
    _.extend(this, obj) // that's not so bad
  
Yeah, so to be really powerful, you have to be able to cast objects coming in and out

Either way, you're going to have to switch off of some type. You need an automatic serialization / deserialization framework











*/



interface IObjectState {
  all: IGameObject[]
}

interface IObjectsService {

}

angular.module('services')
.factory('Objects', function(SharedArray:shared.ArrayService) {

})

