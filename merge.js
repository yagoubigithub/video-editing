console.log(3333)
const exec = require('child_process').exec;


const express = require('express')
const cors = require('cors')
const fs = require('fs')
const app = express()
app.use(cors())
app.use(express.json());
const port = 3000

app.post('/merge', (req, res) => {

            const cmd = `ffmpeg -i video2.mp4 -i image.png \
    -filter_complex "[0:v][1:v] overlay=0:0:enable='between(t,${req.body.from},${req.body.to})'" \
    -pix_fmt yuv420p -c:a copy \
    output.mp4`;
            exec(cmd, function (err, stdout, stderr) {
    
    
                if (err) {
                    console.log(err)
                    //throw err;
                }
    res.json({success : true})
    
    
    
            })
        });
    
   



})

app.get('/download', function(req, res){
    const file = `${__dirname}/output.mp4`;
    res.download(file); // Set disposition and send it.
  });
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})