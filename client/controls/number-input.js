import React from 'react';

export default class NumberInput extends React.Component {
    static propTypes = {
        value: React.PropTypes.number,
        min: React.PropTypes.number,
        max: React.PropTypes.number,
        step: React.PropTypes.number,
        onChange: React.PropTypes.func.isRequired,
        onValueChange: React.PropTypes.func.isRequired,
        format: React.PropTypes.func,
    };
    static defaultProps = {
        value: '0',
        step: 1,
        format: (x) => x,
        min: Number.MIN_SAFE_INTEGER,
        max: Number.MAX_SAFE_INTEGER,
    };
    onKeyDown = (e) => {
        if (e.which === 38) {
            // UP
            e.preventDefault();
            const value = Math.min(this.props.value + this.props.step, this.props.max);
            this.props.onValueChange(value);
        } else if (e.which === 40) {
            // DOWN
            e.preventDefault();
            const value = Math.max(this.props.value - this.props.step, this.props.min);
            this.props.onValueChange(value);
        } else {
            // keyCode?
            // backspace, delete, tab, enter, esc, and .
            const codes = [46, 8, 9, 13, 27, 110, 190];
            if ( (codes.indexOf(e.which, codes) !== -1) ||
                // Allow: Ctrl+A, Command+A
                (e.which === 65 && ( e.ctrlKey === true || e.metaKey === true ) ) ||
                // Allow: home, end, left, right, down, up
                (e.which >= 35 && e.which <= 40)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.which < 48 || e.which > 57)) && (e.which < 96 || e.which > 105)) {
                e.preventDefault();
            }
        }
    };
    render() {
        return (
            <input className={this.props.className}
                id={this.props.id}
                name={this.props.name}
                type="text"
                onKeyDown={this.onKeyDown}
                onChange={this.props.onChange}
                value={this.props.format(this.props.value)} />
        );
    }
}
