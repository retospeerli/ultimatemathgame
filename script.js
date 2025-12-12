// Mathematik Level Definitionen
const MATH_LEVELS = {
    1: { // 1. Klasse
        name: "1. Klasse",
        operations: ['+', '-'],
        maxNumber: 20,
        minNumber: 0,
        description: "Addition und Subtraktion bis 20"
    },
    2: { // 2. Klasse
        name: "2. Klasse",
        operations: ['+', '-'],
        maxNumber: 100,
        minNumber: 0,
        description: "Addition und Subtraktion bis 100"
    },
    3: { // 3. Klasse
        name: "3. Klasse",
        operations: ['+', '-', '×', '÷'],
        maxNumber: 1000,
        minNumber: 0,
        multiplicationMax: 10,
        description: "Addition/Subtraktion bis 1000, Einmaleins bis 10"
    },
    4: { // 4. Klasse
        name: "4. Klasse",
        operations: ['+', '-', '×', '÷'],
        maxNumber: 10000,
        minNumber: 0,
        multiplicationMax: 20,
        multiplesOfTen: true,
        description: "Addition/Subtraktion bis 10.000, Einmaleins bis 20"
    }
};

// Zeit-Modi
const TIME_MODES = {
    5: { name: "Schwer", time: 5, className: "hard" },
    8: { name: "Mittel", time: 8, className: "medium" },
    15: { name: "Einfach", time: 15, className: "easy" },
    0: { name: "Training", time: 0, className: "training" }
};

// Ring Position Mapping (Score Difference -> Image Number)
const RING_POSITION_MAP = {
    "-4": 1,   // CPU dominiert (4:0) - CPU gewinnt fast
    "-3": 2,   // CPU leicht vorne (3:0 oder 3:1) - ALMOST LOST!
    "-2": 3,   // CPU etwas vorne (2:0 oder 2:1)
    "-1": 4,   // CPU minimal vorne (1:0)
    "0": 6,    // Ausgangslage Mitte (0:0, 1:1, 2:2)
    "1": 7,    // Spieler minimal vorne (1:0)
    "2": 8,    // Spieler etwas vorne (2:0 oder 2:1)
    "3": 9,    // Spieler leicht vorne (3:0 oder 3:1) - ALMOST WON!
    "4": 11    // Spieler dominiert (4:0) - Spieler gewinnt fast
};

// Audio-Elemente
const startSound = document.getElementById('start-sound');
const correctSound = document.getElementById('correct-sound');
const errorSound = document.getElementById('error-sound');
const roundWonSound = document.getElementById('roundwon-sound');
const roundLostSound = document.getElementById('roundlost-sound');
const gameWonSound = document.getElementById('gamewon-sound');
const gameLostSound = document.getElementById('gamelost-sound');
const almostLostSound = document.getElementById('almostlost-sound');
const almostWonSound = document.getElementById('almostwon-sound');

// DOM-Elemente für Best of 7
const playerScoreElement = document.getElementById('player-score');
const cpuScoreElement = document.getElementById('cpu-score');
const ringImage = document.getElementById('ring-image');
const currentRoundElement = document.getElementById('current-round');
const streakElement = document.getElementById('streak');
const totalPointsElement = document.getElementById('total-points');

// DOM-Elemente für Mathematik
const classButtons = document.querySelectorAll('.class-btn');
const timeButtons = document.querySelectorAll('.time-btn');
const classIndicator = document.getElementById('class-indicator');
const taskElement = document.getElementById('task');
const choiceButtons = [
    document.getElementById('choice1'),
    document.getElementById('choice2'),
    document.getElementById('choice3'),
    document.getElementById('choice4')
];
const timerDisplay = document.getElementById('timer-display');
const timerValue = document.getElementById('timer-value');
const trainingInfo = document.getElementById('training-info');
const trainingProgress = document.getElementById('training-progress');
const currentTaskNum = document.getElementById('current-task-num');
const correctCount = document.getElementById('correct-count');
const totalTasks = document.getElementById('total-tasks');
const trainingProgressBar = document.getElementById('training-progress-bar');

// Controls
const startButton = document.getElementById('start-btn');
const hintButton = document.getElementById('hint-btn');
const resetButton = document.getElementById('reset-btn');

