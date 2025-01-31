class GridNavigation {
    constructor(gridElement) {
        // Éléments DOM
        this.grid = gridElement;


        // Constantes
        this.MOVEMENT_SPEED = .09;
        this.RELEASE_SPEED = 0.1;


        // États


        if (window.innerWidth < 720) {

        } else {


        }



        this.translateX = 0;
        this.translateY = 0;

        this.targetX = this.translateX;
        this.targetY = this.translateY;
        this.isDragging = false;
        this.isTouching = false;
        this.lastX = 0;
        this.lastY = 0;
        this.touchStartX = 0;
        this.touchStartY = 0;


        // Lier les méthodes au contexte de la classe
        this.animate = this.animate.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        // Initialiser les événements
        this.initializeEvents();

        // Démarrer l'animation
        this.animate();
    }

    // Initialisation des écouteurs d'événements
    initializeEvents() {
        // Mouse events
        this.grid.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mouseleave', this.handleMouseUp);

        // Wheel event
        window.addEventListener('wheel', this.handleWheel, { passive: false });

        // Touch events
        this.grid.addEventListener('touchstart', this.handleTouchStart);
        this.grid.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.grid.addEventListener('touchend', this.handleTouchEnd);
    }

    // Fonction d'interpolation
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // Animation principale
    animate() {
        this.translateX = this.lerp(this.translateX, this.targetX, this.MOVEMENT_SPEED);
        this.translateY = this.lerp(this.translateY, this.targetY, this.MOVEMENT_SPEED);
        this.scale = this.lerp(this.scale, this.targetScale, this.ZOOM_SPEED);

        // this.grid.style.transform = `translate3d(${this.translateX}px, ${this.translateY}px, 0) scale(${this.scale})`;
        this.grid.style.transform = `translate3d(${this.translateX}px, ${this.translateY}px, 0)`;

        requestAnimationFrame(this.animate);
    }

    // Gestion de la souris
    handleMouseDown(e) {
        this.isDragging = true;
        this.grid.style.cursor = 'grabbing';
        this.lastX = e.pageX;
        this.lastY = e.pageY;
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        const deltaX = (e.pageX - this.lastX) * 0.5;
        const deltaY = (e.pageY - this.lastY) * 0.5;
        this.targetX += deltaX;
        this.targetY += deltaY;
        this.lastX = e.pageX;
        this.lastY = e.pageY;
    }

    handleMouseUp(e) {


        this.isDragging = false;
        this.grid.style.cursor = 'grab';
    }

    

    // Gestion du tactile
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            this.isTouching = true;
            this.touchStartX = e.touches[0].pageX;
            this.touchStartY = e.touches[0].pageY;

        }
        
    }

    handleTouchMove(e) {
        e.preventDefault();

        if (e.touches.length === 1 && this.isTouching) {
            const deltaX = e.touches[0].pageX - this.touchStartX;
            const deltaY = e.touches[0].pageY - this.touchStartY;

            this.targetX += deltaX;
            this.targetY += deltaY;

            this.touchStartX = e.touches[0].pageX;
            this.touchStartY = e.touches[0].pageY;


        }
    }

    handleTouchEnd() {
        this.isTouching = false;

    }

   

    // Méthode pour centrer la grille
// Méthode pour centrer la grille
centerGrid(forceReset = false) {
    const gridRect = this.grid.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Détection de l'orientation
    const isPortrait = windowHeight > windowWidth;

    // Vérifier si la grille est réduite
    const isReduced = this.grid.closest('.moodboard-container').classList.contains('moodboard-reduced');

    // Configuration des décalages personnalisés pour chaque Media Query
    const offsets = {
        // Smartphones en portrait
        smallPortrait: { x: 0, y: 250 },

        // Smartphones en paysage
        smallLandscape: { x: 90, y: 70 },

        // Tablettes en portrait
        tabletPortrait: { x: 0, y: 200 },

        // Tablettes en paysage
        tabletLandscape: { x: 150, y: 50 },

        // iPad Pro en portrait
        ipadProPortrait: { x: 0, y: 250 },

        // iPad Pro en paysage
        ipadProLandscape: { x: 100, y: 30 },

        // Ordinateurs portables et petits écrans
        laptop: { x: 300, y: 0 },

        // Écrans larges
        largeScreen: { x: 300, y: 0 },
    };

    // Calcul de base pour le centrage
    let marginCenterX = (windowWidth - gridRect.width) / 2;
    let marginCenterY = (windowHeight - gridRect.height) / 2;

    // Appliquer les décalages uniquement si la grille est réduite
    if (isReduced) {
        if (windowWidth <= 479 && isPortrait) {
            // Smartphones en portrait
            marginCenterX += offsets.smallPortrait.x;
            marginCenterY += offsets.smallPortrait.y;
        } else if (windowWidth <= 899 && !isPortrait) {
            // Smartphones en paysage
            marginCenterX += offsets.smallLandscape.x;
            marginCenterY += offsets.smallLandscape.y;
        } else if (windowWidth >= 768 && windowWidth <= 1024 && isPortrait) {
            // Tablettes en portrait
            marginCenterX += offsets.tabletPortrait.x;
            marginCenterY += offsets.tabletPortrait.y;
        } else if (windowWidth >= 768 && windowWidth <= 1024 && !isPortrait) {
            // Tablettes en paysage
            marginCenterX += offsets.tabletLandscape.x;
            marginCenterY += offsets.tabletLandscape.y;
        } else if (windowWidth >= 834 && windowWidth <= 1366 && isPortrait) {
            // iPad Pro en portrait
            marginCenterX += offsets.ipadProPortrait.x;
            marginCenterY += offsets.ipadProPortrait.y;
        } else if (windowWidth >= 834 && windowWidth <= 1366 && !isPortrait) {
            // iPad Pro en paysage
            marginCenterX += offsets.ipadProLandscape.x;
            marginCenterY += offsets.ipadProLandscape.y;
        } else if (windowWidth >= 1025 && windowWidth <= 1440) {
            // Ordinateurs portables
            marginCenterX += offsets.laptop.x;
            marginCenterY += offsets.laptop.y;
        } else if (windowWidth >= 1441) {
            // Écrans larges
            marginCenterX += offsets.largeScreen.x;
            marginCenterY += offsets.largeScreen.y;
        }
    }

    // Appliquer les nouvelles positions
    this.translateX = marginCenterX;
    this.targetX = marginCenterX;

    this.translateY = marginCenterY;
    this.targetY = marginCenterY;

    // Appliquer la transformation
    this.grid.style.transform = `translate3d(${this.translateX}px, ${this.translateY}px, 0)`;
}

    
}

// Exporter la classe pour l'utiliser dans script.js
window.GridNavigation = GridNavigation;