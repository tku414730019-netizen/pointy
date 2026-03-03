/**
 * 魚群深海視覺化 - 美化版
 */

let shapes = [];
let bubbles = []; // 氣泡陣列
let song;
let amplitude;

// 定義魚的點座標（固定比例）
const fishPoints = [
  [-3, 5], [3, 7], [1, 5], [2, 4], [4, 3], [5, 2], [6, 2], [8, 4], 
  [8, -1], [6, 0], [0, -3], [2, -6], [-2, -3], [-4, -2], [-5, -1], [-6, 1], [-6, 2]
];

function preload() {
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  amplitude = new p5.Amplitude();
  
  // HSB 模式
  colorMode(HSB, 360, 100, 100, 100);

  // 初始化魚群
  for (let i = 0; i < 12; i++) {
    shapes.push({
      x: random(width),
      y: random(height),
      dx: random(-1, 1),
      dy: random(-0.5, 0.5),
      angle: random(TWO_PI),
      rotSpeed: random(-0.01, 0.01),
      hue: random(180, 240), // 限制在藍綠色系，或者 random(360) 繽紛色
      hueSpeed: random(0.2, 0.8),
      baseScale: random(6, 12), // 固定魚的大小倍率
      mirrorX: random() > 0.5 ? 1 : -1, // 隨機水平翻轉
      parallaxFactor: random(0.01, 0.03)
    });
  }

  // 初始化氣泡
  for (let i = 0; i < 40; i++) {
    bubbles.push({
      x: random(width),
      y: random(height, height + 500),
      size: random(2, 8),
      speed: random(1, 3),
      opacity: random(20, 50)
    });
  }
}

function draw() {
  // 設定背景色 #0E5680
  background('#0E5680'); 

  // 繪製氣泡 (不受音樂影響)
  drawBubbles();

  let level = amplitude.getLevel();
  let sizeFactor = map(level, 0, 0.5, 0.9, 2.0);

  // 繪製魚群
  for (let shape of shapes) {
    // 物理移動
    shape.x += shape.dx;
    shape.y += shape.dy;
    if (shape.x < -50 || shape.x > width + 50) shape.dx *= -1;
    if (shape.y < -50 || shape.y > height + 50) shape.dy *= -1;

    // 音樂連動
    if (song.isPlaying()) {
      shape.angle += shape.rotSpeed + (level * 0.05);
      shape.hue = (shape.hue + shape.hueSpeed) % 360;
    }

    // 位移效果
    let mouseOffsetX = (mouseX - width / 2) * shape.parallaxFactor;
    let mouseOffsetY = (mouseY - height / 2) * shape.parallaxFactor;
    let currentScale = (song.isPlaying() ? sizeFactor : 1) * shape.baseScale;

    push();
    translate(shape.x + mouseOffsetX, shape.y + mouseOffsetY);
    scale(currentScale);
    rotate(shape.angle);
    scale(shape.mirrorX, 1); // 應用平面翻轉

    noStroke();

    // 1. 外層發光
    fill(shape.hue, 60, 100, 10); 
    drawFish(1.1);

    // 2. 主體
    fill(shape.hue, 70, 90, 70);
    drawFish(1.0);

    // 3. 內層亮部
    fill(shape.hue, 20, 100, 40);
    drawFish(0.65);

    pop();
  }

  if (!song.isPlaying()) drawUI();
}

// 繪製魚的輔助函式
function drawFish(s) {
  beginShape();
  for (let pt of fishPoints) {
    vertex(pt[0] * s, pt[1] * s);
  }
  endShape(CLOSE);
}

// 氣泡邏輯
function drawBubbles() {
  fill(0, 0, 100, 40);
  noStroke();
  for (let b of bubbles) {
    ellipse(b.x, b.y, b.size);
    b.y -= b.speed; // 向上漂浮
    
    // 左右微震盪
    b.x += sin(frameCount * 0.02 + b.size) * 0.5;

    // 超過頂部重置到底部
    if (b.y < -20) {
      b.y = height + 20;
      b.x = random(width);
    }
  }
}

function drawUI() {
  fill(0, 0, 100, 50);
  textAlign(CENTER, CENTER);
  textSize(18);
  text('點擊以開始播放', width / 2, height - 50);
}

function mousePressed() {
  if (song.isLoaded()) {
    if (song.isPlaying()) {
      song.pause();
    } else {
      song.loop();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}