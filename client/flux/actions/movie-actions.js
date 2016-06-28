import {dispatch} from '../dispatcher';

export function addMovie(movie) {
    dispatch({
        movie,
        type: 'movie:add',
    });
}
export function deleteMovie(movie) {
    dispatch({
        movie,
        type: 'movie:delete',
    });
}
export function updateMovie(movie) {
    dispatch({
        movie,
        type: 'movie:update',
    });
}
export function receiveMovies(movies) {
    dispatch({
        movies,
        type: 'movie:receive',
    });
}
