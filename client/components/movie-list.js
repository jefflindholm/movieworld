// client/components/movie-list.js
import React from 'react';
import MovieInfo from './movie-info';

export default class MovieList extends React.Component {
    static propTypes = {
        movieClicked: React.PropTypes.func.isRequired,
        movieEdit: React.PropTypes.func.isRequired,
    };
    render() {
        return (
            <div>
                {
                    this.props.movies.map((movie, idx) => {
                        const selected = this.props.selectedMovie ? (movie.id === this.props.selectedMovie.id) : false;
                        return (
                            <MovieInfo movie={movie} key={`movie-${idx}`} selected={selected} onClick={this.props.movieClicked} onEdit={this.props.movieEdit}/>
                        );
                    })
                }
            </div>
        );
    }
}
