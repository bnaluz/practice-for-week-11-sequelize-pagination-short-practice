// Instantiate Express and the application - DO NOT MODIFY
const express = require('express');
const app = express();

// Import environment variables in order to connect to database - DO NOT MODIFY
require('dotenv').config();
require('express-async-errors');

// Import the models used in these routes - DO NOT MODIFY
const { Musician, Band, Instrument } = require('./db/models');
const { parse } = require('dotenv');

// Express using json - DO NOT MODIFY
app.use(express.json());

app.get('/musicians', async (req, res, next) => {
  // Parse the query params, set default values, and create appropriate
  // offset and limit values if necessary.
  // Your code here
  //parsing the req query values, they come in as strings
  let { page, size } = req.query;

  //parseInteger from the string, strings that contain no numbers will be returned as NaN (NaN > 0) returns= false
  page = parseInt(page);
  size = parseInt(size);

  //   console.log(page > 0);
  //   console.log(size);

  //if size is returned as NaN which is falsy the default 5 value will be used
  let limit = size || 5;
  let offset;

  //case of a 0 query will use no limit or offset
  if (page === 0 || size === 0) {
    limit = null;
    offset = null;
  } else {
    //the values passed in are number types and not 0 and now checking that they not negative
    page = page > 0 ? page : 1;
    size = size > 0 ? size : 5;
    offset = (page - 1) * size;
  }

  // Query for all musicians
  // Include attributes for `id`, `firstName`, and `lastName`
  // Include associated bands and their `id` and `name`
  // Order by musician `lastName` then `firstName`
  const musicians = await Musician.findAll({
    order: [['lastName'], ['firstName']],
    attributes: ['id', 'firstName', 'lastName'],
    include: [
      {
        model: Band,
        attributes: ['id', 'name'],
      },
    ],
    limit: limit,
    offset: offset,
    // add limit key-value to query
    // add offset key-value to query
    // Your code here
  });

  res.json(musicians);
});

// BONUS: Pagination with bands
app.get('/bands', async (req, res, next) => {
  // Parse the query params, set default values, and create appropriate
  // offset and limit values if necessary.
  // Your code here
  let { page, size } = req.query;

  page = parseInt(page);
  size = parseInt(size);

  let limit = size || 5;
  let offset;

  if (page === 0 || size === 0) {
    limit = null;
    offset = null;
  } else {
    page = page > 0 ? page : 1;
    size = size > 0 ? size : 5;
    offset = (page - 1) * size;
  }

  // Query for all bands
  // Include attributes for `id` and `name`
  // Include associated musicians and their `id`, `firstName`, and `lastName`
  // Order by band `name` then musician `lastName`
  const bands = await Band.findAll({
    order: [['name'], [Musician, 'lastName']],
    attributes: ['id', 'name'],
    include: [
      {
        model: Musician,
        attributes: ['id', 'firstName', 'lastName'],
      },
    ],
    limit: limit,
    offset: offset,
    // add limit key-value to query
    // add offset key-value to query
    // Your code here
  });

  res.json(bands);
});

const paginationHelper = (queryData) => {
  let page = parseInt(queryData.page);
  let size = parseInt(queryData.size);

  let limit = size || 5;
  let offset;

  if (page === 0 || size === 0) {
    limit = null;
    offset = null;
  } else {
    page = page > 0 ? page : 1;
    size = size > 0 ? size : 5;
    offset = (page - 1) * size;
  }
  return { limit, offset };
};

// BONUS: Pagination with instruments
app.get('/instruments', async (req, res, next) => {
  // Parse the query params, set default values, and create appropriate
  // offset and limit values if necessary.
  // Your code here
  const { limit, offset } = paginationHelper(req.query);

  // Query for all instruments
  // Include attributes for `id` and `type`
  // Include associated musicians and their `id`, `firstName` and `lastName`
  // Omit the MusicianInstruments join table attributes from the results
  // Include each musician's associated band and their `id` and `name`
  // Order by instrument `type`, then band `name`, then musician `lastName`
  const instruments = await Instrument.findAll({
    order: [['type'], [Musician, Band, 'name'], [Musician, 'lastName']],
    attributes: ['id', 'type'],
    include: [
      {
        model: Musician,
        attributes: ['id', 'firstName', 'lastName'],
        // Omit the join table (MusicianInstruments) attributes
        through: { attributes: [] },
        include: [
          {
            model: Band,
            attributes: ['id', 'name'],
          },
        ],
      },
    ],
    limit: limit,
    offset: offset,
    // add limit key-value to query
    // add offset key-value to query
    // Your code here
  });

  res.json(instruments);
});

// ADVANCED BONUS: Reduce Pagination Repetition
// Your code here

//create a helper function that can handle the page and size query values
//*Commented this one out and placed function above last route

// const paginationHelper = (queryData) => {
//     let page = parseInt(queryData.page)
//     let size = parseInt(queryData.size)

//     let limit = size || 5
//     let offset

//     if(page === 0 || size === 0){
//         limit = null;
//         offset = null
//     } else {
//         page = page > 0 ? page : 1;
//         size = size > 0 ? size : 5;
//         offset = (page - 1 ) * size
//     }
//     return {limit , offset}
// }

// Root route - DO NOT MODIFY
app.get('/', (req, res) => {
  res.json({
    message: 'API server is running',
  });
});

// Set port and listen for incoming requests - DO NOT MODIFY
const port = 3000;
app.listen(port, () => console.log('Server is listening on port', port));
