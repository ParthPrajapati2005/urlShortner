require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const {MongoClient} = require('mongodb');
const bodyParser = require('body-parser');
const client = new MongoClient("mongodb+srv://parth:<password>@freecodecamptutorial.rkbhvq7.mongodb.net/?retryWrites=true&w=majority");
const db = client.db("urlshortener");
const urls = db.collection("urls");
const dns = require('dns');
const urlparser = require('urlparser');

app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl/', (req,res) => {
  const url = urlparser.parse(req.body.url).host.hostname;
  dns.lookup(url, async(err,address) => {
    if(!address){
      res.json({error:"Invalid URL"});
    }
    else{
      const count = await urls.countDocuments();
      const record = {
        originalURL:req.body.url,
        shortURL: count
      };
      console.log(urls.insertOne(record));
      res.json({originalURL:req.body.url, shortURL:count});
    }
  })
})

app.get("/api/shorturl/:urlToVisit?", async(req,res) => {
  const returnedVal = await urls.findOne({shortURL:parseInt(req.params.urlToVisit)});
  if(returnedVal != null){
    res.redirect(returnedVal.originalURL);
  }else{
    res.json({error:"No short URL found for the given input"});
  }
})
app.listen(3000, function() {
  console.log(`Listening on port ${3000}`);
});
