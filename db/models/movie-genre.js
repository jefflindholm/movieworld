/* eslint-disable comma-dangle */
const SqlTable = require('fluent-sql').SqlTable;

const Columns = [
    {name: 'movie_id'},
    {name: 'genre_id'},
];

const table = new SqlTable({
    name: 'movie_genre',
    columns: Columns
});
module.exports =  table;
