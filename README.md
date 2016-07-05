# Links
**react cheat sheets**
 * http://ricostacruz.com/cheatsheets/react.html
 * http://reactcheatsheet.com/

**ES6 Stuff**
 * http://www.2ality.com/2015/08/getting-started-es6.html?utm_source=javascriptweekly&utm_medium=email

# Database setup
This assumes you are using Postgres and using the command line (psql) to create the Database
```sql
CREATE DATABASE movieworld;
\c movieworld;
CREATE TABLE movie(
    id SERIAL PRIMARY KEY,
    title TEXT,
    duration INT
);
CREATE TABLE genre(
    id SERIAL PRIMARY KEY,
    name TEXT
);
CREATE TABLE movie_genre(
    movie_id INT REFERENCES movie(id),
    genre_id INT REFERENCES genre(id),
    PRIMARY KEY (movie_id, genre_id)
);
CREATE TABLE movie_rating(
    id SERIAL PRIMARY KEY,
    rating_code TEXT,
    description TEXT
);
ALTER TABLE movie
    ADD COLUMN movie_rating_id INT
        REFERENCES movie_rating(id);
\q
```
I made all the string columns TEXT since in Postgres the underlying type is always
TEXT even for VARCHAR(x) you would limit the text in your UI and DAL.

Insert some data, here are some examples:
```sql
INSERT INTO movie_rating (rating_code, description)
VALUES
('G', 'General Audiences'),
('PG', 'Parental Guidance Suggested'),
('PG-13', 'Parents Strongly Cautioned'),
('R', 'Restricted'),
('NC-17', 'Adults Only');

INSERT INTO genre (name)
VALUES
('Comedy'),
('Action'),
('Romance'),
('Suspense');
('Science Fiction'),
('Horror');

INSERT INTO movie (title, duration, movie_rating_id)
VALUES
('The Avengers', 143, 3), --PG-13
('A Scanner Darkly', 100, 4), --R
('A Nightmare on Elm Street', 86, 4), --R
('Toy Story', 81, 1), --G
('This Is 40', 134, 4); --R
```
Add some genre(s) to the movies on your own.....

# STEP-ONE

```
npm i -g express express-generator
mkdir movieworld
cd movieworld
express . -f
npm i
```
```
npm i --save-dev supervisor
```
**or**
```
npm i --save-dev nodemon
```

edit package.json - change node to
supervisor/nodemon in "start": "node ./bin/www"

Which ever you chose to install. (I mentioned this in step-six as well since this is an evolving doc)

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
npm i --save-dev babel-cli babel-core babel-eslint
npm i --save-dev babel-preset-es2015 babel-preset-stage-0 babel-preset-react
npm i --save-dev webpack babel-loader
npm i --save-dev eslint eslint-loader eslint-plugin-react
mkdir client
mkdir client/dist
mkdir client/components
```

we will be using webpack to to the transpiling of our react app, we are adding
es2015 and stage-0 so we can take advantage of new features in javascript

I like to have my webpack run eslint when it builds so I included the items needed
to allow that to happen

make a change to the package.json file to add a script
```
  "scripts": {
    "start": "supervisor ./bin/www",
    "build": "webpack"
  },
```
now you can execute:
```
npm run build
```
to build the webpack bundle.js file


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

# STEP SIX
Lets hook up a form to add/edit movies

```
npm i --save-dev style-loader css-loader
npm i --save react-select-plus
npm i --save nodemon
```
1. Add loaders required for CCS files being imported
2. Add a single and multi-select control
3. Some people mentioned nodemon when I gave a talk about this....

```json
"scripts": {
  "start": "supervisor -w routes -w db ./bin/www",
  "build": "webpack --progrss --colors",
  "webpack": "webpack --progress --colors --watch",
  "nodemon": "nodemon ./bin/www"
},
```
1. Have supervisor watch **routes** and **db** directories
2. add colors etc to webpack build
3. add a new webpack that watches for changes
4. add a new nodemon start

Lets create a new form to handle input of a movie and its details.
```javascript
// client/components/movie-form.js
import React from 'react';
import Select from 'react-select-plus';
import NumberInput from '../controls/number-input';
import 'react-select-plus/dist/react-select-plus.css';
import 'fluent-sql/dist/string';

