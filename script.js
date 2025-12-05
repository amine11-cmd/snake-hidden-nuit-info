// ===== CONFIGURATION GLOBALE =====
const CONFIG = {
    game: {
        gridSize: 25,
        initialSpeed: 8,
        maxSpeed: 20,
        powerups: {
            speed: { duration: 10000, multiplier: 2 },
            shield: { duration: 15000, protection: 3 },
            time: { duration: 10000, bonus: 10 }
        },
        resolution: {
            current: { width: 800, height: 500 },
            options: [
                { width: 800, height: 500, label: "800x500" },
                { width: 1000, height: 600, label: "1000x600" },
                { width: 1200, height: 700, label: "1200x700" },
                { width: 600, height: 400, label: "600x400" }
            ]
        }
    },
    secrets: {
        required: 5,
        sequence: ['s', 'n', 'a', 'k', 'e'],
        easterEggs: 7,
        quizAnswers: {
            dragDrop: ['C', 'O', 'D', 'E', '7', '2', '1'],
            qcm: {
                q1: 'a',
                q2: 'b',
                q3: 'b'
            },
            puzzle: 'G'
        }
    },
    audio: {
        volume: 0.3, // Volume réduit pour les fichiers WAV (souvent plus forts)
        enabled: true,
        files: {
            bgMusic: 'bg-music',
            snakeEat: 'snake-eat',
            powerup: 'powerup',
            secret: 'secret',
            hover: 'hover',
            click: 'click',
            gameStart: 'game-start',
            gameOver: 'game-over',
            bossDefeat: 'boss-defeat'
        }
    }
};

// ===== ÉTAT GLOBAL =====
let state = {
    secretsFound: 0,
    gameActive: false,
    gameScore: 0,
    highScore: localStorage.getItem('snakeHighScore') || 0,
    soundEnabled: true,
    currentLevel: 1,
    powerupsActive: {},
    sequenceProgress: [],
    threeScene: null,
    particles: [],
    quizState: {
        dragDrop: { solved: false, attempts: 0 },
        qcm: { solved: false, attempts: 0 },
        puzzle: { solved: false, attempts: 0 }
    }
};

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation du projet For The Win...');
    
    // Initialiser les composants FTW
    initFTWLogo();
    updateBrandReferences();
    
    // Précharger les fichiers audio
    preloadAudio();
    
    // Initialiser les autres composants
    initThreeJS();
    initParticles();
    initEventListeners();
    initGame();
    initSecrets();
    initQuizzes();
    
    // Animation des statistiques
    animateStats();
    
    // Log de bienvenue avec le nouveau nom
    console.log('%c🚀 FOR THE WIN 🚀', 'color: #FF6B6B; font-size: 18px; font-weight: bold;');
    console.log('%cPrêt à gagner dans le digital!', 'color: #4ECDC4;');
});

// ===== GESTION AUDIO =====
function preloadAudio() {
    // Préchargement des fichiers audio WAV
    const audioElements = document.querySelectorAll('audio');
    
    audioElements.forEach(audio => {
        audio.load();
        audio.volume = CONFIG.audio.volume;
        
        audio.addEventListener('canplaythrough', () => {
            console.log(`✅ Audio chargé: ${audio.id}`);
        });
        
        audio.addEventListener('error', (e) => {
            console.warn(`⚠️ Erreur chargement audio ${audio.id}:`, e);
        });
    });
    
    // Démarrer la musique de fond après chargement
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic && state.soundEnabled) {
        // Attendre que l'audio soit prêt
        bgMusic.addEventListener('canplaythrough', () => {
            setTimeout(() => {
                bgMusic.play().catch(e => {
                    console.log("Lecture audio différée (nécessite interaction utilisateur):", e);
                });
            }, 1500);
        }, { once: true });
    }
}

function playSound(type) {
    if (!state.soundEnabled) return;
    
    let audioId;
    
    // Mapper les types de son aux IDs audio
    switch(type) {
        case 'eat':
            audioId = 'snake-eat';
            break;
        case 'powerup':
            audioId = 'powerup';
            break;
        case 'secret':
            audioId = 'secret';
            break;
        case 'hover':
            audioId = 'hover';
            break;
        case 'click':
            audioId = 'click';
            break;
        case 'game-start':
            audioId = 'game-start';
            break;
        case 'game-over':
            audioId = 'game-over';
            break;
        case 'boss-defeat':
            audioId = 'boss-defeat';
            break;
        case 'bg-music':
            audioId = 'bg-music';
            break;
        case 'powerup-sound': // Compatibilité avec l'ancien code
            audioId = 'powerup';
            break;
        default:
            audioId = type;
    }
    
    const audio = document.getElementById(audioId);
    if (audio) {
        audio.currentTime = 0;
        audio.volume = CONFIG.audio.volume;
        
        // Essayer de jouer le son
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Gestion des erreurs de lecture
                if (error.name === 'NotAllowedError') {
                    console.log(`Lecture audio bloquée pour ${audioId}: interaction utilisateur requise`);
                } else {
                    console.log(`Erreur lecture audio ${audioId}:`, error);
                }
            });
        }
    } else {
        console.warn(`Audio non trouvé: ${audioId}`);
    }
}

function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    const btn = document.getElementById('sound-btn');
    
    if (!btn) return;
    
    if (state.soundEnabled) {
        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
        // Réactiver tous les éléments audio
        document.querySelectorAll('audio').forEach(audio => {
            audio.muted = false;
        });
        // Relancer la musique de fond si elle existe
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic) {
            bgMusic.play().catch(console.log);
        }
    } else {
        btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        // Couper tous les éléments audio
        document.querySelectorAll('audio').forEach(audio => {
            audio.muted = true;
            audio.pause();
        });
    }
}

