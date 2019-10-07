"use strict";
exports.__esModule = true;
var express = require("express");
var PORT = 1100;
var APP_LOCATION = 'dist';
var app = express();
app.get('*.*', express.static(APP_LOCATION, { maxAge: '1y' }));
app.all('*', function (req, res) {
    res.status(200).sendFile("/", { root: APP_LOCATION });
});
app.listen(PORT, function () {
    console.log('Running express server at port: ' + PORT);
});
