const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const lineByLine =  require('line-by-line')
const fs = require('fs')
const cookieSession = require('cookie-session')

const app = express()
const PORT = 3002

let username = ''

app.set('view engine', 'pug')

app.use(cookieSession({
	name:'myCookieName',
	keys: ['holaquetal']
}))

app.use( (req, res, next) => {
	req.session.username = req.session.username || null
	req.session.password = req.session.password || null
	next()
})


app.use( express.static( path.join(__dirname,'public')) )
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
	if (req.session.username && req.session.password) {
		res.redirect('/home')
	} else {
		res.redirect('/login')
	}
})

app.get('/login', (req, res) => {
	if (req.session.username && req.session.password) {
		res.redirect('/home')
	} else {
		res.render('pages/login')
	}
})

app.post('/login', (req, res) => {
	username = req.body.username
	let password = req.body.password
	let loginOk = 0
    const users = fs.readFileSync('users.txt', 'utf-8').split('\r\n')
    users.forEach(function(item) {
    	let user = item.split(':')
    	if (username === user[0] && password === user[1]) {
    		loginOk = 1
    		req.session.username = username
    		req.session.password = password
    	} 
    })
    if (loginOk === 1) {
    	res.redirect('/home')
    } else {
    	res.redirect('/error')
    }
});

app.get('/home', (req, res) => {
	if (req.session.username && req.session.password) {
		res.render('pages/home', {username: req.session.username})
	} else {
		res.redirect('/login')
	}
})

app.get('/error', (req, res) => {
	res.render('pages/error', {username})
})

app.get('/logout', (req, res) => {
	req.session.username = null
	req.session.password = null
	res.redirect('/login')
})

app.get('/register', (req, res) => {
	res.render('pages/register')
})

app.post('/register', (req, res) => {
	let username = req.body.username
	let password = req.body.password
	let user = '\r\n' + username + ':' + password
	fs.appendFileSync('users.txt', user)
	res.redirect('/login')
})



app.listen(PORT)
console.log(`Listening on PORT ${PORT}`)