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
            details: {Search:[]},
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
                console.log('json', json);
                this.setState({details: json});
            });
        }
    }
    renderDetails() {
        if ( this.state.details && this.state.details.Search ) {
            const posters = this.state.details.Search.map(detail => {
                if ( detail.Poster && detail.Type === 'movie' && detail.Title.toLowerCase() === this.state.title.toLowerCase() ) {
                    return (
                        <img src={detail.Poster} key={detail.imdbID}/>
                    );
                } else {
                    return '';
                }
            });
            return posters;
        }
        return <div></div>;
    }
    render() {
        const listStyle = {
            overflowY: 'auto',
            height: `${this.props.height.slice(0, -2) * 0.85}px`,
        };
        console.log('listStyle', listStyle);
        let body;
        if ( this.state.title !== MovieDetail.NOTHING_SELECTED ) {
            body = (
                <div className="panel-body">
                    <div>
                        {`Rating: ${this.state.ratingCode} genres: `}
                        {
                            this.state.genres.map(g => g.name).join(',')
                        }
                    </div>
                    <div style={listStyle}>
                        { this.renderDetails() }
                    </div>
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
