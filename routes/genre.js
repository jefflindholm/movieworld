const express = require('express');
const router = express.Router();

const SqlQuery = require('fluent-sql').SqlQuery;
const executeSimpleQuery = require('../db/database').executeSimpleQuery;

const genre = require('../db/models/genre');

router.get('/', (req, res, next) => {
    const query = new SqlQuery()
                        .from(genre)
                        .select(genre.star());
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