export default class MovieForm extends React.Component {
    constructor() {
        super();
        this.state = {
            title: '',
            duration: 0,
            rating: null,
            ratings: [],
            genres: [],
            selectedRating: null,
            selectedGenres: [],
        };
    }
    componentDidMount() {
        fetch('http://localhost:3000/movie_rating', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        })
        .then(data => {
            return data.json();
        })
        .then(json => {
            const ratings = json.map(rating => {
                return {label: `${rating.ratingCode} - ${rating.description}`, value: rating.id};
            });
            this.setState({ratings});
        });
        fetch('http://localhost:3000/genre', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        })
        .then(data => {
            return data.json();
        })
        .then(json => {
            const genres = json.map(genre => {
                return {label: genre.name, value: genre.id};
            });
            this.setState({genres});
        });
    }
    save = () => {
        const movie = {
            title: this.state.title,
            duration: this.state.duration,
            movieRatingId: this.state.selectedRating.value,
            genres: this.state.selectedGenres.map(g => g.value),
        };
        console.log('save', movie);
    };
    clear = () => {
        this.setState({
            title: '',
            duration: 0,
            rating: null,
            selectedRating: null,
            selectedGenres: [],
        });
    }
    handleInputChange = (e) => {
        e.preventDefault();
        const name = e.target.name;
        const newState = Object.assign({}, this.state);
        newState[name] = e.target.value;
        this.setState(newState);
    };
    valueChange = (val) => {
        this.setState({duration: val});
    };
    ratingSelected = (val) => {
        this.setState({selectedRating: val});
    };
    genreSelected = (val) => {
        this.setState({selectedGenres: val});
    };
    render() {
        return (
            <div className="form">
                <div className="form-group">
                    <label className="control-label" htmlFor="title">Title:</label>
                    <input type="text"
                            className="form-control"
                            id="title"
                            name="title"
                            value={this.state.title}
                            onChange={this.handleInputChange}
                            placeholder="Enter Movie Title" />
                </div>
                <div className="form-group">
                    <label className="control-label" htmlFor="duration">Duration:</label>
                    <NumberInput
                        id="duration"
                        name="duration"
                        min={0}
                        className="form-control"
                        value={this.state.duration}
                        onChange={this.handleInputChange}
                        onValueChange={this.valueChange}
                        placeholder="Minutes" />
                </div>
                <div className="form-group">
                    <label className="control-label" htmlFor="rating">Rating:</label>
                    <Select name="rating"
                            value={this.state.selectedRating}
                            onChange={this.ratingSelected}
                            options={this.state.ratings}
                            placeholder="Select rating"
                            />
                </div>
                <div className="form-group">
                    <label className="control-label" htmlFor="genre">Genres:</label>
                    <Select name="genre"
                            multi
                            value={this.state.selectedGenres}
                            onChange={this.genreSelected}
                            options={this.state.genres}
                            placeholder="Select genre(s)"
                            />
                </div>
                <div className="form-group">
                <button style={{marginRight: '10px'}} className="btn btn-default" onClick={this.save}>{this.state.action.toLowerCase().capitalizeFirst()}</button>
                    <button style={{marginRight: '10px'}} className="btn btn-default" onClick={this.clear}>Clear</button>
                </div>
            </div>
        );
    }
}
```
```javascript
import 'fluent-sql/dist/string';
```
this line brings in a utility file from the fluent-sql project (http://github.com/jefflindholm/fluent-sql)
that adds the following to string
 * toCamel - expects strings like **some-string** or **some_string** returns **someString**
 * toDashCase - expects string **SomeString** or **SomeString** returns **some-string**
 * toSnakeCase - expects string **SomeString** or **SomeString** returns **some_string**
 * capitalizeFirst - just upper cases first character regardless of the rest of the string
 * toPascal - same as toCamel except returns **SomeString**
 * trim - removes spaces from begin and end
 * contains - boolean for whether or not string has passed value

It will only add a method that does not exist on String

I used a new control NumberInput, so now lets create that control.

Create a control to handle the numeric input of the duration
```javascript
// client/controls/number-input.js
import React from 'react';

