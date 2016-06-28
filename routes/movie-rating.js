const express = require('express');
const router = express.Router();

const SqlQuery = require('fluent-sql').SqlQuery;
const executeSimpleQuery = require('../db/database').executeSimpleQuery;

const movie_rating = require('../db/models/movie-rating');

router.get('/', (req, res, next) => {
    const query = new SqlQuery()
                        .from(movie_rating)
                        .select(movie_rating.star());
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
