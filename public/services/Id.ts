///<reference path="../def/angular.d.ts"/>

console.log("Register: Id")

interface IdService {
  sanitize(name:string):string;
  randomId():string;
}

angular.module('services')
.factory('Id', function():IdService {
  return {
    sanitize: sanitize,
    randomId: randomId,
  }
    
  function sanitize(name:string):string {
    if (!name) return null
    return name.toString().replace(/[^a-z0-9\s]/gi, "")
  }

  function randomId():string {
    return Math.random().toString(36).replace(/[0-9\.]/g, "")
  }
})
