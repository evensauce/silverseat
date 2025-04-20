// --- Constants ---
const MOVIES_STORAGE_KEY = 'cinemaMovies';
const AUTH_STORAGE_KEY = 'cinemaAuth';
const CUSTOMERS_STORAGE_KEY = 'cinemaCustomers';
const USER_RATINGS_STORAGE_KEY = 'cinemaUserRatings';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password';
const TOTAL_SEATS_PER_SCREENING = 5 * 8; // 5 rows x 8 cols

// --- DOM Elements ---
// (References remain the same)
const splashScreen = document.getElementById('splash-screen');
const authView = document.getElementById('auth-view');
const customerLoginForm = document.getElementById('customer-login-form');
const customerRegisterForm = document.getElementById('customer-register-form');
const adminLoginForm = document.getElementById('admin-login-form');
const showRegisterButton = document.getElementById('show-register-button');
const showAdminLoginButton = document.getElementById('show-admin-login-button');
const backToCustomerLoginButtons = document.querySelectorAll('.back-to-customer-login');
const customerLoginError = document.getElementById('customer-login-error');
const registerError = document.getElementById('register-error');
const adminLoginError = document.getElementById('admin-login-error');
const appHeader = document.getElementById('app-header');
const loggedInUserInfo = document.getElementById('logged-in-user-info');
const logoutButton = document.getElementById('logout-button');
const adminView = document.getElementById('admin-view');
const customerView = document.getElementById('customer-view');
const adminNavButtons = document.querySelectorAll('.admin-nav-button');
const adminManageMoviesSection = document.getElementById('admin-manage-movies');
const adminAnalyticsSection = document.getElementById('admin-analytics');
const movieForm = document.getElementById('movie-form');
const formTitle = document.getElementById('form-title');
const submitButton = document.getElementById('submit-button');
const cancelEditButton = document.getElementById('cancel-edit-button');
const adminMovieListContainer = document.getElementById('admin-movie-list');
const customerPreviewContainer = document.getElementById('customer-movie-list-preview');
const noMoviesAdminMsg = document.getElementById('no-movies-admin');
const noMoviesPreviewMsg = document.getElementById('no-movies-preview');
const analyticsAvgRatingsContainer = document.getElementById('analytics-avg-ratings');
const analyticsOccupancyContainer = document.getElementById('analytics-occupancy');
const customerMovieListContainer = document.getElementById('customer-movie-list');
const noMoviesCustomerMsg = document.getElementById('no-movies-customer');
const movieDetailsModal = document.getElementById('movie-details-modal');
const modalCloseButton = document.getElementById('modal-close-button');
const modalMovieTitle = document.getElementById('modal-movie-title');
const modalMoviePoster = document.getElementById('modal-movie-poster');
const modalAvgRatingContainer = document.getElementById('modal-avg-rating');
const modalMovieGenre = document.getElementById('modal-movie-genre');
const modalMovieDuration = document.getElementById('modal-movie-duration');
const modalMovieDescription = document.getElementById('modal-movie-description');
const modalShowtimesList = document.getElementById('modal-showtimes-list');
const modalRatingSection = document.getElementById('modal-rating-section');
const modalStarsContainer = document.getElementById('modal-stars');
const modalRatingMessage = document.getElementById('modal-rating-message');
const seatMapContainer = document.getElementById('seat-map-container');
const seatGrid = document.getElementById('seat-grid');
const selectedSeatsInfo = document.getElementById('selected-seats-info');
const confirmSelectionButton = document.getElementById('confirm-selection-button');


// --- State ---
let movies = [];
let customerUsers = [];
let userRatings = {};
let authState = { isLoggedIn: false, user: null };
let editingIndex = null;
let selectedSeats = [];
let currentAdminTab = 'admin-manage-movies';
let currentModalMovieId = null;

// --- Utility Functions (REVISED) ---
function showElement(el) {
    if(el) {
        el.classList.remove('is-hidden');
        el.style.height = '';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.pointerEvents = '';
        el.style.margin = '';
        el.style.padding = '';
        el.style.border = '';
    }
}

function hideElement(el) {
     if(el) {
         el.classList.add('is-hidden');
         el.style.opacity = '0';
         el.style.visibility = 'hidden';
         el.style.pointerEvents = 'none';
     }
}

function displayError(element, message) {
    if (element) {
        element.textContent = message;
        showElement(element);
    }
}

