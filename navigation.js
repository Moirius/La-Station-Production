class GridNavigation {
    constructor(gridElement) {
        // Éléments DOM
        this.grid = gridElement;


        // Constantes
        this.MOVEMENT_SPEED = .09;
        this.RELEASE_SPEED = 0.1;
        this.ZOOM_SPEED = 0.15;
        this.ZOOM_SENSITIVITY = 0.0005;
        this.MIN_ZOOM = 2;
        this.MAX_ZOOM = 3.5;
        this.MIN_ZOOM_TOUCH = 0.7;
        this.MAX_ZOOM_TOUCH = 1.5;
        this.ZOOM_SENSITIVITY_TOUCH = 0.001;

        // États


        if (window.innerWidth < 720) {

        } else {


        }

        this.scale = 1;

        this.scaleTouch = 1.5;

        this.translateX = 0;
        this.translateY = 0;
        this.targetScale = this.scale;
        this.targetX = this.translateX;
        this.targetY = this.translateY;
        this.isDragging = false;
        this.isTouching = false;
        this.lastX = 0;
        this.lastY = 0;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastPinchDistance = 0;

        // Lier les méthodes au contexte de la classe
        this.animate = this.animate.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        //this.handleWheel = this.handleWheel.bind(this);
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

        const sensitivity = 0.5;
        const deltaX = (e.pageX - this.lastX) * sensitivity;
        const deltaY = (e.pageY - this.lastY) * sensitivity;

        this.targetX += deltaX;
        this.targetY += deltaY;

        this.lastX = e.pageX;
        this.lastY = e.pageY;
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;

        const finalSpeedX = (e.pageX - this.lastX) * this.RELEASE_SPEED;
        const finalSpeedY = (e.pageY - this.lastY) * this.RELEASE_SPEED;

        this.targetX += finalSpeedX;
        this.targetY += finalSpeedY;

        this.isDragging = false;
        this.grid.style.cursor = 'grab';
    }

    // Gestion du zoom à la molette
    handleWheel(event) {
        event.preventDefault();

        const gridRect = this.grid.getBoundingClientRect();
        if (
            event.clientX >= gridRect.left &&
            event.clientX <= gridRect.right &&
            event.clientY >= gridRect.top &&
            event.clientY <= gridRect.bottom
        ) {
            const delta = -event.deltaY;
            const zoomFactor = delta * this.ZOOM_SENSITIVITY;
            const newScale = Math.min(
                Math.max(this.MIN_ZOOM, this.scale * (1 + zoomFactor)),
                this.MAX_ZOOM
            );

            const gridCenterX = gridRect.left + gridRect.width / 2;
            const gridCenterY = gridRect.top + gridRect.height / 2;
            const distanceX = event.clientX - gridCenterX;
            const distanceY = event.clientY - gridCenterY;

            if (Math.abs(newScale - this.scale) > 0.01) {
                this.targetX = this.translateX - (distanceX * (newScale - this.scale)) / this.scale;
                this.targetY = this.translateY - (distanceY * (newScale - this.scale)) / this.scale;
                this.targetScale = newScale;
            }
        }
    }

    // Calcul de la distance entre deux points tactiles
    getPinchDistance(touches) {
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Gestion du tactile
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            this.isTouching = true;
            this.touchStartX = e.touches[0].pageX;
            this.touchStartY = e.touches[0].pageY;
        } else if (e.touches.length === 2) {
            this.lastPinchDistance = this.getPinchDistance(e.touches);
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
        } else if (e.touches.length === 2) {
            this.handlePinchZoom(e);
        }
    }

    handleTouchEnd() {
        this.isTouching = false;
        this.lastPinchDistance = 0;
    }

    handlePinchZoom(e) {
        if (e.touches.length !== 2) return;

        const currentPinchDistance = this.getPinchDistance(e.touches);
        const pinchZoomFactor = currentPinchDistance / this.lastPinchDistance;
        const newScale = Math.min(
            Math.max(this.MIN_ZOOM_TOUCH, this.scale * pinchZoomFactor),
            this.MAX_ZOOM
        );

        if (Math.abs(newScale - this.scale) > 0.01) {
            const centerX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
            const centerY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
            const gridRect = this.grid.getBoundingClientRect();
            const gridCenterX = gridRect.left + gridRect.width / 2;
            const gridCenterY = gridRect.top + gridRect.height / 2;
            const distanceX = centerX - gridCenterX;
            const distanceY = centerY - gridCenterY;

            this.targetX = this.translateX - (distanceX * (newScale - this.scale)) / this.scale;
            this.targetY = this.translateY - (distanceY * (newScale - this.scale)) / this.scale;
            this.targetScale = newScale;
        }

        this.lastPinchDistance = currentPinchDistance;
    }

    // Méthode pour centrer la grille
    centerGrid(forceReset = false) {
        const gridRect = this.grid.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        console.log(gridRect);

        // if (forceReset) {
        //     this.targetX = (windowWidth - gridRect.width * this.scaleTouch) / 2;
        //     this.targetY = (windowHeight - gridRect.height * this.scaleTouch) / 2;
        //     this.translateX = this.targetX;
        //     this.translateY = this.targetY;
        // } else {
        //     this.translateX = (windowWidth - gridRect.width * this.scaleTouch) / 2;
        //     this.translateY = (windowHeight - gridRect.height * this.scaleTouch) / 2;
        // }
        let marginCenterY = (window.innerHeight - gridRect.height)/2;
        

        let marginCenterX = (window.innerWidth - gridRect.width)/2;
        

        this.translateX = marginCenterX;
        this.targetX = marginCenterX;

        this.translateY = marginCenterY;
        this.targetY = marginCenterY;
        


        // this.grid.style.transform = `translate3d(${this.translateX}px, ${this.translateY}px, 0) scale(${this.scaleTouch})`;
        this.grid.style.transform = `translate3d(${this.translateX}px, ${this.translateY}px, 0)`;
    }
}

// Exporter la classe pour l'utiliser dans script.js
window.GridNavigation = GridNavigation;