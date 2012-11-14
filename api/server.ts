///<reference path='def/node.d.ts' />
///<reference path="def/express.d.ts"/>

var PORT = process.env.PORT || 3000
import exp = module('express')
var stylus = require('stylus')
var nib = require('nib')
var connect = require('connect')

import auth = module('auth/control')

var app = exp()

// don't use this to expose any assets, just the API
app.configure("development", () => {
  console.log("DEVELOPMENT")
  app.use(stylus.middleware({
    src: 'public',
    compile: (str, path) => {
      console.log("stylus: ", path)
      return stylus(str).use(nib()).import('nib').set('filename', path)
    }
  }))
  app.use(connect.static(__dirname + '/../public'))
})

app.use(connect.cookieParser())
app.use(connect.bodyParser())
app.use(connect.session({secret: 'funky monkey', key: 'blah', store:new connect.session.MemoryStore()}))

app.use(auth.routes)

app.listen(PORT, () => {
  console.log("RUNNING " + PORT)
})
