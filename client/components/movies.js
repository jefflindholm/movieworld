// client/components/movies.js
import React from 'react';
import MovieList from './movie-list';
import MovieForm from './movie-form';
import MovieDetail from './movie-detail';

export default class Movies extends React.Component {
    constructor() {
        super();
        this.state = {
            movies: [],
            movie: {},
            width: 0,
            height: 0,
            showModal: false,
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
    movieClicked = (movie) => {
        this.setState({movie, showModal: false});
    };
    movieEdit = (movie) => {
        this.setState({movie, showModal: true});
    };
    moviesUpdated = () => {
        this.setState({showModal: false});
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
    addMovie = () => {
        this.setState({showModal: true});
    };
    closeModal = () => {
        this.setState({showModal: false});
    }
    render() {
        const listStyle = {
            overflowY: 'auto',
            height: `${this.state.height * 0.75}px`,
            // border: '1px',
            // borderStyle: 'solid',
            // borderColor: 'blue'
        };

        return (
            <div className="row">
                <div className="col-md-6">
                    <MovieDetail movie={this.state.movie} height={`${this.state.height * 0.75}px`} />
                </div>
                <div className="col-md-6">
                    <div style={listStyle}>
                        <MovieList movies={this.state.movies} movieClicked={this.movieClicked} selectedMovie={this.state.movie} movieEdit={this.movieEdit} />
                    </div>
                    <button style={{width: '100%', marginTop: '10px'}} className="btn btn-default" onClick={this.addMovie}>Add a movie</button>
                </div>
                <MovieForm {...this.state.movie} onChanges={this.moviesUpdated} onClose={this.closeModal} showModal={this.state.showModal} action={this.state.movie ? 'UPDATE' : 'ADD'}/>
            </div>
        );
    }
}