export default class NumberInput extends React.Component {
    static propTypes = {
        value: React.PropTypes.number,
        min: React.PropTypes.number,
        max: React.PropTypes.number,
        step: React.PropTypes.number,
        onChange: React.PropTypes.func.isRequired,
        onValueChange: React.PropTypes.func.isRequired,
        format: React.PropTypes.func,
    };
    static defaultProps = {
        value: '0',
        step: 1,
        format: (x) => x,
        min: Number.MIN_SAFE_INTEGER,
        max: Number.MAX_SAFE_INTEGER,
    };
    onKeyDown = (e) => {
        if (e.which === 38) {
            console.log('up');
            // UP
            e.preventDefault();
            const value = Math.min(this.props.value + this.props.step, this.props.max);
            this.props.onValueChange(value);
        } else if (e.which === 40) {
            console.log('down');
            // DOWN
            e.preventDefault();
            const value = Math.max(this.props.value - this.props.step, this.props.min);
            this.props.onValueChange(value);
        } else {
            // backspace, delete, tab, enter, esc, and .
            const codes = [46, 8, 9, 13, 27, 110, 190];
            if ( (codes.indexOf(e.which, codes) !== -1) ||
                // Allow: Ctrl+A, Command+A
                (e.which === 65 && ( e.ctrlKey === true || e.metaKey === true ) ) ||
                // Allow: home, end, left, right, down, up
                (e.which >= 35 && e.which <= 40)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.which < 48 || e.which > 57)) && (e.which < 96 || e.which > 105)) {
                e.preventDefault();
            }
        }
    };
    render() {
        return (
            <input className={this.props.className}
                id={this.props.id}
                name={this.props.name}
                type="text"
                onKeyDown={this.onKeyDown}
                onChange={this.props.onChange}
                value={this.props.format(this.props.value)} />
        );
    }
}
```
```javascript
static propTypes = {
    value: React.PropTypes.number,
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    step: React.PropTypes.number,
    onChange: React.PropTypes.func.isRequired,
    onValueChange: React.PropTypes.func.isRequired,
    format: React.PropTypes.func,
};
static defaultProps = {
    value: '0',
    step: 1,
    format: (x) => x,
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
};
```
The above is a way to ensure that the correct types are passed for our props, that
required properties are always passed, and that properties have valid defaults.

```javascript
static defaultProps = {
    value: '0',
    step: 1,
    format: (x) => x,
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
};
```
The above is used to set the values of properties that are not required, but we
want to have a value defaulted so we don't have to check for null or undefined everywhere.


Lets add the new form to the movie-list.js file
```javascript
// client/components/movie-list.js
import React from 'react';
import MovieInfo from './movie-info';
import MovieForm from './movie-form';

export default class MovieList extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="col-md-6">
                    <MovieForm />
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

We want to save the information for a movie so we need to add a couple helper
functions to the **db/database.js** file.
```javascript
// db.database.js
...
function executeInsert(cmd) {
    try {
        const data = database.query(cmd.sql, {
            type: database.QueryTypes.INSERT,
            bind: cmd.values
        });
        return data;
    } catch (err) {
        console.log(err);
    }
    return null;
}

function executeUpdate(cmd) {
    try {
        const data = database.query(cmd.sql, {
            type: database.QueryTypes.UPDATE,
            bind: cmd.values
        });
        return data;
    } catch (err) {
        console.log(err);
    }
    return null;
}

function executeDelete(cmd) {
    try {
        const data = database.query(cmd.sql, {
            type: database.QueryTypes.DELETE,
            bind: cmd.values
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
    executeInsert,
    executeUpdate,
    executeDelete,
    database,
};
```

OK so we are not saving anything we enter, so lets add a route that is a POST to
the movie endpoint on the server.
I am going to refactor the file a little.
1. pull out getMovies() to its own function
2. pull out the code to get a movie based on id
  * change it to allow for any piece of the movie object
  * add the Promise.resolve(null) when no data found
3. add the new post route for insert
4. add the new patch route for the update
  * patch will update only the fields past
  * we are making an assumption if they pass genres, they pass the complete list
5. add the new delete route for the movie

