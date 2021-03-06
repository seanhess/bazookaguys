///<reference path="../def/angular.d.ts"/>
///<reference path="../def/underscore.d.ts"/>

// TODO switch to firebase.d.ts
declare var Firebase;

interface IFirebaseService {
  ref(url:string):fire.IRef;
  game(gameId:string):fire.IRef;
  apply(cb:fire.IValueCB):fire.ISnapshotCB;
  update(ref:fire.IRef, obj:any);
}

module fire {

  export interface IRef {
    child(name:string);
    on(event:string, cb:ISnapshotCB);
    once(event:string, cb:ISnapshotCB);
    off(event:string, cb:ISnapshotCB);
    set(val:any);
    update(val:any);
    removeOnDisconnect();
  }

  export interface ISnapshot {
    val();
  }

  export interface ISnapshotCB {
    (ref:ISnapshot);
  }

  export interface IValueCB {
    (val:Object);
  }


  // Functional Style Class: it's the same as the module that you were looking for!
  // wait, this sucks. To call other functions in the module, you have to use this
  // oh, it's not that bad

  // KEEP AROUND: as an example of the class function method
  // plus: you can define all the typing inline
  // minus: you have to use "this" for all dependencies
  // minus: can lose this pointer
  // xxxxx: you should be using an interface type, so you have to define the interface twice anyway (EXCEPT, you don't need to do that right away, not until you test, and you don't test anyway!) (Typing is REPLACING your tests)

  export class FB implements IFirebaseService{

    constructor(
        private $rootScope:ng.IRootScopeService
    ) { }

    game(gameId:string):IRef {
      return this.ref("/uarbg2/" + gameId)
    }

    ref(url:string):IRef {
      var ref = new Firebase("https://seanhess.firebaseio.com" + url)
      return ref
    }

    apply(f:IValueCB):ISnapshotCB {
      return (ref:ISnapshot) => {
        if ((<any>this.$rootScope).$$phase)
          return f(ref.val())
        this.$rootScope.$apply(function() {
          f(ref.val())
        })
      }
    }

    update(ref:IRef, obj:any) {
      for (var key in obj) {
        if (obj[key] === undefined)
          delete obj[key]
      }

      ref.set(_.omit(obj, "$$hashKey"))
    }
  }
}

angular.module('services').factory('FB', function($rootScope):IFirebaseService {
  return new fire.FB($rootScope)
})
