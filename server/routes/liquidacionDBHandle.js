const sqlite3 = require('sqlite3').verbose();
const {getConnection} = require('../db/conn');
// open the database

const addLiq = (req,res,next) =>{
    let db = getConnection();
    let sql = `INSERT INTO Liquidacion(IdBeneficiario,FechaEmision,Desde,Hasta) VALUES(?,?,?,?)`;

    // insert one row into the langs table
    db.run(sql,
      req.body.IdBeneficiario,
      req.body.FechaEmision,
      req.body.Desde,
      req.body.Hasta,
      function(err) {
      if (err) {
        res.status(400).json({"error":err.message});
        console.log(err.message);
        return;
      }
      res.status(200).json("Liquidacion cargada con exito");
      console.log("Liquidacion cargada con exito");
    });

    // close the database connection
    // db.close();
}

const getLiq = (req,res,next) =>{
  let db = getConnection();
  let sql = `SELECT * FROM Liquidacion
         ORDER BY id`;
  var arrayData = [];
  db.all(sql, [], (err, rows) => {
      if (err) {
          res.status(400).json({"error":err.message});
          return;
      }
      rows.forEach((row) => {
          // console.log(row);
          arrayData.push(row);
      });
      res.json(rows)
  });
}

const getLiqOnly = (req,res,next) =>{
  var id = req.params.id;
  // delete a row based on id
  let db = getConnection();
  let sql = `DELETE FROM Liquidacion WHERE id="${id}"`;
  db.run(sql, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Se ha borrado la fila ${id}`);
    res.json("Se ha borrado la fila");
  });
}

const updLiq = (req,res,next) =>{
  let db = getConnection();
  let sql = `UPDATE Liquidacion SET IdBeneficiario=?,FechaEmision=?,Desde=?,Hasta=? WHERE Id=${req.params.id}`

  // insert one row into the langs table
  db.run(sql,
    req.body.IdBeneficiario,
    req.body.FechaEmision,
    req.body.Desde,
    req.body.Hasta,
    function(err) {
    if (err) {
      res.status(400).json({"error":err.message});
      console.log(err.message);
      return;
    }
    res.status(200).json("Exito");
    console.log("Exito");
  });

  // close the database connection
  // db.close();
}

const delLiq = (req,res) =>{
  let db = getConnection();
  let sql = `DELETE FROM Liquidacion WHERE id="${req.params.id}"`;
  db.run(sql, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Se ha borrado la fila`);
    res.json("Se ha borrado la fila");
  });
}

module.exports = {addLiq, updLiq, getLiq, getLiqOnly, delLiq}