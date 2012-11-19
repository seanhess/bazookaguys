interface ISoundEffectsService {
  pause(audio:HTMLAudioElement);
  music();
  explosion();
  rocket();
}

angular.module('services')

.factory('SoundEffects', function():ISoundEffectsService {

  var bgMusic = new Audio("/audio/g-style.mp3")
  bgMusic.loop = true
  //var underwater = new Audio("/audio/Underwater.mp3")
  var epic = new Audio("/audio/UnderwaterEpicBattle.mp3")

  function makeMusic(audio:HTMLAudioElement, seconds:number):() => void {
    seconds = seconds || 0

    return function() {

      // if already playing it should be available
      if (audio.currentTime > 0) {
        audio.pause()
        audio.currentTime = seconds
        audio.play()
      }

      // otherwise, assume it has just loaded?
      $(audio).bind("canplay", function() {
        audio.currentTime = seconds
        audio.play()
      })

      return audio
    }

  }

  // all parameters required
  function makeSound(audio:HTMLAudioElement, seconds:number, duration:number):() => void {
    return function() {
      audio.pause()
      // we don't want the canplay thing if we're going to play it after it's been really loaded.
      //$(audio).bind("canplay", function() {
        audio.currentTime = seconds
        audio.play()
        setTimeout(function() {
          audio.pause()
        }, duration)
      //})

      return audio
    }
  }

  function pause(audio:HTMLAudioElement) {
    audio.pause()
  }

  return {
    pause: pause,

    music: makeMusic(bgMusic, 0), // start at 8 seconds
    explosion: makeSound(epic, 0, 750), // 1 - 1.5
    rocket: makeSound(epic, 1, 500)
    //levelUp: makeSound(underwater, 76, 2500)
  }

})
