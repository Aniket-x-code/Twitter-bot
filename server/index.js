const needle = require('needle');
const http = require('http');
const config = require('dotenv').config();
const path = require('path');
const express = require('express')
const socketIo = require('socket.io')
const TOKEN = process.env.TWITTER_BEARER_TOKKEN
const PORT = process.env.PORT || 3000


const app = express();

const server = http.createServer(app)
const io = socketIo(server)


app.get('/', (req,res)=>{
    res.sendFile(path.resolve(__dirname, '../', 'client', 'index.html'))
})

const rulesURL='https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL='https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id'

const rules=[{value: '#T20WorldCup'}];


// get stream rules
async function getRules()
{
    const response= await needle('get', rulesURL, {
        headers:{
            Authorization: `Bearer ${TOKEN}`
        }
    }) 
    // console.log(response.body);
    return response.body;
}

// set stream rules
async function setRules()
{   const data = {
    add: rules
}
    const response= await needle('post', rulesURL,data, {
        headers:{
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    }) 
    return response.body;
}


// delete stream rules
async function deleteRules(rules)
{   
    if(!Array.isArray(rules.data)){
        return null
    }
    
    const ids = rules.data.map((rule)=> rule.id)

    const data = {
    delete: {
        ids: ids
    }
}
    const response= await needle('post', rulesURL,data, {
        headers:{
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    }) 
    return response.body;
}

function streamTweets()
{
    const stream = needle.get(streamURL, { 
        headers: {
        Authorization: `Bearer ${TOKEN}`
                 }
        })
        stream.on('data', (data)=>{
            try {
                const json = JSON.parse(data)
                console.log(json)
            } catch (error) {
                
            }
        })
}


io.on('connection', ()=>{
    console.log('client connected')
})

// (async()=>{
//      let currentRules

//      try {
//         // get all stream rules
//         currentRules = await getRules()
//         // delete all stream rules
        
//         await deleteRules(currentRules)
        
//         await setRules()
      
//      } catch ( error) {
//         console.log(error);
//         process.exit(1)
//      }
//      streamTweets()
// })()

server.listen(3000, () => {
    console.log(`Listening on port ${PORT}`);
});