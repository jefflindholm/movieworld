// client/components/movie-info.js
import React from 'react';

export default class MovieInfo extends React.Component {
    static propTypes = {
        onClick: React.PropTypes.func.isRequired,
        onEdit: React.PropTypes.func.isRequired,
    };
    onClick = () => {
        this.props.onClick(this.props.movie);
    };
    onEdit = () => {
        this.props.onEdit(this.props.movie);
    }
    render() {
        const className = `panel ${this.props.selected ? 'panel-primary' : 'panel-default'}`;
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
                    <button style={{ marginRight: '10px' }} className="btn btn-default pull-right" onClick={this.onEdit}>Edit</button>
                </div>
            </div>
        );
    }
}
