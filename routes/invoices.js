"use strict";
const { json } = require("body-parser");
const { Console } = require("console");
const express = require("express");
const router = new express.Router();
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

/** GET /invoices Returns list of all the invoices.
 * {invoices: [{id, comp_code}, ...]}
 */
router.get("/",
  async function (req, res, next) {
    const results = await db.query(
      `SELECT id, comp_code
               FROM invoices`);

    const invoices = results.rows;
    console.log("INVOICES: ",invoices);
    return res.json({ invoices });
  });

/* GET /invoices/[id] Returns obj on given invoice.
 * If invoice cannot be found, returns 404.
 * Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}
 */
router.get("/:id",
  async function (req, res, next) {
    let id = req.params.id;
    if (!parseInt(id)) throw new BadRequestError();

    const invoiceResults = await db.query(
      `SELECT id, comp_code, amt, paid, add_date, paid_date
                FROM invoices
                WHERE id = $1`, [id]);


    const invoice = invoiceResults.rows[0];

    if (invoice === undefined) throw new NotFoundError();

    const companyResults = await db.query(
      `SELECT code, name, description
                FROM companies
                WHERE code = $1`, [invoice.comp_code]);


    const company = companyResults.rows[0];
    invoice.company = company;
    delete invoice.comp_code;

    return res.json({ invoice });
  }
)

/* POST /invoices Adds an invoice.
 * Needs to be passed in JSON body of: {comp_code, amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post("/",
  async function (req, res, next) {
    let { comp_code, amt } = req.body;

    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
              VALUES ($1, $2)
              RETURNING comp_code, amt`,
      [comp_code, amt]);

    const invoice = result.rows[0];
    return res.status(201).json({ invoice });
  });

/* PUT /invoices/[id] Updates an invoice.
 * If invoice cannot be found, returns a 404.
 * Needs to be passed in a JSON body of {amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.put("/:id",
  async function (req, res, next) {
    let id = req.params.id;
    let { amt } = req.body;

    const result = await db.query(
      `UPDATE invoices
              SET amt=$2
              WHERE id=$1
              RETURNING code, name, description`,
      [id, amt]);

    const invoice = result.rows[0];

    if (invoice === undefined) throw new NotFoundError();

    return res.json({ invoice });
  });

/*  DELETE /invoices/[id] */
router.delete("/:id",
  async function (req, res, next) {
    let id = req.params.id;

    const result = await db.query(
      `DELETE FROM invoices
       WHERE code=$1
       RETURNING id`, [id]);

    const invoice = result.rows[0];

    if (invoice === undefined) throw new NotFoundError();

    return res.json({ "status": "deleted" });
  });

module.exports = router;
