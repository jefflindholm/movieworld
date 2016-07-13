/* eslint-disable comma-dangle */
const SqlTable = require('fluent-sql').SqlTable;

const Columns = [
    {name: 'id'},
    {name: 'rating_code'},
    {name: 'description'},
];

const table = new SqlTable({
    name: 'movie_rating',
    columns: Columns
});
module.exports =  table;
