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
open browser at http://localhost:3000

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

add models

db/models/genre.js
```javascript
/* eslint-disable comma-dangle */
const SqlTable = require('fluent-sql').SqlTable;

const Columns = [
    {name: 'id'},
    {name: 'name'},
];

const table = new SqlTable({
    name: 'genre',
    columns: Columns
});
module.exports =  table;
```

db/models/movie-genre
```javascript
/* eslint-disable comma-dangle */
const SqlTable = require('fluent-sql').SqlTable;

const Columns = [
    {name: 'movie_id'},
    {name: 'genre_id'},
];

const table = new SqlTable({
    name: 'movie_genre',
    columns: Columns
});
module.exports =  table;
```

db/models/movie-rating.js
```javascript
/* eslint-disable comma-dangle */
const SqlTable = require('fluent-sql').SqlTable;

const Columns = [
    {name: 'id'},
    {name: 'rating_code'},
    {name: 'description'},
];

const table = new SqlTable({
    name: 'movie_rating',
    columns: Columns
});
module.exports =  table;
```

db/models/movie.js
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

create a databse helper file to handle the special pieces of postgres, and add 2 helper functions

db/database.js
```javascript
/* eslint-disable comma-dangle */
const config = require('./config');
const Sequelize = require('sequelize');
const CircularJSON = require('circular-json');
const {setDefaultOptions} = require('fluent-sql');

const debug = true;

// setup the actual database connection
const database = new Sequelize(config.database,
    config.user,
    config.password,
    {
        host: config.dbServer,
        dialect: 'postgres',
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },
        logging: debug ? console.log : false
    });

// set the options into fluent-sql so when we make calls any
// items that need to be escaped use "" the default is []
setDefaultOptions({
    sqlStartChar: '"',
    sqlEndChar: '"',
});

//setup a helper function to return 2 promises for complex queries
// fetchSql grabs data while the countSql is the same query just
// count(*) vs a column list
function executeComplexQuery(query) {
    const sql = query.genSql();
    console.log('sql', CircularJSON.stringify(sql, null, 2));
    try {
        const data = database.query(sql.fetchSql, {
            type: database.QueryTypes.SELECT,
            replacements: sql.values
        });
        const count = database.query(sql.countSql, {
            type: database.QueryTypes.SELECT,
            replacements: sql.values
        });
        return { data, count };
    } catch (err) {
        console.log(err);
    }
    return null;
}
// simple query just executes the fetchSql and returns a promise
function executeSimpleQuery(query) {
    const sql = query.genSql();
    console.log('sql', CircularJSON.stringify(sql, null, 2));
    try {
        const data = database.query(sql.fetchSql, {
            type: database.QueryTypes.SELECT,
            replacements: sql.values
        });
        return data;
    } catch (err) {
        console.log(err);
    }
    return null;
}

module.exports = {
    executeSimpleQuery,
    executeComplexQuery,
    database,
};
```

# STEP THREE

add routes

routes/genre.js
```javascript
const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    // get all the genres and ids
    res.send('respond with a genre resource');
});

module.exports = router;
```

routes/movie-rating.js
```javascript
const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    //TODO: get all the ratings and ids
    res.send('respond with a movie-rating resource');
});

module.exports = router;
```

routes/movie.js
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
Add list of genres to the movies, and display them. Also add a 404 check for the id get.

change the routes/movie.js
```javascript
/* global Promise */
/* eslint-disable no-param-reassign */
const express = require('express');
const router = express.Router();
//const CircularJSON = require('circular-json');

const SqlQuery = require('fluent-sql').SqlQuery;
const executeSimpleQuery = require('../db/database').executeSimpleQuery;

const movie = require('../db/models/movie');
const genre = require('../db/models/genre');
const movie_genre = require('../db/models/movie-genre');
const movie_rating = require('../db/models/movie-rating');

// return a promise for the results....
function getGenre(theMovie) {
    const query = new SqlQuery()
                    .from(genre)
                    .select(genre.name)
                    .join(movie_genre.on(movie_genre.genreId).using(genre.id))
                    .where(movie_genre.movieId.eq(theMovie.id));
    return executeSimpleQuery(query)
            .then(data => {
                theMovie.genres = data;
            });
}
router.get('/', (req, res, next) => {
    const query = new SqlQuery()
                        .from(movie)
                        .select(movie.id, movie.title, movie.duration)
                        .join(movie_rating.on(movie_rating.id).using(movie.movieRatingId))
                        .select(movie_rating.ratingCode);
    executeSimpleQuery(query)
                .then((data) => {
                    const promises = data.map(movie => {
                        return getGenre(movie);
                    });
                    // wait until all promises are complete
                    Promise.all(promises)
                        .then(() => res.send(data));
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
                    // add in some checking in case the ID was not in the database
                    if ( data.length > 0 ) {
                        getGenre(data[0])
                            .then(() => res.send(data[0]));
                    } else {
                        res.status(404).send(`${req.params.id} Not found`);
                    }
                })
                .catch(err => {
                    console.log(err);
                    next(err);
                });
});
module.exports = router;
```

add a comma seperated list of genres to the movie-info.js (MovieInfo control)
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
                    {/* add some code to pretty this up a little */}
                    {`Rating: ${this.props.movie.ratingCode} genres: `}
                    {
                        // add the comma separated list
                        this.props.movie.genres.map(g => g.name).join(',')
                    }
                </div>
            </div>
        );
    }
}
```