function hideError(element) {
     if (element) {
        element.textContent = '';
        hideElement(element);
    }
}
function generateId() { return '_' + Math.random().toString(36).substr(2, 9); }

// --- Local Storage Functions ---
// (Remain the same)
function loadMoviesFromStorage() { const d=localStorage.getItem(MOVIES_STORAGE_KEY); if(d){try{movies=JSON.parse(d); if(!Array.isArray(movies)) movies=[];}catch(e){movies=[];}} if(movies.length===0){movies=[{title:"Inception",poster:"https://placehold.co/400x600/3b82f6/ffffff?text=Inception",description:"A thief...",genre:"Sci-Fi, Action",duration:148,showtimes:"11:00 AM, 2:00 PM, 8:00 PM"},{title:"Grand Budapest Hotel",poster:"https://placehold.co/400x600/ef4444/ffffff?text=Grand+Budapest",description:"The adventures...",genre:"Adventure, Comedy",duration:100,showtimes:"10:30 AM, 1:30 PM, 7:30 PM"},{title:"Parasite",poster:"https://placehold.co/400x600/10b981/ffffff?text=Parasite",description:"Greed and class...",genre:"Comedy, Drama",duration:132,showtimes:"12:00 PM, 3:00 PM, 9:00 PM"}]; movies.forEach(m=>{m.movieId=generateId(); m.ratings=[];}); saveMoviesToStorage();} else {movies.forEach(m=>{if(!m.movieId)m.movieId=generateId(); if(!m.ratings)m.ratings=[];}); saveMoviesToStorage();} }
function saveMoviesToStorage() { localStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify(movies)); }
function loadCustomersFromStorage() { const d=localStorage.getItem(CUSTOMERS_STORAGE_KEY); if(d){try{customerUsers=JSON.parse(d); if(!Array.isArray(customerUsers))customerUsers=[];}catch(e){customerUsers=[];}} }
function saveCustomersToStorage() { localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customerUsers)); }
function loadUserRatingsFromStorage() { const d=localStorage.getItem(USER_RATINGS_STORAGE_KEY); if(d){try{userRatings=JSON.parse(d);}catch(e){userRatings={};}}else{userRatings={};} }
function saveUserRatingsToStorage() { localStorage.setItem(USER_RATINGS_STORAGE_KEY, JSON.stringify(userRatings)); }
function loadAuthFromStorage() { const d=localStorage.getItem(AUTH_STORAGE_KEY); if(d){try{const p=JSON.parse(d); if(p && typeof p.isLoggedIn==='boolean' && (!p.isLoggedIn || (p.user && p.user.email && p.user.type))){authState=p;}else{clearAuthStorage();}}catch(e){console.error("Error parsing auth state:", e); clearAuthStorage();}}}
function saveAuthToStorage() { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState)); }
function clearAuthStorage() { authState = { isLoggedIn: false, user: null }; localStorage.removeItem(AUTH_STORAGE_KEY); }


// --- Rating Functions ---
// (Remain the same)
function calculateAverageRating(movie) { if (!movie || !movie.ratings || movie.ratings.length === 0) { return { average: 0, count: 0 }; } const sum = movie.ratings.reduce((acc, r) => acc + r.rating, 0); return { average: sum / movie.ratings.length, count: movie.ratings.length }; }
function renderStars(container, averageRating, count = 0, interactive = false, userRating = null, movieId = null) { if (!container) return; container.innerHTML = ''; container.classList.toggle('interactive', interactive); container.dataset.movieId = movieId || ''; const ratingValue = Math.round(averageRating); const displayRating = userRating !== null ? userRating : ratingValue; for (let i = 1; i <= 5; i++) { const star = document.createElement('i'); star.classList.add(i <= displayRating ? 'fas' : 'fa-regular', 'fa-star'); star.dataset.rating = i; if (interactive) { star.style.cursor = 'pointer'; star.onclick = () => handleStarClick(movieId, i); star.onmouseover = () => highlightStars(container, i); star.onmouseout = () => highlightStars(container, userRating || 0); } container.appendChild(star); } if (!interactive && averageRating > 0) { const ratingText = document.createElement('span'); ratingText.className = 'ml-2 text-sm text-gray-500'; ratingText.textContent = `${averageRating.toFixed(1)} (${count} ${count === 1 ? 'rating' : 'ratings'})`; container.appendChild(ratingText); } else if (!interactive) { const ratingText = document.createElement('span'); ratingText.className = 'ml-2 text-sm text-gray-500'; ratingText.textContent = 'No ratings yet'; container.appendChild(ratingText); } }
function highlightStars(container, rating) { const stars = container.querySelectorAll('i'); stars.forEach(star => { const starRating = parseInt(star.dataset.rating, 10); star.classList.toggle('fas', starRating <= rating); star.classList.toggle('fa-regular', starRating > rating); }); }
function handleStarClick(movieId, rating) { if (!authState.isLoggedIn || !authState.user || authState.user.type !== 'customer' || !movieId) return; const userId = authState.user.email; const movieIndex = movies.findIndex(m => m.movieId === movieId); if (movieIndex === -1) return; if (!userRatings[userId]) userRatings[userId] = {}; if (userRatings[userId][movieId]) return; movies[movieIndex].ratings.push({ userId, rating }); userRatings[userId][movieId] = rating; saveMoviesToStorage(); saveUserRatingsToStorage(); const avgData = calculateAverageRating(movies[movieIndex]); renderStars(modalAvgRatingContainer, avgData.average, avgData.count); renderStars(modalStarsContainer, 0, 0, false, rating, movieId); modalRatingMessage.textContent = `You rated this movie ${rating} star${rating > 1 ? 's' : ''}.`; modalStarsContainer.classList.remove('interactive'); modalStarsContainer.style.cursor = 'default'; renderCustomerContent(); }


