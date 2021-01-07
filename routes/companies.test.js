const request = require("supertest");
const app = require("../app");
let db = require("../db");

let testCompany;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  const results = await db.query(
        `INSERT INTO users (code, name, description)
         VALUES ('apple', 'Apple Computer', 'Maker of OSX.')
         RETURNING code, name, description`);
  
  testCompany = results.rows[0].id;
});

afterAll(async function () {
  await db.end();
});

/** GET /companies Test that list of all the companies returned */

// Getting all companies



/** GET /companies/[code] Test that company based on the URL parameter returned */

// Getting a single company
// Company not found (404)



/* POST /companies Test creation of new company*/

// Creating a company properly
// Bad post body (excess keys)
// Bad post body (missing keys)
// Error when trying to create duplicate company


/*  PUT /companies/[code] Test company properly updated */

// Properly updating
// Testing 404


/* DELETE /companies/[code] Test deletion of company */

// Properly deleting
// Testing 404