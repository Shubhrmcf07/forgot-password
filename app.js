var express = require('express');
var bodyparser = require('body-parser');
var hbs = require('hbs');
var mysql = require('mysql');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: 'shubhamsachdeva593@gmail.com',
        pass: 'Shubh_rmcf07'
    }
});

var jwt = require('jwt-simple');

var con = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'Shubh_rmcf07',
	database: 'logistics'
})

var app = express();

app.set('view engine', 'hbs');
app.set('views', './');

app.use(bodyparser.urlencoded({extended: false}));

app.get('/forgotpassword',(req,res)=>{
    res.render('forgot',{})
})

app.post('/forgotpassword', (req, res)=>{
    var email = req.body.email;
    
    con.query("SELECT * FROM users WHERE email='"+email+"'", (error, response)=>{
        if(error) throw error;

        var payload = {
            id: response[0].user_id,
            email: email
        }

        var secret = response[0].password;

        var token = jwt.encode(payload, secret);

        var mailoptions = {
            from: 'shubhamsachdeva593@gmail.com',
            to: email,
            subject: 'eenie meenie mynie mo',
            text: '/resetpassword'+'/'+payload.id+'/'+token
        }

        transporter.sendMail(mailoptions, (err, data)=>{})

        res.redirect('/forgotpassword')
    })
})

app.get('/resetpassword/:id/:token', (req, res)=>{
    con.query("SELECT * FROM users WHERE user_id='"+req.params.id+"'", (err, response)=>{
        var secret = response[0].password;
        console.log(secret);
        var payload = jwt.decode(req.params.token, secret);

        var obj = {
            id : req.params.id,
            secret : secret
        }

        res.render('resetpassword', {
            id: req.params.id,
            secret: secret
        });
    })
})

app.post('/resetpassword', (req, res)=>{
    console.log(req.body.id);
    if(req.body.password!=req.body.confirm)
    {
        res.send("Passwords do not match");
    }

    else{
        console.log(req.body.id);
        con.query("UPDATE users SET password='"+req.body.password+"' WHERE user_id='"+req.body.id+"'", (err, data)=>{
            console.log(data);
        })
    }
})

app.listen(3000);