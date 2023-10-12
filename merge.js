console.log(3333);
const exec = require("child_process").exec;
const spawn = require("child_process").spawn;

const socketio = require("socket.io");

const path = require("path");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const formidable = require("formidable");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
const port = process.env.PORT || 3000;
//app.use(morgan());
app.use(express.static("front-end"));

let mySoket = null;

app.post("/merge", (req, res) => {
  fs.unlink("./output.mp4", (err) => {
    if (err) console.log(err);
    const base64Data = req.body.imgBase64.replace(
      /^data:image\/png;base64,/,
      ""
    );
    fs.writeFile("image.png", base64Data, "base64", function (err) {
      if (err) {
        console.log(err);
      }

      const cmd = `ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 video2.mp4`;

      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          res.json({ error: err.message });

          throw err;
        }

        const frameNumbers = parseInt(stdout);

        const ffmpeg = spawn("ffmpeg", [
          "-i",
          "video2.mp4",
          "-i",
          "image.png",
          "-filter_complex",
          `[0:v][1:v] overlay=0:0:enable='between(t,${req.body.from},${req.body.to})'`,
          "-c:a",
          "copy",
          "output.mp4",
          "-progress",
          "pipe:1",
        ]);
        ffmpeg.stdout.on("data", (data) => {
          //console.log(`stdout: ${data}`);
        });

        ffmpeg.on("close", (code) => {
          console.log(`child process exited with code ${code}`);
          res.json({ success: true });
        });
        ffmpeg.stderr.on("data", (data) => {
          console.log(data.toString());

          let _data = data.toString();
          if (typeof _data === "string") {
            _data.split(/\r?\n|\r|\n/g).map((line) => {
              if (line.indexOf("frame") > -1) {
                if (line.indexOf("fps") > -1) {
                  const result = line.split("fps")[0];
                  if (result.indexOf("frame") > -1) {
                    if (!isNaN(result.split("=")[1])) {
                      const progress =
                        (parseFloat(result.split("=")[1]) / frameNumbers) * 100;
                      io.sockets.emit("progress", progress);
                    }
                  }
                }
              }
            });
          }
        });
      });

      // exec(cmd, function (err, stdout, stderr) {
      //   if (err) {
      //     res.json({ error: err.message });

      //     throw err;
      //   }
      //   console.log(stdout)
      //   console.log("============================================================")
      //   res.json({ success: true });
      // });
    });
  });
});

app.get("/download", function (req, res) {
  const file = `${__dirname}/output.mp4`;
  res.download(file); // Set disposition and send it.
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "front-end", "index.html?port=" + port));
});

app.post("/upload", (req, res) => {
  const form = formidable({});
  form.parse(req, (err, fields, files) => {
    if (err) {
      //next(err);
      return;
    }

    res.writeHead(200, { "content-type": "text/plain" });

    // We write the copy of the video using the path of the temp video file
    let writer = fs.createWriteStream("./uploads/"+files.file.originalFilename);
    let reader = fs.createReadStream(files.file.filepath).pipe(writer);

    writer.on("finish", () => {
      // Once the video uploaded, we delete the temp file
      fs.unlink(files.file.filepath, err => {
          if (err) throw err
      })
  })

  form.on('progress' , function (bytesRecieved , bytesExpected) {
    console.log('received: ' + bytesRecieved);
    io.sockets.emit('progress', (bytesRecieved * 100) / bytesExpected);
  });
   
  });
});
const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const io = socketio(server);

io.on("connection", (socket) => {
  console.log("New connection");
  mySoket = socket;
});
