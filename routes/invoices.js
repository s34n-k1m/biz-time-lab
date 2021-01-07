const express = require("express");
const router = new express.Router();
const db = require("../db");
const { NotFoundError } = require("../expressError");

/** GET /companies Returns a list of all the companies. */
router.get("/",
  async function (req, res, next) {
    const results = await db.query(
      `SELECT ,
               FROM invoices`); //todo

    const companies = results.rows;
    return res.json({ companies });
  });


/* GET /invoices Return info on invoices:
 * {invoices: [{id, comp_code}, ...]}
 */

/* GET /invoices/[id] Returns obj on given invoice.
 * If invoice cannot be found, returns 404.
 * Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}
 */

/* POST /invoices Adds an invoice.
 * Needs to be passed in JSON body of: {comp_code, amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */

/* PUT /invoices/[id] Updates an invoice.
 * If invoice cannot be found, returns a 404.
 * Needs to be passed in a JSON body of {amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */

/*  DELETE /invoices/[id] */
