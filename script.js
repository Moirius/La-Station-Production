document.addEventListener("DOMContentLoaded", function () {
    // Éléments DOM
    const moodboard = document.querySelector('.moodboard-grid');
    const modal = document.getElementById("youtube-modal");
    const closeModal = document.querySelector(".close");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const logoContainer = document.getElementById('logo-container');
    const logoImage = document.getElementById('logo-image');
    const creditsPanel = createCreditsPanel();

    // État de la modale
    let isModalActive = false;

    // Initialiser la navigation
    const gridNavigation = new GridNavigation(moodboard);

    // Fonctions de logging
    

    // Gestion du redimensionnement
    window.addEventListener('resize', () => {
        console.log("Fenêtre redimensionnée, recentrage...");
        gridNavigation.centerGrid();
    });
























    // Chargement des miniatures depuis le fichier JSON
    function loadMiniatures() {
        fetch('videos.json')
            .then(response => response.json())
            .then(data => {
                const miniatures = [];
                let totalHorizontal = 0;
                let totalVertical = 0;
                let totalSquare = 0;

                // Première passe : compter les différents formats
                data.forEach(video => {
                    if (!video.miniatureRoot) {
                        console.error(`Chemin racine manquant pour : ${video.title}`);
                        return;
                    }

                    video.miniatures.forEach(() => {
                        switch (video.format) {
                            case 'horizontal': totalHorizontal++; break;
                            case 'vertical': totalVertical++; break;
                            case 'square': totalSquare++; break;
                        }
                    });
                });

                console.log('Statistiques des formats:', {
                    horizontal: totalHorizontal,
                    vertical: totalVertical,
                    square: totalSquare,
                    total: totalHorizontal + totalVertical + totalSquare
                });

                // Deuxième passe : création des miniatures
                data.forEach(video => {
                    video.miniatures.forEach(imagePath => {
                        // Création du conteneur de la miniature
                        const miniatureDiv = document.createElement('div');
                        miniatureDiv.className = 'miniature';
                        miniatureDiv.dataset.videoUrl = video.url;
                        miniatureDiv.dataset.type = video.type;

                        // Ajout de la classe de format
                        if (video.format === "vertical") {
                            miniatureDiv.classList.add('vertical');
                        } else if (video.format === "horizontal") {
                            miniatureDiv.classList.add('horizontal');
                        } else if (video.format === "square") {
                            miniatureDiv.classList.add('square');
                        }

                        // Création et configuration de l'image
                        const imgElement = document.createElement('img');
                        //imgElement.dataset.src = `${video.miniatureRoot}/${imagePath}`;
                        imgElement.dataset.src = `${video.miniatureRoot}/${imagePath}`;
                        imgElement.alt = video.title;
                        imgElement.classList.add('lazy');
                        imgElement.dataset.format = video.format;

                        // Ajout de l'image à la miniature
                        miniatureDiv.appendChild(imgElement);

                        // Gestion du clic sur la miniature
                        miniatureDiv.addEventListener('click', () => {
                            fetch('videos.json')
                                .then(response => response.json())
                                .then(data => {
                                    const videoData = data.find(v => v.url === video.url);
                                    if (videoData) {
                                        openYoutubeModal(video.url, videoData);
                                    }
                                });
                        });

                        miniatures.push(miniatureDiv);
                    });
                });

                // Ajout des miniatures vides pour compléter la grille si nécessaire
                const targetCount = 230; // Nombre total souhaité de miniatures
                if (miniatures.length < targetCount) {
                    fillGrid(miniatures, targetCount);
                }

                // Mélange des miniatures
                shuffleArray(miniatures);

                // Ajout des miniatures à la grille
                miniatures.forEach(miniature => {
                    moodboard.appendChild(miniature);
                    const img = miniature.querySelector('img');
                    if (img) observeImage(img);
                });

                // Log des dimensions de la grille
                const gridRect = moodboard.getBoundingClientRect();
                console.log('Dimensions de la grille :', {
                    largeurTotale: Math.round(gridRect.width) + 'px',
                    hauteurTotale: Math.round(gridRect.height) + 'px',
                    nombreColonnes: 25,
                    nombreLignes: Math.ceil(miniatures.length / 25),
                    espacementEntreElements: getComputedStyle(moodboard).gap,
                    nombreTotalMiniatures: miniatures.length
                });

                // Centrer la grille après chargement
                gridNavigation.centerGrid();
                console.log("Grille centrée après le chargement des miniatures");

            })
            .catch(error => {
                console.error('Erreur lors du chargement des miniatures:', error);
                // Afficher un message d'erreur à l'utilisateur si nécessaire
            });
    }



    // Fonction modifiée pour créer des miniatures vides avec les bons ratios
    function fillGrid(miniatures, targetCount) {
        let currentLength = miniatures.length;
        let emptyCount = 0;

        for (let i = 0; i < targetCount - currentLength; i++) {
            const emptyDiv = document.createElement('div');
            if (i % 3 === 0) {
                emptyDiv.className = 'miniature miniature-vide-horizontal';
            } else if (i % 3 === 1) {
                emptyDiv.className = 'miniature miniature-vide-vertical';
            } else {
                emptyDiv.className = 'miniature miniature-vide-square';
            }
            miniatures.push(emptyDiv);
            emptyCount++;
        }

        console.log(`Nombre de miniatures vides créées : ${emptyCount}`);
    }



    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }



    function observeImage(image) {
        if (!(image instanceof HTMLImageElement)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    image.src = image.dataset.src;
                    image.onload = () => image.classList.add('loaded');
                } else {
                    image.removeAttribute("src");
                    image.classList.remove('loaded');
                }
            });
        }, { rootMargin: '200px' });
        observer.observe(image);
    }



    function openYoutubeModal(videoUrl) {
        fetch('videos.json')
            .then(response => response.json())
            .then(data => {
                const videoData = data.find(v => v.url === videoUrl);
                if (videoData) {
                    showCredits(videoData);
                    const player = document.getElementById("youtube-player");
                    const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^/]+\/[^/]+\/|(?:v|embed)\/|[^v]+?\?v=)|youtu\.be\/)([^&?#]+)/)[1];
                    player.src = `https://www.youtube.com/embed/${videoId}`;
                    modal.classList.add('active');
                    isModalActive = true; // Modale ouverte
                }
            });
    }





    closeModal.addEventListener("click", () => {
        modal.classList.remove('active');
        const player = document.getElementById("youtube-player");
        player.src = "";

        // Fermer également les crédits
        const creditsPanel = document.querySelector('.credits-panel');
        if (creditsPanel) {
            creditsPanel.classList.remove('active'); // Masquer les crédits
        }

        // Réinitialiser l'état de la modale
        isModalActive = false;
    });





    function createCreditsPanel() {
        const panel = document.createElement('div');
        panel.className = 'credits-panel';
        panel.innerHTML = `
            <span class="credits-close">×</span>
            <div class="credits-content"></div>
        `;
        document.body.appendChild(panel);

        // Gestion de la fermeture
        panel.querySelector('.credits-close').addEventListener('click', () => {
            panel.classList.remove('active');
            // Fermer aussi la modale YouTube si elle est ouverte
            modal.classList.remove('active');
            const player = document.getElementById("youtube-player");
            if (player) player.src = "";
        });

        return panel;
    }





    function showCredits(videoData) {
        const panel = document.querySelector('.credits-panel') || createCreditsPanel();
        const content = panel.querySelector('.credits-content');

        let html = `
            <div class="credits-header">
                <h2>${videoData.title}</h2>
            </div>
        `;

        if (videoData.credits) {
            // Production
            if (videoData.credits.production) {
                html += `
                    <div class="credits-section">
                        <div class="credits-role">${videoData.credits.production.label}</div>
                        <div class="credits-names">${videoData.credits.production.value}</div>
                    </div>
                `;
            }

            // Équipe principale
            if (videoData.credits.team) {
                videoData.credits.team.forEach(credit => {
                    html += `
                        <div class="credits-section">
                            <div class="credits-role">${credit.role}</div>
                            <div class="credits-names">
                                ${credit.names.map(name =>
                        `<span class="credits-name" data-name="${name}">${name}</span>`
                    ).join(' ')}
                            </div>
                        </div>
                    `;
                });
            }

            // Crédits additionnels
            if (videoData.credits.additional) {
                videoData.credits.additional.forEach(credit => {
                    html += `
                        <div class="credits-section">
                            <div class="credits-role">${credit.role}</div>
                            <div class="credits-names">
                                ${credit.names.map(name =>
                        `<span class="credits-name" data-name="${name}">${name}</span>`
                    ).join(' ')}
                            </div>
                        </div>
                    `;
                });
            }
        }

        content.innerHTML = html;
        panel.classList.add('active');

        // Ajout des événements de filtrage sur les noms
        panel.querySelectorAll('.credits-name').forEach(nameElement => {
            nameElement.addEventListener('click', () => {
                const name = nameElement.dataset.name;
                filterByCredit(name);

                // Fermer la modale et les crédits après le filtrage
                modal.classList.remove('active');
                panel.classList.remove('active');
                const player = document.getElementById("youtube-player");
                if (player) player.src = "";
            });
        });
    }

    function filterByCredit(name) {
        const allMiniatures = document.querySelectorAll('.miniature');

        fetch('videos.json')
            .then(response => response.json())
            .then(data => {
                // Trouver toutes les vidéos qui contiennent ce nom dans les crédits
                const matchingVideos = data.filter(video => {
                    if (!video.credits) return false;

                    const allCredits = [
                        ...(video.credits.team || []),
                        ...(video.credits.additional || [])
                    ];

                    return allCredits.some(credit =>
                        credit.names.includes(name)
                    );
                }).map(video => video.url);

                // Filtrer les miniatures
                allMiniatures.forEach(miniature => {
                    if (matchingVideos.includes(miniature.dataset.videoUrl)) {
                        miniature.style.display = 'block';
                    } else {
                        miniature.style.display = 'none';
                    }
                });

                // Recentrer la grille
                gridNavigation.centerGrid(true);

                // Réactiver les interactions de zoom et déplacement
                isModalActive = false;
            });
    }









    function filterMiniatures(filterType) {
        const allMiniatures = document.querySelectorAll('.miniature');
        let visibleCount = 0;
        let hiddenCount = 0;

        const myGrid = document.querySelector('.moodboard-grid');

        
        myGrid.classList.add('filter-mode');

        if (filterType == 'all') {
            myGrid.classList.remove('filter-mode');
        }

        


        allMiniatures.forEach(miniature => {
            if (filterType === 'all' || miniature.dataset.type === filterType) {
                miniature.style.display = 'block';
                visibleCount++;
            } else {
                miniature.style.display = 'none';
                hiddenCount++;
            }
        });

        console.log(`Filtrage appliqué : ${filterType}`);
        console.log(`Miniatures visibles : ${visibleCount}`);
        console.log(`Miniatures masquées : ${hiddenCount}`);
    }


    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            button.classList.add('active');

            const filterType = button.dataset.type;
            filterMiniatures(filterType);

            // Forcer un recentrage complet lors du filtrage

            // setTimeout(() => {
                gridNavigation.centerGrid(true);
                
            // }, 1500);
        });
    });






    // Charger les miniatures et initialiser l'affichage
    loadMiniatures(() => {
        filterMiniatures('all'); // Par défaut, afficher tout
    });









});