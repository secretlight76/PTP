/**
 * theme.js - Gestion du thème dark/light mode
 */

// Récupérer le thème sauvegardé ou utiliser la préférence système
function getInitialTheme() {
    const savedTheme = localStorage.getItem('ptp-theme');
    if (savedTheme) {
        return savedTheme;
    }

    // Vérifier la préférence système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }

    return 'light';
}

// Appliquer le thème
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ptp-theme', theme);

    // Mettre à jour l'icône du bouton
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('svg');
        if (theme === 'dark') {
            // Icône soleil (pour passer en mode clair)
            icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            `;
        } else {
            // Icône lune (pour passer en mode sombre)
            icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            `;
        }
    }
}

// Toggle le thème
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

// Initialiser le thème au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);

    // Ajouter l'écouteur sur le bouton toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// Écouter les changements de préférence système
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('ptp-theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}
