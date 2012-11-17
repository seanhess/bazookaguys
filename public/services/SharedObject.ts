// This makes an object that is matched to the shared representation of it

///<reference path="../def/angular.d.ts"/>
///<reference path="./FB"/>
///<reference path="../def/underscore.d.ts"/>

interface SharedObject {
  ref: fire.IRef;
  value:any;
  updating?:bool;
  onValue?(snap:fire.ISnapshot);
}

interface SharedArrayItem {
  id:string;
}

interface SharedArray extends SharedObject {
  value:SharedArrayItem[];
  onAdded?(snap:fire.ISnapshot);
  onChanged?(snap:fire.ISnapshot);
  onRemoved?(snap:fire.ISnapshot);
}

interface SharedObjectService {
  bindObject(ref:fire.IRef):SharedObject;
  unbindObject(so:SharedObject);
  set(ref:fire.IRef, value:any);
  update(ref:fire.IRef, value:any, property:string);

  bindArray(ref:fire.IRef):SharedArray;
  unbindArray(so:SharedArray);

  add(arrayRef:fire.IRef, item:SharedArrayItem);
  remove(arrayRef:fire.IRef, item:SharedArrayItem);
  setChild(arrayRef:fire.IRef, item:SharedArrayItem);
}

angular.module('services')
.factory('SharedObject', function($rootScope:ng.IScope, FB:IFirebaseService):SharedObjectService {

  // whether we are currently responsible for an update and should ignore any changes to the remote object
  var updating = false

  return {
    bindObject:bindObject,
    unbindObject:unbindObject,
    update:update,
    set:set,

    bindArray:bindArray,
    unbindArray:unbindArray,
    add: add,
    remove: remove,
    setChild: setChild,
  }

  // these connect them up
  function bindObject(ref:fire.IRef):SharedObject {
    var so:SharedObject = {ref: ref, value:{}}

    so.onValue = makeUpdate(function(value) {
      if (!value) return objectEmpty(so.value)
      _.extend(so.value, value)
    })

    // if null, then delete all properties
    ref.on('value', so.onValue)
    return so
  }

  function unbindObject(so:SharedObject) {
    so.ref.off('value', so.onValue)
  }

  // only work on shared objects! not shared arrays!
  function set(ref:fire.IRef, object:any, shouldIgnoreServer?:bool = true) {
    var updates = {}
    Object.keys(object).forEach(function(key) {
      if (object[key] && !key.match(/^\$/))
        updates[key] = object[key]
    })

    if (!shouldIgnoreServer) 
      return ref.set(updates)

    ignoreServer(function() {
      ref.set(updates)
    })
  }

  function update(ref:fire.IRef, object:any, property:string) {
    ref.child(property).set(object[property])
  }


  function makeUpdate(f:fire.IValueCB):fire.ISnapshotCB {
    return function(snap:fire.ISnapshot) {
      if (updating) return

      if ((<any>$rootScope).$$phase)
        return f(snap.val())

      $rootScope.$apply(function() {
        f(snap.val())
      })   
    }
  }

  function ignoreServer(f:Function) {
    updating = true
    f()
    updating = false
  }







  // Yay, now time for a shared array!
  function bindArray(ref:fire.IRef):SharedArray {
    var sa:SharedArray = {ref: ref, value:[]}

    sa.onAdded = makeUpdate(function(value) {
      sa.value.push(value)
    })

    sa.onChanged = makeUpdate(function(value) {
      var obj = _.find(sa.value, byId(value.id))
      objectReplace(obj, value)
    })

    sa.onRemoved = makeUpdate(function(value) {
      var index = indexOf(sa.value, byId(value.id))
      if (index < 0) return
      sa.value.splice(index, 1)
    })

    ref.on('child_added', sa.onAdded)
    ref.on('child_changed', sa.onChanged)
    ref.on('child_removed', sa.onRemoved)

    return sa
  }

  function unbindArray(sa:SharedArray) {
    sa.ref.off('child_added', sa.onAdded)
    sa.ref.off('child_changed', sa.onChanged)
    sa.ref.off('child_removed', sa.onRemoved)
  }

  function add(arrayRef:fire.IRef, item:SharedArrayItem) {
    setChild(arrayRef, item)
  }

  function remove(arrayRef:fire.IRef, item:SharedArrayItem) {
    arrayRef.child(item.id).remove()
  }

  // like set, call this if you already know you've updated locally
  function setChild(arrayRef:fire.IRef, item:SharedArrayItem) {
    set(arrayRef.child(item.id), item, false)
  }

















  function byId(id:string):(item:SharedArrayItem) => bool {
    return function(item:SharedArrayItem) {
      return (item.id == id)
    }
  }


  function indexOf(array:any[], iterator:(item:any) => bool):number {
    for (var i = 0; i < array.length; i++) {
      if (iterator(array[i])) return i
    }
    return -1
  }

  function objectEmpty(obj:any) {
    Object.keys(obj).forEach(function(key) {
      delete obj[key]
    })
  }

  function objectReplace(dest:any, source:any) {
    objectEmpty(dest)
    objectExtend(dest, source)
  }

  function objectExtend(dest:any, source:any) {
    Object.keys(source).forEach(function(key) {
      dest[key] = source[key]
    })
  }
})



// Data Snapshot: contains all the data at that point in time. Including all child data
// you could do complicated nested objects with this!

// Object.defineProperty() enumerable defaults to false!
