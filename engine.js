//EngineX routing system
//1. Route to Static Files = HTML
//2. Route to Database Files = JSON
//api key:: at_some_key
global.ID = 0
var  session         = require('express-session');
var authy 			 = require('authy')('your_authy_api_key'); // reuires key get it from https://authy.com/
const Verifier       = require("email-verifier"); //requires key get it from https://emailverification.whoisxmlapi.com
const passwordHash   = require('password-hash');


module.exports = function(app, con) {
	
	//Home page
	//The home page
	app.get('/', function(req, res){
		res.render('index')
	})

	app.get('/otp', function(req, res){
		res.render('otp', {mobile: 'phone', data: 5, mail: 'email'})
	})

	//The signin page
	app.get('/signin', function(req, res){
		if(session.email != null) {
			res.render('dash', {data: true})
		}
		else{
			res.render('signin', {data: 0})
		} 
	})

	//Thee about page
	app.get('/about', function(req, res){
		res.render(__dirname + '/assets/about.html' )
	})

	//The register page
	app.get('/register', function(req, res){
		res.render('reg', {data: null})
	})

	//Dashboard Refresh for account verification
	app.get('/refresh', function(req, res){
		res.render('signin', {data: null});
	})

	//The signin
	//Login Module
	app.post('/login', function(req, res){

		var email = req.body.Username;
		var pass  = req.body.Password;

		//set the session
		session = req.session;
		session.email = email;

		var sql 	= "SELECT password FROM users WHERE email = ?";

		con.query(sql, [email], (err, result) => {
			if(err)	console.log("Does not exists");
			else{
				console.log(result + email)
				if(result.length > 0 ){
					//console.log("Password found successfully" );

					if(passwordHash.verify(pass, result[0].password)){
						//console.log("Password not matched")
						con.query("SELECT verify FROM users WHERE email = ?", [email], (err, result) => {
							res.render('dash',  {data: result[0].verify})
							console.log("Status:: " + result[0].verify);
						})
					}
					else{
						res.render('dash',  {data: result[0].verify})
					}
				}
				else{
					res.render('signin', {data: 1})
				}
			}
		})
		
	})

	//OTP checking module
	app.post('/otpcheck', function(req, res){
		var otp = req.body.OTP
		var email = req.body.Email
		var phone = req.body.Phone
		var id = req.body.Id

		res.render('dash',  {data: true})
	})

	function taketoDash(val){
		if(val)
			res.render('dash', {data: false})
		else
			res.render('otp', {mobile: 'phone', data: 3, mail: 'email', OTPid: 'ID'})//wrong otp
	}

	//Singup Module
	app.post('/signup', function(req, resp){
		var name = req.body.Username;
		var pass  = req.body.Password;
		var email = req.body.Email;
		var phone = req.body.Phone;

		var hashedPassword = passwordHash.generate(pass)


		if(checkEmail(email)){
			//defaut STD code INDIA
			authy.register_user(email, phone, '91', function (err, res) {
			    // res = {user: {id: 1337}} where 1337 = ID given to use, store this someplace
			    if(err) console.log(err)
				else{
					ID = res.user.id;
					console.log('In generating'+ID)
					authy.request_sms(ID, function (err, res) {
						// if(err) console.log(err)
						console.log('SMS Sent'+ res)
						console.log('sending to web page::'+ID)
						//email does not exists
						resp.render('otp', {mobile: phone, data: 5, mail: email, OTPid: ID})//wrong otp
					});
				}
			});
			
			var sql 	= "INSERT INTO users(name, email, phone, password) VALUES(?,?,?,?)"

			con.query(sql, [name, email, phone, hashedPassword], (err, result) => {
				if(err)	console.log(err)
				else {
					verifyEmail(email)
				}
			})

		} else {
			//email exists
			resp.render('reg', {data: 2});
		}
		
	})


	//Logout user and its session
	app.get('/logout',function(req,res){
		req.session.destroy(function(err) {
		  if(err) {
		    console.log(err);
		  } else {
		    res.redirect('/');
		  }
		});
		session.email = null; 
	});

	//checking email in the database
	function checkEmail(email){
		con.query("SELECT email FROM users WHERE email = ?", [email], (err, result) => {
				if(err)	console.log(err)
				else{
					if(result.length > 0){
						console.log(result.length);
						return false
					}
				}
		})
		return true;
	}

	//verifying with third party
	function verifyEmail(email){
		let verifier = new Verifier("email_verifier_key");
		verifier.verify(email, (err, data) => {
		  if (err) console.log(err);
		  else{
		  	if(data.formatCheck && data.dnsCheck && data.freeCheck){
		  		console.log("Email verified")
		   		console.log("trying to verify")
				con.query("UPDATE users SET verify = TRUE WHERE email = ?", [email], (err, result) => {
					if(err)	console.log(err)
				})
		  	}
		  }
		})
	}
}
