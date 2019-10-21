var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var config = require('./config');
var db = require('./db');


var users = require('./routes/users');

var app = express();

app.listen(config.app.port, () => {
    console.log('server on port ' + config.app.port);
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser())
app.use(cors())

app.get('/api/v1/reports', (req, res) => {
    let sql = 'SELECT * FROM reports ORDER BY report_id';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(JSON.stringify(result));
    })
})

app.post('/api/v1/reports', (req, res) => {
    let request = req.body;
    let sql = `INSERT INTO reports 
                (report_id, pay_period, pay_amount, data) 
                VALUES 
                ('${ request.report_id }', "${ request.pay_period }", '${ request.pay_amount }', '${ request.report }')
                ON DUPLICATE KEY UPDATE
                pay_period = '${ request.pay_period }',
                pay_amount = '${ request.pay_amount }',
                data = '${ request.report }'`;

    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(JSON.stringify(result));
    })
})

app.on('error', function(err) {
    console.log("[mysql error]", err);
});

module.exports = app;