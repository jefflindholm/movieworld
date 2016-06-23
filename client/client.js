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