```javascript
// routes/movie.js
/* global Promise */
/* eslint-disable no-param-reassign */
const express = require('express');
const router = express.Router();
const CircularJSON = require('circular-json'); // eslint-disable-line no-unused-vars

const {SqlQuery, SqlBuilder} = require('fluent-sql');
const {executeSimpleQuery, executeInsert, executeUpdate, executeDelete} = require('../db/database');

const movie = require('../db/models/movie');
const genre = require('../db/models/genre');
const movie_genre = require('../db/models/movie-genre');
const movie_rating = require('../db/models/movie-rating');

function getGenre(theMovie) {
    const query = new SqlQuery()
                    .from(genre)
                    .select(genre.name)
                    .join(movie_genre.on(movie_genre.genreId).using(genre.id))
                    .select(movie_genre.genreId)
                    .where(movie_genre.movieId.eq(theMovie.id));
    return executeSimpleQuery(query)
            .then(data => {
                theMovie.genres = data;
            });
}
function getMovies() {
    const query = new SqlQuery()
                        .from(movie)
                        .select(movie.id, movie.title, movie.duration, movie.movieRatingId)
                        .join(movie_rating.on(movie_rating.id).using(movie.movieRatingId))
                        .select(movie_rating.ratingCode)
                        .orderBy(movie.title);
    return executeSimpleQuery(query)
                .then((data) => {
                    const promises = data.map(movie => {
                        return getGenre(movie);
                    });
                    return Promise.all(promises).then(() => data);
                });
}
function getMovie(item) {
    let query = new SqlQuery()
                        .from(movie)
                        .select(movie.id, movie.title, movie.duration)
                        .join(movie_rating.on(movie_rating.id).using(movie.movieRatingId))
                        .select(movie_rating.ratingCode);
    if ( item.id ) {
        query = query.where(movie.id.eq(item.id));
    }
    if ( item.title ) {
        query = query.where(movie.title.eq(item.title));
    }
    if ( item.duration ) {
        query = query.where(movie.duration.eq(item.duration));
    }
    if ( item.movieRatingId ) {
        query = query.where(movie.movieRatingId.eq(item.movieRatingId));
    }
    return executeSimpleQuery(query)
                .then((data) => {
                    if ( data.length > 0 ) {
                        return getGenre(data[0]).then(() => data[0]);
                    } else {
                        return Promise.resolve(null);
                    }
                });
}
router.get('/', (req, res, next) => {
    getMovies()
        .then((data) => {
            res.send(data);
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
});
router.get('/:id', (req, res, next) => {
    getMovie({id: req.params.id})
        .then((data) => {
            if ( data ) {
                res.send(data);
            } else {
                res.status(404).send(`${req.params.id} Not found`);
            }
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
});
router.post('/', (req, res, next) => {
    const insertMovie = SqlBuilder.insert(movie, req.body);
    executeInsert(insertMovie)
        .then(() => {
            return getMovie(req.body);
        })
        .then((data) => {
            if (req.body.genres) {
                const promises = req.body.genres.map(g => {
                    const tmp = SqlBuilder.insert(movie_genre, {movieId: data.id, genreId: g});
                    return executeInsert(tmp);
                });
                return Promise.all(promises).then(() => data);
            } else {
                return data;
            }
        })
        .then(data => {
            return getMovie(data);
        })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
});
router.patch('/:id', (req, res, next) => {
    const data = Object.assign({}, req.body, {id: req.params.id});
    let promise;
    if ( data.title || data.duration || data.movieRatingId ) {
        const updateMovie = SqlBuilder.update(movie, data);
        promise = executeUpdate(updateMovie)
                .then(() => {
                    if ( req.body.genres ) {
                        return Promise.resolve(executeDelete(SqlBuilder.delete(movie_genre, {movieId: data.id})));
                    } else {
                        return Promise.resolve(null);
                    }
                });

    } else if ( req.body.genres ) {
        promise = executeDelete(SqlBuilder.delete(movie_genre, {movieId: data.id}));
    } else {
        res.status(204);
        return;
    }
    promise
        .then(() => {
            if (req.body.genres ) {
                const promises = req.body.genres.map(g => {
                    const tmp = SqlBuilder.insert(movie_genre, {movieId: data.id, genreId: g});
                    return executeInsert(tmp);
                });
                return Promise.all(promises).then(() => null);
            } else {
                return Promise.resolve(null);
            }
        })
        .then(() => {
            return getMovie(req.body);
        })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
});
router.delete('/:id', (req, res, next) => {
    const deleteMovie = SqlBuilder.delete(movie, {id: req.params.id});
    const deleteRatings = SqlBuilder.delete(movie_genre, {movieId: req.params.id});
    executeDelete(deleteRatings)
        .then(() => {
            return executeDelete(deleteMovie);
        })
        .then(() => {
            return getMovies();
        })
        .then(data => res.send(data))
        .catch(err => {
            console.log(err);
            next(err);
        });
});

module.exports = router;
```

1. setup propTypes
2. setup defaultProps
3. add an action to state, defaulted to ADD
4. Add componentWillReceiveProps
  * this will get called with the newProps
  * we need to update the state with the new props
  * if we have a title, assume we will be updating (action = 'UPDATE')
5. implement the save
  * gather up the data
  * action
    * ADD - POST the data to the server
    * UPDATE - PATCH the data to the server

