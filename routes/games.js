const express = require('express');
const router = express.Router();
//Databse pool.
const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'pencrud',
    host: 'localhost',
    database: 'collection',
    password: 'secret',
    port: 5432,
});

//CREATE.

//API route for adding a game.
router.post('/addGame', (req, res) => {
    //The title, publisher, system, and release year are pulled from the request body.
    const {title, publisher, system, releaseYear} = req.body;
    //Query is sent.
    pool.query('INSERT INTO games (title, publisher, system, release_year) VALUES ($1, $2, $3, $4)', [title, publisher, system, releaseYear], (error) => {
        if (error) {
            throw error;
        }
        res.status(201).send(`Game added successfully.`);
    })
});

//READ.

//API route for returning everything in the 'games' table.
router.get('/allGames', (req, res) => {
    //Query is sent.
    pool.query('SELECT * FROM games ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error;
        }
        //Return the results of the query.
        res.status(200).json(results.rows);
    })
});

//API route for returning based on search.
router.get('/searchGames', (req, res) => {
    //ID is pulled from the request params.
    const title = req.params.title;
    const releaseYear = parseInt(req.params.releaseYear);
    const publisher = req.params.publisher;
    const system = req.params.system;
    //Query is sent.
    pool.query('SELECT * FROM games WHERE ' + title? 'title=$1' : '1=1' + 'AND' + releaseYear? 'releaseYear=$2' : '1=1' + 'AND' + publisher? 'publisher=$3' : '1=1' + 'AND' + system? 'system=$1' : '1=1', [title, releaseYear, publisher, system], (error, results) => {
        if (error) {
            throw error;
        }
        //Return the results of the query.
        res.status(200).json(results.rows);
    })
})

//UPDATE.

//API route for updating based on ID.
router.post('/updateGame/:id', (req, res) => {
    //ID is pulled from the request params, and the body is provides the title, publisher, system, and release year.
    const id = parseInt(req.params.id);
    const {title, publisher, system, releaseYear} = req.body;
    //Build the query based on how many parameters exist.
    let query = 
        "UPDATE games SET " + (
            title ?
                "title=$1" + ((publisher || system || releaseYear) ?
                    "," : "")
                : ""
        )
        + (
            publisher ?
                "publisher=$2" + ((system || releaseYear) ?
                    "," : "")
                : ""
        )
        + (
            system ?
                "system=$3" + ((releaseYear) ?
                    "," : "")
                : ""
        )
        + (
            releaseYear ?
                "release_year=$4" : ""
        ) + " WHERE id=$" + parseInt(!!title + !!publisher + !!system + !!releaseYear + 1);
    //Build the arguments for the query based on the number of parameters.
    let args = [title ? title : false, publisher ? publisher : false, system ? system : false, releaseYear ? releaseYear : false, id].filter(Boolean);
    //Query is sent.
    pool.query(query, args, (error) => {
        if (error) {
            throw error;
        }
        //Return a message stating that the update went through.
        res.status(200).send(`Game with ID of '${id}' modified successfully.`)
    });
});


//DELETE.

//API route for deleting based on ID.
router.post('/deleteGame/:id', (req, res) => {
    //ID is pulled from the request params.
    const id = parseInt(req.params.id);
    //Query is sent.
    pool.query('DELETE FROM games WHERE id=$1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        //Return a message that the update went through.
        res.status(200).send(`Game with ID of '${id}' deleted successfully.`);
    })
});

module.exports = router