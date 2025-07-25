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
        
        this.initializeEventListeners();
        this.hideSetupPanel();
    }

    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.startRace());
        this.resetBtn.addEventListener('click', () => this.resetRace());
        this.settingsGear.addEventListener('click', () => this.toggleSetupPanel());
        this.settingsOverlay.addEventListener('click', () => this.hideSetupPanel());
        this.inputOverlay.addEventListener('click', () => this.hideSetupPanel());
        this.floatingStartBtn.addEventListener('click', () => this.startRace());
        
        // Update floating button state on input
        document.getElementById('bookableActual').addEventListener('input', () => this.updateFloatingBtnState());
        document.getElementById('bookableTarget').addEventListener('input', () => this.updateFloatingBtnState());
        document.getElementById('registrationsActual').addEventListener('input', () => this.updateFloatingBtnState());
        document.getElementById('registrationsTarget').addEventListener('input', () => this.updateFloatingBtnState());
        document.getElementById('weekTarget').addEventListener('input', () => this.updateFloatingBtnState());
        
        // Allow Enter key to start race
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isRacing && this.inputSection.classList.contains('show')) {
                this.startRace();
            }
        });
    }

    showSetupPanel() {
        this.inputSection.classList.add('show');
        this.inputSection.classList.remove('hide');
        this.settingsOverlay.classList.add('active');
        this.inputOverlay.classList.add('active');
        this.floatingStartBtn.style.display = 'none';
    }

    hideSetupPanel() {
        this.inputSection.classList.remove('show');
        this.inputSection.classList.add('hide');
        this.settingsOverlay.classList.remove('active');
        this.inputOverlay.classList.remove('active');
        this.updateFloatingBtnState();
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
        
        // Calculate race parameters
        const trackWidth = this.raceTrack.offsetWidth - 150; // Account for horse width and finish line
        const maxSpeed = 3; // pixels per frame
        const minSpeed = 1;
        
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
            this.drumrollAudio.play();
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
            
            // Add momentum and random bursts
            if (!finished1) {
                // Random speed variations to create excitement
                const randomFactor1 = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
                const burstChance1 = Math.random() < 0.08; // 8% chance of speed burst (increased)
                const burstMultiplier1 = burstChance1 ? 1.5 : 1;
                
                // Add visual feedback for speed bursts
                if (burstChance1) {
                    this.horse1.querySelector('.horse-img').classList.add('speed-burst');
                    setTimeout(() => {
                        this.horse1.querySelector('.horse-img').classList.remove('speed-burst');
                    }, 300);
                }
                
                // Momentum system - horses can gain/lose momentum
                if (Math.random() < 0.15) { // 15% chance to change momentum (increased)
                    momentum1 = (Math.random() - 0.5) * 0.8; // -0.4 to 0.4 (increased range)
                }
                
                const currentSpeed1 = (baseSpeed1 + momentum1) * randomFactor1 * burstMultiplier1;
                pos1 += currentSpeed1;
                this.horse1.style.left = `${pos1}px`;
                
                if (pos1 >= trackWidth) {
                    finished1 = true;
                    pos1 = trackWidth;
                    this.horse1.style.left = `${pos1}px`;
                    if (!raceEnded) {
                        raceEnded = true;
                        this.finishRace(winner, percent1, percent2, bookableTarget, registrationsTarget, weekTarget, bookableActual, registrationsActual);
                        return;
                    }
                }
            }
            
            if (!finished2) {
                // Random speed variations to create excitement
                const randomFactor2 = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
                const burstChance2 = Math.random() < 0.08; // 8% chance of speed burst (increased)
                const burstMultiplier2 = burstChance2 ? 1.5 : 1;
                
                // Add visual feedback for speed bursts
                if (burstChance2) {
                    this.horse2.querySelector('.horse-img').classList.add('speed-burst');
                    setTimeout(() => {
                        this.horse2.querySelector('.horse-img').classList.remove('speed-burst');
                    }, 300);
                }
                
                // Momentum system - horses can gain/lose momentum
                if (Math.random() < 0.15) { // 15% chance to change momentum (increased)
                    momentum2 = (Math.random() - 0.5) * 0.8; // -0.4 to 0.4 (increased range)
                }
                
                const currentSpeed2 = (baseSpeed2 + momentum2) * randomFactor2 * burstMultiplier2;
                pos2 += currentSpeed2;
                this.horse2.style.left = `${pos2}px`;
                
                if (pos2 >= trackWidth) {
                    finished2 = true;
                    pos2 = trackWidth;
                    this.horse2.style.left = `${pos2}px`;
                    if (!raceEnded) {
                        raceEnded = true;
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
                        pos1 += baseSpeed1 * 2;
                        this.horse1.style.left = `${pos1}px`;
                        hasChangedLead = true;
                    } else if (winner === 2 && pos1 > pos2) {
                        // Give horse 2 a significant boost to take the lead
                        pos2 += baseSpeed2 * 2;
                        this.horse2.style.left = `${pos2}px`;
                        hasChangedLead = true;
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
                        pos1 += baseSpeed1 * 0.5;
                        this.horse1.style.left = `${pos1}px`;
                    } else if (winner === 2 && pos1 > pos2) {
                        // Give horse 2 a boost if it's behind but should win
                        pos2 += baseSpeed2 * 0.5;
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
        }, 1000);
        
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
        const bookableSection = finalPercent1.closest('.growth-section');
        const regsSection = finalPercent2.closest('.growth-section');

        // Remove previous winner highlight
        bookableSection.classList.remove('winner');
        regsSection.classList.remove('winner');
        winnerHighlight.textContent = '';

        // Calculate actuals and targets
        let bookableTargetDisplay = '';
        let regsTargetDisplay = '';
        let weekTargetDisplay = '';
        let bookableVsTarget = '';
        let regsVsTarget = '';
        if (!isNaN(bookableTarget) && !isNaN(weekTarget)) {
            const bookableShouldBe = (bookableTarget * weekTarget / 100).toFixed(1);
            bookableTargetDisplay = `Target for this week: ${weekTarget}% (${bookableShouldBe})`;
            if (bookableActual >= parseFloat(bookableShouldBe)) {
                bookableVsTarget = '<span style="color:#4CAF50;font-weight:700;">Above target 🎉</span>';
            } else {
                bookableVsTarget = '<span style="color:#ff6b6b;font-weight:700;">Below target</span>';
            }
        }
        if (!isNaN(registrationsTarget) && !isNaN(weekTarget)) {
            const regsShouldBe = (registrationsTarget * weekTarget / 100).toFixed(1);
            regsTargetDisplay = `Target for this week: ${weekTarget}% (${regsShouldBe})`;
            if (registrationsActual >= parseFloat(regsShouldBe)) {
                regsVsTarget = '<span style="color:#4CAF50;font-weight:700;">Above target 🎉</span>';
            } else {
                regsVsTarget = '<span style="color:#ff6b6b;font-weight:700;">Below target</span>';
            }
        }

        // Set winner text and highlight
        if (winner === 1) {
            winnerText.textContent = '🏆 Bookable Wins! 🏆';
            winnerText.style.color = '#ffe066';
            bookableSection.classList.add('winner');
            winnerHighlight.textContent = 'Bookable had the highest growth this cycle!';
        } else if (winner === 2) {
            winnerText.textContent = '🏆 Registrations Wins! 🏆';
            winnerText.style.color = '#ffe066';
            regsSection.classList.add('winner');
            winnerHighlight.textContent = 'Registrations had the highest growth this cycle!';
        } else {
            winnerText.textContent = '🤝 It\'s a Tie! 🤝';
            winnerText.style.color = '#FF9800';
            winnerHighlight.textContent = 'Both Bookable and Registrations grew equally!';
        }

        // Update statistics
        finalPercent1.innerHTML = `${percent1.toFixed(1)}%<br><span style='font-size:1rem;font-weight:400;'>(${bookableActual} / ${bookableTarget})</span>` + (bookableTargetDisplay ? `<br><span style='font-size:1rem;font-weight:400;'>${bookableTargetDisplay}</span>` : '') + (bookableVsTarget ? `<br>${bookableVsTarget}` : '');
        finalPercent2.innerHTML = `${percent2.toFixed(1)}%<br><span style='font-size:1rem;font-weight:400;'>(${registrationsActual} / ${registrationsTarget})</span>` + (regsTargetDisplay ? `<br><span style='font-size:1rem;font-weight:400;'>${regsTargetDisplay}</span>` : '') + (regsVsTarget ? `<br>${regsVsTarget}` : '');
        const diff = Math.abs(percent1 - percent2).toFixed(1);
        difference.textContent = `${diff}%`;

        // Show confetti for winner or tie
        this.createConfetti();

        // Show results
        this.results.style.display = 'block';
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 2 + 's';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                
                this.confettiContainer.appendChild(confetti);
                
                // Remove confetti after animation
                setTimeout(() => {
                    confetti.remove();
                }, 5000);
            }, i * 50);
        }
    }

    resetRace() {
        // Show setup panel again
        this.showSetupPanel();
        this.updateFloatingBtnState();
    }

    resetHorses() {
        this.horse1.style.left = '50px';
        this.horse2.style.left = '50px';
    }

    showError(message) {
        // Create temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff6b6b;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            animation: slideDown 0.3s ease;
        `;
        errorDiv.textContent = message;
        
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
        
        // Remove error message after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
            style.remove();
        }, 3000);
    }
}

// Initialize the horse race when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HorseRace();
    
    // Add some fun hover effects
    const horses = document.querySelectorAll('.horse-body');
    horses.forEach(horse => {
        horse.addEventListener('mouseenter', () => {
            horse.style.transform = 'scale(1.1)';
        });
        horse.addEventListener('mouseleave', () => {
            horse.style.transform = 'scale(1)';
        });
    });
    
    // Add some sample data buttons for quick testing
    const inputSection = document.querySelector('.input-section');
    const sampleDataDiv = document.createElement('div');
    sampleDataDiv.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 15px;
    `;
    
    const sampleData = [
        { label: 'Close Race', p1: 45, p2: 48 },
        { label: 'Big Win', p1: 25, p2: 75 },
        { label: 'Tie', p1: 50, p2: 50 }
    ];
    
    sampleData.forEach(data => {
        const btn = document.createElement('button');
        btn.textContent = data.label;
        btn.style.cssText = `
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 8px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
        `;
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
        });
        btn.addEventListener('click', () => {
            document.getElementById('bookableActual').value = data.p1;
            document.getElementById('registrationsActual').value = data.p2;
        });
        sampleDataDiv.appendChild(btn);
    });
    
    inputSection.appendChild(sampleDataDiv);
}); 