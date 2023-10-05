console.log(3333)
const exec = require('child_process').exec;


const morgan = require('morgan')

const path = require('path')
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const app = express()
app.use(cors())
app.use(express.json({limit: '50mb'}));
const port = process.env.PORT || 3000;
app.use(morgan())
app.use(express.static('front-end'))

app.post('/merge', (req, res) => {

  
    // fs.unlink('./output.mp4', (err) => {
    //     if (err) console.log(err);
    //     const base64Data = req.body.imgBase64.replace(/^data:image\/png;base64,/, "");
    //     fs.writeFile("image.png", base64Data, 'base64', function (err) {
    //         if (err) {
    //             console.log(err);
    //         }

         
    //         const cmd = `ffmpeg -i video2.mp4 -i image.png \
    // -filter_complex "[0:v][1:v] overlay=0:0:enable='between(t,${req.body.from},${req.body.to})'" \
    //  -c:a copy \
    // output.mp4`;
    //         exec(cmd, function (err, stdout, stderr) {
    
    
    //             if (err) {
    //                 res.json({error : err.message})
                   
    //                 throw err;
    //             }
    // res.json({success : true})
    
    
    
    //         })
    //     });


    // })



    res.json({success : true})
    
   



})

app.get('/download', function(req, res){
    const file = `${__dirname}/output.mp4`;
    res.download(file); // Set disposition and send it.
  });

  
  app.get('/', function(req, res){
    res.sendFile(path.join(__dirname ,'front-end' ,'index.html?port='+port));
  });
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})