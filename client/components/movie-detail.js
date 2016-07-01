import React from 'react';

export default class MovieDetail extends React.Component {
    static NOTHING_SELECTED = 'Nothing selected...';
    static NO_RATING_SELECTED = 'No rating';
    constructor(props) {
        super(props);
        const movie = props.movie || {};
        this.state = {
            title: movie.title || MovieDetail.NOTHING_SELECTED,
            genres: movie.genres || [],
            ratingCode: movie.ratingCode || MovieDetail.NO_RATING_SELECTED,
        };
    }
    componentWillReceiveProps(newProps) {
        const movie = newProps.movie || {};
        const title = movie.title || MovieDetail.NOTHING_SELECTED;
        this.setState({
            title,
            genres: movie.genres || [],
            ratingCode: movie.ratingCode || MovieDetail.NO_RATING_SELECTED,
        });
        if ( title !== MovieDetail.NOTHING_SELECTED ) {
            fetch(`http://localhost:3000/imdb?movie=${encodeURIComponent(title)}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            })
            .then(data => {
                return data.json();
            })
            .then(json => {
                this.setState({details: json});
            });
        }
    }
    render() {
        let body;
        if ( this.state.title !== MovieDetail.NOTHING_SELECTED ) {
            body = (
                <div className="panel-body">
                    {`Rating: ${this.state.ratingCode} genres: `}
                    {
                        this.state.genres.map(g => g.name).join(',')
                    }
                    { JSON.stringify(this.state.details, null, 2) }
                </div>
            );
        } else {
            body = '';
        }

        return (
            <div className='panel panel-info' style={{height: this.props.height}}>
                <div className="panel-heading">
                    {this.state.title}
                </div>
                {body}
            </div>
        );
    }
}
