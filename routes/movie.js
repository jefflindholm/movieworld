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
