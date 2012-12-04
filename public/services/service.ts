// some utilities
// NOT meant to be angular included, just raw included


// converts a class into an AngularJS service. It's injectable
// makes it easier to work with typescript without defining both an interface AND a module for everything
function toService(Class) {
  var f = function() {
    // we want to use a Class as a service
    var service = new Class()
    Class.apply(service, arguments)
    return service
  }

  // get it to have the same signature
  f.toString = function() {
    return Class.toString()
  }

  return f
}



// what I REALLY want is to be able to export from an inner module thingy. I want to "return" a module