// Game Over Elements
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const totalPointsFinalElement = document.getElementById('total-points-final');
const correctPercentageElement = document.getElementById('correct-percentage');
const maxStreakElement = document.getElementById('max-streak');
const finalClassElement = document.getElementById('final-class');
const gameResultElement = document.getElementById('game-result');
const gameMessageElement = document.getElementById('game-message');
const restartButton = document.getElementById('restart-btn');

// Feedback Element
const feedbackElement = document.getElementById('feedback');

// Spielzustand
const gameState = {
    currentLevel: 1,
    currentTimeMode: 5,
    currentTask: null,
    correctAnswer: null,
    playerScore: 0,
    cpuScore: 0,
    currentRound: 1,
    playerStreak: 0,
    maxStreak: 0,
    totalPoints: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    gameActive: false,
    gameFinished: false,
    trainingMode: false,
    trainingTasks: 30,
    currentTrainingTask: 1,
    trainingCorrect: 0,
    timer: null,
    timeLeft: 15,
    lastRingPosition: 6 // Speichert die letzte Ring-Position für Sound-Trigger
};

// Zufallszahl generieren
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Mathematikaufgabe generieren
function generateMathTask(level) {
    const levelConfig = MATH_LEVELS[level];
    let task, correctAnswer, operation;
    
    // Operation zufällig auswählen
    const randomOpIndex = Math.floor(Math.random() * levelConfig.operations.length);
    operation = levelConfig.operations[randomOpIndex];
    
    switch(operation) {
        case '+': // Addition
            const add1 = getRandomNumber(levelConfig.minNumber, levelConfig.maxNumber);
            const add2 = getRandomNumber(levelConfig.minNumber, levelConfig.maxNumber - add1);
            correctAnswer = add1 + add2;
            task = `${add1} + ${add2} = ?`;
            break;
            
        case '-': // Subtraktion
            const sub1 = getRandomNumber(levelConfig.minNumber, levelConfig.maxNumber);
            const sub2 = getRandomNumber(levelConfig.minNumber, sub1);
            correctAnswer = sub1 - sub2;
            task = `${sub1} - ${sub2} = ?`;
            break;
            
        case '×': // Multiplikation
            let factor1, factor2;
            
            if (level === 4 && Math.random() > 0.5 && levelConfig.multiplesOfTen) {
                // Vielfache von 10 für 4. Klasse
                factor1 = getRandomNumber(1, 10) * 10;
                factor2 = getRandomNumber(1, 10);
            } else {
                factor1 = getRandomNumber(1, levelConfig.multiplicationMax);
                factor2 = getRandomNumber(1, levelConfig.multiplicationMax);
            }
            
            correctAnswer = factor1 * factor2;
            task = `${factor1} × ${factor2} = ?`;
            break;
            
        case '÷': // Division (Umkehrrechnung der Multiplikation)
            let divisor, quotient;
            
            if (level === 4 && Math.random() > 0.5 && levelConfig.multiplesOfTen) {
                // Division mit Vielfachen von 10
                quotient = getRandomNumber(1, 10) * 10;
                divisor = getRandomNumber(1, 10);
                correctAnswer = quotient;
                task = `${quotient * divisor} ÷ ${divisor} = ?`;
            } else {
                divisor = getRandomNumber(1, levelConfig.multiplicationMax);
                quotient = getRandomNumber(1, levelConfig.multiplicationMax);
                correctAnswer = quotient;
                task = `${divisor * quotient} ÷ ${divisor} = ?`;
            }
            break;
    }
    
    return { task, correctAnswer, operation };
}

// Falsche Antworten generieren
function generateWrongAnswers(correctAnswer, level) {
    const wrongAnswers = new Set();
    const levelConfig = MATH_LEVELS[level];
    
    while (wrongAnswers.size < 3) {
        let wrongAnswer;
        
        // Verschiedene Arten von Fehlern generieren
        if (Math.random() > 0.5) {
            // ±1 oder ±2 Fehler
            wrongAnswer = correctAnswer + getRandomNumber(-2, 2);
        } else if (Math.random() > 0.5) {
            // ±10% Fehler (für größere Zahlen)
            const offset = Math.max(1, Math.floor(correctAnswer * 0.1));
            wrongAnswer = correctAnswer + getRandomNumber(-offset, offset);
        } else {
            // Komplett falsche Zahl im Bereich
            wrongAnswer = getRandomNumber(
                Math.max(levelConfig.minNumber, correctAnswer - 10),
                Math.min(levelConfig.maxNumber * 2, correctAnswer + 10)
            );
        }
        
        // Sicherstellen, dass es nicht die richtige Antwort ist und positiv (für Grundschule)
        if (wrongAnswer !== correctAnswer && wrongAnswer >= 0 && 
            !wrongAnswers.has(wrongAnswer) && wrongAnswer <= levelConfig.maxNumber * 2) {
            wrongAnswers.add(wrongAnswer);
        }
    }
    
    return Array.from(wrongAnswers);
}

