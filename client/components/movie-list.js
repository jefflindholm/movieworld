/* eslint-disable no-unused-vars */
import React from 'react';
import MovieInfo from './movie-info';

export default class MovieList extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="col-md-6">
                </div>
                <div className="col-md-6">
                    {
                        this.props.movies.map((movie, idx) => {
                            return (
                                <MovieInfo movie={movie} key={`movie-${idx}`} />
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}