// ===== FONCTIONS FTW (Logo et Branding) =====
function initFTWLogo() {
    const logoWrapper = document.querySelector('.logo-wrapper');
    const logoText = document.querySelector('.logo-text');
    
    if (!logoWrapper) return;
    
    // Animation spéciale au clic sur le logo
    logoWrapper.addEventListener('click', function(e) {
        // Animation existante du triple clic
        if (e.detail === 3) {
            state.secretsFound++;
            updateSecretCounter();
            showEasterEgg(2);
            showNotification('Triple clic détecté! Secret découvert!');
            playSound('secret');
        } else {
            // Effet de particules spécial pour FTW
            createParticles(logoWrapper.getBoundingClientRect().left + 30, 
                           logoWrapper.getBoundingClientRect().top + 30, 
                           15, ['#FF6B6B', '#4ECDC4', '#FFD166']);
            
            // Son de victoire
            playSound('powerup');
            
            // Message spécial FTW
            showToast('For The Win! ✨', 'success');
        }
    });
    
    // Animation au survol
    logoWrapper.addEventListener('mouseenter', function() {
        if (logoText) {
            logoText.style.transform = 'scale(1.05)';
        }
    });
    
    logoWrapper.addEventListener('mouseleave', function() {
        if (logoText) {
            logoText.style.transform = 'scale(1)';
        }
    });
}

function updateBrandReferences() {
    // Mettre à jour le texte dans le sous-titre
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        subtitle.innerHTML = subtitle.innerHTML.replace('AutoCut', '<strong>For The Win</strong>');
    }
    
    // Mettre à jour le titre de la page
    document.title = 'For The Win | Solutions Digitales Innovantes';
}