// Ring-Bild aktualisieren mit Sound-Trigger
function updateRingImage() {
    const scoreDifference = gameState.playerScore - gameState.cpuScore;
    let clampedDifference = Math.max(-4, Math.min(4, scoreDifference));
    
    // Für Training Mode: Basierend auf Prozent der richtigen Antworten
    if (gameState.trainingMode && gameState.totalQuestions > 0) {
        const percentage = gameState.totalCorrect / gameState.totalQuestions;
        if (percentage < 0.3) clampedDifference = -2;
        else if (percentage < 0.5) clampedDifference = -1;
        else if (percentage < 0.7) clampedDifference = 0;
        else if (percentage < 0.9) clampedDifference = 1;
        else clampedDifference = 2;
    }
    
    const imageNumber = RING_POSITION_MAP[clampedDifference.toString()];
    
    // Sound-Trigger für spezielle Positionen
    if (gameState.gameActive && !gameState.gameFinished) {
        // ALMOST LOST Sound (Position 2)
        if (imageNumber === 2 && gameState.lastRingPosition !== 2) {
            almostLostSound.currentTime = 0;
            almostLostSound.play();
            
            // Visuelles Feedback für "almost lost"
            showSpecialFeedback("⚠️ VORSICHT! CPU FÜHRT 3:0!", "warning");
        }
        
        // ALMOST WON Sound (Position 10)
        if (imageNumber === 10 && gameState.lastRingPosition !== 10) {
            almostWonSound.currentTime = 0;
            almostWonSound.play();
            
            // Visuelles Feedback für "almost won"
            showSpecialFeedback("⭐ DU FÜHRST 3:0! NOCH EINE RUNDE!", "success");
        }
        
        // Gewinn oder Verlust Sound (Position 1 oder 11)
        if (imageNumber === 1 && gameState.lastRingPosition !== 1) {
            // CPU gewinnt fast (4:0)
            showSpecialFeedback("💀 CPU FÜHRT 4:0 - LETZTE CHANCE!", "danger");
        }
        
        if (imageNumber === 11 && gameState.lastRingPosition !== 11) {
            // Spieler gewinnt fast (4:0)
            showSpecialFeedback("🎉 DU FÜHRST 4:0 - NOCH EINE RUNDE ZUM SIEG!", "victory");
        }
    }
    
    // Bild aktualisieren
    ringImage.src = `wrestlers/ring_position_${imageNumber}.png`;
    gameState.lastRingPosition = imageNumber;
    
    // Flash Animation
    ringImage.classList.add('image-flash');
    setTimeout(() => {
        ringImage.classList.remove('image-flash');
    }, 300);
}

