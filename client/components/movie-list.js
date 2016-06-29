// client/components/movie-list.js
import React from 'react';
import MovieInfo from './movie-info';
import MovieForm from './movie-form';

export default class MovieList extends React.Component {
    constructor() {
        super();
        this.state = {
            movies: [],
            movie: {},
            width: 0,
            height: 0,
        };
    }
    componentWillMount() {
        this.updateDimensions();
    }
    componentDidMount() {
        this.moviesUpdated();
        window.addEventListener('resize', this.updateDimensions);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }
    updateDimensions = () => {
        const w = window;
        const d = document;
        const documentElement = d.documentElement;
        const body = d.getElementsByTagName('body')[0];
        const width = w.innerWidth || documentElement.clientWidth || body.clientWidth;
        const height = w.innerHeight || documentElement.clientHeight || body.clientHeight;
        this.setState({width, height});
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
        this.setState({movie: null});
    };
    movieClicked = (movie) => {
        console.log('movieClicked', movie);
        this.setState({movie});
    }
    render() {
        const listStyle = {
            overflowY: 'auto',
            height: `${this.state.height * 0.75}px`,
        };
        return (
            <div className="row">
                <div className="col-md-6">
                    <MovieForm {...this.state.movie} onChanges={this.moviesUpdated}/>
                </div>
                <div className="col-md-6" style={listStyle}>
                    {
                        this.state.movies.map((movie, idx) => {
                            const selected = this.state.movie ? (movie.id === this.state.movie.id) : false;
                            return (
                                <MovieInfo movie={movie} key={`movie-${idx}`} selected={selected} onClick={this.movieClicked}/>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}
