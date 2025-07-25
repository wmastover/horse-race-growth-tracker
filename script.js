class HorseRace {
    constructor() {
        this.isRacing = false;
        this.raceTrack = document.querySelector('.race-track');
        this.horse1 = document.getElementById('horse1');
        this.horse2 = document.getElementById('horse2');
        this.startBtn = document.getElementById('startRace');
        this.resetBtn = document.getElementById('resetRace');
        this.results = document.getElementById('results');
        this.confettiContainer = document.getElementById('confetti');
        this.inputSection = document.querySelector('.input-section');
        this.settingsGear = document.getElementById('settingsGear');
        this.settingsOverlay = document.getElementById('settingsOverlay');
        this.inputOverlay = document.getElementById('inputOverlay');
        this.floatingStartBtn = document.getElementById('floatingStartBtn');
        this.drumrollAudio = document.getElementById('drumrollAudio');
        this.raceCommentary = document.getElementById('raceCommentary');
        
        // New elements
        this.percent1Display = document.getElementById('percent1');
        this.percent2Display = document.getElementById('percent2');
        this.bookableSection = document.getElementById('bookableSection');
        this.registrationsSection = document.getElementById('registrationsSection');
        
        // Commentary phrases for excitement
        this.commentaryPhrases = [
            "🎤 Ready to witness some epic growth racing!",
            "🔥 The competition is heating up!",
            "⚡ Lightning-fast growth ahead!",
            "🏆 Who will claim victory today?",
            "🎯 Precision and speed combined!",
            "💪 Peak performance incoming!",
            "🌟 Stellar growth showdown!",
            "🚀 Rocketing towards success!"
        ];
        
        this.initializeEventListeners();
        this.hideSetupPanel();
        this.setupQuickTestButtons();
        this.updateCommentary();
    }

    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.startRace());
        this.resetBtn.addEventListener('click', () => this.resetRace());
        this.settingsGear.addEventListener('click', () => this.toggleSetupPanel());
        this.settingsOverlay.addEventListener('click', () => this.hideSetupPanel());
        this.inputOverlay.addEventListener('click', () => this.hideSetupPanel());
        this.floatingStartBtn.addEventListener('click', () => this.startRace());
        
        // Update floating button state on input
        const inputs = ['bookableActual', 'bookableTarget', 'registrationsActual', 'registrationsTarget', 'weekTarget'];
        inputs.forEach(inputId => {
            document.getElementById(inputId).addEventListener('input', () => {
                this.updateFloatingBtnState();
                this.updateLivePercentages();
            });
        });
        
        // Allow Enter key to start race
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isRacing && this.inputSection.classList.contains('show')) {
                this.startRace();
            }
        });

        // Add escape key to close setup
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.inputSection.classList.contains('show')) {
                this.hideSetupPanel();
            }
        });
    }

    setupQuickTestButtons() {
        const quickTestData = [
            { label: '🔥 Close Race', b1: 47, b2: 52, r1: 45, r2: 48, week: 50 },
            { label: '💪 Big Lead', b1: 35, b2: 80, r1: 25, r2: 75, week: 60 },
            { label: '🤝 Dead Tie', b1: 50, b2: 100, r1: 50, r2: 100, week: 50 },
            { label: '⚡ Comeback', b1: 25, b2: 50, r1: 40, r2: 50, week: 55 }
        ];
        
        const quickTestButtons = document.getElementById('quickTestButtons');
        
        quickTestData.forEach(data => {
            const btn = document.createElement('button');
            btn.textContent = data.label;
            btn.className = 'quick-test-btn';
            btn.addEventListener('click', () => {
                document.getElementById('bookableActual').value = data.b1;
                document.getElementById('bookableTarget').value = data.b2;
                document.getElementById('registrationsActual').value = data.r1;
                document.getElementById('registrationsTarget').value = data.r2;
                document.getElementById('weekTarget').value = data.week;
                this.updateLivePercentages();
                this.updateFloatingBtnState();
                
                // Visual feedback
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 150);
            });
            quickTestButtons.appendChild(btn);
        });
    }

    updateLivePercentages() {
        const bookableActual = parseFloat(document.getElementById('bookableActual').value) || 0;
        const bookableTarget = parseFloat(document.getElementById('bookableTarget').value) || 1;
        const registrationsActual = parseFloat(document.getElementById('registrationsActual').value) || 0;
        const registrationsTarget = parseFloat(document.getElementById('registrationsTarget').value) || 1;

        const percent1 = Math.min(100, (bookableActual / bookableTarget) * 100);
        const percent2 = Math.min(100, (registrationsActual / registrationsTarget) * 100);

        if (this.percent1Display) this.percent1Display.textContent = `${percent1.toFixed(1)}%`;
        if (this.percent2Display) this.percent2Display.textContent = `${percent2.toFixed(1)}%`;

        // Update horse positions slightly based on percentages (preview)
        if (!this.isRacing) {
            const previewOffset = Math.max(percent1, percent2) > 0 ? 10 : 0;
            this.horse1.style.left = `${50 + (percent1 / 100) * previewOffset}px`;
            this.horse2.style.left = `${50 + (percent2 / 100) * previewOffset}px`;
        }
    }

    updateCommentary(message = null) {
        if (!this.raceCommentary) return;
        
        if (message) {
            this.raceCommentary.querySelector('p').textContent = message;
        } else {
            const randomPhrase = this.commentaryPhrases[Math.floor(Math.random() * this.commentaryPhrases.length)];
            this.raceCommentary.querySelector('p').textContent = randomPhrase;
        }
    }

    showSetupPanel() {
        this.inputSection.classList.add('show');
        this.inputSection.classList.remove('hide');
        this.settingsOverlay.classList.add('active');
        this.inputOverlay.classList.add('active');
        this.floatingStartBtn.style.display = 'none';
        this.updateCommentary("🔧 Configuring your epic race setup!");
    }

    hideSetupPanel() {
        this.inputSection.classList.remove('show');
        this.inputSection.classList.add('hide');
        this.settingsOverlay.classList.remove('active');
        this.inputOverlay.classList.remove('active');
        this.updateFloatingBtnState();
        this.updateCommentary();
    }

    updateFloatingBtnState() {
        // Show the floating button only if settings are closed
        if (!this.inputSection.classList.contains('show')) {
            this.floatingStartBtn.style.display = 'block';
            // Validate inputs
            const bookableActual = parseFloat(document.getElementById('bookableActual').value);
            const bookableTarget = parseFloat(document.getElementById('bookableTarget').value);
            const registrationsActual = parseFloat(document.getElementById('registrationsActual').value);
            const registrationsTarget = parseFloat(document.getElementById('registrationsTarget').value);
            
            if (
                isNaN(bookableActual) || isNaN(bookableTarget) || bookableTarget <= 0 ||
                isNaN(registrationsActual) || isNaN(registrationsTarget) || registrationsTarget <= 0 ||
                bookableActual < 0 || registrationsActual < 0
            ) {
                this.floatingStartBtn.disabled = true;
                this.floatingStartBtn.style.opacity = 0.6;
                this.floatingStartBtn.style.pointerEvents = 'none';
            } else {
                this.floatingStartBtn.disabled = false;
                this.floatingStartBtn.style.opacity = 1;
                this.floatingStartBtn.style.pointerEvents = 'auto';
            }
        } else {
            this.floatingStartBtn.style.display = 'none';
        }
    }

    toggleSetupPanel() {
        if (this.inputSection.classList.contains('show')) {
            this.hideSetupPanel();
        } else {
            this.showSetupPanel();
        }
    }

    startRace() {
        // Hide floating button during race
        this.floatingStartBtn.style.display = 'none';
        const bookableActual = parseFloat(document.getElementById('bookableActual').value);
        const bookableTarget = parseFloat(document.getElementById('bookableTarget').value);
        const registrationsActual = parseFloat(document.getElementById('registrationsActual').value);
        const registrationsTarget = parseFloat(document.getElementById('registrationsTarget').value);
        const weekTarget = parseFloat(document.getElementById('weekTarget').value);

        // Validate inputs
        if (
            isNaN(bookableActual) || isNaN(bookableTarget) || bookableTarget <= 0 ||
            isNaN(registrationsActual) || isNaN(registrationsTarget) || registrationsTarget <= 0 ||
            bookableActual < 0 || registrationsActual < 0
        ) {
            this.showError('Please enter valid actuals and targets for both teams!');
            return;
        }

        // Calculate percentages
        const percent1 = Math.min(100, (bookableActual / bookableTarget) * 100);
        const percent2 = Math.min(100, (registrationsActual / registrationsTarget) * 100);

        this.isRacing = true;
        this.startBtn.disabled = true;
        this.results.style.display = 'none';
        this.hideSetupPanel();
        
        // Reset horses to starting position
        this.resetHorses();
        
        // Update commentary for race start
        this.updateCommentary("🏁 And they're off! The race for growth supremacy begins!");
        
        // Calculate race parameters
        const trackWidth = this.raceTrack.offsetWidth - 150; // Account for horse width and finish line
        const maxSpeed = 3.5; // Increased max speed for more excitement
        const minSpeed = 1.2;
        
        // Calculate speeds based on percentages (higher percentage = faster)
        const speed1 = minSpeed + (percent1 / 100) * (maxSpeed - minSpeed);
        const speed2 = minSpeed + (percent2 / 100) * (maxSpeed - minSpeed);
        
        // Determine winner
        const winner = percent1 > percent2 ? 1 : percent2 > percent1 ? 2 : 'tie';
        
        // Start the race animation
        this.animateRace(speed1, speed2, trackWidth, winner, percent1, percent2, bookableTarget, registrationsTarget, weekTarget, bookableActual, registrationsActual);

        // Play drum roll
        if (this.drumrollAudio) {
            this.drumrollAudio.currentTime = 0;
            this.drumrollAudio.loop = true;
            this.drumrollAudio.play().catch(() => {
                // Handle autoplay restrictions
                console.log('Audio autoplay prevented');
            });
        }
    }

    animateRace(speed1, speed2, trackWidth, winner, percent1, percent2, bookableTarget, registrationsTarget, weekTarget, bookableActual, registrationsActual) {
        let pos1 = 50; // Starting position
        let pos2 = 50;
        let finished1 = false;
        let finished2 = false;
        let raceEnded = false;
        
        // Add excitement factors
        let momentum1 = 0;
        let momentum2 = 0;
        let frameCount = 0;
        let hasChangedLead = false;
        let lastLeadChange = 0;
        let commentaryTimer = 0;
        
        // Commentary updates during race
        const raceCommentaries = [
            "🔥 Neck and neck competition!",
            "⚡ Booky is making a move!",
            "💪 Reggy fights back!",
            "🎯 What a performance!",
            "🏆 Victory is within reach!",
            "🌟 Incredible speed burst!"
        ];
        
        // Calculate base speeds with some randomness
        const baseSpeed1 = speed1;
        const baseSpeed2 = speed2;
        
        // Determine which horse should start ahead (opposite of winner for guaranteed lead change)
        const startAhead = winner === 1 ? 2 : 1;
        if (startAhead === 2) {
            pos2 = 80; // Start horse 2 slightly ahead
        } else {
            pos1 = 80; // Start horse 1 slightly ahead
        }
        
        const animate = () => {
            frameCount++;
            commentaryTimer++;
            
            // Update commentary every 60 frames (roughly 1 second)
            if (commentaryTimer % 60 === 0) {
                const randomCommentary = raceCommentaries[Math.floor(Math.random() * raceCommentaries.length)];
                this.updateCommentary(randomCommentary);
            }
            
            // Add momentum and random bursts
            if (!finished1) {
                // Random speed variations to create excitement
                const randomFactor1 = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
                const burstChance1 = Math.random() < 0.1; // 10% chance of speed burst
                const burstMultiplier1 = burstChance1 ? 1.8 : 1; // Increased burst multiplier
                
                // Add visual feedback for speed bursts
                if (burstChance1) {
                    this.horse1.querySelector('.horse-img').classList.add('speed-burst');
                    this.updateCommentary("⚡ Booky with a lightning burst!");
                    setTimeout(() => {
                        this.horse1.querySelector('.horse-img').classList.remove('speed-burst');
                    }, 400);
                }
                
                // Momentum system - horses can gain/lose momentum
                if (Math.random() < 0.18) { // 18% chance to change momentum
                    momentum1 = (Math.random() - 0.5) * 1.0; // Increased momentum range
                }
                
                const currentSpeed1 = (baseSpeed1 + momentum1) * randomFactor1 * burstMultiplier1;
                pos1 += currentSpeed1;
                this.horse1.style.left = `${pos1}px`;
                
                // Update live percentage display
                const progress1 = Math.min(100, (pos1 - 50) / (trackWidth - 50) * 100);
                if (this.percent1Display) {
                    this.percent1Display.textContent = `${(percent1 * progress1 / 100).toFixed(1)}%`;
                }
                
                if (pos1 >= trackWidth) {
                    finished1 = true;
                    pos1 = trackWidth;
                    this.horse1.style.left = `${pos1}px`;
                    if (!raceEnded) {
                        raceEnded = true;
                        this.updateCommentary("🏁 We have a winner! What an incredible finish!");
                        this.finishRace(winner, percent1, percent2, bookableTarget, registrationsTarget, weekTarget, bookableActual, registrationsActual);
                        return;
                    }
                }
            }
            
            if (!finished2) {
                // Random speed variations to create excitement
                const randomFactor2 = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
                const burstChance2 = Math.random() < 0.1; // 10% chance of speed burst
                const burstMultiplier2 = burstChance2 ? 1.8 : 1; // Increased burst multiplier
                
                // Add visual feedback for speed bursts
                if (burstChance2) {
                    this.horse2.querySelector('.horse-img').classList.add('speed-burst');
                    this.updateCommentary("💥 Reggy unleashes power!");
                    setTimeout(() => {
                        this.horse2.querySelector('.horse-img').classList.remove('speed-burst');
                    }, 400);
                }
                
                // Momentum system - horses can gain/lose momentum
                if (Math.random() < 0.18) { // 18% chance to change momentum
                    momentum2 = (Math.random() - 0.5) * 1.0; // Increased momentum range
                }
                
                const currentSpeed2 = (baseSpeed2 + momentum2) * randomFactor2 * burstMultiplier2;
                pos2 += currentSpeed2;
                this.horse2.style.left = `${pos2}px`;
                
                // Update live percentage display
                const progress2 = Math.min(100, (pos2 - 50) / (trackWidth - 50) * 100);
                if (this.percent2Display) {
                    this.percent2Display.textContent = `${(percent2 * progress2 / 100).toFixed(1)}%`;
                }
                
                if (pos2 >= trackWidth) {
                    finished2 = true;
                    pos2 = trackWidth;
                    this.horse2.style.left = `${pos2}px`;
                    if (!raceEnded) {
                        raceEnded = true;
                        this.updateCommentary("🏁 Incredible finish! The crowd goes wild!");
                        this.finishRace(winner, percent1, percent2, bookableTarget, registrationsTarget, weekTarget, bookableActual, registrationsActual);
                        return;
                    }
                }
            }
            
            // Force lead change if it hasn't happened by the middle of the race
            if (!finished1 && !finished2 && !hasChangedLead) {
                const raceProgress = Math.max(pos1, pos2) / trackWidth;
                
                if (raceProgress > 0.4 && raceProgress < 0.7) { // Between 40% and 70% of race
                    // Force the winning horse to take the lead
                    if (winner === 1 && pos2 > pos1) {
                        // Give horse 1 a significant boost to take the lead
                        pos1 += baseSpeed1 * 2.5;
                        this.horse1.style.left = `${pos1}px`;
                        hasChangedLead = true;
                        this.updateCommentary("🔥 Booky makes the crucial move!");
                    } else if (winner === 2 && pos1 > pos2) {
                        // Give horse 2 a significant boost to take the lead
                        pos2 += baseSpeed2 * 2.5;
                        this.horse2.style.left = `${pos2}px`;
                        hasChangedLead = true;
                        this.updateCommentary("💪 Reggy surges ahead!");
                    }
                }
            }
            
            // Ensure the winning horse finishes first by adjusting speeds near the end
            if (!finished1 && !finished2) {
                const distanceToFinish1 = trackWidth - pos1;
                const distanceToFinish2 = trackWidth - pos2;
                
                // If we're getting close to the finish, ensure the winner has advantage
                if (distanceToFinish1 < 100 && distanceToFinish2 < 100) {
                    if (winner === 1 && pos2 > pos1) {
                        // Give horse 1 a boost if it's behind but should win
                        pos1 += baseSpeed1 * 0.8;
                        this.horse1.style.left = `${pos1}px`;
                    } else if (winner === 2 && pos1 > pos2) {
                        // Give horse 2 a boost if it's behind but should win
                        pos2 += baseSpeed2 * 0.8;
                        this.horse2.style.left = `${pos2}px`;
                    }
                }
            }
            
            // Update leading indicator and track lead changes
            if (!finished1 && !finished2) {
                const currentLeader = pos1 > pos2 ? 1 : pos2 > pos1 ? 2 : null;
                
                if (currentLeader === 1) {
                    this.horse1.classList.add('leading');
                    this.horse2.classList.remove('leading');
                } else if (currentLeader === 2) {
                    this.horse2.classList.add('leading');
                    this.horse1.classList.remove('leading');
                } else {
                    this.horse1.classList.remove('leading');
                    this.horse2.classList.remove('leading');
                }
                
                // Track lead changes
                if (currentLeader && currentLeader !== lastLeadChange) {
                    if (lastLeadChange !== 0) { // Not the initial leader
                        hasChangedLead = true;
                        this.updateCommentary("🔄 What a lead change! This is incredible!");
                    }
                    lastLeadChange = currentLeader;
                }
            }
            
            // Continue animation until the first horse finishes
            if (!raceEnded) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    finishRace(winner, percent1, percent2, bookableTarget, registrationsTarget, weekTarget, bookableActual, registrationsActual) {
        // Add winner animation
        if (winner === 1) {
            this.horse1.classList.add('winner');
        } else if (winner === 2) {
            this.horse2.classList.add('winner');
        }
        
        // Show confetti for winner
        if (winner !== 'tie') {
            this.createConfetti();
        }
        
        // Show results after a short delay
        setTimeout(() => {
            this.showResults(winner, percent1, percent2, bookableTarget, registrationsTarget, weekTarget, bookableActual, registrationsActual);
        }, 1200);
        
        this.isRacing = false;
        this.startBtn.disabled = false;

        // Stop drum roll
        if (this.drumrollAudio) {
            this.drumrollAudio.pause();
            this.drumrollAudio.currentTime = 0;
        }
    }

    showResults(winner, percent1, percent2, bookableTarget, registrationsTarget, weekTarget, bookableActual, registrationsActual) {
        const winnerText = document.getElementById('winnerText');
        const finalPercent1 = document.getElementById('finalPercent1');
        const finalPercent2 = document.getElementById('finalPercent2');
        const difference = document.getElementById('difference');
        const winnerHighlight = document.getElementById('winnerHighlight');

        // Remove previous winner highlight
        if (this.bookableSection) this.bookableSection.classList.remove('winner');
        if (this.registrationsSection) this.registrationsSection.classList.remove('winner');
        winnerHighlight.textContent = '';

        // Calculate actuals and targets
        let bookableTargetDisplay = '';
        let regsTargetDisplay = '';
        let weekTargetDisplay = '';
        let bookableVsTarget = '';
        let regsVsTarget = '';
        
        if (!isNaN(bookableTarget) && !isNaN(weekTarget)) {
            const bookableShouldBe = (bookableTarget * weekTarget / 100).toFixed(1);
            bookableTargetDisplay = `Target: ${weekTarget}% (${bookableShouldBe})`;
            if (bookableActual >= parseFloat(bookableShouldBe)) {
                bookableVsTarget = '<span style="color:#4CAF50;font-weight:700;">✅ Above target!</span>';
            } else {
                bookableVsTarget = '<span style="color:#ff6b6b;font-weight:700;">📈 Below target</span>';
            }
        }
        
        if (!isNaN(registrationsTarget) && !isNaN(weekTarget)) {
            const regsShouldBe = (registrationsTarget * weekTarget / 100).toFixed(1);
            regsTargetDisplay = `Target: ${weekTarget}% (${regsShouldBe})`;
            if (registrationsActual >= parseFloat(regsShouldBe)) {
                regsVsTarget = '<span style="color:#4CAF50;font-weight:700;">✅ Above target!</span>';
            } else {
                regsVsTarget = '<span style="color:#ff6b6b;font-weight:700;">📈 Below target</span>';
            }
        }

        // Set winner text and highlight
        if (winner === 1) {
            winnerText.textContent = '🏆 BOOKABLE DOMINATES! 🏆';
            winnerText.style.color = '#ffd700';
            if (this.bookableSection) this.bookableSection.classList.add('winner');
            winnerHighlight.textContent = '🎯 Bookable achieved the highest growth this period!';
        } else if (winner === 2) {
            winnerText.textContent = '🏆 REGISTRATIONS RULES! 🏆';
            winnerText.style.color = '#ffd700';
            if (this.registrationsSection) this.registrationsSection.classList.add('winner');
            winnerHighlight.textContent = '📝 Registrations had the strongest performance!';
        } else {
            winnerText.textContent = '🤝 PERFECT TIE! 🤝';
            winnerText.style.color = '#FF9800';
            winnerHighlight.textContent = '⚖️ Both teams achieved identical growth rates!';
        }

        // Update statistics with enhanced formatting
        finalPercent1.innerHTML = `${percent1.toFixed(1)}%<br><span style='font-size:1rem;font-weight:400;opacity:0.8;'>(${bookableActual} / ${bookableTarget})</span>` + 
            (bookableTargetDisplay ? `<br><span style='font-size:0.9rem;font-weight:500;opacity:0.7;'>${bookableTargetDisplay}</span>` : '') + 
            (bookableVsTarget ? `<br>${bookableVsTarget}` : '');
            
        finalPercent2.innerHTML = `${percent2.toFixed(1)}%<br><span style='font-size:1rem;font-weight:400;opacity:0.8;'>(${registrationsActual} / ${registrationsTarget})</span>` + 
            (regsTargetDisplay ? `<br><span style='font-size:0.9rem;font-weight:500;opacity:0.7;'>${regsTargetDisplay}</span>` : '') + 
            (regsVsTarget ? `<br>${regsVsTarget}` : '');
            
        const diff = Math.abs(percent1 - percent2).toFixed(1);
        difference.textContent = `${diff}%`;

        // Enhanced confetti for results
        this.createEnhancedConfetti();

        // Show results
        this.results.style.display = 'block';
        
        // Update commentary for results
        this.updateCommentary("🎉 What an incredible race! Champions emerge!");
    }

    createConfetti() {
        const colors = ['#ffd700', '#ff6b35', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722'];
        
        for (let i = 0; i < 75; i++) { // Increased confetti count
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 2 + 's';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                confetti.style.width = (Math.random() * 8 + 8) + 'px';
                confetti.style.height = confetti.style.width;
                
                this.confettiContainer.appendChild(confetti);
                
                // Remove confetti after animation
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.remove();
                    }
                }, 6000);
            }, i * 30);
        }
    }

    createEnhancedConfetti() {
        // Create multiple bursts for dramatic effect
        this.createConfetti();
        setTimeout(() => this.createConfetti(), 500);
        setTimeout(() => this.createConfetti(), 1000);
    }

    resetRace() {
        // Reset percentages
        if (this.percent1Display) this.percent1Display.textContent = '0%';
        if (this.percent2Display) this.percent2Display.textContent = '0%';
        
        // Show setup panel again
        this.showSetupPanel();
        this.updateFloatingBtnState();
        this.updateCommentary("🔧 Ready for another epic showdown!");
    }

    resetHorses() {
        this.horse1.style.left = '50px';
        this.horse2.style.left = '50px';
        this.horse1.classList.remove('winner', 'leading');
        this.horse2.classList.remove('winner', 'leading');
    }

    showError(message) {
        // Create temporary error message with enhanced styling
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-weight: 700;
            z-index: 10000;
            box-shadow: 0 15px 30px rgba(255, 107, 107, 0.3);
            animation: slideDown 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            border: 2px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            text-align: center;
            font-size: 1.1rem;
        `;
        errorDiv.innerHTML = `⚠️ ${message}`;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(errorDiv);
        
        // Remove error message after 4 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
            if (style.parentNode) {
                style.remove();
            }
        }, 4000);
        
        // Update floating button state after error
        this.updateFloatingBtnState();
    }
}

// Initialize the horse race when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const horseRace = new HorseRace();
    
    // Add enhanced hover effects for horses
    const horses = document.querySelectorAll('.horse');
    horses.forEach((horse, index) => {
        horse.addEventListener('mouseenter', () => {
            if (!horseRace.isRacing) {
                horse.style.transform = 'translateY(-50%) scale(1.05)';
                horse.style.filter = 'drop-shadow(0 8px 20px rgba(255, 215, 0, 0.4))';
            }
        });
        horse.addEventListener('mouseleave', () => {
            if (!horseRace.isRacing) {
                horse.style.transform = 'translateY(-50%) scale(1)';
                horse.style.filter = 'drop-shadow(0 5px 15px rgba(0,0,0,0.3))';
            }
        });
    });

    // Add keyboard shortcuts info
    console.log('🏁 Horse Race Growth Tracker Shortcuts:');
    console.log('⚙️  Space: Toggle setup panel');
    console.log('🏁 Enter: Start race (when setup is open)');
    console.log('🚪 Escape: Close setup panel');
    
    // Add space key shortcut for setup panel
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.target.matches('input')) {
            e.preventDefault();
            horseRace.toggleSetupPanel();
        }
    });
}); 