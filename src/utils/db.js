// const mysql = require('mysql');
// let pool;

// exports.connect = function (done) {
//     pool = mysql.createPool({
//         host: '127.0.0.1',
//         user: 'root',
//         password: '',
//         database: "wave"
//     });

//     pool.getConnection(function(error, connection){
//         if(error){
//             done(error);
//         }else{
//             console.log("Connected!");
//             done();
//         }
//     })
// };

// exports.get = function() {
//     return pool;
// }
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: ""
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

var sql = 'SELECT * FROM wave.reports';
con.query(sql, function (err, result) {
    if (err) throw err;
    for (let i = 0; i < result.length; i++) 
    {
        console.log("id " + result[i].id + ", report_id " + result[i].report_id + ", pay_period " + result[i].pay_period + ", pay_amount " + result[i].pay_amount + ", data " + result[i].data );
    }
});