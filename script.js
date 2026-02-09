class TowerOfHanoi {
    constructor() {
        this.pegs = [[], [], []];
        this.moveCount = 0;
        this.diskCount = 3;
        this.selectedPeg = null;
        this.isAutoSolving = false;
        this.minMoves = 0;
        
        this.initializeElements();
        this.attachEventListeners();
        this.startNewGame();
    }

    initializeElements() {
        // Control elements
        this.diskCountInput = document.getElementById('diskCount');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.autoSolveBtn = document.getElementById('autoSolveBtn');
        this.moveCountElement = document.getElementById('moveCount');
        this.minMovesElement = document.getElementById('minMoves');
        
        // Game elements
        this.pegElements = document.querySelectorAll('.peg');
        this.disksContainers = document.querySelectorAll('.disks');
        
        // Modal elements
        this.winModal = document.getElementById('winModal');
        this.finalMovesElement = document.getElementById('finalMoves');
        this.finalMinMovesElement = document.getElementById('finalMinMoves');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        
        // Audio elements
        this.tapSound = document.getElementById('tapSound');
        this.dropSound = document.getElementById('dropSound');
        this.victorySound = document.getElementById('victorySound');
    }

    attachEventListeners() {
        // Control panel events
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.autoSolveBtn.addEventListener('click', () => this.autoSolve());
        this.diskCountInput.addEventListener('change', () => this.startNewGame());
        this.playAgainBtn.addEventListener('click', () => {
            this.hideWinModal();
            this.startNewGame();
        });

        // Peg click events using pointer events for cross-platform compatibility
        this.pegElements.forEach((peg, index) => {
            peg.addEventListener('pointerdown', (e) => this.handlePegClick(e, index));
        });

        // Prevent context menu on long press for mobile
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handlePegClick(event, pegIndex) {
        event.preventDefault();
        
        if (this.isAutoSolving) return;
        
        if (this.selectedPeg === null) {
            // Select a peg if it has disks
            if (this.pegs[pegIndex].length > 0) {
                this.selectPeg(pegIndex);
            }
        } else {
            // Try to move disk to this peg
            if (this.selectedPeg === pegIndex) {
                // Deselect if clicking the same peg
                this.deselectPeg();
            } else {
                // Try to move disk
                this.moveDisk(this.selectedPeg, pegIndex);
            }
        }
    }

    selectPeg(pegIndex) {
        this.selectedPeg = pegIndex;
        this.pegElements[pegIndex].classList.add('selected');
        
        // Play tap sound when selecting a disk
        this.playTapSound();
        
        // Add visual feedback for selected disk
        const topDisk = this.disksContainers[pegIndex].lastElementChild;
        if (topDisk) {
            topDisk.style.transform = 'translateY(-8px) scale(1.05)';
            topDisk.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.3)';
        }
    }

    deselectPeg(playSound = true) {
        // Play tap sound when deselecting (only if not part of a move)
        if (playSound) {
            this.playTapSound();
        }
        
        // Reset visual feedback for all disks
        this.disksContainers.forEach(container => {
            const disks = container.querySelectorAll('.disk');
            disks.forEach(disk => {
                disk.style.transform = '';
                disk.style.boxShadow = '';
            });
        });
        
        this.selectedPeg = null;
        this.pegElements.forEach(peg => peg.classList.remove('selected'));
    }

    moveDisk(fromPeg, toPeg, isAutoMove = false) {
        // Validate move
        if (!this.isValidMove(fromPeg, toPeg)) {
            if (!isAutoMove) {
                this.showInvalidMoveAnimation(toPeg);
            }
            return false;
        }

        // Perform the move
        const disk = this.pegs[fromPeg].pop();
        this.pegs[toPeg].push(disk);
        
        if (!isAutoMove) {
            this.moveCount++;
            this.updateMoveCount();
        }

        // Play drop sound when disk is successfully moved
        this.playDropSound();

        // Update UI
        this.updatePegDisplay();
        this.deselectPeg(false); // Don't play tap sound when moving disk

        // Check for win condition
        if (this.checkWinCondition()) {
            setTimeout(() => this.showWinModal(), 500);
        }

        return true;
    }

    isValidMove(fromPeg, toPeg) {
        // Can't move from empty peg
        if (this.pegs[fromPeg].length === 0) return false;
        
        // Can move to empty peg
        if (this.pegs[toPeg].length === 0) return true;
        
        // Can only place smaller disk on larger disk
        const fromDisk = this.pegs[fromPeg][this.pegs[fromPeg].length - 1];
        const toDisk = this.pegs[toPeg][this.pegs[toPeg].length - 1];
        
        return fromDisk < toDisk;
    }

    showInvalidMoveAnimation(pegIndex) {
        const peg = this.pegElements[pegIndex];
        peg.style.animation = 'shake 0.6s ease-in-out';
        peg.style.backgroundColor = 'rgba(255, 107, 107, 0.3)';
        peg.style.borderColor = '#ff6b6b';
        
        setTimeout(() => {
            peg.style.animation = '';
            peg.style.backgroundColor = '';
            peg.style.borderColor = '';
        }, 600);
    }

    updatePegDisplay() {
        // Clear all peg displays
        this.disksContainers.forEach(container => {
            container.innerHTML = '';
        });

        // Render disks on each peg
        this.pegs.forEach((peg, pegIndex) => {
            const container = this.disksContainers[pegIndex];
            peg.forEach(diskSize => {
                const diskElement = this.createDiskElement(diskSize);
                container.appendChild(diskElement);
            });
        });
    }

    createDiskElement(size) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.setAttribute('data-size', size);
        disk.textContent = size;
        return disk;
    }

    startNewGame() {
        // Reset game state
        this.diskCount = parseInt(this.diskCountInput.value) || 3;
        this.diskCount = Math.max(3, Math.min(8, this.diskCount));
        this.diskCountInput.value = this.diskCount;
        
        this.pegs = [[], [], []];
        this.moveCount = 0;
        this.selectedPeg = null;
        this.isAutoSolving = false;
        
        // Calculate minimum moves (2^n - 1)
        this.minMoves = Math.pow(2, this.diskCount) - 1;
        
        // Initialize first peg with disks (largest to smallest)
        for (let i = this.diskCount; i >= 1; i--) {
            this.pegs[0].push(i);
        }
        
        // Update UI
        this.updateMoveCount();
        this.updateMinMoves();
        this.updatePegDisplay();
        this.deselectPeg();
        
        // Enable/disable buttons
        this.autoSolveBtn.disabled = false;
        this.diskCountInput.disabled = false;
    }

    updateMoveCount() {
        this.moveCountElement.textContent = this.moveCount;
    }

    updateMinMoves() {
        this.minMovesElement.textContent = this.minMoves;
    }

    checkWinCondition() {
        // Win if all disks are on the last peg
        return this.pegs[2].length === this.diskCount;
    }

    showWinModal() {
        this.finalMovesElement.textContent = this.moveCount;
        this.finalMinMovesElement.textContent = this.minMoves;
        this.winModal.classList.add('show');
        
        // Play victory sound when player wins
        this.playVictorySound();
    }

    hideWinModal() {
        this.winModal.classList.remove('show');
    }

    async autoSolve() {
        if (this.isAutoSolving) return;
        
        this.isAutoSolving = true;
        this.autoSolveBtn.disabled = true;
        this.diskCountInput.disabled = true;
        this.newGameBtn.disabled = true;
        
        // Reset game to initial state for auto-solve
        this.pegs = [[], [], []];
        this.moveCount = 0;
        this.selectedPeg = null;
        
        // Initialize first peg with disks
        for (let i = this.diskCount; i >= 1; i--) {
            this.pegs[0].push(i);
        }
        
        this.updateMoveCount();
        this.updatePegDisplay();
        
        // Solve using recursive algorithm
        await this.solveTower(this.diskCount, 0, 2, 1);
        
        // Re-enable controls
        this.isAutoSolving = false;
        this.autoSolveBtn.disabled = false;
        this.diskCountInput.disabled = false;
        this.newGameBtn.disabled = false;
    }

    async solveTower(n, from, to, aux) {
        if (n === 1) {
            await this.makeAutoMove(from, to);
            return;
        }
        
        await this.solveTower(n - 1, from, aux, to);
        await this.makeAutoMove(from, to);
        await this.solveTower(n - 1, aux, to, from);
    }

    async makeAutoMove(from, to) {
        return new Promise(resolve => {
            setTimeout(() => {
                this.moveDisk(from, to, true);
                this.moveCount++;
                this.updateMoveCount();
                resolve();
            }, 600); // Delay for visual animation
        });
    }

    // Sound effect methods
    playTapSound() {
        if (this.tapSound) {
            this.tapSound.currentTime = 0;
            this.tapSound.play().catch(e => console.log('Tap sound play failed:', e));
        }
    }

    playDropSound() {
        if (this.dropSound) {
            this.dropSound.currentTime = 0;
            this.dropSound.play().catch(e => console.log('Drop sound play failed:', e));
        }
    }

    playVictorySound() {
        if (this.victorySound) {
            this.victorySound.currentTime = 0;
            this.victorySound.play().catch(e => console.log('Victory sound play failed:', e));
        }
    }
}

// Add shake animation for invalid moves
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TowerOfHanoi();
});

// Prevent zoom on double tap for mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
