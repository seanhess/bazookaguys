///<reference path="../def/angular.d.ts"/>

interface IPreferences {
  avatar:string;
  name:string;
  gameId:string;
}

// I should put it in the URL anyway
interface ICurrentPlayerService {
  loadPreferences():IPreferences;
  savePreferences(name:string, avatar:string, gameId:string);
}

angular.module('services')

.factory('CurrentPlayer', function():ICurrentPlayerService {
  // lets you share the current player

  function loadPreferences():IPreferences {
    return {
      avatar: localStorage.getItem("avatar"),
      name: localStorage.getItem("name"),
      gameId: localStorage.getItem("gameId"),
    }
  }

  function savePreferences(name:string, avatar:string, gameId:string) {
    localStorage.setItem("avatar", avatar)
    localStorage.setItem("name", name)
    localStorage.setItem("gameId", gameId)
  }

  return {
    loadPreferences: loadPreferences,
    savePreferences: savePreferences,
  }
})
