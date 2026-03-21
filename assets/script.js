// 🔥 COMPLETE FIXED script.js - Copy सब कुछ
// Global variables
let currentResults = [];
let favorites = JSON.parse(localStorage.getItem('countryFavorites')) || [];
let currentMap = null;
let debounceTimer;

// 🔥 DUMMY COUNTRIES DATA - बिना Internet काम करेगा
const DUMMY_COUNTRIES = [
  {
    "name": { "common": "India 🇮🇳" },
    "flags": { "png": "https://flagcdn.com/w320/in.png" },
    "population": 1380004385,
    "region": "Asia",
    "capital": ["New Delhi"],
    "currencies": { "INR": { "name": "Indian rupee" } },
    "languages": { "hin": "Hindi", "eng": "English" },
    "latlng": [28.61, 77.20],
    "tld": [".in"],
    "cca3": "IND"
  },
  {
    "name": { "common": "United States 🇺🇸" },
    "flags": { "png": "https://flagcdn.com/w320/us.png" },
    "population": 331002651,
    "region": "Americas",
    "capital": ["Washington, D.C."],
    "currencies": { "USD": { "name": "United States dollar" } },
    "languages": { "eng": "English" },
    "latlng": [38.89, -77.03],
    "tld": [".us"],
    "cca3": "USA"
  },
  {
    "name": { "common": "Brazil 🇧🇷" },
    "flags": { "png": "https://flagcdn.com/w320/br.png" },
    "population": 212559417,
    "region": "Americas",
    "capital": ["Brasília"],
    "currencies": { "BRL": { "name": "Brazilian real" } },
    "languages": { "por": "Portuguese" },
    "latlng": [-15.79, -47.93],
    "tld": [".br"],
    "cca3": "BRA"
  },
  {
    "name": { "common": "Japan 🇯🇵" },
    "flags": { "png": "https://flagcdn.com/w320/jp.png" },
    "population": 125360000,
    "region": "Asia",
    "capital": ["Tokyo"],
    "currencies": { "JPY": { "name": "Japanese yen" } },
    "languages": { "jpn": "Japanese" },
    "latlng": [35.68, 139.77],
    "tld": [".jp"],
    "cca3": "JPN"
  },
  {
    "name": { "common": "Germany 🇩🇪" },
    "flags": { "png": "https://flagcdn.com/w320/de.png" },
    "population": 83019253,
    "region": "Europe",
    "capital": ["Berlin"],
    "currencies": { "EUR": { "name": "Euro" } },
    "languages": { "deu": "German" },
    "latlng": [52.52, 13.40],
    "tld": [".de"],
    "cca3": "DEU"
  },
  {
    "name": { "common": "France 🇫🇷" },
    "flags": { "png": "https://flagcdn.com/w320/fr.png" },
    "population": 67345728,
    "region": "Europe",
    "capital": ["Paris"],
    "currencies": { "EUR": { "name": "Euro" } },
    "languages": { "fra": "French" },
    "latlng": [46.00, 2.00],
    "tld": [".fr"],
    "cca3": "FRA"
  },
  {
    "name": { "common": "Nigeria 🇳🇬" },
    "flags": { "png": "https://flagcdn.com/w320/ng.png" },
    "population": 206139589,
    "region": "Africa",
    "capital": ["Abuja"],
    "currencies": { "NGN": { "name": "Nigerian naira" } },
    "languages": { "eng": "English" },
    "latlng": [10.00, 8.00],
    "tld": [".ng"],
    "cca3": "NGA"
  }
];

// Initialize app
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    setupEventListeners();
    updateFavoritesCount();
    renderFavorites();
    applyTheme();
}

