import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Line, Circle } from 'rc-progress';

import { useState, useRef, useEffect } from "react";
import "./App.css";
import { drawText } from "canvas-txt";
import WebFont from 'webfontloader'
import { Buffer } from "buffer";

window.Buffer = window.Buffer || require("buffer").Buffer;


let w, h, scaleH, scaleW;
let one_second = 0;
let duration;
let font_size = 55;
let from = 0,
  to = 3
  let fontFamily = 'Arial';
  let timing , time;

  let color = "#ffffff"
let videoContainer;
let download_btn;
let theCanvas;
let theContext;
let text_div ;
function App() {
  const [loaded, setLoaded] = useState(false);
  const [insertText, setInsertText] = useState(false);
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef(null);
  const messageRef = useRef(null);

  const load = async () => {
    videoContainer = document.getElementById("video-container");
    download_btn = document.getElementById("download_btn");
     timing = document.getElementById("timing");
     text_div = document.getElementById("text")
      time = document.getElementById("time");
    theCanvas = document.createElement("canvas");
    theContext = theCanvas.getContext("2d");

    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      //messageRef.current.innerHTML = message;
    //  console.log(message);
    });

    ffmpeg.on("error", (err) => {
      console.log(err);
    });
    ffmpeg.on("progress" , (p)=>{
      setProgress(p.progress)
      if(p.progress >= 1){
        setProgress(0)
      }
    })
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      )
    });

    //mov_bbb.mp4
    let videoUrl = "./mov_bbb.mp4";
    let videoBlob = await fetch(videoUrl).then((r) => r.blob());
    let videoObjectUrl = URL.createObjectURL(videoBlob);
    let video = document.createElement("video");
    video.src = videoObjectUrl;

    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");

    if (download_btn) {
      // create video
     download_btn.addEventListener("click" , ()=>{
      var BASE64_MARKER = ';base64,';
      var base64Index = theCanvas.toDataURL().indexOf(BASE64_MARKER) + BASE64_MARKER.length;
      var base64 = theCanvas.toDataURL().substring(base64Index);
      var raw = window.atob(base64);
      var rawLength = raw.length;
      var array = new Uint8Array(new ArrayBuffer(rawLength));
    
      for(let i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
      }
     
      transcode(array)
     })
    }

    canvas.addEventListener("click", (event) =>
      clickCanvas(canvas, context, event.offsetX, event.offsetY)
    );

    const myRange = document.getElementById("myRange");

    myRange.value = 0;
    let fired = 0;
    video.addEventListener("canplay", async function () {
      // if (seekResolve) seekResolve();
  
      
      fired++
      if (fired < 4) {
        console.log("fired")
       
        scaleW = (document.body.getBoundingClientRect().width - 600) / video.videoWidth;
        scaleH = (document.body.getBoundingClientRect().height - 200) / video.videoHeight;
        [w, h] = [document.body.getBoundingClientRect().width - 600, document.body.getBoundingClientRect().height - 200];
  
  
        canvas.width = w;
        canvas.height = h;
  
        theCanvas.width = video.videoWidth;
        theCanvas.height = video.videoHeight;
  
        myRange.max = video.duration
        myRange.style.width = w + "px"
  
        video.currentTime = 1 
        video.currentTime = 0  
       
        one_second = w / video.duration;
        timing.style.width = (one_second * 3) + "px";
        time.innerHTML = new Date(from * 1000).toISOString().substring(14, 19) + "---" + new Date(to * 1000).toISOString().substring(14, 19)
  
        duration = video.duration
        context.drawImage(video, 0, 0, w, h);
        document.getElementById("video-container").append(canvas)
        videoContainer.style.width = w + "px";
        videoContainer.style.height = h + "px";
        setLoaded(true);
        print()
      }

    })

    /***************************************************************************************** */

const timing_left = document.getElementById("timing-left");
const timing_right = document.getElementById("timing-right")
let original_width = 0;
let original_x = 0;
let original_y = 0;
let original_mouse_x = 0;
let original_mouse_y = 0;
let minwidth = 100;

