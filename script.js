/**
 * Provides requestAnimationFrame in a cross browser way.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */

if (!window.requestAnimationFrame) {

    window.requestAnimationFrame = (function() {

        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {

                window.setTimeout(callback, 1000 / 60);

            };

    })();

}


//---- Request animation ends ---/

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;

var camvideo = document.getElementById('myCam');


navigator.getUserMedia({
    video: true
}, gotStream, noStream);


function gotStream(stream) {
    if (window.URL) {
        camvideo.src = window.URL.createObjectURL(stream);
    } else // Opera
    {
        camvideo.src = stream;
    }

}

function noStream(e) {

}

// Motion Detection //
// assign global variables to HTML elements
var video = document.getElementById('myCam');
var videoCanvas = document.getElementById('videoCanvas');
var videoContext = videoCanvas.getContext('2d');

var blendCanvas = document.getElementById("blendCanvas");
var blendContext = blendCanvas.getContext('2d');

var messageArea = document.getElementById("messageArea");

// these changes are permanent
videoContext.translate(320, 0);
videoContext.scale(-1, 1);

// background color if no video present
videoContext.fillStyle = '#eaeaea';
videoContext.fillRect(0, 0, videoCanvas.width, videoCanvas.height);



// start the loop               
animate();

function animate() {
    requestAnimationFrame(animate);

    render();
    blend();
    checkHotspots();
}

function render() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // mirror video
        videoContext.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);

    }
}

var lastImageData;

function blend() {
    var width = videoCanvas.width;
    var height = videoCanvas.height;
    // get current webcam image data
    var sourceData = videoContext.getImageData(0, 0, width, height);
    // create an image if the previous image doesn�t exist
    if (!lastImageData) lastImageData = videoContext.getImageData(0, 0, width, height);
    // create a ImageData instance to receive the blended result
    var blendedData = videoContext.createImageData(width, height);
    // blend the 2 images
    checkDiff(sourceData.data, lastImageData.data, blendedData.data);
    // draw the result in a canvas
    blendContext.putImageData(blendedData, 0, 0);
    // store the current webcam image
    lastImageData = sourceData;
}

function checkDiff(currentImage, lastImage, output) {


    var i = 0;
    while (i < (currentImage.length / 4)) {
        var average1 = (currentImage[4 * i] + currentImage[4 * i + 1] + currentImage[4 * i + 2]) / 3;
        var average2 = (lastImage[4 * i] + lastImage[4 * i + 1] + lastImage[4 * i + 2]) / 3;
        var diff = threshold((average1 - average2));
        //var diff = average1 - average2;
        output[4 * i] = diff;
        output[4 * i + 1] = diff;
        output[4 * i + 2] = diff;
        output[4 * i + 3] = 0xff;
        ++i;
    }
}

function fastAbs(value) {
    return (value ^ (value >> 31)) - (value >> 31);
}

function threshold(value) {
    return (value > 0x15) ? 0xFF : 0;
}


function checkHotspots() {

    // get the pixels in a note area from the blended image
    var blendedData = blendContext.getImageData(0, 0, 50, 50);

    // calculate the average lightness of the blended data
    var i = 0;
    var sum = 0;
    var countPixels = blendedData.data.length * 0.25;
    while (i < countPixels) {
        sum += (blendedData.data[i * 4] + blendedData.data[i * 4 + 1] + blendedData.data[i * 4 + 2]);
        ++i;
    }
    // calculate an average between of the color values of the note area [0-255]
    var average = Math.round(sum / (3 * countPixels));
    if (average > 10) // more than 20% movement detected
    {

        messageArea.innerHTML = "<font color= red> Something Moved. </font>";
    } else {
        messageArea.innerHTML = "<font color=black> .... </font>";
    }

}