// Event Listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const themeToggle = document.getElementById('themeToggle');
    const favoritesBtn = document.getElementById('favoritesBtn');
    const tabs = document.querySelectorAll('.tab-btn');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');

    searchInput.addEventListener('input', debounce(searchCountries, 500));
    themeToggle.addEventListener('click', toggleTheme);
    favoritesBtn.addEventListener('click', () => showTab('favorites'));
    
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const targetTab = e.currentTarget.dataset.tab;
            showTab(targetTab);
        });
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// 🔥 FIXED SEARCH FUNCTION - Dummy Data + Real API
async function searchCountries(e) {
    const query = e.target.value.trim().toLowerCase();
    const spinner = document.getElementById('searchSpinner');
    
    if (query.length === 0) {
        clearResults();
        return;
    }

    spinner.style.display = 'block';
    showTab('results');

    try {
        // Try Real API first
        const response = await fetch(`https://restcountries.com/v3.1/name/${query}?fields=name,flags,population,region,capital,currencies,languages,latlng,tld,cca3`);
        
        if (response.ok) {
            const countries = await response.json();
            currentResults = countries.slice(0, 12);
            spinner.style.display = 'none';
            renderResults(currentResults);
            return;
        }
    } catch (error) {
        console.log('API failed, using dummy data');
    }

    // 🔥 FALLBACK TO DUMMY DATA
    spinner.style.display = 'none';
    const filtered = DUMMY_COUNTRIES.filter(country => 
        country.name.common.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        showError('Country not found 😅<br>Try: India, USA, Japan, Brazil, Germany');
        return;
    }

    currentResults = filtered;
    renderResults(currentResults);
}

// Render Results
function renderResults(countries) {
    const grid = document.getElementById('resultsGrid');
    const emptyState = document.getElementById('emptyState');

    if (countries.length === 0) {
        grid.innerHTML = emptyState.outerHTML;
        return;
    }

    if (emptyState) emptyState.remove();
    grid.innerHTML = countries.map(country => createCountryCard(country)).join('');

    // Add click listeners to cards
    document.querySelectorAll('.country-card').forEach((card, index) => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn')) {
                const cca3 = card.dataset.cca3;
                const country = countries.find(c => c.cca3 === cca3);
                openModal(country);
            }
        });
    });

    // Add favorite button listeners
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(btn.dataset.cca3);
        });
    });
}

// Create Country Card
function createCountryCard(country) {
    const isFavorite = favorites.some(fav => fav.cca3 === country.cca3);
    const capital = country.capital?.[0] || 'N/A';
    const currency = Object.values(country.currencies || {})[0]?.name || 'N/A';
    const languages = Object.values(country.languages || {}).join(', ') || 'N/A';

    return `
        <div class="country-card" data-cca3="${country.cca3}">
            <img class="flag" src="${country.flags.png}" alt="${country.name.common}" loading="lazy">
            <button class="favorite-btn ${isFavorite ? 'is-favorite' : ''}" data-cca3="${country.cca3}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                <i class="fas ${isFavorite ? 'fa-heart' : 'fa-heart-regular'} fa-sm"></i>
            </button>
            <div class="card-content">
                <h3 class="card-title">${country.name.common}</h3>
                <div class="card-info">
                    <div class="card-info-item">
                        <i class="fas fa-users"></i>
                        <span>${formatPopulation(country.population)}</span>
                    </div>
                    <div class="card-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${country.region}</span>
                    </div>
                    <div class="card-info-item">
                        <i class="fas fa-landmark"></i>
                        <span>${capital}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Clear Results
function clearResults() {
    const grid = document.getElementById('resultsGrid');
    grid.innerHTML = `
        <div class="empty-state" id="emptyState">
            <i class="fas fa-search-location"></i>
            <h3>Search for a country to get started</h3>
            <p>Enter a country name above to explore its details</p>
        </div>
    `;
}

// Show Error
function showError(message) {
    const grid = document.getElementById('resultsGrid');
    grid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Oops!</h3>
            <p>${message}</p>
        </div>
    `;
}

// Tab Switching
function showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');

    if (tabName === 'favorites') {
        renderFavorites();
    }
}

// Favorites Management
function toggleFavorite(cca3) {
    const index = favorites.findIndex(fav => fav.cca3 === cca3);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        const country = [...currentResults, ...favorites].find(c => c.cca3 === cca3);
        if (country) favorites.unshift(country); // Add to beginning
    }

    localStorage.setItem('countryFavorites', JSON.stringify(favorites));
    updateFavoritesCount();
    
    // Refresh both grids
    if (currentResults.length > 0) renderResults(currentResults);
    renderFavorites();
}

