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
    value:any;
    updating?:bool;
    onValue?(snap:fire.ISnapshot);
  }

  export interface IArrayItem {
    name:string;
  }

  export interface IArray extends IObject {
    value:IArrayItem[];
    onPushed?(snap:fire.ISnapshot);
    onChanged?(snap:fire.ISnapshot);
    onRemoved?(snap:fire.ISnapshot);
  }

  export interface ObjectService {
    bind(ref:fire.IRef):IObject;
    unbind(so:IObject);
    set(ref:fire.IRef, value:any, shouldIgnoreServer?:bool);
    update(ref:fire.IRef, object:any, properties:string[]);
    makeUpdate(f:fire.IValueCB):fire.ISnapshotCB;

    objectEmpty(obj:any);
    objectReplace(dest:any, source:any);
    objectExtend(dest:any, source:any);
  }

  export interface ArrayService {
    bind(ref:fire.IRef):IArray;
    unbind(so:IArray);
    push(arrayRef:fire.IRef, item:IArrayItem);
    remove(arrayRef:fire.IRef, item:IArrayItem);
    set(arrayRef:fire.IRef, item:IArrayItem);
    update(arrayRef:fire.IRef, object:any, properties:string[]);
  }
}

angular.module('services')
.factory('SharedObject', function($rootScope:ng.IScope, FB:IFirebaseService):shared.ObjectService {

  // whether we are currently responsible for an update and should ignore any changes to the remote object
  var updating = false

  return {
    bind:bind,
    unbind:unbind,
    update:update,
    set:set,
    makeUpdate:makeUpdate,
    objectEmpty:objectEmpty,
    objectReplace:objectReplace,
    objectExtend:objectExtend,
  }


  function bind(ref:fire.IRef):shared.IObject {
    var so:shared.IObject = {ref: ref, value:{}}

    so.onValue = makeUpdate(function(value) {
      if (!value) return objectEmpty(so.value)
      _.extend(so.value, value)
    })

    // if null, then delete all properties
    ref.on('value', so.onValue)
    return so
  }

  function unbind(so:shared.IObject) {
    so.ref.off('value', so.onValue)
  }


  // only work on shared objects! not shared arrays!
  // or ALWAYS have them be updates?
  // under what conditions would you want to REPLACE them?
  // um... never?
  function set(ref:fire.IRef, object:any, shouldIgnoreServer?:bool = true) {

    // need to clean up the object. Make sure all keys are defined, and there are no $$hashKeys and the like
    var updates = {}
    Object.keys(object).forEach(function(key) {
      if (typeof object[key] !== "undefined" && !key.match(/^\$/))
        updates[key] = object[key]
    })

    if (!shouldIgnoreServer) 
      return ref.set(updates)

    ignoreServer(function() {
      ref.set(updates)
    })
  }

  function update(ref:fire.IRef, object:any, properties:string[]) {
    var updates = _.pick.apply(null, [object].concat(properties))
    ignoreServer(function() {
      ref.update(updates)
    })
  }


  function makeUpdate(f:fire.IValueCB):fire.ISnapshotCB {
    return function(snap:fire.ISnapshot) {
      if (updating) return
      //console.log("UPDATING", JSON.stringify(snap.val()))
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






  function objectEmpty(obj:any) {
    Object.keys(obj).forEach(function(key) {
      delete obj[key]
    })
  }

  function objectReplace(dest:any, source:any) {
    objectExtend(dest, source)
  }

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
    update: update,
  }

  function bind(ref:fire.IRef):shared.IArray {
    var sa:shared.IArray = {ref: ref, value:[]}

    sa.onPushed = SharedObject.makeUpdate(function(value) {
      sa.value.push(value)
    })

    sa.onChanged = SharedObject.makeUpdate(function(value) {
      var obj = _.find(sa.value, byName(value.name))
      SharedObject.objectReplace(obj, value)
    })

    sa.onRemoved = SharedObject.makeUpdate(function(value) {
      var index = indexOf(sa.value, byName(value.name))
      if (index < 0) return
      sa.value.splice(index, 1)
    })

    ref.on('child_added', sa.onPushed)
    ref.on('child_changed', sa.onChanged)
    ref.on('child_removed', sa.onRemoved)

    return sa
  }

  function unbind(sa:shared.IArray) {
    sa.ref.off('child_added', sa.onPushed)
    sa.ref.off('child_changed', sa.onChanged)
    sa.ref.off('child_removed', sa.onRemoved)
  }

  function push(arrayRef:fire.IRef, item:shared.IArrayItem) {
    var ref = arrayRef.child(item.name)
    ref.removeOnDisconnect()
    SharedObject.set(ref, item, false)
  }

  function remove(arrayRef:fire.IRef, item:shared.IArrayItem) {
    arrayRef.child(item.name).remove()
  }

  // like set, call this if you already know you've updated locally
  function set(arrayRef:fire.IRef, item:shared.IArrayItem) {
    SharedObject.set(arrayRef.child(item.name), item)
  }

  // you lose type checking on the property list, but you do that anyway
  // even with an object, because there is no support for generics
  function update(arrayRef:fire.IRef, item:shared.IArrayItem, properties:string[]) {

    // NOTE: if name doesn't exit, it will create a new node with no .name!

    SharedObject.update(arrayRef.child(item.name), item, properties)
    //set(arrayRef.child(item.name), {})
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
