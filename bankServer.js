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

// app.get('/accounts/:id', function(req,res){
//     fs.readFile(accountsPath, 'utf8', function(readErr){
//         if(readErr){
//             console.error(readErr.stack)
//             return res.status(500)
//         }


//     })
// })

// Transactions

app.get('/accounts/:id/transactions', function(req,res){
    fs.readFile(accountsPath, 'utf8', function(readErr, accountsJSON){
        if(readErr){
            console.error(readErr.stack)
            return res.status(500)
        }

        let id = Number.parseInt(req.params.id)
        let accounts = JSON.parse(accountsJSON)

        res.status(200).json(accounts.users[id].transaction)

    })
})

app.listen(app.get('port'), function(){
    console.log('Listening on', app.get('port'));
})