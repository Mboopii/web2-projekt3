const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

//definiranje početnih postavki igre
let x = canvas.width / 2; //početna horizontalna pozicija loptice
let y = canvas.height - 30; //početna vertikalna pozicija loptice
let paddleHeight = 10; //visina palice
let paddleWidth = 75; //širina palice
let paddleX = (canvas.width - paddleWidth) / 2; //početna pozicija palice
let rightPressed = false; //praćenje je li pritisnuta desna strelica
let leftPressed = false; //praćenje je li pritisnuta lijeva strelica
let score = 0; //trenutni rezultat igrača
let maxScore = localStorage.getItem('maxScore') || 0; //dohvaćanje najboljeg rezultata iz lokalne memorije
let brickHeight = 20; //visina cigle
let brickWidth = 75; //širina cigle
let brickPadding = 10; //razmak između cigli
let brickOffsetTop = 30; //vertikalni razmak od vrha do prvog reda cigli
let brickOffsetLeft = 30; //horizontalni razmak od lijeve strane do prve kolone cigli
let brickColumnCount = 10; //broj stupaca cigli
let brickRowCount = 4; //broj redova cigli

//inicijalizacija matrice cigli
let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 }; //svaka cigla ima početne koordinate i aktivni status
    }
}

//dodavanje listenera za praćenje pritisnutih tipki
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

//funkcija za rukovanje pritiskom na tipku
function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") { //provjera je li pritisnuta desna strelica
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") { //provjera je li pritisnuta lijeva strelica
        leftPressed = true;
    }
}

//funkcija za rukovanje otpuštanjem tipke
function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") { //provjera je li otpuštena desna strelica
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") { //provjera je li otpuštena lijeva strelica
        leftPressed = false;
    }
}

//funkcija za crtanje cigli na canvasu
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) { //crtaj samo aktivne cigle
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft; //izračunaj horizontalnu poziciju cigle
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop; //izračunaj vertikalnu poziciju cigle
                bricks[c][r].x = brickX; //spremi x-koordinatu cigle
                bricks[c][r].y = brickY; //spremi y-koordinatu cigle
                ctx.beginPath(); //započinjemo novo crtanje

                //kreiranje radijalnog gradijenta za ciglu
                let gradient = ctx.createRadialGradient(
                    brickX + brickWidth / 2, brickY + brickHeight / 2, 10,
                    brickX + brickWidth / 2, brickY + brickHeight / 2, brickWidth / 2
                );
                gradient.addColorStop(0, "#2ECC71"); //svijetlo zelena u centru
                gradient.addColorStop(1, "#1D8348"); //tamno zelena na rubovima

                ctx.fillStyle = gradient; //postavljanje gradijenta kao boje cigle
                ctx.rect(brickX, brickY, brickWidth, brickHeight); //crtanje pravokutnika za ciglu
                ctx.fill(); //popunjavanje boje unutar cigle
                ctx.lineWidth = 2; //debljina ruba cigle
                ctx.strokeStyle = "#005F72"; //boja ruba cigle
                ctx.stroke(); //crtanje ruba cigle
                ctx.closePath(); //završavamo crtanje trenutne cigle
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    let gradient=ctx.createRadialGradient(x,y,0,x,y,ballRadius);
    gradient.addColorStop(0,"#FFD700");
    gradient.addColorStop(1,"#FF4500");
    ctx.fillStyle=gradient;
    ctx.arc(x,y,ballRadius,0,Math.PI*2);
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();

    //kreiranje linearnog gradijenta za palicu
    let gradient = ctx.createLinearGradient(paddleX, canvas.height - paddleHeight, paddleX, canvas.height);
    gradient.addColorStop(0, "#B03A2E");
    gradient.addColorStop(1, "#FF5733"); 

    ctx.fillStyle = gradient;
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#9C1C1C";
    ctx.stroke();
    ctx.closePath();
}


function collisionDetection() {
    let allBricksDestroyed = true;

    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {  //ako cigla još nije uništena
                allBricksDestroyed = false;  //nisu sve cigle uništene
                //granice cigle
                let brickLeft = b.x;
                let brickRight = b.x + brickWidth;
                let brickTop = b.y;
                let brickBottom = b.y + brickHeight;

                //provjera dodiruje li loptica ciglu
                if (
                    x + ballRadius > brickLeft &&
                    x - ballRadius < brickRight &&
                    y + ballRadius > brickTop &&
                    y - ballRadius < brickBottom
                ) {
                    //odbijanje loptice ovisno o tome gdje je udarila
                    let ballFromLeft = x < brickLeft && dx > 0;
                    let ballFromRight = x > brickRight && dx < 0;
                    let ballFromTop = y < brickTop && dy > 0;
                    let ballFromBottom = y > brickBottom && dy < 0;

                    //promjena pravca
                    if (ballFromLeft || ballFromRight) {
                        dx = -dx; //odbijanje po horizontalnoj osi
                    }
                    if (ballFromTop || ballFromBottom) {
                        dy = -dy; //odbijanje po vertikalnoj osi
                    }

                    //destrukcija cigle i povećanje rezultata
                    b.status = 0;
                    score++;
                }
            }
        }
    }

    if (allBricksDestroyed) {
        gameOver(true);  //pozivamo gameOver s argumentom true jer je igrač pobijedio
    }
}