```javascript
// client/components/movie-form.js
static propTypes = {
    onChanges: React.PropTypes.func.isRequired,
    title: React.PropTypes.string,
    duration: React.PropTypes.number,
    genres: React.PropTypes.array,
    rating: React.PropTypes.number,
};
static defaultProps = {
    genres: [],
    title: '',
    duration: 0,
};
constructor() {
    super();
    this.state = {
        title: '',
        duration: 0,
        ratings: [],
        genres: [],
        selectedRating: null,
        selectedGenres: [],
        action: 'ADD',
    };
}
componentWillReceiveProps(newProps) {
    const selectedRating = this.state.ratings.find((i) => (i.value === newProps.movieRatingId));
    const selectedGenres = newProps.genres.map((g => {
        return this.state.genres.find((genre) => (g.genreId === genre.value));
    }));
    this.setState({
        title: newProps.title,
        duration: newProps.duration,
        selectedRating,
        selectedGenres,
        action: newProps.title ? 'UPDATE' : 'ADD',
    });
}
...
save = () => {
    const movie = {
        title: this.state.title,
        duration: this.state.duration,
        movieRatingId: this.state.selectedRating.value,
        genres: this.state.selectedGenres.map(g => g.value),
    };

    let verb;
    let url = 'http://localhost:3000/movie';
    if ( this.state.action === 'ADD') {
        verb = 'POST';
    } else if ( this.state.action === 'UPDATE') {
        verb = 'PATCH';
        url = `${url}/${this.props.id}`;
    }
    fetch(url, {
        method: verb,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(movie),
    })
    .then(() => {
        this.props.onChanges();
        this.clear();
    })
    .catch(err => {
        alert(err);
    });
};
```
move the initial fill of the page into the movie-list.js file.
```javascript
// client/client.js
/* eslint-disable no-unused-vars */
import React from 'react';
import ReactDOM from 'react-dom';
import MovieList from './components/movie-list';

ReactDOM.render(<MovieList />, document.getElementById('container'));
```

My list was getting big and forcing me to scroll the page, which made me loose
the form, do lets make the div scrollable and set the height to 75% of the client
area.
Lets change the movie-list now.
1. get the dimensions of the window so we can make our list scrollable
2. subscribe to the window resizing event
  * subscribe in componentDidMount
  * unsubscribe in componentWillUnmount
3. Add a method to fetch the movies and save them into the state
4. Add a method to handle a movie clicked
5. Pass the currently selected movie to the form
6. Tell the currently selected movie-info it is selected
```javascript
// client/components/movie-list.js
import React from 'react';
import MovieInfo from './movie-info';
import MovieForm from './movie-form';

export default class MovieList extends React.Component {
    constructor() {
        super();
        this.state = {
            movies: [],
            movie: {},
            width: 0,
            height: 0,
        };
    }
    componentWillMount() {
        this.updateDimensions();
    }
    componentDidMount() {
        this.moviesUpdated();
        window.addEventListener('resize', this.updateDimensions);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }
    updateDimensions = () => {
        const w = window;
        const d = document;
        const documentElement = d.documentElement;
        const body = d.getElementsByTagName('body')[0];
        const width = w.innerWidth || documentElement.clientWidth || body.clientWidth;
        const height = w.innerHeight || documentElement.clientHeight || body.clientHeight;
        this.setState({width, height});
    }
    moviesUpdated = () => {
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
            this.setState({movies: json});
        });
        this.setState({movie: null});
    };
    movieClicked = (movie) => {
        console.log('movieClicked', movie);
        this.setState({movie});
    }
    render() {
        const listStyle = {
            overflowY: 'auto',
            height: `${this.state.height * 0.75}px`,
        };
        return (
            <div className="row">
                <div className="col-md-6">
                    <MovieForm {...this.state.movie} onChanges={this.moviesUpdated}/>
                </div>
                <div className="col-md-6" style={listStyle}>
                    {
                        this.state.movies.map((movie, idx) => {
                            const selected = this.state.movie ? (movie.id === this.state.movie.id) : false;
                            return (
                                <MovieInfo movie={movie} key={`movie-${idx}`} selected={selected} onClick={this.movieClicked}/>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}
```
```javascript
<MovieForm {...this.state.movie} onChanges={this.moviesUpdated}/>
```
The above line will create a property for every member of movie for MovieForm using the ES6 spread opperator (...)

Now make some changes to the **movie-info** to display the selected item differently
```javascript
// client/components/movie-info.js
import React from 'react';

export default class MovieInfo extends React.Component {
    onClick = () => {
        console.log('clicked');
        this.props.onClick(this.props.movie);
    };
    render() {
        const className = `panel ${this.props.selected ? 'panel-primary' : 'panel-default'}`;
        console.log(className);
        return (
            <div className={className}>
                <div className="panel-heading" onClick={this.onClick}>
                    {this.props.movie.title}
                </div>
                <div className="panel-body">
                    {`Rating: ${this.props.movie.ratingCode} genres: `}
                    {
                        this.props.movie.genres.map(g => g.name).join(',')
                    }
                </div>
            </div>
        );
    }
}
```

at this point I made a change to the webpack.config.js file to have better error messages
**devtool** to source-map so errors should relate to the original javascript file
```javascript
module.exports = {
    devtool: 'source-map',
    entry: ['./client/client.js'],
```

