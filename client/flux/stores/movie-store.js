import {dispatch, listen} from '../dispatcher';
import {receiveMovies} from '../actions/movie-actions';

export default class MovieStore {
    constructor() {
        super();
        this.movies = [];
        this.listeners = [];
    }
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
            this.movies = json;
            this.triggerChange();
        });
    }
    onChange(listener) {
        this.listeners.push(listener);
    }
    addMovie(movie) {

    }
}
