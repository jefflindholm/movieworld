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
    namedValueMarker: '$'
});

function executeComplexQuery(query) {
    const sql = query.genSql();
    try {
        const data = database.query(sql.fetchSql, {
            type: database.QueryTypes.SELECT,
            bind: sql.values
        });
        const count = database.query(sql.countSql, {
            type: database.QueryTypes.SELECT,
            bind: sql.values
        });
        return { data, count };
    } catch (err) {
        console.log(err);
    }
    return null;
}
function executeSimpleQuery(query) {
    const sql = query.genSql();
    try {
        const data = database.query(sql.fetchSql, {
            type: database.QueryTypes.SELECT,
            bind: sql.values
        });
        return data;
    } catch (err) {
        console.log(err);
    }
    return null;
}

function executeInsert(cmd) {
    try {
        const data = database.query(cmd.sql, {
            type: database.QueryTypes.INSERT,
            bind: cmd.values
        });
        return data;
    } catch (err) {
        console.log(err);
    }
    return null;
}

function executeUpdate(cmd) {
    try {
        const data = database.query(cmd.sql, {
            type: database.QueryTypes.UPDATE,
            bind: cmd.values
        });
        return data;
    } catch (err) {
        console.log(err);
    }
    return null;
}

function executeDelete(cmd) {
    try {
        const data = database.query(cmd.sql, {
            type: database.QueryTypes.DELETE,
            bind: cmd.values
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
    executeInsert,
    executeUpdate,
    executeDelete,
    database,
};
