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

const shortId = require('shortid')
const uuidv4 = require('uuid/v4');

// Accounts

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

app.get('/accounts/:id', function(req,res){
    fs.readFile(accountsPath, 'utf8', function(err, accountsJSON){
        if (err) {
            console.error(err.stack)
            return res.sendStatus(500)
        }

        var id = Number.parseInt(req.params.id)
        var accounts = JSON.parse(accountsJSON)

        if(id < 0 || Number.isNaN(id) || id >= accounts.users.length){
            return res.status(404).json({"Error": "invalid id"})
        }

        res.status(200).json(accounts.users[id])
    })
})

app.post('/accounts', function(req,res){
    fs.readFile(accountsPath, 'utf8', function(readErr, accountsJSON){
        if(readErr){
            console.error(readErr.stack)
            return res.status(500)
        }

        var accounts = JSON.parse(accountsJSON)
        let generatedId = shortId.generate() + shortId.generate()
        var account = {
            "userId": generatedId,
            "firstName": req.body.fname,
            "lastName": req.body.lname,
            "bankName": req.body.bank,
            "description": "",
            "transaction": [],
        }

        if (!req.body.fname || !req.body.lname) {
            return res.status(400).json({"Error": "Missing customer data."})
        }

        accounts.users.push(account)

        var newAccountsJSON = JSON.stringify(accounts)

        fs.writeFile(accountsPath, newAccountsJSON, function(writeErr){
            if(writeErr){
                console.error(writeErr.stack)
                return res.status(500).json({"Error": "Internal error."})
            }
        })

        res.status(200).json(account)

    })
})

app.put('/accounts/:id', function(req, res){
    fs.readFile(accountsPath, 'utf8', function(readErr, accountsJSON){
        if(readErr){
            console.error(readErr.stack)
            return res.status(500)
        }

        let id = Number.parseInt(req.params.id)
        let accounts = JSON.parse(accountsJSON)
        let account = accounts.users[id]

        let firstName = req.body.fname
        let lastName = req.body.lname
        let bank = req.body.bank

        
        if(id < 0 || Number.isNaN(id) || id >= accounts.users.length){
            return res.status(404).json({"Error": "Not Found, Invalid ID."})
        } else if(!firstName || !lastName || !bank){
            return res.status(400).json({"Error": "Missing user data"})
        }
        
        account["firstName"] = firstName
        account["lastName"] = lastName
        account["bankName"] = bank
        accounts.users[id] = account
        
        var newAccountsJSON = JSON.stringify(accounts)

        fs.writeFile(accountsPath, newAccountsJSON, function(writeErr){
            if(writeErr){
                console.error(writeErr.stack)
                return res.status(500).json({
                    "Error": "Internal error."
                })
            }
        })

        
        res.send(accounts.users[id])
    })
})

app.delete('/accounts/:id', function(req, res){
    fs.readFile(accountsPath, 'utf8', function(readErr, accountsJSON){
        if(readErr){
            console.error(readErr.stack)
            return res.status(500)
        }

        let id = Number.parseInt(req.params.id)
        let accounts = JSON.parse(accountsJSON)

        if(id < 0 || Number.isNaN(id) || id >= accounts.users.length){
            return res.status(404).json({"Error": "Missing user data"})
        }

        accounts.users.splice(id,1)

        let newAccountsJSON = JSON.stringify(accounts)

        fs.writeFile(accountsPath, newAccountsJSON, function(writeErr){
            if(writeErr){
                return res.status(500).json({
                    "Error": "Internal error"
                })
            }
        })

        res.status(200).json({"Deleted": id})
    })
})

// Transactions

app.get('/accounts/:id/transactions', function(req,res){
    fs.readFile(accountsPath, 'utf8', function(readErr, accountsJSON){
        if(readErr){
            console.error(readErr.stack)
            return res.status(500)
        }

        let id = Number.parseInt(req.params.id)
        let accounts = JSON.parse(accountsJSON)

        if (id < 0 || Number.isNaN(id) || id >= accounts.users.length) {
            return res.status(404).json({"Error": "Invalid id"})
        }

        res.status(200).json(accounts.users[id].transaction)

    })
})

app.post('/accounts/:id/transactions', function(req, res){
    fs.readFile(accountsPath, 'utf8', function(readErr, accountsJSON){
        if(readErr){
            console.error(readErr.stack)
            return res.status(500)
        }

        let id = Number.parseInt(req.params.id)
        let accounts = JSON.parse(accountsJSON)

        let newTransaction = {
            "userId": uuidv4(),
            "title": req.body.title,
            "amount": req.body.amount,
            "pending": true
        }

        if (id < 0 || Number.isNaN(id) || id >= accounts.users.length) {
            return res.status(404).json({"Error": "Invalid id"})
        } else if (!req.body.title || !req.body.amount) {
            return res.status(400).json({
                "Error": "Missing transaction data."
            })
        }

        accounts.users[id]["transaction"].push(newTransaction)

        let newAccountsJSON = JSON.stringify(accounts)

        fs.writeFile(accountsPath, newAccountsJSON, function(writeErr){
            if(writeErr){
                return res.status(500).json({
                    "Error": "Internal error"
                })
            }
        })

        res.status(201).json({ "account": accounts.users[id]})
    })
})

app.put('/accounts/:id/transactions', function(req,res,next){
    fs.readFile(accountsPath, 'utf8', function(readErr, accountsJSON){
        if(readErr){
            console.error(readErr.stack)
            return res.status(500)
        }

        let id = Number.parseInt(req.params.id)
        let accounts = JSON.parse(accountsJSON)

        if (id < 0 || Number.isNaN(id) || id >= accounts.users.length) {
            return res.status(404).json({ "Error": "Invalid id" })
        }

        let title = req.body.title
        let amount = req.body.amount
        let transactionToUpdate = req.body.transaction

        if(!title || !amount || !transactionToUpdate){
            return res.status(400).json({
                "Error": "Missing transaction data."
            })
        }

        let response = {
            "Message": "Succesfully Updated",
            "transactions": accounts.users[id]["transaction"]
        }

        accounts.users[id]["transaction"].map((t) => {
            if(t["id"] === transactionToUpdate){
                t["title"] = title
                t["amount"] = amount
            }  
        })

        let newAccountsJSON = JSON.stringify(accounts)

        fs.writeFile(accountsPath, newAccountsJSON, function(writeErr){
            if(writeErr){
                return res.status(500).json({
                    "Error": "Internal error"
                })
            }
        })

        res.status(200).json(response)
    })
})

app.listen(app.get('port'), function(){
    console.log('Listening on', app.get('port'));
})