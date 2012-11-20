uarbg2
======

Underwater Adventure Rocket Bazooka Guys v2

Install
-------

    make install

Compiling
---------

    make


* Don't respawn the winner. keep him in the same place
* bug: the missile disapepars and he dies

Ideas
-----

* Humble Bundle Style Donation Statistics and leaderboards

Needs
-----
* better explosion / death graphic
* explosion and rocket in same format

Hit List
--------

* (small) add firebase, angularjs and typescript badges + mixpanel

* (feature) leaderboards
* (feature) metrics
* (feature) powerups

* (bug) Dead people chatting

* (small) Dead people explosions + headstones (obvious you can't shoot past them)
* (small) Explosion (NEED: explosion and rocket in the same format)
* (small) Rocket animation 

* (bug) hit arrow keys should cancel the bubble
* (bug) kill notices
* (bug) you can kill yourself?

* (clean) use signals/events instead of $rootScope.broadcast
* (clean) automated tests

* DONE (feature) chat bubbles
* DONE (bug) can't shoot past dead people (NO. dead people become headstones / obstacles)
* DONE (bug) player animations not propogating to other computers. (I was removing the keys before re-adding them. For some reason the bindings were triggering twice. Lame)
* DONE names with spaces in them? (spaces are ok, other characters are not)
* DONE (clean) going back to the main page should clean up the game. (music doesn't stop, doesn't remove you from the game)
* DONE (bug) disconnect from missiles too (in game)
* DONE <script async></script> loading (Doesn't need it!)
* DONE Two missiles colliding should explode
* DONE Collide with other players
* DONE deploy to server with REAL domain (can heroku do it? Do you need hosting?)
* DONE (bug) loop music
* DONE (bug) current player not set when you check winner? BIG ONE: the old Players object is kicking around, and IT gets all set up and good to go, but the new one doesn't
* DONE (bug) must click to play
* DONE (bug) multiple taunt bubbles. umm... no
* DONE (bug) move/fire after dead
* DONE (bug) rounds / winning
* DONE (bug) closed-lid players

* NO (idea) switch game/matches when you switch matches? (don't really need it any more. bugs are fixed)


METRICS
-------

How many people come?
How long to people stay?
How many people come back?
How often do they come back?
Do people invite their friends?

CLEANUP
-------

* When you donate, we should keep track in your session / user profile

Next Features?
-------------
* 3... 2... 1... Fight!
* facebook / twitter login
* invite only

Not Yet
-------
* Coral / Walls
* Powerups
* Update payments
* matchmaking via geolocation
* Cannonical server? Ditch firebase?


Google Hangouts
---------------

[ ] https (not sure if that's why it isn't letting me invite people?)
[ ] publish it??

https://developers.google.com/+/hangouts/writing

Shared Application State: https://developers.google.com/+/hangouts/api/#gapi.hangout.data

  gapi.hangout.onApiReady.add(function(eventObj) {
    startMyApp();
  });

  gapi.hangout.getEnabledParticipants()
  gapi.hangout.getHangoutId()
  gapi.hangout.getParticipantByIdI()
  gapi.hangout.getLocalParticipant()
  gapi.hangout.getParticipants()
  gapi.hangout.isApiReady()
  gapi.hangout.isAppVisible()
  gapi.hangout.isPublic()

  class Participant(
    id,
    displayIndex,
    hasMicrophone,
    hasCamera,
    hasAppEnabled,
    isBroadcaster,
    isInBroadcast,
    person,
    person.id,
    person.displayName,
    person.image,
    person.image.url
  )
