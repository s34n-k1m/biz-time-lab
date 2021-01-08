"use strict";
const request = require("supertest");
const app = require("../app");
let db = require("../db");

let testCompany;

beforeEach(async function () {
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
  await db.query(
    `INSERT INTO companies (code, name, description)
    VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
           ('ibm', 'IBM', 'Big blue.');`);

  await db.query(
    `INSERT INTO invoices (comp_code, amt, paid, paid_date)
    VALUES ('apple', 100, FALSE, NULL),
           ('apple', 200, FALSE, NULL),
           ('apple', 300, TRUE, '2018-01-01'),
           ('ibm', 400, FALSE, NULL);`);
});

afterAll(async function () {
  await db.end();
});

/** GET /companies Test that list of all the companies returned */

// Getting all companies
describe("GET /companies", function () {
  it("Gets a list of all companies", async function () {
    const resp = await request(app)
      .get(`/companies`)
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ "companies": [{ "code": "apple", "name": "Apple Computer" }, { "code": "ibm", "name": "IBM" }] });
  });
});




/** GET /companies/[code] Test that company based on the URL parameter returned */
describe("GET /companies/[code]", function () {
  it("Gets a single company", async function () {
    const resp = await request(app)
      .get(`/companies/ibm`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ "company": { "code": "ibm", "name": "IBM", "description": "Big blue.", "invoices": [expect.any(Number)] } });
  });

  it("Responds with 404 if name invalid", async function () {
    const resp = await request(app).get(`/companies/gimmie404`);
    expect(resp.statusCode).toEqual(404);
  });
});

/* POST /companies Test creation of new company*/
describe("POST /companies", function () {
  it("Creates a new company", async function () {
    const resp = await request(app)
      .post(`/companies`)
      .send({ "code": "slack", "name": "Slack", "description": "Who needs money when you have cool software?" });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      "company": { "code": "slack", "name": "Slack", "description": "Who needs money when you have cool software?" }
    });
  });
  it("Returns 400 when the request is missing keys", async function () {
    const resp = await request(app)
      .post(`/companies`)
      .send({ "name": "Twitter", "description": "tweet tweet" });
    expect(resp.statusCode).toEqual(400);
  });
  it("Ignores extra keys", async function () {
    const resp = await request(app)
      .post(`/companies`)
      .send({ "code": "lyft", "name": "Lyft", "description": "Yo you need a lyft?", "extra-key": "Prop 22 sucks" });
    expect(resp.statusCode).toEqual(201);
  });
});



/*  PUT /companies/[code] Test company properly updated */
describe("PUT /companies/[code]", function () {
  it("Updates a company", async function () {
    const resp = await request(app)
      .put(`/companies/ibm`)
      .send({ "name": "IBM", "description": "We make giant boxes that really need air conditioning." });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ "company": { "code": "ibm", "name": "IBM", "description": "We make giant boxes that really need air conditioning." } });
  });
  it("Responds with 404 if name invalid", async function () {
    const resp = await request(app).put(`/companies/gimmie404`);
    expect(resp.statusCode).toEqual(404);
  });
});


/* DELETE /companies/[code] Test deletion of company */
describe("DELETE /companies/[code]", function () {
  it("Deletes a company", async function () {
    const resp = await request(app)
      .delete(`/companies/ibm`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ "status": "deleted" });

    const results = await db.query(`
      SELECT code
        FROM companies
    `);

    const companies = results.rows;
    expect(results.rows.length).toEqual(1);

  });
  it("Responds with 404 if name invalid", async function () {
    const resp = await request(app).delete(`/companies/gimmie404`);
    expect(resp.statusCode).toEqual(404);
  });
});
