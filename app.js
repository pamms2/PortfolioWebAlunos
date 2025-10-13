const routes = require('./routers/route');
const handlebars = require('express-handlebars');
const express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const middlewares = require('./middlewares/middleware');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
  secret: 'textosecreto$asdfasdfaswwww',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 60 * 1000, 
    httpOnly: true,
    secure: false 
  }
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
})

const hbs = handlebars.create({
  defaultLayout: 'principal',
  helpers: {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    eq: (a,b) => a === b
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine','handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(middlewares.logRegister);
app.use(routes);

app.use(
    express.urlencoded({
      extended: true
    })
)

app.listen(8080, function(){
        console.log("Servidor no http://localhost:8080")
});