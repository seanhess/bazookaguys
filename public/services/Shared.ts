// This makes an object that is matched to the shared representation of it

// DONE updates
// TODO not based on name. Can you find out what the ref name is some other way? set a secret refname, not based on a property on the object? Like, what if I wanted more than one missile per player?
// TODO events when items are pushed and removed (and updated?)

///<reference path="../def/angular.d.ts"/>
///<reference path="./FB"/>
///<reference path="../def/underscore.d.ts"/>

// I don't like that I have to use "name", but whatever

module shared {
  export interface IObject {
    ref: fire.IRef;
    onValue(snap:fire.ISnapshot);
  }

  export interface IArrayItem {
    name:string;
  }

  export interface IArray {
    ref: fire.IRef;
    onPushed?(snap:fire.ISnapshot);
    onChanged?(snap:fire.ISnapshot);
    onRemoved?(snap:fire.ISnapshot);
  }

  export interface ObjectService {

    // public
    bind(ref:fire.IRef, type?:Function):IObject;
    unbind(so:IObject);
    set(so:IObject, properties?:string[]);


    // private
    setRef(ref:fire.IRef, value:any, properties?:string[]);
    makeUpdate(f:fire.IValueCB):fire.ISnapshotCB;
    objectEmpty(obj:any);
    //objectReplace(dest:any, source:any);
    objectExtend(dest:any, source:any);
  }

  export interface ArrayService {
    bind(ref:fire.IRef, type?:Function):IArray;
    unbind(so:IArray);
    set(arrayRef:fire.IRef, item:IArrayItem, properties?:string[]);
    push(arrayRef:fire.IRef, item:IArrayItem);
    remove(arrayRef:fire.IRef, item:IArrayItem);
  }
}



// stores a bunch of context
// person.save()

// everything explicit
// SharedArray.set(peopleRef, person)

// it can only have ONE prototype!
// but it can have defineProperty to a function



// one syntax to rule them all
// sharedObject.save(properties?)


angular.module('services')
.factory('SharedObject', function($rootScope:ng.IScope, FB:IFirebaseService):shared.ObjectService {

  return {
    bind:bind,
    unbind:unbind,
    setRef:setRef,
    set:set,
    makeUpdate:makeUpdate,
    objectEmpty:objectEmpty,
    //objectReplace:objectReplace,
    objectExtend:objectExtend,
  }

  function bind(ref:fire.IRef, type?:Function = Object):shared.IObject {
    var value = Object.create(type.prototype, {
      ref: { 
        value: ref 
      },
      onValue: {
        value: makeUpdate(function(updates) {
          // if null, then delete all properties
          if (!updates) return objectEmpty(value)
          _.extend(value, updates)
        })
      },
    })

    return value
  }

  function unbind(so:shared.IObject) {
    so.ref.off('value', so.onValue)
  }

  function set(so:shared.IObject) {
    setRef(so.ref, so)
  }

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

  function makeUpdate(f:fire.IValueCB):fire.ISnapshotCB {
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

  //function ignoreServer(f:Function) {
    //updating = true
    //f()
    //updating = false
  //}






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
})



.factory('SharedArray', function($rootScope:ng.IScope, FB:IFirebaseService, SharedObject:shared.ObjectService):shared.ArrayService {

  return {
    bind:bind,
    unbind:unbind,
    push: push,
    remove: remove,
    set: set,
  }

  function bind(ref:fire.IRef, type?:Function = Object):shared.IArray {
    //var sa:shared.IArray = {ref: ref, value:[]}
    var array = []
    var sa:shared.IArray = <any> array

    sa.ref = ref

    sa.onPushed = SharedObject.makeUpdate(function(value) {
      var obj = Object.create(type.prototype)
      SharedObject.objectExtend(obj, value)
      array.push(obj)
    })

    sa.onChanged = SharedObject.makeUpdate(function(value) {
      var obj = _.find(array, byName(value.name))
      SharedObject.objectExtend(obj, value)
    })

    sa.onRemoved = SharedObject.makeUpdate(function(value) {
      var index = indexOf(array, byName(value.name))
      if (index < 0) return
      array.splice(index, 1)
    })

    ref.on('child_added', sa.onPushed)
    ref.on('child_changed', sa.onChanged)
    ref.on('child_removed', sa.onRemoved)

    return sa
  }

  function unbind(array:shared.IArray) {
    array.ref.off('child_added', array.onPushed)
    array.ref.off('child_changed', array.onChanged)
    array.ref.off('child_removed', array.onRemoved)
  }

  function push(arrayRef:fire.IRef, item:shared.IArrayItem) {
    var ref = arrayRef.child(item.name)
    ref.removeOnDisconnect()
    SharedObject.setRef(ref, item)
  }

  function remove(arrayRef:fire.IRef, item:shared.IArrayItem) {
    arrayRef.child(item.name).remove()
  }

  // like set, call this if you already know you've updated locally
  function set(arrayRef:fire.IRef, item:shared.IArrayItem, properties?:string[]) {
    SharedObject.setRef(arrayRef.child(item.name), item, properties)
  }



  function byName(name:string):(item:shared.IArrayItem) => bool {
    return function(item:shared.IArrayItem) {
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
