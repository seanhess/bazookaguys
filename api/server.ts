///<reference path="def/express.d.ts"/>

var PORT = process.env.PORT || 3000
import express = module('express')
var stylus = require('stylus')
var nib = require('nib')

import auth = module('auth/control')

//declare function express():express.ServerApplication;
var app = express.createServer()
express.createServer()


// don't use this to expose any assets, just the API
app.configure("development", () => {
  console.log("DEVELOPMENT")
  app.use(stylus.middleware({
    src: 'public',
    compile: (str, path) => {
      return stylus(str).use(nib()).import('nib').set('filename', path)
    }
  }))
  app.use(express.static(__dirname + '/../public'))
})

app.use((<any> express).cookieParser())
app.use((<any> express).bodyParser())
app.use((<any> express).session({secret: 'funky monkey', key: 'blah', store:new (<any>express).session.MemoryStore()}))

app.use(auth.routes)

app.listen(PORT, () => {
  console.log("RUNNING " + PORT)
})
