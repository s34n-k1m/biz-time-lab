"use strict";
const request = require("supertest");
const app = require("../app");
let db = require("../db");

let testInvoice;
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

  const invoiceResult = await db.query(`
    SELECT id, amt, paid, add_date, paid_date
      FROM invoices
  `);

  testInvoice = invoiceResult.rows[0];

  const companyResult = await db.query(`
    SELECT code, name, description
      FROM companies
      WHERE code = $1`, [testInvoice.id]);

  testCompany = companyResult.rows[0];

});

afterAll(async function () {
  await db.end();
});

/** GET /invoices Returns list of all the invoices.
 * {invoices: [{id, comp_code}, ...]}
 */
describe("GET /invoices", function () {
  it("Gets a list of invoices", async function () {
    const resp = await request(app)
      .get(`/invoices`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      "invoices": [
        { "id": expect.any(Number), "comp_code": "apple" },
        { "id": expect.any(Number), "comp_code": "apple" },
        { "id": expect.any(Number), "comp_code": "apple" },
        { "id": expect.any(Number), "comp_code": "ibm" }]
    });
  });

});

/* Test function for:
 * GET /invoices/[id] Returns obj on given invoice.
 * If invoice cannot be found, returns 404.
 * Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}
 */
// describe("GET /invoices/[id]", function () {
//   it("Gets a single invoice", async function () {
//     const resp = await request(app)
//       .get(`/invoices/${testInvoice.id}`);
//     console.log(">>>>>>>>", testCompany);
//     testInvoice.company = await testCompany;

//     expect(resp.statusCode).toEqual(200);
//     expect(resp.body).toEqual({ testInvoice });
//   });

//   it("Responds with 400 if id not a number", async function () {
//     const resp = await request(app).get(`/invoices/gimmie404`);
//     expect(resp.statusCode).toEqual(400);
//   });
// });


/* Test function for:
 * POST /invoices Adds an invoice.
 * Needs to be passed in JSON body of: {comp_code, amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */

/* Test function for:
 * PUT /invoices/[id] Updates an invoice.
 * If invoice cannot be found, returns a 404.
 * Needs to be passed in a JSON body of {amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */


/*  Test function for:
 *  DELETE /invoices/[id] */
