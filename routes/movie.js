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
