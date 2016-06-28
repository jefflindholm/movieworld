import React from 'react';
import MovieInfo from './movie-info';
import MovieForm from './movie-form';

export default class MovieList extends React.Component {
    constructor() {
        super();
        this.state = {
            movies: [],
        };
    }
    componentDidMount() {
        this.moviesUpdated();
    }
    moviesUpdated = () => {
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
            this.setState({movies: json});
        });
    }
    render() {
        return (
            <div className="row">
                <div className="col-md-6">
                    <MovieForm onChanges={this.moviesUpdated}/>
                </div>
                <div className="col-md-6">
                    {
                        this.state.movies.map((movie, idx) => {
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
