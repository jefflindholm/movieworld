import React from 'react';
import Select from 'react-select-plus';
import NumberInput from '../controls/number-input';
import 'react-select-plus/dist/react-select-plus.css';

export default class MovieForm extends React.Component {
    static propTypes = {
        onChanges: React.PropTypes.func.isRequired,
    };
    constructor() {
        super();
        this.state = {
            title: '',
            duration: 0,
            rating: null,
            ratings: [],
            genres: [],
            selectedRating: null,
            selectedGenres: [],
            action: 'ADD',
        };
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
        let promise;
        if ( this.state.action === 'ADD') {
            // post the data
            promise = fetch('http://localhost:3000/genre', {
                method: 'POST',
                body: JSON.stringify(movie),
                headers: {
                    Accept: 'application/json',
                },
            });
        } else if ( this.state.action === 'UPDATE') {
            // patch the data
            promise = fetch('http://localhost:3000/genre', {
                method: 'PATCH',
                body: JSON.stringify(movie),
                headers: {
                    Accept: 'application/json',
                },
            });
        }
        promise
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
                    <label className="control-label" htmlFor="title">Title:</label>
                    <input type="text"
                            className="form-control"
                            id="title"
                            name="title"
                            value={this.state.title}
                            onChange={this.handleInputChange}
                            placeholder="Enter Movie Title" />
                </div>
                <div className="form-group">
                    <label className="control-label" htmlFor="duration">Duration:</label>
                    <NumberInput
                        id="duration"
                        name="duration"
                        className="form-control"
                        min={0}
                        value={this.state.duration}
                        onChange={this.handleInputChange}
                        onValueChange={this.valueChange}
                        placeholder="Minutes" />
                </div>
                <div className="form-group">
                    <label className="control-label" htmlFor="rating">Rating:</label>
                    <Select name="rating"
                            value={this.state.selectedRating}
                            onChange={this.ratingSelected}
                            options={this.state.ratings}
                            placeholder="Select rating"
                            />
                </div>
                <div className="form-group">
                    <label className="control-label" htmlFor="genre">Genres:</label>
                    <Select name="genre"
                            multi
                            value={this.state.selectedGenres}
                            onChange={this.genreSelected}
                            options={this.state.genres}
                            placeholder="Select genre(s)"
                            />
                </div>
                <div className="form-group">
                    <button style={{marginRight: '10px'}} className="btn btn-default" onClick={this.save}>Save</button>
                    <button style={{marginRight: '10px'}} className="btn btn-default" onClick={this.clear}>Clear</button>
                </div>
            </div>
        );
    }
}
