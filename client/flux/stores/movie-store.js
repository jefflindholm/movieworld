import {dispatch, listen} from '../dispatcher';
import {receiveMovies} from '../actions/movie-actions';

export default class MovieStore {
    let movies = [];
    getMovies() {
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
            movies = json;
            this.triggerChange();
        });
    }
    const listeners = [];
    onChange(listener) {
        listeners.push(listener);
    }
    addMovie(movie) {
        
    }
}