# STEP-SEVEN
```
npm i --save react-bootstrap
```
Add a new component called movies
Move code from movie-list.js into this
```javascript
// client/components/movies.js
import React from 'react';
import MovieList from './movie-list';
import MovieForm from './movie-form';
import MovieDetail from './movie-detail';

export default class Movies extends React.Component {
    constructor() {
        super();
        this.state = {
            movies: [],
            movie: {},
            width: 0,
            height: 0,
            showModal: false,
        };
    }
    componentWillMount() {
        this.updateDimensions();
    }
    componentDidMount() {
        this.moviesUpdated();
        window.addEventListener('resize', this.updateDimensions);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }
    updateDimensions = () => {
        const w = window;
        const d = document;
        const documentElement = d.documentElement;
        const body = d.getElementsByTagName('body')[0];
        const width = w.innerWidth || documentElement.clientWidth || body.clientWidth;
        const height = w.innerHeight || documentElement.clientHeight || body.clientHeight;
        this.setState({width, height});
    }
    movieClicked = (movie) => {
        this.setState({movie, showModal: false});
    };
    movieEdit = (movie) => {
        this.setState({movie, showModal: true});
    };
    moviesUpdated = () => {
        this.setState({showModal: false});
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
            this.setState({movies: json});
        });
        this.setState({movie: null});
    };
    addMovie = () => {
        this.setState({showModal: true});
    };
    closeModal = () => {
        this.setState({showModal: false});
    }
    render() {
        const listStyle = {
            overflowY: 'auto',
            height: `${this.state.height * 0.75}px`,
            // border: '1px',
            // borderStyle: 'solid',
            // borderColor: 'blue'
        };

        return (
            <div className="row">
                <div className="col-md-6">
                    <MovieDetail movie={this.state.movie} height={`${this.state.height * 0.75}px`} />
                </div>
                <div className="col-md-6">
                    <div style={listStyle}>
                        <MovieList movies={this.state.movies} movieClicked={this.movieClicked} selectedMovie={this.state.movie} movieEdit={this.movieEdit} />
                    </div>
                    <button style={{width: '100%', marginTop: '10px'}} className="btn btn-default" onClick={this.addMovie}>Add a movie</button>
                </div>
                <MovieForm {...this.state.movie} onChanges={this.moviesUpdated} onClose={this.closeModal} showModal={this.state.showModal} action={this.state.movie ? 'UPDATE' : 'ADD'}/>
            </div>
        );
    }
}
```

movie-list becomes much more focused
```javascript
// client/components/movie-list.js
import React from 'react';
import MovieInfo from './movie-info';

export default class MovieList extends React.Component {
    static propTypes = {
        movieClicked: React.PropTypes.func.isRequired,
        movieEdit: React.PropTypes.func.isRequired,
    };
    render() {
        return (
            <div>
                {
                    this.props.movies.map((movie, idx) => {
                        const selected = this.props.selectedMovie ? (movie.id === this.props.selectedMovie.id) : false;
                        return (
                            <MovieInfo movie={movie} key={`movie-${idx}`} selected={selected} onClick={this.props.movieClicked} onEdit={this.props.movieEdit}/>
                        );
                    })
                }
            </div>
        );
    }
}
```

change client.js to create an instance of movies
```javascript
// client/client.js
/* eslint-disable no-unused-vars */
import React from 'react';
import ReactDOM from 'react-dom';
import Movies from './components/movies';

ReactDOM.render(<Movies />, document.getElementById('container'));
```

