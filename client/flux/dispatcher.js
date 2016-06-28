// flux/dispatcher.js
const listeners = [];
export function dispatch(payload) {
    listeners.map(l => l(payload));
}
export function listen(listener) {
    listeners.push(listener);
}
