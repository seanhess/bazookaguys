///<reference path="../def/request.d.ts"/>

import express = module('express')
import request = module('request')

var OAuth = require('oauth').OAuth

interface SessionRequest extends express.ServerRequest {
  session:Session;
}

interface OAuthOptions {
  requestUrl: string;
  accessUrl: string;
  consumerKey: string;
  consumerSecret: string;
  version: string;
  callbackUrl: string;
  signatureMethod: string; // HMAC-SHA1
}

// my session
interface Session {
  oauth?: SessionOauth;
  user?: IUser;
  gameId?:string;
}

// share this between both!
interface IUser {
  username: string;
  twitterId: string;
  twitterScreenName: string;
  avatarUrl?: string;
  name?:string;
  description?:string;
}

interface SessionOauth {
  requestToken?:string;
  requestSecret?:string;
  accessToken?:string;
  accessSecret?:string;
  verifier?:string;
}

// TWITTER USER: there are more properties
//https://api.twitter.com/1/users/show.json?screen_name=twitterapi&include_entities=true
interface ITwitterUser {
  id: number;
  id_str: string;
  name: string;
  screen_name: string;
  location: string;
  url: string;
  description: string;
  profile_image_url: string;
}

function consumer(options:OAuthOptions) {
  return new OAuth(options.requestUrl, options.accessUrl, options.consumerKey, options.consumerSecret, options.version, options.callbackUrl, options.signatureMethod)
}

// Use OAuth 1.0a rather than the newer version, because they don't have long-lived
// tokens on their newer system
// key and secret: your twitter consumer key and secret. Get one at developer.twitter.com
// callbackUrl: you have to have a url that twitter calls after they finish log
function twitterConsumer(key:string, secret:string, callbackUrl?:string) {
  return consumer({
    requestUrl:"https://api.twitter.com/oauth/request_token",
    //requestUrl:"http://localhost:3000/auth/debug",
    accessUrl:"https://api.twitter.com/oauth/access_token",
    consumerKey: key,
    consumerSecret: secret,
    version: "1.0A",
    callbackUrl: callbackUrl || null, // must be NULL not undefined
    signatureMethod: "HMAC-SHA1",
  })
}

// we'll define the callback url when we send the request
var twitter = twitterConsumer("tns3FETsDLzkZjbtOBQ", "uzWAVNVKwXL1lSRao8osjBhjYdUByweC0b1H8FE7ExU") // , "http://localhost:3000/api/auth/twitter/callback")

export var routes = express()

routes.get('/api/auth/user', function(req:SessionRequest, res:express.ServerResponse) {
  res.json(req.session.user || {error: "Not Authenticated"})
})

routes.post('/api/auth/logout', function(req:SessionRequest, res:express.ServerResponse) {
  delete req.session.user
  delete req.session.oauth
  res.send(200)
})

routes.get('/api/auth/twitter/login', function(req:SessionRequest, res:express.ServerResponse) {

  // if they send a gameId, save that for the redirect later
  var gameId = req.param('gameId')

  var oauth_callback = "http://"+req.header('host')+"/api/auth/twitter/callback"
  twitter.getOAuthRequestToken({oauth_callback:oauth_callback}, function(err, requestToken, requestSecret, results) {
    req.session.oauth = {}
    req.session.oauth.requestToken = requestToken
    req.session.oauth.requestSecret = requestSecret
    req.session.gameId = gameId
    res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken)
  })
})

routes.get('/api/auth/twitter/callback', function(req:SessionRequest, res:express.ServerResponse) {
  var oauth = req.session.oauth
  oauth.verifier = req.param('oauth_verifier')
  twitter.getOAuthAccessToken(oauth.requestToken, oauth.requestSecret, oauth.verifier, function(err, accessToken, accessSecret, profile) {
    // TODO redirect to an error page or something
    if (err) return res.json(err, 500)
    oauth.accessToken = accessToken
    oauth.accessSecret = accessSecret
    console.log("PROFILE", profile)
    req.session.user = {username: profile.screen_name, twitterId: profile.user_id, twitterScreenName: profile.screen_name}

    request.get({url: "https://api.twitter.com/1/users/show.json?screen_name="+req.session.user.username+"&include_entities=true", json:true}, function(err, rs, user:ITwitterUser) {
      if (err) return res.json(err, 500)

      req.session.user.twitterId = user.id_str
      req.session.user.twitterScreenName = user.screen_name
      req.session.user.avatarUrl = user.profile_image_url
      req.session.user.name = user.name
      req.session.user.description = user.description

      console.log("LOGGED IN!", req.session.user)

      var url = "/#/identify"
      if (req.session.gameId) url += "?gameId=" + req.session.gameId
      res.redirect(url)
    })
  })
})

// FULL PROFILE INFORMATION
// https://api.twitter.com/1/users/show.json?screen_name=seanhess&include_entities=true

// FRIENDS AND FOLLOWERS
// https://api.twitter.com/1/followers/ids.json?cursor=-1&screen_name=twitterapi
// https://api.twitter.com/1/friends/ids.json?cursor=-1&screen_name=seanhess


