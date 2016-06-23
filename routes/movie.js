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
