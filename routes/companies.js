const express = require("express");
const router = new express.Router();
const db = require("../db");
const { NotFoundError } = require("../expressError");

/** Returns a list of all the companies. */
router.get("/",
  async function (req, res, next) {
    const results = await db.query(
      `SELECT code, name
               FROM companies`);

    const companies = results.rows;
    return res.json({ companies });
  });

/** Returns a company based on the URL parameter. */
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



// /** TEMPLATE EXAMPLE POSTGRES ROUTE*/
// /** Create new user, return user */
// router.post("/", async function (req, res, next) {
//   const { name, type } = req.body;

//   const result = await db.query(
//     `INSERT INTO users (name, type)
//            VALUES ($1, $2)
//            RETURNING id, name, type`,
//     [name, type],
//   );
//   const user = result.rows[0];
//   return res.status(201).json({ user });
// });

// /** TEMPLATE EXAMPLE POSTGRES ROUTE*/
// /** Update user, returning user */
// router.patch("/:id", async function (req, res, next) {
//   const { name, type } = req.body;

//   const result = await db.query(
//     `UPDATE users
//            SET name=$1,
//                type=$2
//            WHERE id = $3
//            RETURNING id, name, type`,
//     [name, type, req.params.id],
//   );
//   const user = result.rows[0];
//   return res.json({ user });
// });


// /** TEMPLATE EXAMPLE POSTGRES ROUTE*/
// /** Delete user, returning {message: "Deleted"} */
// router.delete("/:id", async function (req, res, next) {
//   await db.query(
//     "DELETE FROM users WHERE id = $1",
//     [req.params.id],
//   );
//   return res.json({ message: "Deleted" });
// });

module.exports = router;