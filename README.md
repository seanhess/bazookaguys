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


Needs
-----
* better explosion / death graphic
* explosion and rocket in same format

Hit List
--------
* names with spaces in them?
* Explosion (NEED: explosion and rocket in the same format)
* Rocket animation 
* (bug) you can kill yourself?
* (bug) disconnect from missiles too (in game)
* Collide with other players
* Two missiles colliding should explode
* <script async></script> loading

* (clean) use signals/events instead of $rootScope.broadcast
* (clean) going back to the main page should clean up the game. 
* (idea) switch game/matches when you switch matches?

* DONE deploy to server with REAL domain (can heroku do it? Do you need hosting?)
* DONE (bug) loop music
* DONE (bug) current player not set when you check winner? BIG ONE: the old Players object is kicking around, and IT gets all set up and good to go, but the new one doesn't
* DONE (bug) must click to play
* DONE (bug) multiple taunt bubbles. umm... no
* DONE (bug) move/fire after dead
* DONE (bug) rounds / winning
* DONE (bug) closed-lid players

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
