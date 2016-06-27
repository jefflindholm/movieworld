/* eslint-disable comma-dangle */
const SqlTable = require('fluent-sql').SqlTable;

const Columns = [
    {name: 'id'},
    {name: 'name'},
];

const table = new SqlTable({
    name: 'genre',
    columns: Columns
});
module.exports =  table;