Change movie-form.js into a modal dialog, using the Modal control/component from react-bootstrap
Also add a delete to the form.
```javascript
// client/components/movie-form.js
import React from 'react';
import Select from 'react-select-plus';
import {Modal} from 'react-bootstrap';
import NumberInput from '../controls/number-input';
import 'react-select-plus/dist/react-select-plus.css';
import 'fluent-sql/dist/string';

export default class MovieForm extends React.Component {
    static propTypes = {
        onChanges: React.PropTypes.func.isRequired,
        title: React.PropTypes.string,
        duration: React.PropTypes.number,
        genres: React.PropTypes.array,
        rating: React.PropTypes.number,
    };
    static defaultProps = {
        genres: [],
        title: '',
        duration: 0,
    };
    constructor() {
        super();
        this.state = {
            movieTitle: '',
            movieDuration: 0,
            ratings: [],
            genres: [],
            selectedRating: null,
            selectedGenres: [],
            action: 'ADD',
        };
    }
    componentWillReceiveProps(newProps) {
        const selectedRating = this.state.ratings.find((i) => (i.value === newProps.movieRatingId));
        const selectedGenres = newProps.genres.map((g => {
            return this.state.genres.find((genre) => (g.genreId === genre.value));
        }));
        this.setState({
            movieTitle: newProps.title,
            movieDuration: newProps.duration,
            selectedRating,
            selectedGenres,
            action: newProps.action || 'ADD',
            showModal: newProps.showModal,
        });
    }
    componentDidMount() {
        fetch('http://localhost:3000/movie_rating', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        })
        .then(data => {
            return data.json();
        })
        .then(json => {
            const ratings = json.map(rating => {
                return {label: `${rating.ratingCode} - ${rating.description}`, value: rating.id};
            });
            this.setState({ratings});
        });
        fetch('http://localhost:3000/genre', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        })
        .then(data => {
            return data.json();
        })
        .then(json => {
            const genres = json.map(genre => {
                return {label: genre.name, value: genre.id};
            });
            this.setState({genres});
        });
    }
    save = () => {
        const movie = {
            title: this.state.movieTitle,
            duration: this.state.movieDuration,
            movieRatingId: this.state.selectedRating.value,
            genres: this.state.selectedGenres.map(g => g.value),
        };

        let verb;
        let url = 'http://localhost:3000/movie';
        if ( this.state.action === 'ADD') {
            verb = 'POST';
        } else if ( this.state.action === 'UPDATE') {
            verb = 'PATCH';
            url = `${url}/${this.props.id}`;
        }
        fetch(url, {
            method: verb,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movie),
        })
        .then(() => {
            this.props.onChanges();
            this.setState({showModal: false});
        })
        .catch(err => {
            alert(err);
        });
    };
    delete = () => {
        const url = `http://localhost:3000/movie/${this.props.id}`;
        fetch(url, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then(() => {
            this.props.onChanges();
            this.setState({showModal: false});
        })
        .catch(err => {
            alert(err);
        });
    }
    handleInputChange = (e) => {
        e.preventDefault();
        const name = e.target.name;
        const newState = Object.assign({}, this.state);
        newState[name] = e.target.value;
        this.setState(newState);
    };
    valueChange = (val) => {
        this.setState({duration: val});
    };
    ratingSelected = (val) => {
        this.setState({selectedRating: val});
    };
    genreSelected = (val) => {
        this.setState({selectedGenres: val});
    };
    close = () => {
        this.setState({showModal: false});
    }
    render() {
        return (
            <Modal show={this.state.showModal} onHide={this.close}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.state.title || 'New Movie'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form">
                        <div className="form-group">
                            <label className="control-label" htmlFor="movieTitle">Title:</label>
                            <input type="text"
                                    className="form-control"
                                    id="movieTitle"
                                    name="movieTitle"
                                    value={this.state.movieTitle}
                                    onChange={this.handleInputChange}
                                    placeholder="Enter Movie Title" />
                        </div>
                        <div className="form-group">
                            <label className="control-label" htmlFor="movieDuration">Duration:</label>
                            <NumberInput
                                id="movieDuration"
                                name="movieDuration"
                                className="form-control"
                                min={0}
                                value={this.state.movieDuration}
                                onChange={this.handleInputChange}
                                onValueChange={this.valueChange}
                                placeholder="Minutes" />
                        </div>
                        <div className="form-group">
                            <label className="control-label" htmlFor="ratingList">Rating:</label>
                            <Select name="ratingList"
                                    value={this.state.selectedRating}
                                    onChange={this.ratingSelected}
                                    options={this.state.ratings}
                                    placeholder="Select rating"
                                    />
                        </div>
                        <div className="form-group">
                            <label className="control-label" htmlFor="genreList">Genres:</label>
                            <Select name="genreList"
                                    multi
                                    value={this.state.selectedGenres}
                                    onChange={this.genreSelected}
                                    options={this.state.genres}
                                    placeholder="Select genre(s)"
                                    />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="form-group">
                        <button style={{marginRight: '10px'}} className="btn btn-default pull-left" onClick={this.delete}>Delete</button>
                        <button style={{marginRight: '10px'}} className="btn btn-default" onClick={this.save}>{this.state.action.toLowerCase().capitalizeFirst()}</button>
                        <button style={{marginRight: '10px'}} className="btn btn-default" onClick={this.close}>Cancel</button>
                    </div>
                </Modal.Footer>
            </Modal>
        );
    }
}
```

Add an edit button the the movie-info.js
```javascript
// client/components/movie-info.js
import React from 'react';

