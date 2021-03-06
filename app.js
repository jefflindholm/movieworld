const express = require('express');
const path = require('path');
const favicon = require('serve-favicon'); // eslint-disable-line no-unused-vars
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// setup a static directory
app.use(express.static(path.join(__dirname, 'client/dist')));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet.hidePoweredBy());

const routes = require('./routes/index');
const users = require('./routes/users');
const movie = require('./routes/movie');
const movie_rating = require('./routes/movie-rating');
const genre = require('./routes/genre');
const imdb = require('./routes/imdb');
app.use('/', routes);
app.use('/users', users);
app.use('/movie', movie);
app.use('/movie_rating', movie_rating);
app.use('/genre', genre);
app.use('/imdb', imdb);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
    });
});


module.exports = app;
