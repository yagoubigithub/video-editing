
//let baseUrl = 'https://video-editing-1234-abcd.site'

 let baseUrl =  'http://localhost:3000'
let c = 0
let insertText = false
const canvasTxt = window.canvasTxt
let w, h, scaleH, scaleW , precentageH, precentageW;
let one_second = 0;
let duration
let from = 0,
  to = 3
  let fontFamily = 'Arial';

  let color = "#ffffff"
  let backgroundColor = "#ffffff00"
  const dragContainer = document.getElementById("drag-container")
const videoContainer = document.getElementById('video-container')
const download_btn = document.getElementById('download_btn')
const theCanvas = document.createElement("canvas")
const theContext = theCanvas.getContext("2d")
const socket = io();

socket.on('progress', (data) => {
  document.getElementById("progress").style.width = ` ${parseFloat(data)}vw`
        console.log(`New message from ${socket.id}: ${data}`);
    })

async function showFram() {
  let videoUrl = "./video2.mp4"
  let videoBlob = await fetch(videoUrl).then((r) => r.blob());
  let videoObjectUrl = URL.createObjectURL(videoBlob);
  let video = document.createElement("video");
  video.src = videoObjectUrl;

  let canvas = document.createElement("canvas");
  let context = canvas.getContext("2d");

  if (download_btn) {
    download_btn.addEventListener("click", () => {
      const dataurl = theCanvas.toDataURL()
      download_btn.innerText = "downloading ..."

      const url_string  = window.location.href

      const url = new URL(url_string);
      console.log(url_string)
const  port = url.searchParams.get("port");

      fetch(`${baseUrl}/merge`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },


          body: JSON.stringify({
            imgBase64: dataurl,
            from,
            to
          })
        } , 50000).then((response) => response.json()).then((result) => {
          download_btn.innerText = "download"
          if (result.success) {
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.download = 'output.mp4';
            a.href = "./download";
            a.click();
          }
        })


    })
  }

  canvas.addEventListener('click', (event) => clickCanvas(canvas, context, event.offsetX, event.offsetY))


  const myRange = document.getElementById("myRange")
 



  myRange.value = 0
  let fired = 0
  video.addEventListener("canplay", async function () {
    // if (seekResolve) seekResolve();

    
    fired++
    if (fired < 4) {
      console.log("fired")
      document.getElementById("splash-screen").style.display = "none"
    
      w = document.body.getBoundingClientRect().width - 450
      h = document.body.getBoundingClientRect().height - 200
      scaleW = video.videoWidth /  w  ;
      scaleH = video.videoHeight /  h ;

      precentageW = (video.videoWidth / w) * 100
      precentageH = (video.videoHeight  / h) * 100

    

      

      dragContainer.style.left = ((w / 2) - (dragContainer.offsetWidth / 2) ) + "px"
      dragContainer.style.top = ((h / 2) - (dragContainer.offsetHeight ) ) + "px"

      
      dragElement(dragContainer , w , h , print);
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
      print()
    }



  });

  myRange.addEventListener("input", (event) => {
    console.log(event.target.value)
    video.currentTime = 1
   
    video.currentTime = parseInt(event.target.value)
    context.drawImage(video, 0, 0, w, h);
   
  })



 const play_btn =  document.getElementById("play-btn")

 let toggele = 'pause'
 play_btn.addEventListener("click" , (ev)=>{
  if(toggele === 'pause'){
    video.play()
    toggele = 'play'
  }else{
    video.pause()
    toggele = 'pause'
  }
  video.addEventListener('play', function() {
    var $this = this; //cache
    (function loop() {
      if (!$this.paused && !$this.ended) {
       
        context.drawImage(video, 0, 0, w, h);
        setTimeout(loop, 1000 / 30); // drawing at 30fps
      }
    })();
  }, 0);

  video.addEventListener('timeupdate', function() {
   console.log( video.currentTime   )
   myRange.value = video.currentTime 
  });
 })

  //context.drawImage(video, 0, 0, w, h);






}


function prepareInsertTetx() {
  document.body.style.cursor = "text";
  insertText = true
}


