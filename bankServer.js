'use strict'

var express = require('express')
var app = express()

app.disable('x-powered-by')
app.set('port', process.env.PORT || 7000)

var morgan = require('morgan')
app.use(morgan('short'))

var bodyParser = require('body-parser')
app.use(bodyParser.json())

var fs = require('fs')
var path = require('path')
var accountsPath = path.join(__dirname, 'accountsData.json')

app.get('/accounts', function(req,res){
    fs.readFile(accountsPath, 'utf8', function(err, accountsJSON){
        if(err){
            console.error(err.stack)
            return res.sendStatus(500)
        }

        var accounts = JSON.parse(accountsJSON)

        res.status(200).json(accounts)
    })
})

app.listen(app.get('port'), function(){
    console.log('Listening on', app.get('port'));
})