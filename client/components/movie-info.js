// client/components/movie-info.js
import React from 'react';

export default class MovieInfo extends React.Component {
    onClick = () => {
        console.log('clicked');
        this.props.onClick(this.props.movie);
    };
    render() {
        const className = `panel ${this.props.selected ? 'panel-primary' : 'panel-default'}`;
        console.log(className);
        return (
            <div className={className}>
                <div className="panel-heading" onClick={this.onClick}>
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
