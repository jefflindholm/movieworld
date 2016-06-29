// client/components/movie-form.js
import React from 'react';
import Select from 'react-select-plus';
import NumberInput from '../controls/number-input';
import 'react-select-plus/dist/react-select-plus.css';
import 'fluent-sql/dist/string';

export default class MovieForm extends React.Component {
    static propTypes = {
        onChanges: React.PropTypes.func.isRequired,
        title: React.PropTypes.string,
        duration: React.PropTypes.number,
        genres: React.PropTypes.array,
        rating: React.PropTypes.number,
    };
    static defaultProps = {
        genres: [],
        title: '',
        duration: 0,
    };
    constructor() {
        super();
        this.state = {
            title: '',
            duration: 0,
            ratings: [],
            genres: [],
            selectedRating: null,
            selectedGenres: [],
            action: 'ADD',
        };
    }
    componentWillReceiveProps(newProps) {
        const selectedRating = this.state.ratings.find((i) => (i.value === newProps.movieRatingId));
        const selectedGenres = newProps.genres.map((g => {
            return this.state.genres.find((genre) => (g.genreId === genre.value));
        }));
        this.setState({
            title: newProps.title,
            duration: newProps.duration,
            selectedRating,
            selectedGenres,
            action: newProps.title ? 'UPDATE' : 'ADD',
        });
    }
    componentDidMount() {
        fetch('http://localhost:3000/movie_rating', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        })
        .then(data => {
            return data.json();
        })
        .then(json => {
            const ratings = json.map(rating => {
                return {label: `${rating.ratingCode} - ${rating.description}`, value: rating.id};
            });
            this.setState({ratings});
        });
        fetch('http://localhost:3000/genre', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        })
        .then(data => {
            return data.json();
        })
        .then(json => {
            const genres = json.map(genre => {
                return {label: genre.name, value: genre.id};
            });
            this.setState({genres});
        });
    }
    save = () => {
        const movie = {
            title: this.state.title,
            duration: this.state.duration,
            movieRatingId: this.state.selectedRating.value,
            genres: this.state.selectedGenres.map(g => g.value),
        };

        let verb;
        let url = 'http://localhost:3000/movie';
        if ( this.state.action === 'ADD') {
            verb = 'POST';
        } else if ( this.state.action === 'UPDATE') {
            verb = 'PATCH';
            url = `${url}/${this.props.id}`;
        }
        fetch(url, {
            method: verb,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movie),
        })
        .then(() => {
            this.props.onChanges();
            this.clear();
        })
        .catch(err => {
            alert(err);
        });
    };
    clear = () => {
        this.setState({
            title: '',
            duration: 0,
            rating: null,
            selectedRating: null,
            selectedGenres: [],
            action: 'ADD',
        });
    }
    handleInputChange = (e) => {
        e.preventDefault();
        const name = e.target.name;
        const newState = Object.assign({}, this.state);
        newState[name] = e.target.value;
        this.setState(newState);
    };
    valueChange = (val) => {
        this.setState({duration: val});
    };
    ratingSelected = (val) => {
        this.setState({selectedRating: val});
    };
    genreSelected = (val) => {
        this.setState({selectedGenres: val});
    };
    render() {
        return (
            <div className="form">
                <div className="form-group">
                    <label className="control-label" htmlFor="movieTitle">Title:</label>
                    <input type="text"
                            className="form-control"
                            id="movieTitle"
                            name="movieTitle"
                            value={this.state.title}
                            onChange={this.handleInputChange}
                            placeholder="Enter Movie Title" />
                </div>
                <div className="form-group">
                    <label className="control-label" htmlFor="movieDuration">Duration:</label>
                    <NumberInput
                        id="movieDuration"
                        name="movieDuration"
                        className="form-control"
                        min={0}
                        value={this.state.duration}
                        onChange={this.handleInputChange}
                        onValueChange={this.valueChange}
                        placeholder="Minutes" />
                </div>
                <div className="form-group">
                    <label className="control-label" htmlFor="ratingList">Rating:</label>
                    <Select name="ratingList"
                            value={this.state.selectedRating}
                            onChange={this.ratingSelected}
                            options={this.state.ratings}
                            placeholder="Select rating"
                            />
                </div>
                <div className="form-group">
                    <label className="control-label" htmlFor="genreList">Genres:</label>
                    <Select name="genreList"
                            multi
                            value={this.state.selectedGenres}
                            onChange={this.genreSelected}
                            options={this.state.genres}
                            placeholder="Select genre(s)"
                            />
                </div>
                <div className="form-group">
                    <button style={{marginRight: '10px'}} className="btn btn-default" onClick={this.save}>{this.state.action.toLowerCase().capitalizeFirst()}</button>
                    <button style={{marginRight: '10px'}} className="btn btn-default" onClick={this.clear}>Clear</button>
                </div>
            </div>
        );
    }
}
