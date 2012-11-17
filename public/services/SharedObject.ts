// This makes an object that is matched to the shared representation of it

///<reference path="../def/angular.d.ts"/>
///<reference path="./FB"/>
///<reference path="../def/underscore.d.ts"/>

interface SharedArray {
  ref: fire.IRef;
  value:any[];
}

interface SharedObject {
  ref: fire.IRef;
  value:any;
  updating?:bool;
}

interface SharedObjectService {
  object(ref:fire.IRef):SharedObject;
  set(so:SharedObject);
  update(so:SharedObject, property:string);
}

angular.module('services')
.factory('SharedObject', function($rootScope:ng.IScope, FB:IFirebaseService):SharedObjectService {

  return {
    object:object,
    update:update,
    set:set,
  }

  // these connect them up
  function object(ref:fire.IRef):SharedObject {
    var so:SharedObject = {ref: ref, value:{}}

    // if null, then delete all properties
    ref.on('value', function(snapshot:fire.ISnapshot) {

      // ignore if we caused the value change
      if (so.updating) return

      $rootScope.$apply(function() {
        var value = snapshot.val()
        if (!value) return
        _.extend(so.value, value)
      })
    })

    return so
  }

  // only work on shared objects! not shared arrays!
  function set(so:SharedObject) {
    var updates = {}
    var obj = so.value
    Object.keys(obj).forEach(function(key) {
      if (obj[key] && !key.match(/^\$/))
        updates[key] = obj[key]
    })

    // ignore changes between these!
    so.updating = true
    so.ref.set(updates)
    so.updating = false
  }

  function update(so:SharedObject, property:string) {
    so.ref.child(property).set(so[property])
  }
})


// Data Snapshot: contains all the data at that point in time. Including all child data
// you could do complicated nested objects with this!
