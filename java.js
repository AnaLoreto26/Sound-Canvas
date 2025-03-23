let symmetry = 6;
let angle = 360 / symmetry;
let mic, fft;
let prevX = 0, prevY = 0;
let drawing = true; 
let currentColorMode;
let scaleFactor = 2.5; // Fator para aumentar o tamanho

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  colorMode(HSB, 360, 100, 100);
  background(0);

  //_______________________________________________ativar som____________________________________
    mic = new p5.AudioIn();

let micButton = createButton('Activate microphone');
micButton.class('mic-btn');
micButton.mousePressed(async () => {
  await userStartAudio();
  mic.start();
  micButton.remove();
});
micButton.parent(document.body);  


  fft = new p5.FFT();
  fft.setInput(mic);
  
  //_______________________________________________CORES____________________________________

  let colorModes = [
    (bass, mid, treble, vol) => ({

      //Modo 1 -A cor se move aleatoriamente, e os sons mais agudos criam um desenho mais brilhante
      hue: map(bass + mid + treble, 1, random(500,700), random (-5,5), 600), //bass + mid + treble → quanto maior a soma, maior a variação de cor, random gera uma mudança aleatória no matiz, evitando padrões repetitivos.
      saturation: map(vol-10, 0, 1, 255, 1), //quanto maior o volume (vol), menor a saturação
      brightness: map(treble, 0, 255, 50, 255) //Se os agudos são altos, o brilho aumenta
    }), 

    //Modo 2 -Cores mais frias, menos mudança de matiz, e brilho controlado pelos agudos
    (bass, mid, treble, vol) => ({
      hue: map(bass + mid + treble, 1, random(300,700), random(-5,5), 360), //intervalo de aleatoriedade gera tons mais verdes/azuis
      saturation: map(vol-10, 0, 1, 255, 1),
      brightness: map(vol, 0, 1, 100, 255) //Quanto mais alto o som, mais brilhante será o desenho.
    }),

    //Modo 3- Maior foco em tons avermelhados e menos variação de matiz
    (bass, mid, treble, vol) => ({
      hue: map(bass + mid + treble, 1, random(500,700), 360, random(50,100)), //O ponto inicial do Hue começa em 360 → Tendência para vermelhos e rosas, random com menor variação
      saturation: map(bass, 0, 255, 50, 255), //graves controlam a saturação
      brightness: map(treble, 0, 255, 50, 255)
    }),

    // Todas as cores possíveis, com mudanças mais dinâmicas e variadas
    (bass, mid, treble, vol) => ({
      hue: map(bass + mid + treble, 1, random(500,700), 0, 360), //  valores são distribuídos de 0 a 360, cobrindo todo o espectro de cores
      saturation: map(vol-10, 0, 1, 255, 1),
      brightness: map(treble, 0, 255, 50, 255)
    })
  ];

  currentColorMode = random(colorModes);

  //_______________________________________________BOTOES BAIXO____________________________________

    let buttonContainer = select('#button-container');

    let refreshButton = createButton('Refresh');
    refreshButton.parent(buttonContainer);
    refreshButton.mousePressed(() => {
        background(0);
        if (!drawing) {
            mic.start();
            drawing = true;
        }
         // Escolhe um novo modo de cor aleatório
        currentColorMode = random(colorModes);
    });

   
    let stopButton = createButton('Pause');
    stopButton.parent(buttonContainer);
    stopButton.mousePressed(() => {
        mic.stop();
        drawing = false;
    });

    let saveButton = createButton('Save');
    saveButton.parent(buttonContainer);
    saveButton.mousePressed(() => {
        saveCanvas('desenho', 'png');
    });

   //_______________________________________________BOTAO TITLE ____________________________________
    let title = document.getElementById("title");
    let toggleButton = document.getElementById("toggleTitleButton");

    toggleButton.addEventListener("click", function () {
        let buttonContainer = document.getElementById("button-container");

        if (title.style.display === "none") {
            title.style.display = "block"; // Mostra o título
            toggleButton.textContent = "No title"; // Altera texto do botão
            buttonContainer.classList.remove("hidden-buttons"); // Remove classe dos botões
        } else {
            title.style.display = "none"; // Esconde o título
            toggleButton.textContent = "Title"; // Altera texto do botão
            buttonContainer.classList.add("hidden-buttons"); // Aplica estilo transparente aos botões
        }
    });

 //_______________________________________________BOTAO ABOUT ____________________________________
    let aboutButton = document.getElementById("aboutButton");
    let aboutText = document.getElementById("aboutText");

    aboutButton.addEventListener("click", function () {
        if (aboutText.style.display === "none") {
            aboutText.style.display = "block"; // Exibe o texto
        } else {
            aboutText.style.display = "none"; // Esconde o texto
        }
    });
}


function draw() {
  if (!drawing) return;

  translate(width / 2, height / 2);

  let vol = mic.getLevel();
  let spectrum = fft.analyze();
  let bass = fft.getEnergy("bass");
  let mid = fft.getEnergy("mid");
  let treble = fft.getEnergy("treble");

  let { hue, saturation, brightness } = currentColorMode(bass, mid, treble, vol);
  stroke(hue, saturation, brightness);
  
  let maxSize = random(700, 2500); // Define o tamanho máximo da linha
  let lineLength = map(vol, 0, 1, 5, maxSize) * scaleFactor; // Aplica escala  e ajusta o tamanho com base no volume

  let angleNoise = frameCount * 0.05;
  let x = cos(angleNoise) * lineLength; // Calculam um movimento circular
  let y = sin(angleNoise) * lineLength;

  strokeWeight(2.5);

  for (let i = 0; i < symmetry; i++) { //Repete o desenho para criar simetria
    rotate(angle); //Rotaciona a cada iteração
    line(prevX, prevY, x, y);

    push();
    scale(1, -1);  // Cria um efeito espelhado
    line(prevX, prevY, x, y);
    pop();
  }
  prevX = x; //Guarda as últimas coordenadas para o próximo frame
  prevY = y;

}
