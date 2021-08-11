const cors = require("cors");
const dotenv = require("dotenv");
const { response } = require("express");
const express = require("express");
const app = express();
dotenv.config();

const dbService = require("./dbService");
const zillowScraper = require("./zillowscraper");
const craiglistScraper = require("./craiglistScraper");
const CraiglistScraper = require("./craiglistScraper");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let totalCountCraiglist = 0;
let loggedUser;
let reqParameters = [];

//Create
app.post('/createUser', (req, res) => {
    const db = dbService.getDbServiceInstance();

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    console.log(req.body);

    const response = db.createUser(name, email, password);

    console.log(response);

    response
        .then(data => res.json(data))
        .catch(err => console.log(err));
});

//Read
app.get('/getUser', (req, res) => {
    const db = dbService.getDbServiceInstance();

    const result = db.getUser(req.query.email);

    result
        .then(data =>{
            loggedUser = data;
            res.json(data);
        })
        .catch(err => console.log(err));
});

app.get('/getCountCr', (req, res) => {
    res.json(totalCountCraiglist);
});

app.get('/getLoggedUser', (req, res) => {
    res.json(loggedUser);
});

app.get('/scheduleZillow', (req, res) => {

    const zilScraper = zillowScraper.ZillowScraperInstance();

    const totalCount = zilScraper.scrapeRecords("https://www.zillow.com/homes/" + req.query.city + "_rb/");

    console.log("total count from api " + totalCount);
    totalCount
        .then(data => res.json(data))
        .catch(err => console.log(err));
});

app.get('/checkCountCraiglist', (req, res) => {
    const craiglist = craiglistScraper.CraiglistScraperInstance();

    const totalCount = craiglist.getTotalCount(req.query.city, req.query.scrapFor, req.query.formValue);

    totalCount.then(data => {
        totalCountCraiglist = data;
        res.json(data);
    })
        .catch(err => {
            console.log("No Record");
            console.log(err)
        });

    console.log(reqParameters);
    console.log(totalCountCraiglist);
});

app.get('/scheduleCraiglist', (req, res) => {
    const craiglist = craiglistScraper.CraiglistScraperInstance();

    //const totalCount = craiglist.getTotalCount(req.query.city, req.query.scrapFor);

    const result = craiglist.scrapeDetails(req.query.city, req.query.scrapFor, req.query.formValue);

    result.then(data => {
        //console.log(data);
        res.json(data);
    })
        .catch(err => {
            console.log("No Record");
            console.log(err)
        });
});

app.get('/test', (req,res) => {
   console.log("OK");
});

app.get('/', (req,res) => {
    console.log("Server");
});

//Update

//Delete

//Listen
app.listen(process.env.PORT , "api.fsborei.com", () => {
    console.log("Server Running at: " + process.env.PORT + " - " + process.env.HOST);
});








// app.get('/:user',(req, res)=>{
// 	const user_id = req.query.email;
// 	console.log(user_id)
// });

// app.listen('12', ()=>{
// 	console.log("Server running");
// });

