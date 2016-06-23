# STEP-ONE

```
npm i express express-generator
mkdir movieworld
cd movieworld
express . -f
npm i
npm i --save-dev supervisor
```

edit package.json - change node to
supervisor in "start": "node ./bin/www"

```
npm start
```
open browser at http://localhost:/3000

also a simple db/config.js file with the settings for the database

```javascript
// database stuff
const dbServer = 'localhost';
const database = 'movieworld';
const user = 'postgres';
const password = 'postgres';

module.exports = {
    dbServer,
    database,
    user,
    password,
};
```
# STEP-TWO

```
npm i --save sequelize pg pg-hstore fluent-sql
npm i --save circular-json
```

add models, example movie....
```javascript
/* eslint-disable comma-dangle */
const SqlTable = require('fluent-sql').SqlTable;

const Columns = [
    {name: 'id'},
    {name: 'title'},
    {name: 'duration'},
    {name: 'movie_rating_id'},
];

const table = new SqlTable({
    name: 'movie',
    columns: Columns
});
module.exports = table;
```

# STEP THREE

add routes example movie ...
```javascript
const express = require('express');
const router = express.Router();
//const CircularJSON = require('circular-json');

const SqlQuery = require('fluent-sql').SqlQuery;
const executeSimpleQuery = require('../db/database').executeSimpleQuery;

const movie = require('../db/models/movie');
const genre = require('../db/models/genre');
const movie_rating = require('../db/models/movie-rating');

router.get('/', (req, res, next) => {
    const query = new SqlQuery()
                        .from(movie)
                        .select(movie.id, movie.title, movie.duration)
                        .join(movie_rating.on(movie_rating.id).using(movie.movieRatingId))
                        .select(movie_rating.ratingCode);
    executeSimpleQuery(query)
                .then((data) => {
                    //TODO: insert a list of genres for each movie
                    res.send(data);
                })
                .catch(err => {
                    console.log(err);
                    next(err);
                });
});
router.get('/:id', (req, res, next) => {
    const query = new SqlQuery()
                        .from(movie)
                        .select(movie.id, movie.title, movie.duration)
                        .join(movie_rating.on(movie_rating.id).using(movie.movieRatingId))
                        .select(movie_rating.ratingCode)
                        .where(movie.id.eq(req.params.id));
    executeSimpleQuery(query)
                .then((data) => {
                    res.send(data);
                })
                .catch(err => {
                    console.log(err);
                    next(err);
                });
});
module.exports = router;
```

add routes to the app.js
I personally moved the original user route and index route down to keep all the routes together
```javascript
...
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/index');
var users = require('./routes/users');
const movie = require('./routes/movie');
const movie_rating = require('./routes/movie-rating');
const genre = require('./routes/genre');
app.use('/', routes);
app.use('/users', users);
app.use('/movie', movie);
app.use('/movie_rating', movie_rating);
app.use('/genre', genre);

// catch 404 and forward to error handler
...
```

# STEP FOUR
create a react client
```
npm i --save react react-dom
mkdir client
mkdir client/dist
mkdir client/components
```
make changes to the app.js file to serve our client pages

```javascript
...
app.set('view engine', 'jade');

// setup a static directory
app.use(express.static(path.join(__dirname, 'client/dist')));

// uncomment after placing your favicon in /public
...
```

dist\index.html
```html
<!doctype html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Movie World</title>
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" />
</head>

<body>
    <div class="navbar navbar-default">
        <div class="container-fluid">
            <div class="navbar-header">
                <a class="navbar-brand" href="#">Movie World</a>
            </div>
        </div>
    </div>
    <div id="container" class="container"></div>
    <script src="bundle.js"></script>
</body>

</html>
```
create a movie item
client/components/movie-info.js
```javascript
import React from 'react';

export default class MovieInfo extends React.Component {
    render() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    {this.props.movie.title}
                </div>
                <div className="panel-body">
                    {this.props.movie.ratingCode}
                </div>
            </div>
        );
    }
}
```

create list of movies
client/components/movie-list.js
```javascript
/* eslint-disable no-unused-vars */
import React from 'react';
import MovieInfo from './movie-info';

export default class MovieList extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="col-md-6">
                </div>
                <div className="col-md-6">
                    {
                        this.props.movies.map((movie, idx) => {
                            return (
                                <MovieInfo movie={movie} key={`movie-${idx}`} />
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}
```

make the main client/client.js file

```javascript
/* eslint-disable no-unused-vars */
import React from 'react';
import ReactDOM from 'react-dom';
import MovieList from './components/movie-list';

function render(movies) {
    ReactDOM.render(<MovieList movies={movies} />, document.getElementById('container'));
}

fetch('http://localhost:3000/movie', {
    method: 'GET',
    headers: {
        Accept: 'application/json',
    },
})
.then(data => {
    return data.json();
})
.then(json => {
    render(json);
});
```

lastly webpack.config.js in project root directory
```javascript
/* eslint-disable comma-dangle */
const path = require('path');

module.exports = {
    entry: ['./client/client.js'],
    output: {
        path: path.resolve(__dirname, 'client/dist'),
        filename: 'bundle.js',
        publicPath: '/build/'
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: 'eslint',
                include: path.join(__dirname, 'client')
            }
        ],
        loaders: [
            {
                loader: 'babel-loader',
                exclude: /node_modules/,
                test: /\.js$/,
                query: {
                    presets: ['es2015', 'react', 'stage-0'],
                },
            }
        ]
    }
};
```

# STEP FIVE
adde list of genres to the movies, and display them

change the routes/movie.js