function clickCanvas(canvas, context, x, y) {
  if (insertText) {
    var input = document.createElement("span");

    input.setAttribute("contenteditable", "true")

    input.className = "my-input"
    input.style.position = "absolute";
    input.style.zIndex = 100;
    input.style.border = 0;
    input.style.color = "red";
    input.style.background = "transparent";
    input.style.fontFamily = "Calibri";
    input.style.fontSize = (25) + "px";
    input.style.padding = 0;
    input.style.margin = 0;
    input.style.position = "absolute"




    input.style.left = x + "px";
    input.style.top = (y) + "px";


    videoContainer.appendChild(input);

    window.setTimeout(function () {
      input.focus()
    }, 33);

    input.addEventListener("blur", () => {
      const txtCanvas = document.createElement('canvas')
      txtCanvas.style.pointerEvents = 'none';
      const textContext = txtCanvas.getContext("2d");
      txtCanvas.width = w;
      txtCanvas.height = h;
      insertText = false
      document.body.style.cursor = "default";
      const textToWrite = input.innerText;

      textContext.fillStyle = '#ff0000' //red color text
      canvasTxt.drawText(textContext, textToWrite, { x, y, width: input.offsetWidth + 10, height: input.offsetHeight + 10, fontSize: 25, font: "Calibri", align: "left" })

      theContext.fillStyle = '#ff0000' //red color text
      canvasTxt.drawText(theContext, textToWrite, { x: x / scaleW, y: y / scaleH, width: (input.offsetWidth + 10) / scaleW, height: (input.offsetHeight + 10) / scaleH, fontSize: 25 / scaleW, font: "Calibri", align: "left" })



      videoContainer.removeChild(input)
      videoContainer.append(txtCanvas)





    })



  }

}


showFram()

/***************************************************************************************** */
const timing = document.getElementById("timing");

const time = document.getElementById("time");
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
let font_size = 35;
const text_div = document.getElementById("text")
text_div.addEventListener("click" , ()=>{
  //placeCaretAtEnd( text_div );
})


font_size_input.addEventListener("input", (ev) => {
  const value = parseInt(ev.target.value)
  font_size = value
  font_size_input.value = value
  text_div.style.fontSize = value + "px"
  print()
})

add_btn.addEventListener("click", (ev) => {
  font_size++;
  font_size_input.value = font_size
  text_div.style.fontSize = font_size + "px"
  print()

})

remove_btn.addEventListener("click", (ev) => {
  if (font_size === 11) return
  font_size_input.value = font_size
  text_div.style.fontSize = font_size + "px"
  print()

})

text_div.addEventListener("input", (ev) => {
  print()
})


function print() {
  text_div.style.fontFamily = fontFamily;
  text_div.style.color = color;
  text_div.style.backgroundColor = backgroundColor

  
  const clone = text_div.cloneNode(true);
 

  
  console.log("precte" , precentageW , precentageH)

  document.getElementById("trash").innerHTML = ""
  document.getElementById("trash").appendChild(clone)
  html2canvas(clone).then(mynewCanvas => {
   
    let x1 =( dragContainer.offsetLeft) * (precentageW / 100)
    let y1 = (dragContainer.offsetTop)  * (precentageH / 100)
  
    console.log(mynewCanvas.width, mynewCanvas.height)
    theContext.clearRect(0, 0, theCanvas.width, theCanvas.height)
    theContext.drawImage(mynewCanvas,0,0 , mynewCanvas.width , mynewCanvas.height ,x1, y1, 
      ( dragContainer.offsetWidth -5 ) * (precentageW / 100),
      ( dragContainer.offsetHeight  -5  ) * (precentageH / 100)
      
      );
    //document.getElementById("trash").removeChild(clone)


}); 
 



  // theContext.fillStyle = backgroundColor //background color text
  // theContext.fillRect(x1 , y1, width1, height1);
  // theContext.fillStyle = color // color text
  // canvasTxt.drawText(theContext, text_div.innerText, { x:x1, y:y1 , width:width1 + 10 , height:height1 +10, fontSize: font_size / scaleW, font: fontFamily, align: "center" })
}







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
  
  h3.innerText = font,
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

const backgroundInput  = document.getElementById("background-color-input")

backgroundInput.addEventListener("input" , (ev)=>{
  console.log(ev.target.value)
  backgroundColor = ev.target.value
  print()
})



//video-input

const videoInput  = document.getElementById("video-input")

videoInput.addEventListener("change" , (ev)=>{
  const selectedFile = videoInput.files[0];
  console.log(selectedFile);
  const formData  = new FormData();

  formData.append("file", selectedFile);
  const req = new XMLHttpRequest(); 

  req.upload.addEventListener("progress", (e)=>{
    console.log(` ${parseFloat( (((e.loaded/e.total)*100)))}vw`)
    //progress
    document.getElementById("progress").style.width = ` ${parseFloat( (((e.loaded/e.total)*100)))}vw`
  }); 
  req.open("POST", "/upload"); 

  req.send(formData)

})