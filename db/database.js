/* eslint-disable comma-dangle */
const config = require('./config');
const Sequelize = require('sequelize');
const CircularJSON = require('circular-json');
const {setDefaultOptions} = require('fluent-sql');

const debug = true;

const database = new Sequelize(config.database,
    config.user,
    config.password,
    {
        host: config.dbServer,
        dialect: 'postgres',
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },
        logging: debug ? console.log : false
    });

setDefaultOptions({
    sqlStartChar: '"',
    sqlEndChar: '"',
});

function executeComplexQuery(query) {
    const sql = query.genSql();
    console.log('sql', CircularJSON.stringify(sql, null, 2));
    try {
        const data = database.query(sql.fetchSql, {
            type: database.QueryTypes.SELECT,
            replacements: sql.values
        });
        const count = database.query(sql.countSql, {
            type: database.QueryTypes.SELECT,
            replacements: sql.values
        });
        return { data, count };
    } catch (err) {
        console.log(err);
    }
    return null;
}
function executeSimpleQuery(query) {
    const sql = query.genSql();
    console.log('sql', CircularJSON.stringify(sql, null, 2));
    try {
        const data = database.query(sql.fetchSql, {
            type: database.QueryTypes.SELECT,
            replacements: sql.values
        });
        return data;
    } catch (err) {
        console.log(err);
    }
    return null;
}

module.exports = {
    executeSimpleQuery,
    executeComplexQuery,
    database,
};
