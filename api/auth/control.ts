import express = module('express')
import express2 = module('def/express2')
var OAuth = require('oauth').OAuth

export var routes = <express2.ServerApplication> express.createServer()


/*

interface IOAuthOptions {
  requestUrl: string;
  accessUrl: string;
  consumerKey: string;
  consumerSecret: string;
  version: string;
  callbackUrl: string;
  signatureMethod: string; // HMAC-SHA1
}

var TWITTER = {
  requestUrl:"https://twitter.com/oauth/request_token",
  accessUrl:"https://twitter.com/oauth/access_token",
  consumerKey: "",
  consumerSecret: "",
  version: "1.0A",
  callbackUrl: "",
  signatureMethod: "HMAC-SHA1",
  //NONCE_SIZE: "",
  //CUSTOM_HEADERS: "",
}

function makeConsumer(options:IOAuthOptions) {
  return new Oauth(options.requestUrl, options.accessUrl, options.consumerKey, options.consumerSecret, options.version, options.callbackUrl, options.signatureMethod)
}

// is github any eaiser?
// I should probably just do sessions....
// but I only want to load the session on SOME of the requests, no?
// I don't really want to use sessions at all
// but I have to do SOMETHING

var API_BASE_URL = "http://localhost:3000"

var twitter = makeConsumer(TWITTER)

// this is a webpage the user loads... in their own window
routes.post('/auth/twitter/login', function(req, res) {
  // 1 // obtain a request token
  // 2 // redirect to login screen -> calls your site back with the informationz..
})

// have it be a front-end callback?
// either that, or you store it in the session like a MAN
// bah, sessions are LAME
// I have to add a whole dependency, but I suppose there's no way around that :)

// you can pass the callback in later

// you have to issue a callback.. blech
// well, the callback could be a route that's supposed to be called with the information

routes.post('/auth/twitter/callback', function(req, res) {

})
*/


// https://api.twitter.com/

// 1 - Obtain a request token - POST /oauth/request_token with a bunch of oauth stuff
// oauth_token=NPcudxy0yU5T3tBzho7iCotZ3cnetKwcTIRlX0iwRl0&
// oauth_token_secret=veNRnAWe6inFuo8o2u8SLLZLjolYDmDP7SzL0YfYI&
// oauth_callback_confirmed=true

// 2 - Redirect to GET /oauth/authenticate?oauth_token=??? with the result of step one
// use a 302
// YES: callback with oauth request token
// GET /callback?oauth_token=xx&oauth_verifier=nnnn

// 3 - Convert request token to access token
// POST /oauth/access_token - with another big oauth call, including oauth-verifier from #2
// comes back with oauth_token and oauth_token_secret


//////////////////////////////////////////////////////
// SORT OF WORKING PASSPORT VERSION
////////////////////////////////////////////////////

/*

var passport = require('passport')
//var LocalStrategy = require('passport-local').Strategy
var TwitterStrategy = require('passport-twitter').Strategy

declare module passport {

  export function authenticate(type:string, options?:IAuthOptions):express2.IHandler;
  export function authenticate(type:string, cb:(err, user, info)=>void):express2.IHandler;
  export function use(strategy:any);
  export function initialize();
  export function session();
  export function serializeUser(f:(user:any, done:Function) => void);
  export function deserializeUser(f:(id:string, done:Function) => void);

  export interface IAuthOptions {
    session?: bool;
    successRedirect?: string;
    failureRedirect?: string;
  }
}

//passport.use(new LocalStrategy(function(username, password, done) {
  //// you're supposed to call back with the user object
  //done(null, {username:username, password:password})

  //// if invalid
  //// done(null, false)
  //// done(null, false, { message: "Incorrect Password" })
//}))

// it CAN'T be that hard to integrate by hand


// NOTE: use Oauth 1.0a for long-lived tokens


var TwitterConfig = {
  consumerKey: "tns3FETsDLzkZjbtOBQ",
  consumerSecret: "uzWAVNVKwXL1lSRao8osjBhjYdUByweC0b1H8FE7ExU",
  callbackURL: "http://localhost:3000/auth/twitter/callback",
}

// what does this mean? does it apply to ALL requests?
// that's not exactly what I wanted. Wouldn't I need to ... umm... 
passport.use(new TwitterStrategy(TwitterConfig, function(token, tokenSecret, profile, done) {
  
  // wait, what IS this?
  // am I creating the user or just checking the password?

  console.log("AUTHED!", token, tokenSecret, profile.username)
  done(null, {blah:"hi"})
  // you save it and pass it back
  // basically you pass it back? 
  // this should check to make sure the user is authenticated
  // supposed to be a find or create
}))

passport.serializeUser(function(user, done) {
  console.log("SERIALIZE", user)
  done(null, "fakeUserId");
});

passport.deserializeUser(function(id, done) {
  console.log("DESERIALIZE", id)
  done(null, {some:"user"})
  //User.findById(id, function(err, user) {
    //done(err, user);
  //});
});

routes.use(passport.initialize())
routes.use(passport.session())

routes.get('/auth/twitter', passport.authenticate('twitter'))
routes.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/auth/ok',
  failureRedirect: '/auth/login',
}))

routes.get('/auth/logout', function(req, res) {
  delete (<any> req).session
  res.send(200)
})

routes.get('/auth/login', function(req, res) {
  console.log("/auth/login", (<any> req).user)
  res.send("LOGIN: <a href='/auth/twitter'>Login with Twitter</a>")
})

routes.get('/auth/ok', function(req, res) {
  console.log("/auth/ok", (<any> req).user)
  res.send("Passed!")
})

routes.get('/auth/session', function(req, res) {
  var asdf = <any> req
  res.json({session:asdf.session, user: asdf.user})
})


// MIDDLEWARE
// express.session({secret: 'keyboard cat'})
// passport.initialize()
// passport.session()
// app.router

//var auth = passport.authenticate('basic', {session: false})

//routes.get('/auth/twitter/start', function (req, res) {

//})

////routes.post('/auth/login', function(req, res) {})

//routes.post('/auth/login', passport.authenticate('local', { 
  //successRedirect: '/', 
  //failureRedirect: '/login',
//}));

//routes.get('/api/users/me', auth, function(req,res) {
  //res.json({id: req.user.id, username: req.user.username})
//})

*/