function renderFavorites() {
    const grid = document.getElementById('favoritesGrid');
    const emptyState = document.getElementById('favoritesEmpty');

    if (favorites.length === 0) {
        grid.innerHTML = emptyState.outerHTML;
        return;
    }

    if (emptyState) emptyState.remove();
    grid.innerHTML = favorites.map(country => createCountryCard(country)).join('');

    document.querySelectorAll('#favoritesGrid .country-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn')) {
                openModal(favorites.find(c => c.cca3 === card.dataset.cca3));
            }
        });
    });

    document.querySelectorAll('#favoritesGrid .favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(btn.dataset.cca3);
        });
    });
}

function updateFavoritesCount() {
    const count = document.getElementById('favoritesCount');
    if (count) count.textContent = favorites.length;
}

// Modal Functions
function openModal(country) {
    document.getElementById('modalTitle').textContent = country.name.common;
    document.getElementById('modalFlag').src = country.flags.png;
    document.getElementById('modalFlag').alt = country.name.common;
    
    renderModalDetails(country);
    setTimeout(() => initMap(country.latlng[0], country.latlng[1], country.name.common), 100);
    
    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function renderModalDetails(country) {
    const currencies = Object.entries(country.currencies || {}).map(([code, data]) => 
        `${data.name} (${code})`
    ).join(', ') || 'N/A';
    
    const languages = Object.values(country.languages || {}).join(', ') || 'N/A';
    const capital = country.capital?.[0] || 'N/A';
    const tld = country.tld?.[0] || 'N/A';

    document.getElementById('modalDetails').innerHTML = `
        <div class="detail-item">
            <h4><i class="fas fa-city"></i> Capital</h4>
            <p>${capital}</p>
        </div>
        <div class="detail-item">
            <h4><i class="fas fa-users"></i> Population</h4>
            <p>${formatPopulation(country.population)}</p>
        </div>
        <div class="detail-item">
            <h4><i class="fas fa-globe"></i> Region</h4>
            <p>${country.region}</p>
        </div>
        <div class="detail-item">
            <h4><i class="fas fa-money-bill-wave"></i> Currency</h4>
            <p>${currencies}</p>
        </div>
        <div class="detail-item">
            <h4><i class="fas fa-comments"></i> Languages</h4>
            <p>${languages}</p>
        </div>
        <div class="detail-item">
            <h4><i class="fas fa-globe-asia"></i> Top Level Domain</h4>
            <p>${tld}</p>
        </div>
    `;
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
    if (currentMap) {
        currentMap.remove();
        currentMap = null;
    }
}

// Map Functions
function initMap(lat, lng, countryName) {
    const mapContainer = document.getElementById('mapContainer');
    mapContainer.innerHTML = ''; // Clear previous map
    
    if (typeof L === 'undefined') {
        mapContainer.innerHTML = '<p>Map loading... (needs internet)</p>';
        return;
    }
    
    if (currentMap) currentMap.remove();
    currentMap = L.map('mapContainer').setView([lat, lng], 8);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(currentMap);

    L.marker([lat, lng]).addTo(currentMap)
        .bindPopup(`<b>${countryName}</b><br>Capital City`)
        .openPopup();
}

// Theme Management
function toggleTheme() {
    const app = document.getElementById('app');
    const currentTheme = app.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    app.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = document.querySelector('#themeToggle i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function applyTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const app = document.getElementById('app');
    app.setAttribute('data-theme', savedTheme);
    
    const icon = document.querySelector('#themeToggle i');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Debounce utility
function debounce(func, wait) {
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(debounceTimer);
            func(...args);
        };
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(later, wait);
    };
}

// Utility Functions
function formatPopulation(population) {
    if (population >= 1_000_000_000) return `${(population / 1_000_000_000).toFixed(1)}B`;
    if (population >= 1_000_000) return `${(population / 1_000_000).toFixed(1)}M`;
    if (population >= 1_000) return `${(population / 1_000).toFixed(0)}K`;
    return population.toLocaleString();
}