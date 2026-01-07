const sndClick = new Audio("assets/click.wav");
const sndCountdown = new Audio("assets/countdown.wav");
const sndWin = new Audio("assets/win.wav");
const sndLose = new Audio("assets/lose.wav");
const sndDraw = new Audio("assets/draw.wav");
const sndConfetti = new Audio("assets/confetti.wav");

const panelTitle = document.getElementById('panel-title');
const panelRounds = document.getElementById('panel-rounds');
const panelGameplay = document.getElementById('panel-gameplay');
const panelResult = document.getElementById('panel-result');

const btnPlay = document.getElementById('btn-play');
const btnRoundBack = document.getElementById('btn-round-back');
const roundButtons = document.querySelectorAll('[data-rounds]');

const playerHandImg = document.getElementById('player-hand');
const computerHandImg = document.getElementById('computer-hand');

const choices = document.querySelectorAll('.choice');

const resultText = document.getElementById('result-text');
const countdownEl = document.getElementById('countdown');

const playerScoreEl = document.getElementById('player-score');
const computerScoreEl = document.getElementById('computer-score');
const roundIndicator = document.getElementById('round-indicator');

const btnPause = document.getElementById('btn-pause');
const pauseMenu = document.getElementById('pause-menu');
const btnResume = document.getElementById('btn-resume');
const btnRestart = document.getElementById('btn-restart');
const btnHome = document.getElementById('btn-home');

const finalResultText = document.getElementById('final-result-text');
const finalPlayerScore = document.getElementById('final-player-score');
const finalComputerScore = document.getElementById('final-computer-score');
const btnPlayAgain = document.getElementById('btn-play-again');
const btnHomeResult = document.getElementById('btn-home-result');

let totalRounds = 0,
    currentRound = 0,
    playerScore = 0,
    computerScore = 0,
    isPaused = false,
    isGameOver = false,
    isShaking = false;

let countdownTimer = null,
    shakeTimeout = null,
    resultTimeout = null;

function togglePanels(hide, show) {
    hide.classList.remove('active');
    show.classList.add('active');
}

function clearTimers() {
    clearInterval(countdownTimer);
    clearTimeout(shakeTimeout);
    clearTimeout(resultTimeout);

    countdownTimer = null;
}

function resetGame() {
    clearTimers();

    totalRounds = 0;
    currentRound = 0;
    playerScore = 0;
    computerScore = 0;
    isPaused = false;
    isGameOver = false;
    isShaking = false;

    updateScoreboard();

    resultText.classList.add('hidden');
    countdownEl.textContent = '';
    pauseMenu.classList.add('hidden');
    btnPause.style.display = 'block';
}

btnPlay.addEventListener('click', () => {
    sndClick.currentTime = 0; sndClick.play();
    togglePanels(panelTitle, panelRounds);
});

btnRoundBack.addEventListener('click', () => {
    sndClick.currentTime = 0; sndClick.play();
    togglePanels(panelRounds, panelTitle);
});

roundButtons.forEach(btn =>
    btn.addEventListener('click', () => {
        sndClick.currentTime = 0; sndClick.play();
        startGame(parseInt(btn.dataset.rounds));
    })
);

choices.forEach(c =>
    c.addEventListener('click', () => {
        if (isPaused || isGameOver || isShaking || currentRound >= totalRounds || countdownTimer) return;
        startCountdown(c.dataset.choice);
    })
);

btnPause.addEventListener('click', () => {
    sndClick.currentTime = 0; sndClick.play();
    isPaused = true;
    pauseMenu.classList.remove('hidden');
    btnPause.style.display = 'none';
});

btnResume.addEventListener('click', () => {
    sndClick.currentTime = 0; sndClick.play();
    isPaused = false;
    pauseMenu.classList.add('hidden');
    btnPause.style.display = 'block';
});

btnRestart.addEventListener('click', () => {
    sndClick.currentTime = 0; sndClick.play();
    startGame(totalRounds);
});

btnHome.addEventListener('click', () => {
    sndClick.currentTime = 0; sndClick.play();
    resetGame();
    togglePanels(panelGameplay, panelTitle);
});