// --- UI Rendering Functions ---
function renderUI() {
    closeModal();
    if (authState.isLoggedIn && authState.user) {
        hideElement(authView);
        showElement(appHeader);
        loggedInUserInfo.textContent = `Logged in as: ${authState.user.email} (${authState.user.type})`;
        if (authState.user.type === 'admin') {
            hideElement(customerView);
            showElement(adminView);
            renderAdminContent();
        } else { // Customer
            hideElement(adminView);
            showElement(customerView);
            renderCustomerContent();
        }
    } else {
        hideElement(appHeader);
        hideElement(adminView);
        hideElement(customerView);
        showElement(authView);
        showCustomerLoginForm();
    }
}

function renderAdminContent() {
     resetForm();
     document.querySelectorAll('.admin-section').forEach(sec => {
         if (sec.id === currentAdminTab) { showElement(sec); } else { hideElement(sec); }
     });
     if (currentAdminTab === 'admin-manage-movies') { renderMovies(adminMovieListContainer, 'admin'); renderMovies(customerPreviewContainer, 'preview'); }
     else if (currentAdminTab === 'admin-analytics') { renderAnalyticsDashboard(); }
}

function renderCustomerContent() { renderMovies(customerMovieListContainer, 'customer'); }

// --- Admin Analytics ---
// (Remain the same)
function renderAnalyticsDashboard() { analyticsAvgRatingsContainer.innerHTML = ''; analyticsOccupancyContainer.innerHTML = ''; if (movies.length === 0) { analyticsAvgRatingsContainer.innerHTML = '<p class="text-gray-500">No movie data.</p>'; analyticsOccupancyContainer.innerHTML = '<p class="text-gray-500">No movie data.</p>'; return; } let hasRatings = false; movies.forEach(movie => { const { average, count } = calculateAverageRating(movie); if (count > 0) hasRatings = true; const ratingDiv = document.createElement('div'); ratingDiv.className = 'flex justify-between items-center text-sm pb-1 border-b border-gray-200'; const titleSpan = document.createElement('span'); titleSpan.textContent = movie.title; titleSpan.className = 'font-medium text-gray-700'; const starsSpan = document.createElement('span'); starsSpan.className = 'stars-container flex items-center'; renderStars(starsSpan, average, count); ratingDiv.appendChild(titleSpan); ratingDiv.appendChild(starsSpan); analyticsAvgRatingsContainer.appendChild(ratingDiv); }); if (!hasRatings) { analyticsAvgRatingsContainer.innerHTML = '<p class="text-gray-500">No ratings yet.</p>'; } movies.forEach(movie => { const movieOccupancyDiv = document.createElement('div'); movieOccupancyDiv.className = 'mb-4 pb-4 border-b border-gray-200 last:border-b-0'; const movieTitle = document.createElement('h4'); movieTitle.className = 'text-lg font-semibold text-gray-800 mb-2'; movieTitle.textContent = movie.title; movieOccupancyDiv.appendChild(movieTitle); const showtimes = movie.showtimes ? movie.showtimes.split(',').map(st => st.trim()).filter(st => st) : []; if (showtimes.length > 0) { showtimes.forEach(time => { const simulatedBookedCount = Math.floor(Math.random() * (TOTAL_SEATS_PER_SCREENING + 1)); const occupancyPercent = TOTAL_SEATS_PER_SCREENING > 0 ? (simulatedBookedCount / TOTAL_SEATS_PER_SCREENING) * 100 : 0; let occupancyLabel = 'Unpopular'; let occupancyClass = 'occupancy-unpopular'; if (occupancyPercent >= 67) { occupancyLabel = 'Popular'; occupancyClass = 'occupancy-popular'; } else if (occupancyPercent >= 34) { occupancyLabel = 'Normal'; occupancyClass = 'occupancy-normal'; } const showtimeDiv = document.createElement('div'); showtimeDiv.className = 'flex justify-between items-center text-sm mb-1'; showtimeDiv.innerHTML = `<span class="text-gray-600">${time}</span><span><span class="text-gray-500 mr-2">(${simulatedBookedCount}/${TOTAL_SEATS_PER_SCREENING} seats)</span><span class="occupancy-tag ${occupancyClass}">${occupancyLabel}</span></span>`; movieOccupancyDiv.appendChild(showtimeDiv); }); } else { movieOccupancyDiv.innerHTML += '<p class="text-sm text-gray-500">No showtimes.</p>'; } analyticsOccupancyContainer.appendChild(movieOccupancyDiv); }); if (analyticsOccupancyContainer.innerHTML === '') { analyticsOccupancyContainer.innerHTML = '<p class="text-gray-500">No movie data.</p>'; } }