timing_right.addEventListener('mousedown', function (e) {
  e.preventDefault()
  window.addEventListener('mousemove', resize)
  window.addEventListener('mouseup', () => {
    window.removeEventListener('mousemove', resize)
  })

  function resize(e) {


    if (w - e.pageX + 200 <= 0) {
      return
    }

    if (e.pageX - timing.getBoundingClientRect().left <= minwidth) return

    timing.style.width = e.pageX - timing.getBoundingClientRect().left + 'px';
    to = (e.pageX - 200) / one_second
    time.innerHTML = new Date(from * 1000).toISOString().substring(14, 19) + "---" + new Date(to * 1000).toISOString().substring(14, 19)



  }

})


timing_left.addEventListener('mousedown', function (e) {
  e.preventDefault()
  original_width = parseFloat(getComputedStyle(timing, null).getPropertyValue('width').replace('px', ''));
  original_x = timing.getBoundingClientRect().left;

  original_mouse_x = e.pageX;
  original_mouse_y = e.pageY;
  window.addEventListener('mousemove', resize)
  window.addEventListener('mouseup', () => {
    window.removeEventListener('mousemove', resize)
  })

  function resize(e) {

    if (e.pageX - original_mouse_x < 0) {
      return
    }
    if (original_width - (e.pageX - original_mouse_x) <= minwidth) return

    timing.style.width = original_width - (e.pageX - original_mouse_x) + 'px'
    timing.style.left = (e.pageX - original_mouse_x) + 'px'

    from = (e.pageX - original_mouse_x) / one_second

    time.innerHTML = new Date(from * 1000).toISOString().substring(14, 19) + "---" + new Date(to * 1000).toISOString().substring(14, 19)



  }

})
/*********************************************************************************************** */

const add_btn = document.getElementById("add-btn");
const remove_btn = document.getElementById("remove-btn");
const font_size_input = document.getElementById("font-size-input")


font_size_input.addEventListener("input", (ev) => {
  const value = parseInt(ev.target.value)
  font_size = value
  font_size_input.value = value
  text_div.style.fontSize = value + "px"
})

add_btn.addEventListener("click", (ev) => {
  font_size++;
  font_size_input.value = font_size
  text_div.style.fontSize = font_size + "px"

})

remove_btn.addEventListener("click", (ev) => {
  if (font_size === 11) return
  font_size--;
  font_size_input.value = font_size
  text_div.style.fontSize = font_size + "px"

})

text_div.addEventListener("input", (ev) => {
  print()
})


const fontlist = document.getElementById("font-list")

const fonts = ['Droid Sans', 'Croissant One' , 'Fuggles' , 'Bebas Neue' , 'Pacifico' , 'Great Vibes'  , 'Yellowtail' , 'Philosopher' , 'Passion One' , 'Kaushan Script']

WebFont.load({
  google: {
    families: fonts
  }
});

for (let i = 0; i < fonts.length; i++) {
  const font = fonts[i];
  const li = document.createElement("li")

  const h3 = document.createElement("h3")
  
  h3.innerText = font
  h3.style.fontFamily  = font;
  li.append(h3)
  fontlist.append(li)
  li.addEventListener("click" , ()=>{

    fontFamily = font;
    print()
  })
}


const colorInput  = document.getElementById("color-input")

