const express = require('express')
const routes = require('./routes')
const http = require('http')
const path = require('path')
// const mongoskin = require('mongoskin')
const mongoose = require('mongoose')
const dbUrl = process.env.MONGOHQ_URL || 'mongodb://127.0.0.1:27017/blog'
mongoose.connect(dbUrl, {useMongoClient: true})
const models = require('./models')
// const db = mongoskin.db(dbUrl)
// const collections = {
//   articles: db.collection('articles'),
//   users: db.collection('users')
// }

const cookieParser = require('cookie-parser')
const session = require('express-session')
const logger = require('morgan')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
// const everyauth = require('everyauth')

// everyauth.debug = true
// everyauth.twitter
//   .consumerKey(TWITTER_CONSUMER_KEY)
//   .consumerSecret(TWITTER_CONSUMER_SECRET)
//   .findOrCreateUser(function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
//     var promise = this.Promise()
//     process.nextTick(function () {
//       if (twitterUserMetadata.screen_name === 'azat_co') {
//         session.user = twitterUserMetadata
//         session.admin = true
//       }
//       promise.fulfill(twitterUserMetadata)
//     })
//     return promise
//     // return twitterUserMetadata
//   })
//   .redirectPath('/admin')

// we need it because otherwise the session will be kept alive
// the Express.js request is intercepted by Everyauth automatically added /logout
// and never makes it to our /logout
// everyauth.everymodule.handleLogout(routes.user.logout)

// everyauth.everymodule.findUserById(function (user, callback) {
//   callback(user)
// })

const app = express()
app.locals.appTitle = 'blog-express'

// Expose collections to request handlers
app.use((req, res, next) => {
  if (!models.Article || !models.User) return next(new Error('No models.'))
  req.models = models
  return next()
})

// Express.js configurations
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Express.js middleware configuration
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(methodOverride())
app.use(require('stylus').middleware(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser('3CCC4ACD-6ED1-4844-9217-82131BDCB239'))
app.use(session({secret: '2C44774A-D649-4D44-9535-46E296EF984F',
  resave: true,
  saveUninitialized: true}))

// Authorization Middleware
const authorize = (req, res, next) => {
  if (req.session && req.session.admin) {
    return next()
  } else {
    return res.status(401).send()
  }
}

// development only
if (app.get('env') === 'development') {
  app.use(errorHandler('dev'))
}

// Pages and routes
app.get('/', routes.index)
app.get('/login', routes.user.login)
app.post('/login', routes.user.authenticate)
app.get('/logout', routes.user.logout)
app.get('/admin', authorize, routes.article.admin)
app.get('/post', authorize, routes.article.post)
app.post('/post', authorize, routes.article.postArticle)
app.get('/articles/:slug', routes.article.show)

// // REST API routes
app.get('/api/articles', routes.article.list)
app.post('/api/articles', routes.article.add)
app.put('/api/articles/:id', routes.article.edit)
app.delete('/api/articles/:id', routes.article.del)

app.all('*', (req, res) => {
  res.status(404).send()
})

// http.createServer(app).listen(app.get('port'), function(){
  // console.log('Express server listening on port ' + app.get('port'));
// });

const server = http.createServer(app)
const boot = function () {
  server.listen(app.get('port'), function () {
    console.info(`Express server listening on port ${app.get('port')}`)
  })
}
const shutdown = function () {
  server.close(process.exit)
}
if (require.main === module) {
  boot()
} else {
  console.info('Running app as a module')
  exports.boot = boot
  exports.shutdown = shutdown
  exports.port = app.get('port')
}