// Spezielles Feedback anzeigen
function showSpecialFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.className = `special-feedback ${type}`;
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        font-size: 1.5rem;
        font-weight: bold;
        text-align: center;
        z-index: 1000;
        border: 3px solid;
        animation: fadeInOut 2s ease-in-out;
    `;
    
    if (type === 'warning') {
        feedback.style.borderColor = '#e74c3c';
        feedback.style.boxShadow = '0 0 20px #e74c3c';
    } else if (type === 'success') {
        feedback.style.borderColor = '#2ecc71';
        feedback.style.boxShadow = '0 0 20px #2ecc71';
    } else if (type === 'danger') {
        feedback.style.borderColor = '#c0392b';
        feedback.style.boxShadow = '0 0 20px #c0392b';
        feedback.style.color = '#ff6b6b';
    } else if (type === 'victory') {
        feedback.style.borderColor = '#f1c40f';
        feedback.style.boxShadow = '0 0 20px #f1c40f';
        feedback.style.color = '#f1c40f';
    }
    
    document.body.appendChild(feedback);
    
    // CSS für Animation hinzufügen
    if (!document.getElementById('special-feedback-style')) {
        const style = document.createElement('style');
        style.id = 'special-feedback-style';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                30% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Nach 2 Sekunden entfernen
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 2000);
}

// Best of 7 Display aktualisieren
function updateBestOf7Display() {
    playerScoreElement.textContent = gameState.playerScore;
    cpuScoreElement.textContent = gameState.cpuScore;
    currentRoundElement.textContent = gameState.currentRound;
    streakElement.textContent = gameState.playerStreak;
    totalPointsElement.textContent = gameState.totalPoints;
    
    // Ring-Bild aktualisieren (mit Sound-Trigger)
    updateRingImage();
    
    // Training Mode spezifische Updates
    if (gameState.trainingMode) {
        currentTaskNum.textContent = gameState.currentTrainingTask;
        correctCount.textContent = gameState.trainingCorrect;
        totalTasks.textContent = gameState.trainingTasks;
        const progress = (gameState.currentTrainingTask - 1) / gameState.trainingTasks * 100;
        trainingProgressBar.style.width = `${progress}%`;
    }
}

// Timer starten
function startTimer() {
    if (gameState.trainingMode || gameState.currentTimeMode === 0) return;
    
    gameState.timeLeft = TIME_MODES[gameState.currentTimeMode].time;
    timerValue.textContent = gameState.timeLeft;
    timerDisplay.className = `timer-display ${TIME_MODES[gameState.currentTimeMode].className}`;
    timerDisplay.style.display = 'block';
    
    // Warning bei 3 Sekunden
    if (gameState.timeLeft <= 3) {
        timerDisplay.classList.add('warning');
    } else {
        timerDisplay.classList.remove('warning');
    }
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        timerValue.textContent = gameState.timeLeft;
        
        // Warning bei 3 Sekunden
        if (gameState.timeLeft <= 3) {
            timerDisplay.classList.add('warning');
        }
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            timeOut();
        }
    }, 1000);
}

// Timer stoppen
function stopTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    timerDisplay.style.display = 'none';
}

// Zeit abgelaufen
function timeOut() {
    if (!gameState.gameActive || gameState.gameFinished) return;
    
    // CPU gewinnt Runde bei Zeitablauf
    cpuWinsRound();
    
    feedbackElement.textContent = "⏰ ZEIT ABGELAUFEN!";
    feedbackElement.className = "feedback error";
    
    errorSound.currentTime = 0;
    errorSound.play();
    
    // Nächste Aufgabe
    setTimeout(() => {
        if (!gameState.gameFinished) {
            if (gameState.trainingMode) {
                gameState.currentTrainingTask++;
                if (gameState.currentTrainingTask > gameState.trainingTasks) {
                    endTraining();
                    return;
                }
            } else {
                gameState.currentRound++;
            }
            updateBestOf7Display();
            loadNextQuestion();
        }
    }, 2000);
}

// Spieler gewinnt Runde
function playerWinsRound() {
    if (gameState.gameFinished) return;
    
    gameState.playerScore++;
    gameState.playerStreak++;
    gameState.totalPoints += 10;
    gameState.totalCorrect++;
    gameState.totalQuestions++;
    
    if (gameState.trainingMode) {
        gameState.trainingCorrect++;
    }
    
    if (gameState.playerStreak > gameState.maxStreak) {
        gameState.maxStreak = gameState.playerStreak;
    }
    
    // Check for victory (Best of 7)
    if (!gameState.trainingMode && gameState.playerScore >= 4) {
        gameState.gameFinished = true;
        setTimeout(() => {
            endGame(true);
        }, 1000);
    }
    
    updateBestOf7Display();
    
    // Play win sound
    roundWonSound.currentTime = 0;
    roundWonSound.play();
    
    return true;
}

// CPU gewinnt Runde
function cpuWinsRound() {
    if (gameState.gameFinished) return;
    
    gameState.cpuScore++;
    gameState.playerStreak = 0;
    gameState.totalQuestions++;
    
    // Check for victory (Best of 7)
    if (!gameState.trainingMode && gameState.cpuScore >= 4) {
        gameState.gameFinished = true;
        setTimeout(() => {
            endGame(false);
        }, 1000);
    }
    
    updateBestOf7Display();
    
    // Play lose sound
    roundLostSound.currentTime = 0;
    roundLostSound.play();
    
    return true;
}

// Neue Frage laden
function loadNextQuestion() {
    if (gameState.gameFinished) return;
    
    // Timer stoppen
    stopTimer();
    
    // Neue Aufgabe generieren
    const task = generateMathTask(gameState.currentLevel);
    gameState.currentTask = task.task;
    gameState.correctAnswer = task.correctAnswer;
    
    // Aufgabe anzeigen
    taskElement.textContent = gameState.currentTask;
    classIndicator.textContent = MATH_LEVELS[gameState.currentLevel].name;
    classIndicator.className = `class-indicator class-${gameState.currentLevel}`;
    
    // Antwortoptionen generieren
    const wrongAnswers = generateWrongAnswers(task.correctAnswer, gameState.currentLevel);
    const allAnswers = [task.correctAnswer, ...wrongAnswers];
    shuffleArray(allAnswers);
    
    // Buttons mit Antworten füllen
    choiceButtons.forEach((btn, index) => {
        btn.textContent = allAnswers[index];
        btn.dataset.answer = allAnswers[index];
        btn.disabled = false;
        btn.className = "choice-btn";
    });
    
    // Feedback zurücksetzen
    feedbackElement.textContent = "";
    feedbackElement.className = "feedback";
    
    // Timer starten (wenn nicht Training)
    if (!gameState.trainingMode) {
        startTimer();
    }
    
    // Tipp-Button aktivieren
    hintButton.disabled = false;
}

// Array mischen
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Antwort überprüfen
function checkAnswer(selectedAnswer) {
    if (!gameState.gameActive || gameState.gameFinished) return;
    
    const isCorrect = parseInt(selectedAnswer) === gameState.correctAnswer;
    
    // Buttons deaktivieren
    choiceButtons.forEach(btn => {
        btn.disabled = true;
        
        if (parseInt(btn.dataset.answer) === gameState.correctAnswer) {
            btn.classList.add('correct');
        } else if (parseInt(btn.dataset.answer) === parseInt(selectedAnswer) && !isCorrect) {
            btn.classList.add('error');
        }
    });
    
    // Timer stoppen
    stopTimer();
    
    if (isCorrect) {
        // RICHTIG - Spieler gewinnt Runde
        playerWinsRound();
        
        feedbackElement.textContent = `✓ RICHTIG! ${gameState.currentTask.replace('?', selectedAnswer)}`;
        feedbackElement.className = "feedback correct";
        
        correctSound.currentTime = 0;
        correctSound.play();
    } else {
        // FALSCH - CPU gewinnt Runde
        cpuWinsRound();
        
        feedbackElement.textContent = `✗ FALSCH! Richtig wäre: ${gameState.currentTask.replace('?', gameState.correctAnswer)}`;
        feedbackElement.className = "feedback error";
        
        errorSound.currentTime = 0;
        errorSound.play();
    }
    
    // Nächste Aufgabe oder Spielende
    setTimeout(() => {
        if (!gameState.gameFinished) {
            if (gameState.trainingMode) {
                gameState.currentTrainingTask++;
                if (gameState.currentTrainingTask > gameState.trainingTasks) {
                    endTraining();
                    return;
                }
            } else {
                gameState.currentRound++;
            }
            updateBestOf7Display();
            loadNextQuestion();
        }
    }, 2000);
}

// Training beenden
function endTraining() {
    gameState.gameActive = false;
    gameState.gameFinished = true;
    
    // Buttons deaktivieren
    choiceButtons.forEach(btn => {
        btn.disabled = true;
    });
    
    hintButton.disabled = true;
    resetButton.disabled = false;
    
    // Berechnungen für Ergebnis
    const percentage = Math.round((gameState.trainingCorrect / gameState.trainingTasks) * 100);
    
    // Game Over Screen anpassen
    finalScoreElement.textContent = `TRAINING BEENDET`;
    totalPointsFinalElement.textContent = gameState.totalPoints;
    correctPercentageElement.textContent = percentage;
    maxStreakElement.textContent = gameState.maxStreak;
    finalClassElement.textContent = MATH_LEVELS[gameState.currentLevel].name;
    
    if (percentage >= 80) {
        gameResultElement.textContent = "AUSGEZEICHNET!";
        gameMessageElement.textContent = "Perfekte Leistung im Training!";
        gameWonSound.currentTime = 0;
        gameWonSound.play();
    } else if (percentage >= 60) {
        gameResultElement.textContent = "SEHR GUT!";
        gameMessageElement.textContent = "Gute Leistung - weiter so!";
    } else if (percentage >= 40) {
        gameResultElement.textContent = "GUT GEMACHT!";
        gameMessageElement.textContent = "Solide Leistung - übe weiter!";
    } else {
        gameResultElement.textContent = "WEITER ÜBEN!";
        gameMessageElement.textContent = "Übe regelmäßig, dann wirst du besser!";
        gameLostSound.currentTime = 0;
        gameLostSound.play();
    }
    
    gameOverElement.classList.add('active');
}

// Spiel beenden (Best of 7)
function endGame(playerWon) {
    gameState.gameActive = false;
    
    // Buttons deaktivieren
    choiceButtons.forEach(btn => {
        btn.disabled = true;
    });
    
    hintButton.disabled = true;
    resetButton.disabled = false;
    
    // Berechnungen
    const totalQuestions = gameState.totalCorrect + (gameState.totalQuestions - gameState.totalCorrect);
    const percentage = totalQuestions > 0 ? Math.round((gameState.totalCorrect / totalQuestions) * 100) : 0;
    
    // Game Over Screen
    finalScoreElement.textContent = `SPIELER ${gameState.playerScore} - ${gameState.cpuScore} CPU`;
    totalPointsFinalElement.textContent = gameState.totalPoints;
    correctPercentageElement.textContent = percentage;
    maxStreakElement.textContent = gameState.maxStreak;
    finalClassElement.textContent = MATH_LEVELS[gameState.currentLevel].name;
    
    if (playerWon) {
        gameResultElement.textContent = "SIEG!";
        gameMessageElement.textContent = "Du hast das Best of 7 gewonnen!";
        gameWonSound.currentTime = 0;
        gameWonSound.play();
    } else {
        gameResultElement.textContent = "NIEDERLAGE";
        gameMessageElement.textContent = "Die CPU hat das Best of 7 gewonnen.";
        gameLostSound.currentTime = 0;
        gameLostSound.play();
    }
    
    gameOverElement.classList.add('active');
}

// Tipp anzeigen
function showHint() {
    if (!gameState.gameActive || gameState.gameFinished) return;
    
    const hints = [
        `Denke an die ${MATH_LEVELS[gameState.currentLevel].name} Regeln`,
        "Überprüfe deine Rechnung noch einmal",
        "Schreibe die Aufgabe auf Papier",
        `Aktuelle Klassenstufe: ${MATH_LEVELS[gameState.currentLevel].name}`
    ];
    
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    feedbackElement.textContent = `💡 TIPP: ${randomHint}`;
    feedbackElement.className = "feedback";
    
    hintButton.disabled = true;
    setTimeout(() => {
        if (gameState.gameActive && !gameState.gameFinished) {
            hintButton.disabled = false;
        }
    }, 3000);
}

// Event Listener für Klassenauswahl
classButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        classButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.currentLevel = parseInt(btn.dataset.class);
        
        // Beispielaufgabe aktualisieren
        if (!gameState.gameActive) {
            const exampleTask = generateMathTask(gameState.currentLevel);
            taskElement.textContent = exampleTask.task;
            classIndicator.textContent = MATH_LEVELS[gameState.currentLevel].name;
            classIndicator.className = `class-indicator class-${gameState.currentLevel}`;
        }
    });
});

// Event Listener für Zeitauswahl
timeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        timeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.currentTimeMode = parseInt(btn.dataset.time);
        gameState.trainingMode = (gameState.currentTimeMode === 0);
        
        // Training Info anzeigen/verbergen
        if (gameState.trainingMode) {
            trainingInfo.style.display = 'block';
            trainingProgress.style.display = 'block';
        } else {
            trainingInfo.style.display = 'none';
            trainingProgress.style.display = 'none';
        }
    });
});

// Spiel starten
function startGame() {
    if (gameState.gameActive) return;
    
    // Start-Sound abspielen
    startSound.currentTime = 0;
    startSound.play();
    
    // Spielzustand zurücksetzen
    gameState.playerScore = 0;
    gameState.cpuScore = 0;
    gameState.currentRound = 1;
    gameState.playerStreak = 0;
    gameState.maxStreak = 0;
    gameState.totalPoints = 0;
    gameState.totalCorrect = 0;
    gameState.totalQuestions = 0;
    gameState.gameActive = true;
    gameState.gameFinished = false;
    gameState.lastRingPosition = 6; // Reset auf Mitte
    
    if (gameState.trainingMode) {
        gameState.currentTrainingTask = 1;
        gameState.trainingCorrect = 0;
    }
    
    // Buttons aktivieren/deaktivieren
    startButton.disabled = true;
    resetButton.disabled = false;
    hintButton.disabled = false;
    
    // Klassenauswahl deaktivieren
    classButtons.forEach(btn => btn.disabled = true);
    timeButtons.forEach(btn => btn.disabled = true);
    
    // Display aktualisieren
    updateBestOf7Display();
    
    // Feedback
    feedbackElement.textContent = gameState.trainingMode ? 
        "TRAINING STARTET! 30 AUFGABEN WARTEN!" : 
        "BEST OF 7 STARTET! VIEL ERFOLG!";
    feedbackElement.className = "feedback";
    
    // Kurze Verzögerung, dann erste Frage laden
    setTimeout(() => {
        loadNextQuestion();
    }, 1500);
}

// Spiel zurücksetzen
function resetGame() {
    // Timer stoppen
    stopTimer();
    
    // Spielzustand zurücksetzen
    gameState.gameActive = false;
    gameState.gameFinished = false;
    gameState.playerScore = 0;
    gameState.cpuScore = 0;
    gameState.currentRound = 1;
    gameState.playerStreak = 0;
    gameState.maxStreak = 0;
    gameState.totalPoints = 0;
    gameState.totalCorrect = 0;
    gameState.totalQuestions = 0;
    gameState.lastRingPosition = 6;
    
    if (gameState.trainingMode) {
        gameState.currentTrainingTask = 1;
        gameState.trainingCorrect = 0;
    }
    
    // Buttons zurücksetzen
    startButton.disabled = false;
    resetButton.disabled = true;
    hintButton.disabled = true;
    
    // Klassen- und Zeitauswahl aktivieren
    classButtons.forEach(btn => btn.disabled = false);
    timeButtons.forEach(btn => btn.disabled = false);
    
    // Answer Buttons zurücksetzen
    choiceButtons.forEach(btn => {
        btn.disabled = true;
        btn.className = "choice-btn";
    });
    
    // Beispielaufgabe anzeigen
    const exampleTask = generateMathTask(gameState.currentLevel);
    taskElement.textContent = exampleTask.task;
    
    // Display aktualisieren
    updateBestOf7Display();
    
    // Feedback zurücksetzen
    feedbackElement.textContent = "WÄHLE KLASSE, ZEIT UND STARTE!";
    feedbackElement.className = "feedback";
    
    // Ring auf Mitte zurücksetzen
    ringImage.src = 'wrestlers/ring_position_6.png';
}

// Event Listener für Controls
startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
hintButton.addEventListener('click', showHint);
restartButton.addEventListener('click', () => {
    gameOverElement.classList.remove('active');
    resetGame();
});

// Event Listener für Answer Buttons
choiceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        checkAnswer(btn.dataset.answer);
    });
});

// Spiel initialisieren
function initGame() {
    // Beispielaufgabe generieren
    const exampleTask = generateMathTask(gameState.currentLevel);
    taskElement.textContent = exampleTask.task;
    classIndicator.textContent = MATH_LEVELS[gameState.currentLevel].name;
    
    // Display aktualisieren
    updateBestOf7Display();
    
    // Beispiel-Antworten
    const wrongAnswers = generateWrongAnswers(exampleTask.correctAnswer, gameState.currentLevel);
    const allAnswers = [exampleTask.correctAnswer, ...wrongAnswers];
    shuffleArray(allAnswers);
    
    choiceButtons.forEach((btn, index) => {
        btn.textContent = allAnswers[index];
        btn.dataset.answer = allAnswers[index];
    });
    
    // Ring auf Mitte setzen
    ringImage.src = 'wrestlers/ring_position_6.png';
    gameState.lastRingPosition = 6;
}

// Spiel initialisieren
initGame();