// --- Authentication Form Switching ---
// (Use NEW hide/show functions)
function showCustomerLoginForm() { hideElement(customerRegisterForm); hideElement(adminLoginForm); showElement(customerLoginForm); hideError(customerLoginError); hideError(registerError); hideError(adminLoginError); }
function showCustomerRegisterForm() { hideElement(customerLoginForm); hideElement(adminLoginForm); showElement(customerRegisterForm); hideError(customerLoginError); hideError(registerError); hideError(adminLoginError); customerRegisterForm.reset(); }
function showAdminLoginForm() { hideElement(customerLoginForm); hideElement(customerRegisterForm); showElement(adminLoginForm); hideError(customerLoginError); hideError(registerError); hideError(adminLoginError); }

// --- Authentication Logic ---
// (Remain the same)
function handleCustomerLogin(event) { event.preventDefault(); hideError(customerLoginError); const email = document.getElementById('customer-email').value.trim(); const password = document.getElementById('customer-password').value; const foundUser = customerUsers.find(user => user.email === email && user.password === password); if (foundUser) { authState = { isLoggedIn: true, user: { email: email, type: 'customer' } }; saveAuthToStorage(); renderUI(); customerLoginForm.reset(); } else { displayError(customerLoginError, "Invalid email or password."); } }
function handleAdminLogin(event) { event.preventDefault(); hideError(adminLoginError); const email = document.getElementById('admin-email').value.trim(); const password = document.getElementById('admin-password').value; if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) { authState = { isLoggedIn: true, user: { email: email, type: 'admin' } }; saveAuthToStorage(); renderUI(); adminLoginForm.reset(); } else { displayError(adminLoginError, "Invalid admin credentials."); } }
function handleRegistration(event) { event.preventDefault(); hideError(registerError); const email = document.getElementById('register-email').value.trim(); const password = document.getElementById('register-password').value; const confirmPassword = document.getElementById('register-confirm-password').value; if (!email || !password) { displayError(registerError, "Email and password are required."); return; } if (password !== confirmPassword) { displayError(registerError, "Passwords do not match."); return; } if (password.length < 6) { displayError(registerError, "Password must be at least 6 characters long."); return; } if (customerUsers.some(user => user.email === email)) { displayError(registerError, "Email address is already registered."); return; } customerUsers.push({ email, password }); saveCustomersToStorage(); authState = { isLoggedIn: true, user: { email: email, type: 'customer' } }; saveAuthToStorage(); renderUI(); customerRegisterForm.reset(); }
function handleLogout() { clearAuthStorage(); currentAdminTab = 'admin-manage-movies'; renderUI(); }