// Fonction utilitaire pour créer des particules
function createParticles(x, y, count, colors) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'ftw-particle';
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
            `;
            
            document.body.appendChild(particle);
            
            // Animation de la particule
            const angle = Math.random() * Math.PI * 2;
            const velocity = 2 + Math.random() * 3;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            let opacity = 1;
            const animate = () => {
                particle.style.left = `${parseFloat(particle.style.left) + vx}px`;
                particle.style.top = `${parseFloat(particle.style.top) + vy}px`;
                opacity -= 0.02;
                particle.style.opacity = opacity;
                
                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };
            
            animate();
        }, i * 50);
    }
}

// Fonction utilitaire pour afficher des toasts
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'ftw-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4ECDC4' : '#6C63FF'};
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
        font-weight: 500;
        max-width: 300px;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Animation de sortie
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== THREE.JS BACKGROUND =====
function initThreeJS() {
    const container = document.getElementById('threejs-background');
    if (!container) return;
    
    // Créer la scène
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // Ajouter des lumières
    const ambientLight = new THREE.AmbientLight(0x6C63FF, 0.3);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x4CC9F0, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Créer des formes géométriques
    const geometry = new THREE.IcosahedronGeometry(2, 0);
    const material = new THREE.MeshPhongMaterial({
        color: 0x6C63FF,
        transparent: true,
        opacity: 0.1,
        wireframe: true
    });
    
    const shapes = [];
    for (let i = 0; i < 20; i++) {
        const shape = new THREE.Mesh(geometry, material);
        shape.position.x = (Math.random() - 0.5) * 50;
        shape.position.y = (Math.random() - 0.5) * 50;
        shape.position.z = (Math.random() - 0.5) * 50;
        shape.scale.setScalar(Math.random() * 2 + 0.5);
        scene.add(shape);
        shapes.push(shape);
    }
    
    camera.position.z = 20;
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        
        shapes.forEach((shape, i) => {
            shape.rotation.x += 0.005;
            shape.rotation.y += 0.007;
            shape.position.y += Math.sin(Date.now() * 0.001 + i) * 0.02;
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Redimensionnement
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    state.threeScene = scene;
}

// ===== PARTICLES =====
function initParticles() {
    const container = document.querySelector('.particles-container');
    if (!container) return;
    
    for (let i = 0; i < 100; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Position aléatoire
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Taille aléatoire
        const size = Math.random() * 4 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Couleur aléatoire (ajout des couleurs FTW)
        const colors = ['#6C63FF', '#FF6584', '#4CC9F0', '#FF6B6B', '#4ECDC4', '#FFD166'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Animation delay
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.animationDuration = `${15 + Math.random() * 10}s`;
        
        container.appendChild(particle);
        state.particles.push(particle);
    }
}

// ===== INITIALISATION DES QUIZZES =====
function initQuizzes() {
    initDragDropQuiz();
    initQCMQuiz();
    initPuzzleQuiz();
}

function initDragDropQuiz() {
    const dragItems = document.querySelectorAll('.drag-item');
    const dropSlots = document.querySelectorAll('.drop-slot');
    const submitBtn = document.getElementById('drag-submit');
    const feedback = document.getElementById('drag-feedback');
    
    let draggedItem = null;
    
    // Événements pour les éléments draggables
    dragItems.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            draggedItem = this;
            this.classList.add('dragging');
            e.dataTransfer.setData('text/plain', this.dataset.order);
        });
        
        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            draggedItem = null;
        });
        
        // Son au survol
        item.addEventListener('mouseenter', () => {
            playSound('hover');
        });
        
        // Son au clic/début du drag
        item.addEventListener('mousedown', () => {
            playSound('click');
        });
    });
    
    // Événements pour les zones de drop
    dropSlots.forEach(slot => {
        slot.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('over');
        });
        
        slot.addEventListener('dragleave', function() {
            this.classList.remove('over');
        });
        
        slot.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('over');
            
            if (draggedItem && !this.querySelector('.drag-item')) {
                const clonedItem = draggedItem.cloneNode(true);
                clonedItem.draggable = false;
                clonedItem.classList.remove('dragging');
                clonedItem.classList.add('dropped');
                this.appendChild(clonedItem);
                this.classList.add('filled');
                
                // Mettre à jour l'ordre
                clonedItem.dataset.order = this.dataset.slot;
                
                // Son de placement
                playSound('click');
                
                // Vérifier si tous les slots sont remplis
                checkDragDropComplete();
            }
        });
    });
    
    // Bouton de soumission
    submitBtn.addEventListener('click', function() {
        playSound('click');
        
        if (state.quizState.dragDrop.solved) {
            showQuizFeedback(feedback, 'Vous avez déjà résolu ce quiz!', 'success');
            return;
        }
        
        const slots = document.querySelectorAll('.drop-slot');
        const userSequence = Array.from(slots)
            .map(slot => {
                const item = slot.querySelector('.drag-item');
                return item ? item.textContent : '';
            })
            .filter(text => text !== '');
        
        if (userSequence.length !== CONFIG.secrets.quizAnswers.dragDrop.length) {
            showQuizFeedback(feedback, 'Veuillez remplir tous les emplacements!', 'error');
            state.quizState.dragDrop.attempts++;
            return;
        }
        
        const isCorrect = userSequence.every((item, index) => 
            item === CONFIG.secrets.quizAnswers.dragDrop[index]
        );
        
        if (isCorrect) {
            state.quizState.dragDrop.solved = true;
            state.secretsFound++;
            updateSecretCounter();
            showQuizFeedback(feedback, '✅ Code correct! Secret débloqué!', 'success');
            showNotification('🎉 Quiz Drag & Drop résolu! +1 secret');
            playSound('secret');
        } else {
            state.quizState.dragDrop.attempts++;
            showQuizFeedback(feedback, '❌ Code incorrect. Essayez encore!', 'error');
            
            // Indice après 3 tentatives
            if (state.quizState.dragDrop.attempts >= 3) {
                setTimeout(() => {
                    showToast('💡 Indice: Le code est "CODE721"', 'info');
                }, 1000);
            }
        }
    });
    
    function checkDragDropComplete() {
        const slots = document.querySelectorAll('.drop-slot');
        const filled = Array.from(slots).filter(slot => 
            slot.querySelector('.drag-item')
        ).length;
        
        const submitBtn = document.getElementById('drag-submit');
        submitBtn.disabled = filled !== slots.length;
    }
}

function initQCMQuiz() {
    const submitBtn = document.getElementById('qcm-submit');
    const feedback = document.getElementById('qcm-feedback');
    const radioInputs = document.querySelectorAll('.qcm-options input[type="radio"]');
    
    // Sons pour les boutons radio
    radioInputs.forEach(input => {
        input.addEventListener('click', () => {
            playSound('click');
        });
    });
    
    submitBtn.addEventListener('click', function() {
        playSound('click');
        
        if (state.quizState.qcm.solved) {
            showQuizFeedback(feedback, 'Vous avez déjà résolu ce quiz!', 'success');
            return;
        }
        
        const answers = CONFIG.secrets.quizAnswers.qcm;
        let correctCount = 0;
        let totalQuestions = 0;
        
        // Vérifier chaque question
        Object.keys(answers).forEach(question => {
            totalQuestions++;
            const selected = document.querySelector(`input[name="${question}"]:checked`);
            if (selected && selected.value === answers[question]) {
                correctCount++;
            }
        });
        
        if (correctCount === totalQuestions) {
            state.quizState.qcm.solved = true;
            state.secretsFound++;
            updateSecretCounter();
            showQuizFeedback(feedback, '✅ Toutes les réponses sont correctes! Secret débloqué!', 'success');
            showNotification('🎉 QCM résolu! +1 secret');
            playSound('secret');
        } else {
            state.quizState.qcm.attempts++;
            showQuizFeedback(feedback, `❌ ${correctCount}/${totalQuestions} réponses correctes. Essayez encore!`, 'error');
            
            // Indice après 2 tentatives
            if (state.quizState.qcm.attempts >= 2) {
                setTimeout(() => {
                    showToast('💡 Indice: 1. For The Win, 2. Node.js, 3. Taper "SNAKE"', 'info');
                }, 1000);
            }
        }
    });
}

function initPuzzleQuiz() {
    const options = document.querySelectorAll('.puzzle-option');
    const feedback = document.getElementById('puzzle-feedback');
    
    options.forEach(option => {
        option.addEventListener('click', function() {
            playSound('click');
            
            if (state.quizState.puzzle.solved) {
                showQuizFeedback(feedback, 'Vous avez déjà résolu ce puzzle!', 'success');
                return;
            }
            
            const userAnswer = this.textContent;
            const correctAnswer = CONFIG.secrets.quizAnswers.puzzle;
            
            // Réinitialiser les styles
            options.forEach(opt => {
                opt.classList.remove('correct', 'wrong');
            });
            
            if (userAnswer === correctAnswer) {
                this.classList.add('correct');
                state.quizState.puzzle.solved = true;
                state.secretsFound++;
                updateSecretCounter();
                showQuizFeedback(feedback, '✅ Bonne réponse! La séquence FTW est complète! Secret débloqué!', 'success');
                showNotification('🎉 Puzzle résolu! +1 secret');
                playSound('secret');
            } else {
                this.classList.add('wrong');
                state.quizState.puzzle.attempts++;
                showQuizFeedback(feedback, '❌ Mauvaise réponse. Essayez encore!', 'error');
                
                // Indice après 3 tentatives
                if (state.quizState.puzzle.attempts >= 3) {
                    setTimeout(() => {
                        showToast('💡 Indice: La séquence forme un mot complet...', 'info');
                    }, 1000);
                }
            }
        });
    });
}

function showQuizFeedback(element, message, type) {
    element.textContent = message;
    element.className = `quiz-feedback ${type}`;
    element.style.display = 'block';
    
    // Masquer après 5 secondes
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// ===== ÉCOUTEURS D'ÉVÉNEMENTS =====
function initEventListeners() {
    // Thème sombre/clair
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            playSound('click');
            toggleTheme();
        });
    }
    
    // Boutons CTA
    const ctaPrimary = document.getElementById('cta-primary');
    if (ctaPrimary) {
        ctaPrimary.addEventListener('click', () => {
            playSound('click');
            document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
            showNotification('Explorez nos expertises digitales');
        });
    }
    
    const secretBtn = document.getElementById('secret-btn');
    if (secretBtn) {
        secretBtn.addEventListener('click', () => {
            playSound('secret');
            state.secretsFound++;
            updateSecretCounter();
            showEasterEgg(1);
        });
    }
    
    // Cartes de services
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            playSound('hover');
        });
        
        card.addEventListener('click', () => {
            playSound('click');
            if (card.dataset.service === 'ai') {
                state.secretsFound++;
                updateSecretCounter();
                showEasterEgg(3);
                playSound('secret');
            }
        });
    });
    
    // Liens de navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            playSound('click');
        });
        
        link.addEventListener('mouseenter', () => {
            playSound('hover');
        });
    });
    
    // Boutons génériques
    document.querySelectorAll('button:not(.no-sound)').forEach(button => {
        button.addEventListener('click', function(e) {
            // Éviter de jouer le son deux fois pour les éléments qui ont déjà des écouteurs
            if (!this.classList.contains('sound-handled')) {
                playSound('click');
            }
        });
        
        button.addEventListener('mouseenter', () => {
            playSound('hover');
        });
    });
    
    // Séquence de touches pour activer le jeu
    document.addEventListener('keydown', handleKeySequence);
    
    // Contrôles du jeu
    const closeGameBtn = document.querySelector('.close-game');
    if (closeGameBtn) {
        closeGameBtn.addEventListener('click', function() {
            playSound('click');
            closeGame();
        });
    }
    
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            playSound('click');
            togglePause();
        });
    }
    
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
        soundBtn.addEventListener('click', function() {
            playSound('click');
            toggleSound();
        });
    }
    
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function() {
            playSound('click');
            toggleFullscreen();
        });
    }
    
    // Bouton de résolution
    const resolutionBtn = document.getElementById('resolution-btn');
    if (resolutionBtn) {
        resolutionBtn.addEventListener('click', function() {
            playSound('click');
            toggleResolutionMenu();
        });
    }
    
    // Options de résolution
    document.querySelectorAll('.resolution-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            playSound('click');
            const width = parseInt(this.dataset.width);
            const height = parseInt(this.dataset.height);
            changeResolution(width, height);
            
            // Mettre à jour l'état actif
            document.querySelectorAll('.resolution-btn').forEach(b => 
                b.classList.remove('active')
            );
            this.classList.add('active');
            
            // Mettre à jour l'affichage
            const resolutionInfo = document.getElementById('current-resolution');
            if (resolutionInfo) {
                resolutionInfo.textContent = `${width}x${height}`;
            }
        });
    });
    
    // Sélecteur de difficulté
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            playSound('click');
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            changeDifficulty(btn.dataset.diff);
        });
    });
    
    // Gestion de la touche R pour la résolution
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            playSound('click');
            toggleResolutionMenu();
        }
    });
}

// ===== GESTION DE LA RÉSOLUTION =====
function toggleResolutionMenu() {
    const menu = document.querySelector('.resolution-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

function changeResolution(width, height) {
    const canvas = document.getElementById('game-canvas');
    if (!canvas || !gameInstance) return;
    
    // Mettre à jour la taille du canvas
    canvas.width = width;
    canvas.height = height;
    
    // Mettre à jour la configuration
    CONFIG.game.resolution.current = { width, height };
    
    // Recalculer le nombre de tuiles
    gameInstance.tileCount = {
        x: Math.floor(width / gameInstance.gridSize),
        y: Math.floor(height / gameInstance.gridSize)
    };
    
    // Réinitialiser le jeu avec la nouvelle résolution
    gameInstance.init();
    
    // Afficher une notification
    showNotification(`🎮 Résolution changée: ${width}x${height}`);
}

// ===== SYSTÈME DE SECRETS =====
function initSecrets() {
    // Afficher le compteur de secrets
    updateSecretCounter();
    
    // Afficher le panneau de séquence après 3 secrets
    setTimeout(() => {
        const secretPanel = document.querySelector('.secret-panel');
        if (secretPanel) {
            secretPanel.classList.add('active');
        }
    }, 3000);
}

function handleKeySequence(e) {
    const key = e.key.toLowerCase();
    
    // Ajouter à la progression
    state.sequenceProgress.push(key);
    
    // Garder seulement les 5 derniers
    if (state.sequenceProgress.length > 5) {
        state.sequenceProgress.shift();
    }
    
    // Mettre à jour l'affichage
    updateSequenceDisplay();
    
    // Vérifier la séquence complète
    if (state.sequenceProgress.join('') === CONFIG.secrets.sequence.join('')) {
        activateGame();
        state.sequenceProgress = [];
        updateSequenceDisplay();
    }
    
    // Secrets supplémentaires avec touches spéciales
    if (e.key === 'F12') {
        e.preventDefault();
        state.secretsFound = CONFIG.secrets.easterEggs;
        updateSecretCounter();
        showEasterEgg(7);
        playSound('secret');
    }
    
    if (e.key === '?' || e.key === '/') {
        showNotification('💡 Astuce: Tapez "SNAKE" pour activer le jeu caché');
    }
}

function updateSequenceDisplay() {
    const keys = document.querySelectorAll('.sequence-key');
    
    keys.forEach((key, index) => {
        if (state.sequenceProgress[index] === CONFIG.secrets.sequence[index]) {
            key.classList.add('active');
            key.textContent = CONFIG.secrets.sequence[index].toUpperCase();
            if (index === CONFIG.secrets.sequence.length - 1) {
                // Dernière lettre de la séquence trouvée
                playSound('secret');
            }
        } else {
            key.classList.remove('active');
            key.textContent = '?';
        }
    });
}

function updateSecretCounter() {
    const counter = document.querySelector('.secret-count');
    const stat = document.querySelector('.hero-stats .stat:last-child .stat-number');
    
    if (counter) {
        counter.textContent = state.secretsFound;
    }
    
    if (stat) {
        stat.textContent = state.secretsFound;
    }
    
    // Animation
    if (counter) {
        counter.classList.add('pulse');
        setTimeout(() => counter.classList.remove('pulse'), 500);
    }
    
    // Vérifier si assez de secrets pour activer le jeu
    if (state.secretsFound >= CONFIG.secrets.required) {
        showNotification(`🎮 ${CONFIG.secrets.required} secrets trouvés! Tapez "SNAKE" pour jouer`);
    }
}

// ===== JEU SNAKE AVANCÉ =====
class SnakeGame {
    constructor() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        
        // Dimensions
        this.gridSize = CONFIG.game.gridSize;
        this.tileCount = {
            x: Math.floor(this.canvas.width / this.gridSize),
            y: Math.floor(this.canvas.height / this.gridSize)
        };
        
        // État du jeu
        this.snake = [];
        this.food = { x: 0, y: 0 };
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.score = 0;
        this.speed = CONFIG.game.initialSpeed;
        this.gameLoop = null;
        this.isPaused = false;
        this.level = 1;
        this.powerups = [];
        this.boss = null;
        this.bossHealth = 100;
        
        // Initialiser
        this.init();
    }
    
    init() {
        // Réinitialiser le serpent
        this.snake = [
            { x: Math.floor(this.tileCount.x / 2), y: Math.floor(this.tileCount.y / 2) }
        ];
        
        // Générer la première nourriture
        this.generateFood();
        
        // Initialiser les power-ups
        this.powerups = [];
        
        // Définir le boss pour les niveaux supérieurs
        if (this.level >= 3) {
            this.initBoss();
        }
        
        // Mettre à jour l'affichage
        this.updateScore();
    }
    
    generateFood() {
        let foodOnSnake, foodOnPowerup;
        
        do {
            foodOnSnake = false;
            foodOnPowerup = false;
            
            this.food = {
                x: Math.floor(Math.random() * this.tileCount.x),
                y: Math.floor(Math.random() * this.tileCount.y)
            };
            
            // Vérifier les collisions
            for (let segment of this.snake) {
                if (this.food.x === segment.x && this.food.y === segment.y) {
                    foodOnSnake = true;
                    break;
                }
            }
            
            for (let powerup of this.powerups) {
                if (this.food.x === powerup.x && this.food.y === powerup.y) {
                    foodOnPowerup = true;
                    break;
                }
            }
            
        } while (foodOnSnake || foodOnPowerup);
    }
    
    generatePowerup() {
        if (Math.random() > 0.3) return; // 30% de chance
        
        const types = ['speed', 'shield', 'time'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let powerupOnSnake, powerupOnFood;
        
        do {
            powerupOnSnake = false;
            powerupOnFood = false;
            
            const powerup = {
                x: Math.floor(Math.random() * this.tileCount.x),
                y: Math.floor(Math.random() * this.tileCount.y),
                type: type
            };
            
            // Vérifier les collisions
            for (let segment of this.snake) {
                if (powerup.x === segment.x && powerup.y === segment.y) {
                    powerupOnSnake = true;
                    break;
                }
            }
            
            if (powerup.x === this.food.x && powerup.y === this.food.y) {
                powerupOnFood = true;
            }
            
            if (!powerupOnSnake && !powerupOnFood) {
                this.powerups.push(powerup);
                break;
            }
            
        } while (true);
    }
    
    initBoss() {
        this.boss = {
            x: Math.floor(this.tileCount.x / 2),
            y: 5,
            width: 5,
            height: 3,
            direction: 1,
            speed: 2
        };
    }
    
    updateBoss() {
        if (!this.boss) return;
        
        // Déplacement du boss
        this.boss.x += this.boss.direction * this.boss.speed;
        
        // Inverser la direction aux bords
        if (this.boss.x <= 0 || this.boss.x >= this.tileCount.x - this.boss.width) {
            this.boss.direction *= -1;
        }
        
        // Vérifier la collision avec le serpent
        const head = this.snake[0];
        if (head.x >= this.boss.x && head.x < this.boss.x + this.boss.width &&
            head.y >= this.boss.y && head.y < this.boss.y + this.boss.height) {
            
            this.bossHealth -= 10;
            if (this.bossHealth <= 0) {
                this.score += 500;
                this.boss = null;
                this.level++;
                this.updateScore();
                playSound('boss-defeat');
                showNotification(`🎉 BOSS VAINCU! Niveau ${this.level} atteint!`);
            } else {
                this.gameOver();
            }
        }
    }
    
    update() {
        if (this.isPaused) return;
        
        // Mettre à jour la direction
        this.direction = { ...this.nextDirection };
        
        if (this.direction.x === 0 && this.direction.y === 0) return;
        
        // Déplacer la tête
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Vérifier les collisions avec les murs
        if (head.x < 0 || head.x >= this.tileCount.x || 
            head.y < 0 || head.y >= this.tileCount.y) {
            
            if (state.powerupsActive.shield) {
                // Téléporter de l'autre côté
                head.x = (head.x + this.tileCount.x) % this.tileCount.x;
                head.y = (head.y + this.tileCount.y) % this.tileCount.y;
                state.powerupsActive.shield--;
            } else {
                this.gameOver();
                return;
            }
        }
        
        // Vérifier les collisions avec soi-même
        for (let i = 0; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                if (state.powerupsActive.shield) {
                    state.powerupsActive.shield--;
                    this.snake.pop(); // Retirer la queue
                    break;
                } else {
                    this.gameOver();
                    return;
                }
            }
        }
        
        // Ajouter la nouvelle tête
        this.snake.unshift(head);
        
        // Vérifier la nourriture
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10 * this.level;
            playSound('eat');
            this.generateFood();
            
            // Générer occasionnellement un power-up
            this.generatePowerup();
            
            // Augmenter la vitesse progressivement
            if (this.score % 100 === 0 && this.speed < CONFIG.game.maxSpeed) {
                this.speed++;
                this.adjustSpeed();
            }
            
            // Passer au niveau suivant
            if (this.score >= this.level * 200) {
                this.level++;
                if (this.level === 3) {
                    this.initBoss();
                }
                showNotification(`🎯 Niveau ${this.level} atteint!`);
            }
            
            this.updateScore();
        } else {
            // Retirer la queue si aucune nourriture mangée
            this.snake.pop();
        }
        
        // Vérifier les power-ups
        this.checkPowerups(head);
        
        // Mettre à jour le boss
        this.updateBoss();
        
        // Dessiner
        this.draw();
    }
    
    checkPowerups(head) {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            
            if (head.x === powerup.x && head.y === powerup.y) {
                this.activatePowerup(powerup.type);
                this.powerups.splice(i, 1);
                playSound('powerup');
                break;
            }
        }
    }
    
    activatePowerup(type) {
        const config = CONFIG.game.powerups[type];
        
        switch(type) {
            case 'speed':
                state.powerupsActive.speed = {
                    multiplier: config.multiplier,
                    endTime: Date.now() + config.duration
                };
                this.speed *= config.multiplier;
                this.adjustSpeed();
                break;
                
            case 'shield':
                state.powerupsActive.shield = (state.powerupsActive.shield || 0) + config.protection;
                break;
                
            case 'time':
                // Ajouter du temps supplémentaire (dans une version avec timer)
                break;
        }
        
        // Supprimer le power-up après sa durée
        setTimeout(() => {
            if (type === 'speed') {
                this.speed /= config.multiplier;
                this.adjustSpeed();
                delete state.powerupsActive.speed;
            }
        }, config.duration);
    }
    
    adjustSpeed() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        this.gameLoop = setInterval(() => this.update(), 1000 / this.speed);
    }
    
    draw() {
        // Effacer le canvas
        this.ctx.fillStyle = '#0A0A14';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner la grille
        this.drawGrid();
        
        // Dessiner le serpent
        this.drawSnake();
        
        // Dessiner la nourriture
        this.drawFood();
        
        // Dessiner les power-ups
        this.drawPowerups();
        
        // Dessiner le boss
        if (this.boss) {
            this.drawBoss();
        }
        
        // Effets visuels
        this.drawEffects();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(108, 99, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Lignes verticales
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Lignes horizontales
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        // Tête avec effet de dégradé
        const head = this.snake[0];
        const headX = head.x * this.gridSize;
        const headY = head.y * this.gridSize;
        
        // Tête
        const headGradient = this.ctx.createLinearGradient(
            headX, headY,
            headX + this.gridSize, headY + this.gridSize
        );
        headGradient.addColorStop(0, '#6C63FF');
        headGradient.addColorStop(1, '#4CC9F0');
        
        this.ctx.fillStyle = headGradient;
        this.ctx.fillRect(headX + 2, headY + 2, this.gridSize - 4, this.gridSize - 4);
        
        // Yeux
        this.ctx.fillStyle = '#FFFFFF';
        const eyeSize = this.gridSize / 6;
        
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        if (this.direction.x === 1) {
            leftEyeX = headX + this.gridSize - eyeSize - 4;
            leftEyeY = headY + this.gridSize / 3;
            rightEyeX = headX + this.gridSize - eyeSize - 4;
            rightEyeY = headY + 2 * this.gridSize / 3;
        } else if (this.direction.x === -1) {
            leftEyeX = headX + eyeSize + 4;
            leftEyeY = headY + this.gridSize / 3;
            rightEyeX = headX + eyeSize + 4;
            rightEyeY = headY + 2 * this.gridSize / 3;
        } else if (this.direction.y === 1) {
            leftEyeX = headX + this.gridSize / 3;
            leftEyeY = headY + this.gridSize - eyeSize - 4;
            rightEyeX = headX + 2 * this.gridSize / 3;
            rightEyeY = headY + this.gridSize - eyeSize - 4;
        } else {
            leftEyeX = headX + this.gridSize / 3;
            leftEyeY = headY + eyeSize + 4;
            rightEyeX = headX + 2 * this.gridSize / 3;
            rightEyeY = headY + eyeSize + 4;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pupilles
        this.ctx.fillStyle = '#0A0A14';
        this.ctx.beginPath();
        this.ctx.arc(leftEyeX, leftEyeY, eyeSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(rightEyeX, rightEyeY, eyeSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Corps
        for (let i = 1; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // Dégradé pour le corps
            const intensity = 1 - (i / this.snake.length) * 0.7;
            this.ctx.fillStyle = `rgba(108, 99, 255, ${intensity})`;
            
            // Arrondir les coins
            const radius = 5;
            this.ctx.beginPath();
            this.ctx.moveTo(x + radius, y);
            this.ctx.lineTo(x + this.gridSize - radius, y);
            this.ctx.quadraticCurveTo(x + this.gridSize, y, x + this.gridSize, y + radius);
            this.ctx.lineTo(x + this.gridSize, y + this.gridSize - radius);
            this.ctx.quadraticCurveTo(x + this.gridSize, y + this.gridSize, x + this.gridSize - radius, y + this.gridSize);
            this.ctx.lineTo(x + radius, y + this.gridSize);
            this.ctx.quadraticCurveTo(x, y + this.gridSize, x, y + this.gridSize - radius);
            this.ctx.lineTo(x, y + radius);
            this.ctx.quadraticCurveTo(x, y, x + radius, y);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // Effet de lueur
        const gradient = this.ctx.createRadialGradient(
            x + this.gridSize / 2, y + this.gridSize / 2, 0,
            x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize
        );
        gradient.addColorStop(0, 'rgba(255, 101, 132, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 101, 132, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pomme
        this.ctx.fillStyle = '#FF6584';
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2 - 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Feuille
        this.ctx.fillStyle = '#4CC9F0';
        this.ctx.beginPath();
        this.ctx.ellipse(x + this.gridSize / 2, y + this.gridSize / 4, this.gridSize / 6, this.gridSize / 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPowerups() {
        this.powerups.forEach(powerup => {
            const x = powerup.x * this.gridSize;
            const y = powerup.y * this.gridSize;
            
            let color, symbol;
            
            switch(powerup.type) {
                case 'speed':
                    color = '#FFD700';
                    symbol = '⚡';
                    break;
                case 'shield':
                    color = '#4CC9F0';
                    symbol = '🛡️';
                    break;
                case 'time':
                    color = '#9B30FF';
                    symbol = '⏱️';
                    break;
            }
            
            // Animation de pulsation
            const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
            
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = 0.8;
            this.ctx.beginPath();
            this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2 * pulse, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Symbole
            this.ctx.globalAlpha = 1;
            this.ctx.font = `${this.gridSize * 0.8}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText(symbol, x + this.gridSize / 2, y + this.gridSize / 2);
        });
    }
    
    drawBoss() {
        const x = this.boss.x * this.gridSize;
        const y = this.boss.y * this.gridSize;
        const width = this.boss.width * this.gridSize;
        const height = this.boss.height * this.gridSize;
        
        // Corps du boss
        const gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, '#FF0000');
        gradient.addColorStop(1, '#8B0000');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, width, height);
        
        // Yeux du boss
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(x + width / 3, y + height / 2, this.gridSize / 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x + 2 * width / 3, y + height / 2, this.gridSize / 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pupilles
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(x + width / 3, y + height / 2, this.gridSize / 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x + 2 * width / 3, y + height / 2, this.gridSize / 6, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawEffects() {
        // Effets de particules (simplifié)
        if (Math.random() > 0.7) {
            this.ctx.fillStyle = 'rgba(108, 99, 255, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                2, 0, Math.PI * 2
            );
            this.ctx.fill();
        }
    }
    
    updateScore() {
        const currentScore = document.getElementById('current-score');
        const highScore = document.getElementById('high-score');
        const currentLevel = document.getElementById('current-level');
        
        if (currentScore) currentScore.textContent = this.score;
        if (highScore) highScore.textContent = state.highScore;
        if (currentLevel) currentLevel.textContent = this.level;
        
        // Mettre à jour la barre de vie du boss
        if (this.boss) {
            const healthBar = document.querySelector('.health-fill');
            if (healthBar) {
                healthBar.style.width = `${this.bossHealth}%`;
            }
        }
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        
        // Mettre à jour le meilleur score
        if (this.score > state.highScore) {
            state.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.score);
            showNotification(`🏆 NOUVEAU RECORD: ${this.score} points!`);
        }
        
        playSound('game-over');
        
        // Afficher l'écran de game over
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FF6584';
        this.ctx.font = 'bold 60px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '30px Montserrat';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        this.ctx.fillText(`Meilleur score: ${state.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
        
        this.ctx.fillStyle = '#6C63FF';
        this.ctx.font = '20px Montserrat';
        this.ctx.fillText('Appuyez sur ESPACE pour rejouer', this.canvas.width / 2, this.canvas.height / 2 + 120);
        
        // Réinitialiser après 3 secondes
        setTimeout(() => {
            this.init();
            this.adjustSpeed();
        }, 3000);
    }
    
    start() {
        this.adjustSpeed();
        
        // Contrôles clavier
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
                    break;
                case 'ArrowDown':
                    if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
                    break;
                case 'ArrowLeft':
                    if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
                    break;
                case 'ArrowRight':
                    if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
                    break;
                case ' ':
                    if (!this.gameLoop) {
                        this.init();
                        this.adjustSpeed();
                    }
                    break;
                case 'r':
                case 'R':
                    playSound('click');
                    toggleResolutionMenu();
                    break;
            }
        });
    }
    
    pause() {
        this.isPaused = true;
        clearInterval(this.gameLoop);
    }
    
    resume() {
        this.isPaused = false;
        this.adjustSpeed();
    }
    
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
}

