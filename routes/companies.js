const express = require("express");
const router = new express.Router();
const db = require("../db");
const { NotFoundError } = require("../expressError");

/** GET /companies Returns a list of all the companies.
 * Returns: {companies: [{code, name}, ...]}
 */
router.get("/",
  async function (req, res, next) {
    const results = await db.query(
      `SELECT code, name
               FROM companies`);

    const companies = results.rows;
    return res.json({ companies });
  });

/** GET /companies/[code] Returns a company based on the URL parameter
 * along with its invoice ids
 * Returns: {company: {code, name, description, invoices: [id, ...]}}
 */
router.get("/:code",
  async function (req, res, next) {
    let code = req.params.code;

    const companyResult = await db.query(
      `SELECT code, name, description
               FROM companies
               WHERE code = $1`, [code]);

    const company = companyResult.rows[0];
    
    if (company === undefined) throw new NotFoundError();

    const invoicesResults = await db.query(
      `SELECT id, comp_code, amt, paid, add_date, paid_date
                FROM invoices
                WHERE comp_code=$1,` [company.code]);

    const invoices = invoicesResults.rows;
    company.invoices = invoices.map(inv => inv.id);

    return res.json({ company });
  });

/* POST /companies Returns a newly created company
Needs to be given JSON like: {code, name, description}
Returns obj of new company: {company: {code, name, description}}*/
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

/*  PUT /companies/[code] Returns an updated company
Needs to be given JSON like: {name, description}
Returns update company object: {company: {code, name, description}} 
*/
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
    if (company === undefined) throw new NotFoundError();

    return res.json({ company });
  });

/* DELETE /companies/[code] Returns {status: deleted} or 404 based 
on company code in URL Parameter
Returns: {status: "deleted"}
*/
router.delete("/:code",
  async function (req, res, next) {
    let code = req.params.code;
    const result = await db.query(
      `DELETE FROM companies
       WHERE code=$1
       RETURNING code`, [code]);
    const company = result.rows[0];
    if (company === undefined) throw new NotFoundError();
    return res.json({ "status": "deleted" });
  });

module.exports = router;