export default class MovieInfo extends React.Component {
    static propTypes = {
        onClick: React.PropTypes.func.isRequired,
        onEdit: React.PropTypes.func.isRequired,
    };
    onClick = () => {
        this.props.onClick(this.props.movie);
    };
    onEdit = () => {
        this.props.onEdit(this.props.movie);
    }
    render() {
        const className = `panel ${this.props.selected ? 'panel-primary' : 'panel-default'}`;
        return (
            <div className={className}>
                <div className="panel-heading" onClick={this.onClick}>
                    {this.props.movie.title}
                </div>
                <div className="panel-body">
                    {`Rating: ${this.props.movie.ratingCode} genres: `}
                    {
                        this.props.movie.genres.map(g => g.name).join(',')
                    }
                    <button style={{marginRight: '10px'}} className="btn btn-default pull-right" onClick={this.onEdit}>Edit</button>
                </div>
            </div>
        );
    }
}
```

so now we can get some more information from the internet.
create and imdb route (imdb has an undocumented api, but omdbapi.com is open and free) the data coming
from omdbapi was causing node-fetch problems so I wrote my own quick and dirty fetch
```javascript
// routes/imdb.js
const express = require('express');
const router = express.Router();
const http = require('http');

function fetch(host, path, cb, err) {
    const options = { host, path };
    const request = http.request(options, response => {
        let data = '';
        response.on('data', chunk => {
            data += chunk;
        });
        response.on('end', () => {
            const obj = JSON.parse(data);
            console.log(JSON.stringify(obj, null, 2));
            cb(obj);
        });
    });
    request.on('error', e => {
        console.log(e.message);
        err('nothing found');
    });
    request.end();
}

router.get('/', (req, res, next) => {
    if ( req.query.movie ) {
        console.log('searching for', req.query.movie);
        const url = `http://www.omdbapi.com/?s=${encodeURIComponent(req.query.movie)}`;
        console.log(url);
        const host = 'www.omdbapi.com';
        const path = `/?s=${encodeURIComponent(req.query.movie)}`;
        fetch(host, path, data => {
            res.send(data);
        }, e => {
            next(e);
        });
    } else {
        res.status(404).send('please add a movie');
    }
});

module.exports = router;
```
Add the new route to app.js
```javascript
//app.js
...
const imdb = require('./routes/imdb');
...
app.use('/imdb', imdb);
...
```

Create a detail movie page, to display extra information we get from the internet about the movie.
Just going to show the movie poster this time....
```javascript
import React from 'react';

export default class MovieDetail extends React.Component {
    static NOTHING_SELECTED = 'Nothing selected...';
    static NO_RATING_SELECTED = 'No rating';
    constructor(props) {
        super(props);
        const movie = props.movie || {};
        this.state = {
            title: movie.title || MovieDetail.NOTHING_SELECTED,
            genres: movie.genres || [],
            ratingCode: movie.ratingCode || MovieDetail.NO_RATING_SELECTED,
            details: {Search:[]},
        };
    }
    componentWillReceiveProps(newProps) {
        const movie = newProps.movie || {};
        const title = movie.title || MovieDetail.NOTHING_SELECTED;
        this.setState({
            title,
            genres: movie.genres || [],
            ratingCode: movie.ratingCode || MovieDetail.NO_RATING_SELECTED,
        });
        if ( title !== MovieDetail.NOTHING_SELECTED ) {
            fetch(`http://localhost:3000/imdb?movie=${encodeURIComponent(title)}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            })
            .then(data => {
                return data.json();
            })
            .then(json => {
                console.log('json', json);
                this.setState({details: json});
            });
        }
    }
    renderDetails() {
        if ( this.state.details && this.state.details.Search ) {
            const posters = this.state.details.Search.map(detail => {
                if ( detail.Poster && detail.Type === 'movie' && detail.Title.toLowerCase() === this.state.title.toLowerCase() ) {
                    return (
                        <img src={detail.Poster} key={detail.imdbID}/>
                    );
                } else {
                    return '';
                }
            });
            return posters;
        }
        return <div></div>;
    }
    render() {
        const listStyle = {
            overflowY: 'auto',
            height: `${this.props.height.slice(0, -2) * 0.85}px`,
        };
        console.log('listStyle', listStyle);
        let body;
        if ( this.state.title !== MovieDetail.NOTHING_SELECTED ) {
            body = (
                <div className="panel-body">
                    <div>
                        {`Rating: ${this.state.ratingCode} genres: `}
                        {
                            this.state.genres.map(g => g.name).join(',')
                        }
                    </div>
                    <div style={listStyle}>
                        { this.renderDetails() }
                    </div>
                </div>
            );
        } else {
            body = '';
        }

        return (
            <div className='panel panel-info' style={{height: this.props.height}}>
                <div className="panel-heading">
                    {this.state.title}
                </div>
                {body}
            </div>
        );
    }
}
```
