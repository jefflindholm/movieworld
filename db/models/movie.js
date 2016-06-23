/* eslint-disable comma-dangle */
const SqlTable = require('fluent-sql').SqlTable;

const Columns = [
    {name: 'id'},
    {name: 'title'},
    {name: 'duration'},
    {name: 'movie_rating_id'},
];

const table = new SqlTable({
    name: 'users',
    columns: Columns
});
module.exports =  table;
