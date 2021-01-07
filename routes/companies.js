const express = require("express");
const router = new express.Router();
const db = require("../db");
const { NotFoundError } = require("../expressError");

/** GET /companies Returns a list of all the companies. */
router.get("/",
  async function (req, res, next) {
    const results = await db.query(
      `SELECT code, name
               FROM companies`);

    const companies = results.rows;
    return res.json({ companies });
  });

/** GET /companies/[code] Returns a company based on the URL parameter. */
router.get("/:code",
  async function (req, res, next) {
    let code = req.params.code;

    const results = await db.query(
      `SELECT code, name, description
               FROM companies
               WHERE code = $1`, [code]);

    const company = results.rows[0];

    if (!company) throw new NotFoundError();

    return res.json({ company });
  });

/* POST /companies Returns a newly created company*/
router.post("/",
  async function (req, res, next) {
    let { code, name, description } = req.body;

    const result = await db.query(
      `INSERT INTO companies (code, name, description)
              VALUES ($1, $2, $3)
              RETURNING code, name, description`,
      [code, name, description]);
    const company = result.rows[0];
    return res.status(201).json({ company });
  });

/*  PUT /companies/[code] Returns an updated company */
router.put("/:code",
  async function (req, res, next) {
    let code = req.params.code;
    let { name, description } = req.body;

    const result = await db.query(
      `UPDATE companies
              SET name=$2,
                  description=$3
              WHERE code=$1
              RETURNING code, name, description`,
      [code, name, description]);
    const company = result.rows[0];
    if (!company) throw new NotFoundError();

    return res.json({ company });
  });

/* DELETE /companies/[code] Returns {status: deleted} or 404 */
router.delete("/:code",
  async function (req, res, next) {
    let code = req.params.code;
    const result = await db.query(
      `DELETE FROM companies
       WHERE code=$1
       RETURNING code`, [code]);
    const company = result.rows[0];
    if (!company) throw new NotFoundError();
    return res.json({ "status": "deleted" });
  });

module.exports = router;