// ===== FONCTIONS UTILITAIRES =====
let gameInstance = null;

function initGame() {
    // Initialiser le canvas
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    
    // Définir la résolution initiale
    const initialRes = CONFIG.game.resolution.current;
    canvas.width = initialRes.width;
    canvas.height = initialRes.height;
    
    // Mettre à jour l'affichage de la résolution
    const resolutionInfo = document.getElementById('current-resolution');
    if (resolutionInfo) {
        resolutionInfo.textContent = `${initialRes.width}x${initialRes.height}`;
    }
    
    gameInstance = new SnakeGame();
}

function activateGame() {
    if (state.secretsFound < CONFIG.secrets.required) {
        showNotification(`🔒 Trouvez encore ${CONFIG.secrets.required - state.secretsFound} secrets pour débloquer le jeu`);
        return;
    }
    
    const gameModal = document.querySelector('.game-modal');
    if (gameModal) {
        gameModal.classList.add('active');
    }
    
    if (gameInstance) {
        gameInstance.start();
    }
    
    playSound('game-start');
    
    // Mettre à jour l'état
    state.gameActive = true;
}

function closeGame() {
    const gameModal = document.querySelector('.game-modal');
    if (gameModal) {
        gameModal.classList.remove('active');
    }
    
    // Masquer le menu de résolution
    const resolutionMenu = document.querySelector('.resolution-menu');
    if (resolutionMenu) {
        resolutionMenu.classList.remove('active');
    }
    
    if (gameInstance) {
        gameInstance.pause();
    }
    
    state.gameActive = false;
}

