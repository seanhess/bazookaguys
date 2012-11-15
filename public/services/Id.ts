///<reference path="../def/angular.d.ts"/>

console.log("Register: Id")

interface IdService {
  sanitize(name:string):string;
}

angular.module('services')
.factory('Id', function() {
  return {
    sanitize: function(name:string):string {
      if (!name) return null
      return name.toString().replace(/[^a-z0-9]/gi, "")
    }
  }
})
