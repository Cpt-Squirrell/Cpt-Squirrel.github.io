function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var canvasBackground;
document.getElementsByClassName("canvas")[0].style.backgroundColor = canvasBackground;
var strokes = [];
var bubbles = [];

function drawLine(x1, y1, x2, y2, vertical, speed)
{
    var canvas = document.getElementsByClassName("canvas")[0];
    var context = canvas.getContext("2d");
    context.strokeStyle = "#FFF";
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    let index = strokes.length;
    strokes[strokes.length] = [
        x1, Math.round(Math.random()),
        y1, Math.round(Math.random()),
        x2, Math.round(Math.random()),
        y2, Math.round(Math.random()),
        vertical, speed
    ];
    return index;
}
function updateLine(x1, x1Dir, y1, y1Dir, x2, x2Dir, y2, y2Dir, vertical, speed)
{
    var canvas = document.getElementsByClassName("canvas")[0];
    var context = canvas.getContext("2d");
    context.strokeStyle = "#FFF";
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    let index = strokes.length;
    strokes[strokes.length] = [
        x1, x1Dir,
        y1, y1Dir,
        x2, x2Dir,
        y2, y2Dir,
        vertical,
        speed
    ];
    return index;
}

function nearBubbles(bubble, distance, bubbleBuffer)
{
    let nearBubbles = [];
    for (let i = 0; i < bubbleBuffer.length; i++)
    {
        if (i == bubble)
            continue;
        let iDistance = Math.sqrt(
            Math.pow( bubbleBuffer[bubble][0] - bubbleBuffer[i][0], 2 ) +
            Math.pow( bubbleBuffer[bubble][1] - bubbleBuffer[i][1], 2 )
        );
            // iDistance != 0 added as workaround for bug
        if (iDistance < distance && iDistance != 0)
            nearBubbles[nearBubbles.length] = [i, iDistance];
    }
    return nearBubbles;
}
function drawBubble(x, y, radius, fill = false)
{
    let canvas = document.getElementsByClassName("canvas")[0];
    let context = canvas.getContext("2d");
    let index = bubbles.length;
    let dir = Math.random() * 360;
    let speed = Math.random() * 2;
    bubbles[bubbles.length] = [
        x, y, radius, dir, speed];
    context.strokeStyle = "#000";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.stroke();
    return index;
}
function updateBubbles(bubbleBuffer)
{
    let canvas = document.getElementsByClassName("canvas")[0];
    let context = canvas.getContext("2d");    
    for (let i = 0; i < bubbleBuffer.length; i++)
    {
            //Get all variables
        let x = bubbleBuffer[i][0],
            y = bubbleBuffer[i][1],
            radius = bubbleBuffer[i][2],
            dir = bubbleBuffer[i][3],
            speed = bubbleBuffer[i][4];
            //Calculate new position
        let newX = x + speed * Math.cos(dir),
            newY = y + speed * Math.sin(dir);
            //Get all nearBubbles to this bubble
        let index = bubbles.length;
        let closeBubbles = nearBubbles(index, 13, bubbleBuffer);
        let closestBubble;
        if (closeBubbles.length > 0)
        {
            closestBubble = closeBubbles[0];
            closeBubbles.forEach(element => {
                if (element[1] < closestBubble[1])
                    closestBubble = element;
            });
        }
         
            //Bounce back to center if out of bounds
        if (newX < 0 || newX > canvas.clientWidth || newY < 0 || newY > canvas.clientHeight)
        {
            dir = Math.random() * 2 * Math.PI;
            newX = Math.random() * window.innerWidth;
            newY = Math.random() * window.innerHeight;
        }
            //Give the bubble a new altered direction
        else if (closeBubbles.length > 0)
        {
            closeBubbles.forEach(element => {
                let elementAngle =
                    Math.atan2(
                        bubbleBuffer[element[0]][1] - newY,
                        bubbleBuffer[element[0]][0] - newX
                    );
                if (elementAngle > dir)
                    dir += 0.0005 * ((30 - closestBubble[1]) * 20);
                else
                    dir -= 0.0005 * ((30 - closestBubble[1]) * 20);
            });
        }
        else {
            dir += (Math.random() - 0.5) * 0.2;
        }
            //Alter speed of bubble based on other close bubbles
        if (closeBubbles.length > 0)
            if (speed < 80)
                speed *= 1.2;
            else;
        else if (speed > 1)
            speed *= 0.9;
        
        if (closeBubbles.length > 0)
        {
            context.strokeStyle = "#bebebe";
            context.beginPath();
            context.arc(newX, newY, radius * 1.5, 2 * Math.PI, false);
            context.stroke();
        }
        else
        {
            context.strokeStyle = "#888";
            context.beginPath();
            context.arc(newX, newY, radius, 0, 2 * Math.PI, false);
            context.stroke();
        }
        bubbles[bubbles.length] = [
            newX, newY, radius, dir, speed
        ];
    }
}

function updateCanvas()
{
    //Remove the existing Canvas and replace it with new canvas
    var canvasContainer = document.getElementById("canvas_container");
    canvasContainer.removeChild(document.getElementsByClassName("canvas")[0]);
    var canvas = document.createElement("canvas");
    canvas.classList.add("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasContainer.appendChild(canvas);   
    animate();
}

function animate()
{
    let bubbleBuffer = []; 
    for (let i = 0; i < bubbles.length; i++)
        bubbleBuffer[bubbleBuffer.length] = bubbles[i];
    bubbles.splice(0, bubbles.length);
    updateBubbles(bubbleBuffer);
}

//Spawn the initial set of bubbles
for (let i = 0; i < 250; i++)
{
    drawBubble (Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
                0.3 + Math.random() * 1.5, true);
}

//The updater
async function thread()
{
    while (true)
    {
        await sleep(43);
        updateCanvas();
    }
}

thread();