btnPlayAgain.addEventListener('click', () => {
    sndClick.currentTime = 0; sndClick.play();
    clearTimers();
    resetGame();
    togglePanels(panelResult, panelRounds);
});

btnHomeResult.addEventListener('click', () => {
    sndClick.currentTime = 0; sndClick.play();
    clearTimers();
    resetGame();
    togglePanels(panelResult, panelTitle);
});

function startGame(rounds) {
    resetGame();
    totalRounds = rounds;

    playerHandImg.src = 'assets/player.png';
    playerHandImg.style.setProperty('--flip', '1');

    computerHandImg.src = 'assets/computer.png';
    computerHandImg.style.setProperty('--flip', '-1');

    updateScoreboard();
    togglePanels(panelRounds, panelGameplay);
}

function startCountdown(playerChoice) {
    let count = 3;
    countdownEl.textContent = count;

    sndCountdown.currentTime = 0;
    sndCountdown.play();

    clearInterval(countdownTimer);

    countdownTimer = setInterval(() => {
        count--;

        if (count > 0) {
            countdownEl.textContent = count;
        } else {
            clearInterval(countdownTimer);
            countdownTimer = null;
            countdownEl.textContent = '';
            startRound(playerChoice);
        }
    }, 700);
}

function startRound(playerChoice) {
    currentRound++;
    updateScoreboard();

    resultText.classList.add('hidden');

    playerHandImg.src = 'assets/player.png';
    computerHandImg.src = 'assets/computer.png';

    playerHandImg.style.setProperty('--flip', '1');
    computerHandImg.style.setProperty('--flip', '-1');

    playerHandImg.classList.add('shake');
    computerHandImg.classList.add('shake');

    if (!isShaking) {
        isShaking = true;

        shakeTimeout = setTimeout(() => {
            playerHandImg.classList.remove('shake');
            computerHandImg.classList.remove('shake');
            isShaking = false;

            const cpuChoice = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];

            playerHandImg.src = `assets/${playerChoice}.png`;
            computerHandImg.src = `assets/${cpuChoice}.png`;

            const result = computeResult(playerChoice, cpuChoice);
            showResult(result);

            updateScoreboard();

            if (currentRound >= totalRounds) {
                isGameOver = true;

                resultTimeout = setTimeout(() => {
                    const winner =
                        playerScore > computerScore ? 'YOU WIN!' :
                        playerScore < computerScore ? 'YOU LOSE!' :
                        "IT'S A TIE!";

                    finalResultText.textContent = winner;
                    finalPlayerScore.textContent = playerScore;
                    finalComputerScore.textContent = computerScore;

                    if (playerScore > computerScore) launchConfetti();
                    togglePanels(panelGameplay, panelResult);

                }, 1500);
            }

        }, 500);
    }
}

function computeResult(player, cpu) {
    if (player === cpu) {
        sndDraw.currentTime = 0; sndDraw.play();
        return "IT'S A TIE!";
    }

    const win =
        (player === 'rock' && cpu === 'scissors') ||
        (player === 'paper' && cpu === 'rock') ||
        (player === 'scissors' && cpu === 'paper');

    if (win) {
        playerScore++;
        sndWin.currentTime = 0; sndWin.play();
        return 'YOU WIN!';
    } else {
        computerScore++;
        sndLose.currentTime = 0; sndLose.play();
        return 'YOU LOSE!';
    }
}

function updateScoreboard() {
    playerScoreEl.textContent = playerScore;
    computerScoreEl.textContent = computerScore;
    roundIndicator.textContent = `${currentRound} / ${totalRounds}`;
}

function showResult(msg) {
    resultText.textContent = msg;
    resultText.classList.remove('hidden');
}

function launchConfetti() {
    sndConfetti.currentTime = 0;
    sndConfetti.play();

    setTimeout(() => sndConfetti.pause(), 3000);

    confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
    });

    confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
    });
}

const style = document.createElement('style');
style.textContent = `
@keyframes fall {
    to { transform: translateY(100vh); opacity: 0; }
}
`;
document.head.appendChild(style);
