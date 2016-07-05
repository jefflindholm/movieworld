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