colorInput.addEventListener("input" , (ev)=>{
  console.log(ev.target.value)
  color = ev.target.value
  print()
})



   
  };

  const  base64ToArrayBuffer = (base64)=> {
   
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
  const transcode = async (binary) => {
    console.log(binary)
    const ffmpeg = ffmpegRef.current;
   
    await ffmpeg.writeFile("mov_bbb.mp4", await fetchFile("mov_bbb.mp4"));
    await ffmpeg.writeFile("logo192.png", await fetchFile(binary));
    // await ffmpeg.writeFile('arial.ttf', await fetchFile('https://raw.githubusercontent.com/ffmpegwasm/testdata/master/arial.ttf'));

    await ffmpeg.exec([
      "-i",
      "mov_bbb.mp4",
      "-i",
      "logo192.png",
      "-filter_complex",
      "[0:v][1:v] overlay=0:0:enable='between(t,0,5)'",
      "-c:a",
      "copy",
      "output.mp4",
    ]);
  
    const data = await ffmpeg.readFile("output.mp4");
   
    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
   
    a.download = 'output.mp4';
    a.click();
    console.log(a)
  };


  const print = () => {
    text_div.style.fontFamily = fontFamily;
    text_div.style.color = color;
  
    theContext.fillStyle = color //white color text
    theContext.clearRect(0, 0, theCanvas.width, theCanvas.height)
    drawText(theContext, text_div.innerText, { x: text_div.getBoundingClientRect().left, y: text_div.getBoundingClientRect().top, width: (text_div.offsetWidth + 10) / scaleW, height: (text_div.offsetHeight + 10) / scaleH, fontSize: font_size / scaleW, font: fontFamily, align: "center" })
  }
  
  
  const wasCalled = useRef(false);
  
  useEffect(() => {
    if(wasCalled.current) return;
    wasCalled.current = true;
    load();
  }, [loaded]);

  const clickCanvas = (canvas, context, x, y) => {
    if (insertText) {
      var input = document.createElement("span");

      input.setAttribute("contenteditable", "true");

      input.className = "my-input";
      input.style.position = "absolute";
      input.style.zIndex = 100;
      input.style.border = 0;
      input.style.color = "red";
      input.style.background = "transparent";
      input.style.fontFamily = "Calibri";
      input.style.fontSize = 25 + "px";
      input.style.padding = 0;
      input.style.margin = 0;
      input.style.position = "absolute";

      input.style.left = x + "px";
      input.style.top = y + "px";

      videoContainer.appendChild(input);

      window.setTimeout(function () {
        input.focus();
      }, 33);

      input.addEventListener("blur", () => {
        const txtCanvas = document.createElement("canvas");
        txtCanvas.style.pointerEvents = "none";
        const textContext = txtCanvas.getContext("2d");
        txtCanvas.width = w;
        txtCanvas.height = h;
        insertText = false;
        document.body.style.cursor = "default";
        const textToWrite = input.innerText;

        textContext.fillStyle = "#ff0000"; //red color text
        drawText(textContext, textToWrite, {
          x,
          y,
          width: input.offsetWidth + 10,
          height: input.offsetHeight + 10,
          fontSize: 25,
          font: "Calibri",
          align: "left",
        });

        theContext.fillStyle = "#ff0000"; //red color text
        drawText(theContext, textToWrite, {
          x: x / scaleW,
          y: y / scaleH,
          width: (input.offsetWidth + 10) / scaleW,
          height: (input.offsetHeight + 10) / scaleH,
          fontSize: 25 / scaleW,
          font: "Calibri",
          align: "left",
        });

        videoContainer.removeChild(input);
        videoContainer.append(txtCanvas);
      });
    }
  };

  return (
    <>
  {
    ( !loaded) && <div id="splash-screen">
    <div className="loader"></div>
  </div>
  }

  {
    progress > 0 && 
    <div id="splash-screen">
    <Line percent={progress * 100} strokeWidth={4} strokeColor="#D3D3D3" />

  </div>
  }
      
      <div className="container">
        <div className="side-bar">
          <button id="play-btn">
            <img src="./img/play.png" alt="" />
          </button>
        </div>
        <div className="content">
          <div className="top-bar">
            <button id="download_btn">download</button>
          </div>

          <div className="content-container">
            <div className="video-container">
              <div>
                <div id="video-container">
                  <blockquote id="text" contentEditable >
                    come and enjoy
                  </blockquote>
                </div>
                <input type="range" min="0" step="0.1" id="myRange" />
                <div id="timing">
                  <div id="timing-left" className="left"></div>
                  <div id="time"></div>
                  <div id="timing-right" className="right"></div>
                </div>
              </div>

              <div className="tool-bar">
                <div className="sizing">
                  <button id="add-btn">
                    <img src="./img/add.png" alt="add" />
                  </button>
                  <input
                    type="number"
                    min="11"
                    value="55"
                    id="font-size-input"
                  />
                  <button id="remove-btn">
                    <img src="./img/remove.png" alt="remove.png" />
                  </button>
                </div>

                <ul id="font-list"></ul>

                <div className="color-container">
                  <label for="style1">Color</label>
                  <br />
                  <input type="color" value="#ffffff" id="color-input" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

     {/*  <br />

      <video ref={videoRef} controls></video>
      <br />
      <button onClick={transcode}>Transcode webm to mp4 with text</button>
      <p ref={messageRef}></p>
      <p>Open Developer Tools (Ctrl+Shift+I) to View Logs</p> */}
    </>
  ) ;
}

export default App;
