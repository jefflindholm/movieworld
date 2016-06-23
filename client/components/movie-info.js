import React from 'react';

export default class MovieInfo extends React.Component {
    render() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    {this.props.movie.title}
                </div>
                <div className="panel-body">
                    {`Rating: ${this.props.movie.ratingCode} genres: `}
                    {
                        this.props.movie.genres.map(g => g.name).join(',')
                    }
                </div>
            </div>
        );
    }
}
