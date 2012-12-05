// This makes an object that is matched to the shared representation of it

// DONE updates
// TODO not based on name. Can you find out what the ref name is some other way? set a secret refname, not based on a property on the object? Like, what if I wanted more than one missile per player?
// TODO events when items are pushed and removed (and updated?)

///<reference path="../def/angular.d.ts"/>
///<reference path="./FB"/>
///<reference path="../def/underscore.d.ts"/>
///<reference path="../def/signals.d.ts"/>

// I don't like that I have to use "name", but whatever

module shared {
  export interface IObject {
    ref: fire.IRef;
    onValue(snap:fire.ISnapshot);
    updated:signals.ISignal;
  }

  export interface IArrayItem {
    name:string;
  }

  export interface IArray {
    ref: fire.IRef;
    onPushed?(snap:fire.ISnapshot);
    onChanged?(snap:fire.ISnapshot);
    onRemoved?(snap:fire.ISnapshot);

    pushed:signals.ISignal;
    updated:signals.ISignal;
    removed:signals.ISignal;
  }

  export interface ObjectService {

    // public
    bind(ref:fire.IRef, type?:Function):IObject;
    unbind(so:IObject);
    set(so:IObject, properties?:string[]);
  }

  export interface ArrayService {
    bind(ref:fire.IRef, type?:Function):IArray;
    unbind(array:IArray);
    set(array:IArray, item:IArrayItem, properties?:string[]);
    push(array:IArray, item:IArrayItem);
    remove(array:IArray, item:IArrayItem);
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

      Object.defineProperty(value, "ref", {value:ref})
      Object.defineProperty(value, "onValue", {
        value: makeUpdate($rootScope, function(updates) {
          console.log("On Value", updates)
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
      so.ref.off('value', so.onValue)
      so.updated.dispose()
    }

    function set(so:IObject) {
      setRef(so.ref, so)
    }

  })



  .factory('SharedArray', function($rootScope:ng.IScope, FB:IFirebaseService):ArrayService {

    return {
      bind:bind,
      unbind:unbind,
      push: push,
      remove: remove,
      set: set,
    }

    function bind(ref:fire.IRef, type?:Function = Object):IArray {

      // We need to extend array here, which is tricky. We'll use defineProperty to make non-enumerable properties
      var array = []
      var sa:IArray = <any> array

      // ref is contextual, needs to be set here with define property
      Object.defineProperty(sa, "ref", {value:ref})

      // the rest are just methods
      Object.defineProperty(sa, "onPushed", {
        value: makeUpdate($rootScope, function(value) {
          var obj = Object.create(type.prototype)
          objectExtend(obj, value)
          array.push(obj)
        })
      })

      Object.defineProperty(sa, "onChanged", {
        value: makeUpdate($rootScope, function(value) {
          var obj = _.find(array, byName(value.name))
          objectExtend(obj, value)
        })
      })

      Object.defineProperty(sa, "onRemoved", {
        value: makeUpdate($rootScope, function(value) {
          var index = indexOf(array, byName(value.name))
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
      array.ref.off('child_added', array.onPushed)
      array.ref.off('child_changed', array.onChanged)
      array.ref.off('child_removed', array.onRemoved)
    }

    function push(array:IArray, item:IArrayItem) {
      var ref = array.ref.child(item.name)
      ref.removeOnDisconnect()
      setRef(ref, item)
    }

    function remove(array:IArray, item:IArrayItem) {
      array.ref.child(item.name).remove()
    }

    // like set, call this if you already know you've updated locally
    function set(array:IArray, item:IArrayItem, properties?:string[]) {
      setRef(array.ref.child(item.name), item, properties)
    }



    function byName(name:string):(item:IArrayItem) => bool {
      return function(item:IArrayItem) {
        return (item.name == name)
      }
    }


    function indexOf(array:any[], iterator:(item:any) => bool):number {
      for (var i = 0; i < array.length; i++) {
        if (iterator(array[i])) return i
      }
      return -1
    }

  })



  // Data Snapshot: contains all the data at that point in time. Including all child data
  // you could do complicated nested objects with this!

  // Object.defineProperty() enumerable defaults to false!
  }



  // stores a bunch of context
  // person.save()

  // everything explicit
  // SharedArray.set(peopleRef, person)

  // it can only have ONE prototype!
  // but it can have defineProperty to a function



  // one syntax to rule them all
  // sharedObject.save(properties?)


