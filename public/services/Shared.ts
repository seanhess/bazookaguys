// This makes an object that is matched to the shared representation of it

// DONE updates
// TODO events when items are pushed and removed (and updated?)

///<reference path="../def/angular.d.ts"/>
///<reference path="./FB"/>
///<reference path="../def/underscore.d.ts"/>
///<reference path="../def/signals.d.ts"/>

module shared {

  interface IHashFunction {
    (obj:any):string;
  }

  export interface IObject {
    _ref: fire.IRef;
    onValue(snap:fire.ISnapshot);
    updated:signals.ISignal;
  }

  export interface IArray {
    _ref: fire.IRef;
    _hash: IHashFunction;

    onPushed?(snap:fire.ISnapshot);
    onChanged?(snap:fire.ISnapshot);
    onRemoved?(snap:fire.ISnapshot);
  }

  export interface ObjectService {

    // public
    bind(ref:fire.IRef, hash?:IHashFunction, type?:Function):IObject;
    unbind(so:IObject);
    set(so:IObject, properties?:string[]);
  }

  export interface ArrayService {
    bind(ref:fire.IRef, type?:Function):IArray;
    unbind(array:IArray);
    set(array:IArray, item:any, properties?:string[]);
    push(array:IArray, item:any);
    remove(array:IArray, item:any);
    removeAll(array:IArray);
  }



  // Internal modules (used by both services, but not exported)
  function setRef(ref:fire.IRef, object:any, properties?:string[]) {

    if (properties) return updateRef(ref, object, properties)

    var keys = Object.keys(object).filter(function(key) {
      return (typeof object[key] !== "undefined" && !key.match(/^\$/))
    })

    var updates = _.pick.apply(null, [object].concat(keys))
    return ref.set(updates)
  }

  function updateRef(ref:fire.IRef, object:any, properties:string[]) {
    var updates = _.pick.apply(null, [object].concat(properties))
    ref.update(updates)
  }

  function makeUpdate($rootScope:ng.IScope, f:fire.IValueCB):fire.ISnapshotCB {
    return function(snap:fire.ISnapshot) {
      //if (updating) return
      //console.log("UPDATING", JSON.stringify(snap.val()))
      if ((<any>$rootScope).$$phase)
        return f(snap.val())

      $rootScope.$apply(function() {
        f(snap.val())
      })   
    }
  }

  function objectEmpty(obj:any) {
    Object.keys(obj).forEach(function(key) {
      delete obj[key]
    })
  }

  function toString(obj) { 
    return obj.toString() 
  }

  function byHash(hash:IHashFunction, value:Object):(item:any) => bool {
    var key = hash(value)
    return function(item:Object) {
      return hash(item) == key
    }
  }

  // it was weird to delete keys. Definitely didn't work to delete then re-add them
  // you can try to get fancier than this, but you don't really NEED to delete keys. Just set them to null
  // If they are set to null in the source it'll carry over
  //function objectReplace(dest:any, source:any) {
    //objectExtend(dest, source)
  //}

  function objectExtend(dest:any, source:any) {
    Object.keys(source).forEach(function(key) {
      dest[key] = source[key]
    })
  }



  // Export the module!
  angular.module('services')
  .factory('SharedObject', function($rootScope:ng.IScope, FB:IFirebaseService):ObjectService {

    return {
      bind:bind,
      unbind:unbind,
      set:set,
    }

    function bind(ref:fire.IRef, type?:Function = Object):IObject {
      var value = Object.create(type.prototype)

      Object.defineProperty(value, "_ref", {value:ref})
      Object.defineProperty(value, "onValue", {
        value: makeUpdate($rootScope, function(updates) {
          // if null, then delete all properties
          if (!updates) objectEmpty(value)
          else _.extend(value, updates)

          value.updated.dispatch(value)
        })
      })

      Object.defineProperty(value, "updated", {value: new signals.Signal()})

      ref.on('value', value.onValue)

      return value
    }

    function unbind(so:IObject) {
      so._ref.off('value', so.onValue)
      so.updated.dispose()
    }

    function set(so:IObject) {
      setRef(so._ref, so)
    }

  })



  .factory('SharedArray', function($rootScope:ng.IScope, FB:IFirebaseService):ArrayService {

    return {
      bind:bind,
      unbind:unbind,
      push: push,
      remove: remove,
      set: set,
      removeAll: removeAll,
    }

    function bind(ref:fire.IRef, hash:IHashFunction = toString, type?:Function = Object):IArray {

      // We need to extend array here, which is tricky. We'll use defineProperty to make non-enumerable properties
      var array = []
      var sa:IArray = <any> array

      // ref is contextual, needs to be set here with define property
      Object.defineProperty(sa, "_ref", {value:ref})
      Object.defineProperty(sa, "_hash", {value:hash})

      // the rest are just methods
      Object.defineProperty(sa, "onPushed", {
        value: makeUpdate($rootScope, function(value) {
          var obj = Object.create(type.prototype)
          objectExtend(obj, value)
          array.push(obj)
        })
      })

      Object.defineProperty(sa, "onChanged", {
        value: makeUpdate($rootScope, function(value:Object) {
          var obj = _.find(array, byHash(hash, value))
          objectExtend(obj, value)
        })
      })

      Object.defineProperty(sa, "onRemoved", {
        value: makeUpdate($rootScope, function(value) {
          var index = indexOf(array, byHash(hash, value))
          if (index < 0) return
          array.splice(index, 1)
        })
      })

      ref.on('child_added', sa.onPushed)
      ref.on('child_changed', sa.onChanged)
      ref.on('child_removed', sa.onRemoved)

      return sa
    }

    function unbind(array:IArray) {
      array._ref.off('child_added', array.onPushed)
      array._ref.off('child_changed', array.onChanged)
      array._ref.off('child_removed', array.onRemoved)
    }

    function push(array:IArray, item:Object) {
      var ref = array._ref.child(array._hash(item))
      // for now, leave this out. See if it still plays ok
      //ref.removeOnDisconnect()
      setRef(ref, item)
    }

    function remove(array:IArray, item:Object) {
      array._ref.child(array._hash(item)).remove()
    }

    // like set, call this if you already know you've updated locally
    function set(array:IArray, item:Object, properties?:string[]) {
      setRef(array._ref.child(array._hash(item)), item, properties)
    }
    
    // removeAll
    function removeAll(array:IArray) {
      // must concat, because otherwise you're removing items from the array while you're enumerating it
      (<any>array).concat().forEach(function(item:Object) {
        remove(array, item)
      })
    }

    function indexOf(array:Object[], iterator:(item:Object) => bool):number {
      for (var i = 0; i < array.length; i++) {
        if (iterator(array[i])) return i
      }
      return -1
    }

  })
}