// --- Movie Management (Admin) ---
// (Remain the same)
function resetForm() { movieForm.reset(); editingIndex = null; formTitle.textContent = 'Add New Movie'; submitButton.textContent = 'Add Movie'; cancelEditButton.classList.add('hidden'); if(document.getElementById('edit-index')) document.getElementById('edit-index').value = ''; }
function handleMovieFormSubmit(event) { event.preventDefault(); const indexInput = document.getElementById('edit-index').value; const movieData = { title: document.getElementById('title').value.trim(), poster: document.getElementById('poster').value.trim(), description: document.getElementById('description').value.trim(), genre: document.getElementById('genre').value.trim(), duration: parseInt(document.getElementById('duration').value, 10), showtimes: document.getElementById('showtimes').value.trim(), movieId: indexInput !== '' ? movies[parseInt(indexInput, 10)].movieId : generateId(), ratings: indexInput !== '' ? movies[parseInt(indexInput, 10)].ratings : [] }; if (!movieData.title || !movieData.poster || !movieData.genre || !movieData.showtimes || isNaN(movieData.duration) || movieData.duration <= 0) { alert("Please fill fields correctly."); return; } if (indexInput !== '') { const index = parseInt(indexInput, 10); if (index >= 0 && index < movies.length) { movies[index] = movieData; } else { return; } } else { movies.push(movieData); } saveMoviesToStorage(); renderAdminContent(); resetForm(); }
function showEditForm(index) { if (index < 0 || index >= movies.length) return; editingIndex = index; const movie = movies[index]; document.getElementById('edit-index').value = index; document.getElementById('title').value = movie.title || ''; document.getElementById('poster').value = movie.poster || ''; document.getElementById('description').value = movie.description || ''; document.getElementById('genre').value = movie.genre || ''; document.getElementById('duration').value = movie.duration || ''; document.getElementById('showtimes').value = movie.showtimes || ''; formTitle.textContent = 'Edit Movie'; submitButton.textContent = 'Save Changes'; cancelEditButton.classList.remove('hidden'); movieForm.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function deleteMovie(index) { if (index < 0 || index >= movies.length) return; const movieTitle = movies[index]?.title || 'this movie'; if (confirm(`Delete "${movieTitle}"?`)) { const movieIdToDelete = movies[index].movieId; movies.splice(index, 1); Object.keys(userRatings).forEach(userId => { if (userRatings[userId][movieIdToDelete]) delete userRatings[userId][movieIdToDelete]; }); saveMoviesToStorage(); saveUserRatingsToStorage(); renderAdminContent(); if (editingIndex === index) resetForm(); } }

// --- Movie Card Creation ---
// (Remain the same)
function createMovieCard(movie, index, viewType) { const card = document.createElement('div'); card.className = 'movie-card flex flex-col'; card.dataset.index = index; card.dataset.movieId = movie.movieId; const img = document.createElement('img'); img.src = movie.poster || 'https://placehold.co/400x600/cccccc/ffffff?text=No+Image'; img.alt = `${movie.title} Poster`; img.className = 'movie-poster'; img.onerror = function() { this.onerror=null; this.src='https://placehold.co/400x600/cccccc/ffffff?text=Image+Error'; }; const content = document.createElement('div'); content.className = 'p-4 flex flex-col flex-grow'; const title = document.createElement('h3'); title.className = 'text-lg font-semibold mb-1 text-gray-800'; title.textContent = movie.title; const avgRatingDiv = document.createElement('div'); avgRatingDiv.className = 'stars-container text-sm mb-2'; const { average, count } = calculateAverageRating(movie); renderStars(avgRatingDiv, average, count); const details = document.createElement('p'); details.className = 'text-sm text-gray-600 mb-1'; details.innerHTML = `<i class="fas fa-tag mr-1 opacity-75"></i> ${movie.genre || 'N/A'} &bull; <i class="fas fa-clock mr-1 opacity-75"></i> ${movie.duration || 'N/A'} min`; const description = document.createElement('p'); description.className = 'text-sm text-gray-700 mb-3 flex-grow'; description.textContent = movie.description || 'No description available.'; const showtimes = document.createElement('p'); showtimes.className = 'text-sm text-blue-600 font-medium mt-auto'; showtimes.innerHTML = `<i class="fas fa-calendar-alt mr-1 opacity-75"></i> Showtimes: ${movie.showtimes || 'N/A'}`; content.appendChild(title); content.appendChild(avgRatingDiv); content.appendChild(details); content.appendChild(description); content.appendChild(showtimes); card.appendChild(img); card.appendChild(content); if (viewType === 'admin') { const adminControls = document.createElement('div'); adminControls.className = 'p-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2'; const editButton = document.createElement('button'); editButton.innerHTML = '<i class="fas fa-edit"></i> Edit'; editButton.className = 'btn btn-secondary btn-icon text-xs !py-1 !px-2'; editButton.onclick = (e) => { e.stopPropagation(); showEditForm(index); }; const deleteButton = document.createElement('button'); deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete'; deleteButton.className = 'btn btn-danger btn-icon text-xs !py-1 !px-2'; deleteButton.onclick = (e) => { e.stopPropagation(); deleteMovie(index); }; adminControls.appendChild(editButton); adminControls.appendChild(deleteButton); card.appendChild(adminControls); } else { card.classList.add('cursor-pointer'); card.onclick = () => openModal(movie.movieId); } return card; }

// --- Movie List Rendering ---
// (Use NEW hide/show functions)
function renderMovies(container, viewType) {
    container.innerHTML = ''; let noMoviesMsg;
    if (viewType === 'admin') noMoviesMsg = noMoviesAdminMsg; else if (viewType === 'preview') noMoviesMsg = noMoviesPreviewMsg; else noMoviesMsg = noMoviesCustomerMsg;
    if (movies.length === 0) { if(noMoviesMsg) showElement(noMoviesMsg); return; } else { if(noMoviesMsg) hideElement(noMoviesMsg); }
    movies.forEach((movie, index) => { const card = createMovieCard(movie, index, viewType); container.appendChild(card); });
}


// --- Movie Details Modal Logic ---
// (Use NEW hide/show functions for modal and internal sections)
function openModal(movieId) {
    const movie = movies.find(m => m.movieId === movieId); if (!movie) return; currentModalMovieId = movieId;
    modalMovieTitle.textContent = movie.title || 'Movie Details'; modalMoviePoster.src = movie.poster || 'https://placehold.co/400x600/cccccc/ffffff?text=No+Image'; modalMoviePoster.alt = `${movie.title || 'Movie'} Poster`; modalMovieGenre.textContent = movie.genre || 'N/A'; modalMovieDuration.textContent = movie.duration || 'N/A'; modalMovieDescription.textContent = movie.description || 'No description available.';
    const avgData = calculateAverageRating(movie); renderStars(modalAvgRatingContainer, avgData.average, avgData.count);
    modalShowtimesList.innerHTML = ''; const showtimes = movie.showtimes ? movie.showtimes.split(',').map(st => st.trim()).filter(st => st) : []; if (showtimes.length > 0) { showtimes.forEach((time, i) => { const radioId = `showtime-${movie.movieId}-${i}`; const radio = document.createElement('input'); radio.type = 'radio'; radio.id = radioId; radio.name = `movie-${movie.movieId}-showtime`; radio.value = time; radio.className = 'showtime-radio'; radio.onchange = () => handleShowtimeSelection(time); const label = document.createElement('label'); label.htmlFor = radioId; label.textContent = time; label.className = 'showtime-label'; modalShowtimesList.appendChild(radio); modalShowtimesList.appendChild(label); }); } else { modalShowtimesList.innerHTML = '<p class="text-gray-500 text-sm">No showtimes available.</p>'; }
    if (authState.isLoggedIn && authState.user.type === 'customer') {
        showElement(modalRatingSection); const userId = authState.user.email; const userCurrentRating = userRatings[userId]?.[movieId] || null; const hasRated = userCurrentRating !== null;
        renderStars(modalStarsContainer, 0, 0, !hasRated, userCurrentRating, movieId); modalRatingMessage.textContent = hasRated ? `You rated this movie ${userCurrentRating} star${userCurrentRating > 1 ? 's' : ''}.` : 'Click stars to rate!';
        if(hasRated) { modalStarsContainer.classList.remove('interactive'); modalStarsContainer.style.cursor = 'default'; } else { modalStarsContainer.classList.add('interactive'); modalStarsContainer.style.cursor = 'pointer'; }
    } else { hideElement(modalRatingSection); }
    hideElement(seatMapContainer); seatGrid.innerHTML = ''; selectedSeats = []; updateSelectedSeatsInfo(); confirmSelectionButton.disabled = true;
    showElement(movieDetailsModal); document.body.classList.add('overflow-hidden');
}
function closeModal() { hideElement(movieDetailsModal); document.body.classList.remove('overflow-hidden'); currentModalMovieId = null; }
function handleShowtimeSelection(selectedTime) { renderSeatMap(5, 8); showElement(seatMapContainer); selectedSeats = []; updateSelectedSeatsInfo(); confirmSelectionButton.disabled = true; } // Show seat map
function renderSeatMap(rows, cols) { seatGrid.innerHTML = ''; for (let r = 0; r < rows; r++) { const rowDiv = document.createElement('div'); rowDiv.className = 'seat-row'; const rowLetter = String.fromCharCode(65 + r); for (let c = 0; c < cols; c++) { if (c === 2 || c === 6) { const spacer = document.createElement('div'); spacer.className = 'seat-spacer'; rowDiv.appendChild(spacer); } const seatId = `${rowLetter}${c + 1}`; const seatDiv = document.createElement('div'); seatDiv.className = 'seat'; seatDiv.id = `seat-${seatId}`; seatDiv.dataset.seatId = seatId; seatDiv.innerHTML = `<i class="fas fa-chair"></i>`; seatDiv.onclick = () => toggleSeatSelection(seatId); rowDiv.appendChild(seatDiv); } seatGrid.appendChild(rowDiv); } }
function toggleSeatSelection(seatId) { const seatElement = document.getElementById(`seat-${seatId}`); if (!seatElement || seatElement.classList.contains('unavailable')) return; const index = selectedSeats.indexOf(seatId); if (index > -1) { selectedSeats.splice(index, 1); seatElement.classList.remove('selected'); } else { selectedSeats.push(seatId); seatElement.classList.add('selected'); } updateSelectedSeatsInfo(); }
function updateSelectedSeatsInfo() { if (selectedSeats.length === 0) { selectedSeatsInfo.textContent = 'Selected Seats: None'; confirmSelectionButton.disabled = true; } else { selectedSeatsInfo.textContent = `Selected Seats: ${selectedSeats.sort().join(', ')}`; confirmSelectionButton.disabled = false; } }

// --- Admin Tab Switching ---
function handleAdminTabClick(event) {
    const targetId = event.target.dataset.target; if (!targetId || targetId === currentAdminTab) return;
    currentAdminTab = targetId;
    adminNavButtons.forEach(btn => { btn.classList.toggle('active', btn.dataset.target === targetId); });
    renderAdminContent(); // Re-render admin content for the new tab
}

// --- Initialization ---
function initializeApp() {
    showElement(splashScreen); // Show splash immediately

    loadMoviesFromStorage(); loadCustomersFromStorage(); loadUserRatingsFromStorage(); loadAuthFromStorage();

    // Setup event listeners
    customerLoginForm.addEventListener('submit', handleCustomerLogin);
    customerRegisterForm.addEventListener('submit', handleRegistration);
    adminLoginForm.addEventListener('submit', handleAdminLogin);
    showRegisterButton.addEventListener('click', showCustomerRegisterForm);
    showAdminLoginButton.addEventListener('click', showAdminLoginForm);
    backToCustomerLoginButtons.forEach(btn => btn.addEventListener('click', showCustomerLoginForm));
    logoutButton.addEventListener('click', handleLogout);
    adminNavButtons.forEach(btn => btn.addEventListener('click', handleAdminTabClick));
    movieForm.addEventListener('submit', handleMovieFormSubmit);
    cancelEditButton.addEventListener('click', resetForm);
    modalCloseButton.addEventListener('click', closeModal);
    movieDetailsModal.addEventListener('click', (e) => { if (e.target === movieDetailsModal) closeModal(); });
    confirmSelectionButton.addEventListener('click', () => { if (selectedSeats.length > 0) { alert(`Seats ${selectedSeats.sort().join(', ')} selected! (Booking simulation complete)`); closeModal(); } else { alert("Please select at least one seat."); } });

    // Hide splash and render main UI after delay
    setTimeout(() => {
        hideElement(splashScreen); // Use revised hideElement
         // Remove splash screen from DOM after transition for performance (optional)
         // No need to remove if using is-hidden correctly
         // setTimeout(() => { if(splashScreen) splashScreen.remove(); }, 800);
        renderUI(); // Initial UI render based on auth state
    }, 1500);
}

// --- Start the App ---
window.addEventListener('load', initializeApp);