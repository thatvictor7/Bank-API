'use strict'

var express = require('express')
var app = express()

app.set('port', process.env.PORT || 7000)

app.listen(app.get('port'), function(){
    console.log('Listening on', app.get('port'));
})