//brzina palice
function movePaddle() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 15;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 15;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    movePaddle();

    //detekcija sudara s bočnim zidovima
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }

    //detekcija sudara s gornjim zidom
    if (y + dy < ballRadius) {
        dy = -dy;
    }

    //detekcija sudara s palicom
    if (
        y + dy > canvas.height - paddleHeight - ballRadius &&
        x + ballRadius > paddleX &&
        x - ballRadius < paddleX + paddleWidth
    ) {
        //računanje kuta odbijanja loptice
        let relativeHit = (x - paddleX) / paddleWidth;
        let maxBounceAngle = Math.PI / 3;
        let bounceAngle = (relativeHit - 0.5) * 2 * maxBounceAngle;

        let speed = Math.sqrt(dx * dx + dy * dy);

        //nakon prve iteracije koristimo novi kut za odbijanje
        if (!isFirstIteration) {
            dx = speed * Math.sin(bounceAngle);
            dy = -speed * Math.cos(bounceAngle);
        }

        isFirstIteration = false;
    }

    //provjera za kraj igre (loptica pada ispod palice)
    if (y + dy > canvas.height - ballRadius) {
        gameOver();  //pozivamo gameOver bez argumenata jer je igrač izgubio
        return;
    }
    

    //ažuriranje pozicije loptice
    x += dx;
    y += dy;
    console.log(`Score: ${score}, Max Score: ${maxScore}`);

    //prikaz rezultata
    document.getElementById('score').textContent = score;
    document.getElementById('maxScore').textContent = maxScore;

    //ponovno iscrtavanje scene
    requestAnimationFrame(draw);
}

function randomDirection() {
    let angle = (Math.random() * 360 - 180) * Math.PI / 180;
    let speed = 10;  //postavljanje brzine

    //izračunavanje dx i dy temeljenog na kutu
    dx = speed * Math.cos(angle);  //horizontalna komponenta
    dy = -speed * Math.abs(Math.sin(angle));  //vertikalna komponenta
}


function startGame() {
    x = canvas.width / 2;
    y = canvas.height - 30;

    randomDirection();  //pozivamo randomDirection samo pri prvom pokretanju igre
    isFirstIteration = true;  //označavamo da je igra upravo pokrenuta

    paddleWidth = canvas.width / 8;
    paddleX = (canvas.width - paddleWidth) / 2;

    score = 0;
    document.getElementById('gameOverMessage').style.display = "none";
    document.getElementById('winMessage').style.display = "none";
    document.getElementById('restartMessage').style.display = "none";

    //postavljanje cigli u početnu poziciju
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }

    draw();
}


function gameOver(isVictory = false) {
    gameOverFlag = true;  

    //zaustavi lopticu
    dx = 0;
    dy = 0;
    
    //pohrana najboljeg rezultata u localStorage
    if (score > maxScore) {
        maxScore = score;
        localStorage.setItem('maxScore', maxScore);
    }
    console.log(`Final Score: ${score}, Max Score: ${maxScore}`);
    
    if (isVictory) {
        document.getElementById('winMessage').style.display = "block";
        document.getElementById('restartMessage').style.display = "block";
    } else {
        document.getElementById('gameOverMessage').style.display = "block";
        document.getElementById('restartMessage').style.display = "block";
    }


}


//dodavanje listenera za klik na restart poruku
document.getElementById('restartMessage').addEventListener('click', function() {
    location.reload();
});


function resizeCanvas() {
    const borderThickness = 5;  //debljina ruba
    const availableWidth = window.innerWidth - 2 * borderThickness;
    const availableHeight = window.innerHeight - 2 * borderThickness;

    canvas.width = availableWidth;
    canvas.height = availableHeight;

    //ponovno postavljanje palice i loptice
    paddleWidth = canvas.width / 8;
    paddleX = (canvas.width - paddleWidth) / 2;

    ballRadius = canvas.width / 100; //veličina loptice
    x = canvas.width / 2;
    y = canvas.height - 30;

    //ažuriranje dimenzija cigli
    brickWidth = (canvas.width - (brickColumnCount + 1) * brickPadding - 2 * brickOffsetLeft) / brickColumnCount;
    brickHeight = canvas.height / 15;

    //resetiranje cigli
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

window.addEventListener("resize", resizeCanvas);

//pozadina Canvasa
canvas.style.backgroundColor = "#fff"; //bijela pozadina
canvas.style.border = "5px solid #B87333"; //smeđi rub

//inicijalizacija veličine Canvasa
resizeCanvas();

startGame();