function togglePause() {
    if (gameInstance) {
        gameInstance.togglePause();
        const btn = document.getElementById('pause-btn');
        if (btn) {
            btn.innerHTML = gameInstance.isPaused ? 
                '<i class="fas fa-play"></i>' : 
                '<i class="fas fa-pause"></i>';
        }
    }
}

function toggleFullscreen() {
    const elem = document.querySelector('.game-modal');
    if (!elem) return;
    
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(console.log);
    } else {
        document.exitFullscreen();
    }
}

function changeDifficulty(diff) {
    if (!gameInstance) return;
    
    const speeds = {
        easy: 8,
        medium: 12,
        hard: 16,
        extreme: 20
    };
    
    gameInstance.speed = speeds[diff];
    gameInstance.adjustSpeed();
    
    showNotification(`Difficulté: ${diff.toUpperCase()} activée`);
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const icon = document.querySelector('#theme-toggle i');
    
    if (!icon) return;
    
    if (document.body.classList.contains('light-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

function showNotification(message) {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = 'notification-temp';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Supprimer après 4 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function showEasterEgg(number) {
    const egg = document.getElementById(`egg-${number}`);
    if (!egg) return;
    
    egg.classList.add('active');
    
    // Jouer un son spécial
    if (state.soundEnabled) {
        playSound('secret');
    }
    
    // Fermer automatiquement après 3 secondes
    setTimeout(() => {
        egg.classList.remove('active');
    }, 3000);
}

function animateStats() {
    const stats = document.querySelectorAll('.stat-number[data-count]');
    
    stats.forEach(stat => {
        const target = parseInt(stat.dataset.count);
        let current = 0;
        const increment = target / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current);
        }, 30);
    });
}

// ===== AJOUT DE STYLES DYNAMIQUES =====
const style = document.createElement('style');
style.textContent = `
    .notification-temp {
        position: fixed;
        top: 100px;
        right: 30px;
        background: linear-gradient(45deg, #6C63FF, #4CC9F0);
        color: white;
        padding: 15px 25px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(108, 99, 255, 0.4);
        z-index: 9999;
        transform: translateX(150%);
        transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-width: 350px;
        border: 2px solid white;
    }
    
    .notification-temp.show {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 15px;
        font-weight: 500;
    }
    
    .notification-content i {
        font-size: 1.5rem;
    }
    
    .pulse {
        animation: pulse 0.5s ease;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
    
    /* Styles pour les particules FTW */
    .ftw-particle {
        position: fixed;
        pointer-events: none;
        z-index: 10000;
        border-radius: 50%;
    }
    
    .ftw-toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4ECDC4;
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
        font-weight: 500;
        max-width: 300px;
    }
    
    /* Style pour l'indicateur de chargement audio */
    .audio-loading {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: var(--primary);
        color: white;
        padding: 10px 20px;
        border-radius: 10px;
        z-index: 10000;
        display: none;
        font-size: 0.9rem;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }
    
    .audio-loading.show {
        display: block;
        animation: pulse 1.5s infinite;
    }
`;
document.head.appendChild(style);

// ===== EXPORT POUR DEBUG =====
window.game = {
    state,
    CONFIG,
    activateGame,
    closeGame,
    showNotification,
    changeResolution,
    playSound,
    toggleSound
};

console.log('✅ Projet For The Win initialisé avec succès!');
console.log('🐍 Tapez "SNAKE" pour activer le jeu secret');
console.log('🔊 Système audio WAV local activé');