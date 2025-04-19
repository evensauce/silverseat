// --- Constants ---
const MOVIES_STORAGE_KEY = 'cinemaMovies';
const AUTH_STORAGE_KEY = 'cinemaAuth'; // Stores { isLoggedIn, user: {email, type} }
const CUSTOMERS_STORAGE_KEY = 'cinemaCustomers'; // Stores array of {email, password}
const ADMIN_EMAIL = 'admin@example.com'; // Hardcoded admin email
const ADMIN_PASSWORD = 'password'; // Hardcoded admin password

// --- DOM Elements ---
// Auth View Elements
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

// App Header Elements
const appHeader = document.getElementById('app-header');
const loggedInUserInfo = document.getElementById('logged-in-user-info');
const logoutButton = document.getElementById('logout-button');

// Main View Elements
const adminView = document.getElementById('admin-view');
const customerView = document.getElementById('customer-view');

// Admin Form Elements
const movieForm = document.getElementById('movie-form');
const formTitle = document.getElementById('form-title');
const submitButton = document.getElementById('submit-button');
const cancelEditButton = document.getElementById('cancel-edit-button');

// Movie List Containers
const adminMovieListContainer = document.getElementById('admin-movie-list');
const customerMovieListContainer = document.getElementById('customer-movie-list');
const customerPreviewContainer = document.getElementById('customer-movie-list-preview');
const noMoviesAdminMsg = document.getElementById('no-movies-admin');
const noMoviesCustomerMsg = document.getElementById('no-movies-customer');
const noMoviesPreviewMsg = document.getElementById('no-movies-preview');

// Modal DOM Elements
const movieDetailsModal = document.getElementById('movie-details-modal');
const modalCloseButton = document.getElementById('modal-close-button');
const modalMovieTitle = document.getElementById('modal-movie-title');
const modalMoviePoster = document.getElementById('modal-movie-poster');
const modalMovieGenre = document.getElementById('modal-movie-genre');
const modalMovieDuration = document.getElementById('modal-movie-duration');
const modalMovieDescription = document.getElementById('modal-movie-description');
const modalShowtimesList = document.getElementById('modal-showtimes-list');
const seatMapContainer = document.getElementById('seat-map-container');
const seatGrid = document.getElementById('seat-grid');
const selectedSeatsInfo = document.getElementById('selected-seats-info');
const confirmSelectionButton = document.getElementById('confirm-selection-button');

// --- State ---
let movies = []; // Array to hold movie objects
let customerUsers = []; // Array for registered customers {email, password}
let authState = { // Holds current authentication status
    isLoggedIn: false,
    user: null // { email: '...', type: 'customer' | 'admin' }
};
let editingIndex = null; // Index of movie being edited in admin form
let selectedSeats = []; // Array to hold IDs of selected seats in the modal

// --- Utility Functions ---
function showElement(el) {
    if(el) {
        el.classList.remove('hidden', 'view-hidden');
        // Force reflow for transitions if needed, though 'hidden' removal might suffice
        // void el.offsetWidth;
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.height = ''; // Reset height if using view-hidden
         el.style.display = ''; // Reset display if using view-hidden
    }
}

function hideElement(el) {
     if(el) {
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        // Add 'hidden' after transition ends for accessibility and layout
        setTimeout(() => {
             el.classList.add('hidden', 'view-hidden');
             el.style.height = '0'; // Set height if using view-hidden
             el.style.display = 'none'; // Set display if using view-hidden
        }, 300); // Match CSS transition duration
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

// --- Local Storage Functions ---
function loadMoviesFromStorage() {
    const storedMovies = localStorage.getItem(MOVIES_STORAGE_KEY);
    if (storedMovies) {
        try {
            movies = JSON.parse(storedMovies);
            if (!Array.isArray(movies)) movies = [];
        } catch (e) { movies = []; }
    }
    if (movies.length === 0) { // Add defaults if empty
         movies = [ { title: "Inception", poster: "https://placehold.co/400x600/3b82f6/ffffff?text=Inception", description: "A thief who steals corporate secrets...", genre: "Sci-Fi, Action", duration: 148, showtimes: "11:00 AM, 2:00 PM, 8:00 PM" }, { title: "Grand Budapest Hotel", poster: "https://placehold.co/400x600/ef4444/ffffff?text=Grand+Budapest", description: "The adventures of Gustave H...", genre: "Adventure, Comedy", duration: 100, showtimes: "10:30 AM, 1:30 PM, 7:30 PM" }, { title: "Parasite", poster: "https://placehold.co/400x600/10b981/ffffff?text=Parasite", description: "Greed and class discrimination...", genre: "Comedy, Drama", duration: 132, showtimes: "12:00 PM, 3:00 PM, 9:00 PM" } ];
        saveMoviesToStorage();
    }
}
function saveMoviesToStorage() {
    localStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify(movies));
}
function loadCustomersFromStorage() {
    const storedCustomers = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
     if (storedCustomers) {
        try {
            customerUsers = JSON.parse(storedCustomers);
             if (!Array.isArray(customerUsers)) customerUsers = [];
        } catch (e) { customerUsers = []; }
    }
}
function saveCustomersToStorage() {
     localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customerUsers));
}
function loadAuthFromStorage() {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
        try {
            const parsedAuth = JSON.parse(storedAuth);
            // Basic validation of stored auth data
            if (parsedAuth && typeof parsedAuth.isLoggedIn === 'boolean' && (!parsedAuth.isLoggedIn || (parsedAuth.user && parsedAuth.user.email && parsedAuth.user.type))) {
                 authState = parsedAuth;
            } else {
                 clearAuthStorage(); // Clear invalid stored auth data
            }
        } catch (e) {
            console.error("Error parsing auth state:", e);
            clearAuthStorage(); // Clear if parsing fails
        }
    }
}
function saveAuthToStorage() {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
}
 function clearAuthStorage() {
    authState = { isLoggedIn: false, user: null };
    localStorage.removeItem(AUTH_STORAGE_KEY);
}


// --- UI Rendering Functions ---
function renderUI() {
    closeModal(); // Ensure modal is closed on UI refresh
    if (authState.isLoggedIn && authState.user) {
        hideElement(authView);
        showElement(appHeader);
        loggedInUserInfo.textContent = `Logged in as: ${authState.user.email}`;
        if (authState.user.type === 'admin') {
            showElement(adminView);
            hideElement(customerView);
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
        showCustomerLoginForm(); // Default to customer login
    }
}

function renderAdminContent() {
     resetForm(); // Ensure admin form is reset
     renderMovies(adminMovieListContainer, 'admin');
     renderMovies(customerPreviewContainer, 'preview');
}

function renderCustomerContent() {
    renderMovies(customerMovieListContainer, 'customer');
}

// --- Authentication Form Switching ---
function showCustomerLoginForm() {
    hideElement(customerRegisterForm);
    hideElement(adminLoginForm);
    showElement(customerLoginForm);
    hideError(customerLoginError);
    hideError(registerError);
    hideError(adminLoginError);
}
function showCustomerRegisterForm() {
     hideElement(customerLoginForm);
     hideElement(adminLoginForm);
     showElement(customerRegisterForm);
     hideError(customerLoginError);
     hideError(registerError);
     hideError(adminLoginError);
     customerRegisterForm.reset(); // Clear form on show
}
function showAdminLoginForm() {
     hideElement(customerLoginForm);
     hideElement(customerRegisterForm);
     showElement(adminLoginForm);
     hideError(customerLoginError);
     hideError(registerError);
     hideError(adminLoginError);
}

// --- Authentication Logic ---
function handleCustomerLogin(event) {
    event.preventDefault();
    hideError(customerLoginError); // Hide previous errors
    const email = document.getElementById('customer-email').value.trim();
    const password = document.getElementById('customer-password').value;

    const foundUser = customerUsers.find(user => user.email === email && user.password === password);

    if (foundUser) {
        authState = { isLoggedIn: true, user: { email: email, type: 'customer' } };
        saveAuthToStorage();
        renderUI();
        customerLoginForm.reset();
    } else {
        displayError(customerLoginError, "Invalid email or password.");
    }
}

function handleAdminLogin(event) {
    event.preventDefault();
     hideError(adminLoginError);
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
         authState = { isLoggedIn: true, user: { email: email, type: 'admin' } };
         saveAuthToStorage();
         renderUI();
         adminLoginForm.reset(); // Optionally reset, though pre-filled might be desired for demo
    } else {
         displayError(adminLoginError, "Invalid admin credentials.");
    }
}

function handleRegistration(event) {
    event.preventDefault();
    hideError(registerError);
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (!email || !password) {
         displayError(registerError, "Email and password are required.");
        return;
    }
    if (password !== confirmPassword) {
        displayError(registerError, "Passwords do not match.");
        return;
    }
     if (password.length < 6) { // Basic password length check
         displayError(registerError, "Password must be at least 6 characters long.");
         return;
    }

    // Check if email already exists
    if (customerUsers.some(user => user.email === email)) {
        displayError(registerError, "Email address is already registered.");
        return;
    }

    // Add new user
    customerUsers.push({ email, password });
    saveCustomersToStorage();

    // Optionally log the user in immediately after registration
    authState = { isLoggedIn: true, user: { email: email, type: 'customer' } };
    saveAuthToStorage();
    renderUI();
    customerRegisterForm.reset();

    // Or redirect to login:
    // alert("Registration successful! Please log in.");
    // showCustomerLoginForm();
}

function handleLogout() {
    clearAuthStorage();
    renderUI();
}

// --- Movie Management (Admin) ---
function resetForm() {
    movieForm.reset();
    editingIndex = null;
    formTitle.textContent = 'Add New Movie';
    submitButton.textContent = 'Add Movie';
    cancelEditButton.classList.add('hidden');
    if(document.getElementById('edit-index')) document.getElementById('edit-index').value = '';
}

function handleMovieFormSubmit(event) {
    event.preventDefault();
    const indexInput = document.getElementById('edit-index').value;
    const movieData = {
        title: document.getElementById('title').value.trim(),
        poster: document.getElementById('poster').value.trim(),
        description: document.getElementById('description').value.trim(),
        genre: document.getElementById('genre').value.trim(),
        duration: parseInt(document.getElementById('duration').value, 10),
        showtimes: document.getElementById('showtimes').value.trim()
    };

    if (!movieData.title || !movieData.poster || !movieData.genre || !movieData.showtimes || isNaN(movieData.duration) || movieData.duration <= 0) {
         alert("Please fill in all fields correctly (Title, Poster URL, Genre, Showtimes, valid Duration).");
         return;
    }

    if (indexInput !== '') { // Editing
        const index = parseInt(indexInput, 10);
        if (index >= 0 && index < movies.length) {
            movies[index] = movieData;
        } else { return; } // Invalid index
    } else { // Adding
        movies.push(movieData);
    }

    saveMoviesToStorage();
    renderAdminContent(); // Re-render admin lists
    resetForm();
}

function showEditForm(index) {
     if (index < 0 || index >= movies.length) return;
     editingIndex = index;
     const movie = movies[index];
     document.getElementById('edit-index').value = index;
     document.getElementById('title').value = movie.title || '';
     document.getElementById('poster').value = movie.poster || '';
     document.getElementById('description').value = movie.description || '';
     document.getElementById('genre').value = movie.genre || '';
     document.getElementById('duration').value = movie.duration || '';
     document.getElementById('showtimes').value = movie.showtimes || '';
     formTitle.textContent = 'Edit Movie';
     submitButton.textContent = 'Save Changes';
     cancelEditButton.classList.remove('hidden');
     movieForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteMovie(index) {
    if (index < 0 || index >= movies.length) return;
    const movieTitle = movies[index]?.title || 'this movie';
    if (confirm(`Are you sure you want to delete "${movieTitle}"?`)) {
        movies.splice(index, 1);
        saveMoviesToStorage();
        renderAdminContent();
        if (editingIndex === index) resetForm();
    }
}

// --- Movie Card Creation ---
function createMovieCard(movie, index, viewType) {
    // (This function remains largely the same as before)
    // ... [Copy the existing createMovieCard function here] ...
    // Make sure the onclick for customer/preview calls openModal(index)
    // and the onclick for admin edit/delete calls showEditForm/deleteMovie
    // with e.stopPropagation()
    const card = document.createElement('div');
    card.className = 'movie-card flex flex-col';
    card.dataset.index = index;

    const img = document.createElement('img');
    img.src = movie.poster || 'https://placehold.co/400x600/cccccc/ffffff?text=No+Image';
    img.alt = `${movie.title} Poster`;
    img.className = 'movie-poster';
    img.onerror = function() { this.onerror=null; this.src='https://placehold.co/400x600/cccccc/ffffff?text=Image+Error'; };

    const content = document.createElement('div');
    content.className = 'p-4 flex flex-col flex-grow';

    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold mb-2 text-gray-800';
    title.textContent = movie.title;

    const details = document.createElement('p');
    details.className = 'text-sm text-gray-600 mb-1';
    details.innerHTML = `<i class="fas fa-tag mr-1 opacity-75"></i> ${movie.genre || 'N/A'} &bull; <i class="fas fa-clock mr-1 opacity-75"></i> ${movie.duration || 'N/A'} min`;

    const description = document.createElement('p');
    description.className = 'text-sm text-gray-700 mb-3 flex-grow';
    description.textContent = movie.description || 'No description available.';

    const showtimes = document.createElement('p');
    showtimes.className = 'text-sm text-blue-600 font-medium mt-auto';
    showtimes.innerHTML = `<i class="fas fa-calendar-alt mr-1 opacity-75"></i> Showtimes: ${movie.showtimes || 'N/A'}`;

    content.appendChild(title);
    content.appendChild(details);
    content.appendChild(description);
    content.appendChild(showtimes);

    card.appendChild(img);
    card.appendChild(content);

    if (viewType === 'admin') {
        const adminControls = document.createElement('div');
        adminControls.className = 'p-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2';
        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editButton.className = 'btn btn-secondary btn-icon text-xs !py-1 !px-2'; // Smaller admin buttons
        editButton.onclick = (e) => { e.stopPropagation(); showEditForm(index); };
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteButton.className = 'btn btn-danger btn-icon text-xs !py-1 !px-2'; // Smaller admin buttons
        deleteButton.onclick = (e) => { e.stopPropagation(); deleteMovie(index); };
        adminControls.appendChild(editButton);
        adminControls.appendChild(deleteButton);
        card.appendChild(adminControls);
    } else { // Customer or Preview view
        card.classList.add('cursor-pointer');
        card.onclick = () => openModal(index);
    }
    return card;
}

// --- Movie List Rendering ---
function renderMovies(container, viewType) {
    container.innerHTML = ''; // Clear previous content
    let noMoviesMsg;
    if (viewType === 'admin') noMoviesMsg = noMoviesAdminMsg;
    else if (viewType === 'preview') noMoviesMsg = noMoviesPreviewMsg;
    else noMoviesMsg = noMoviesCustomerMsg;

    if (movies.length === 0) {
        if(noMoviesMsg) showElement(noMoviesMsg);
        return;
    } else {
         if(noMoviesMsg) hideElement(noMoviesMsg);
    }
    movies.forEach((movie, index) => {
        const card = createMovieCard(movie, index, viewType);
        container.appendChild(card);
    });
}


// --- Movie Details Modal Logic (Keep as is) ---
function openModal(index) {
    // (This function remains the same as before)
    // ... [Copy the existing openModal function here] ...
    if (index < 0 || index >= movies.length) return;
    const movie = movies[index];
    modalMovieTitle.textContent = movie.title || 'Movie Details';
    modalMoviePoster.src = movie.poster || 'https://placehold.co/400x600/cccccc/ffffff?text=No+Image';
    modalMoviePoster.alt = `${movie.title || 'Movie'} Poster`;
    modalMovieGenre.textContent = movie.genre || 'N/A';
    modalMovieDuration.textContent = movie.duration || 'N/A';
    modalMovieDescription.textContent = movie.description || 'No description available.';
    modalShowtimesList.innerHTML = '';
    const showtimes = movie.showtimes ? movie.showtimes.split(',').map(st => st.trim()).filter(st => st) : [];
    if (showtimes.length > 0) {
        showtimes.forEach((time, i) => {
            const radioId = `showtime-${index}-${i}`;
            const radio = document.createElement('input');
            radio.type = 'radio'; radio.id = radioId; radio.name = `movie-${index}-showtime`; radio.value = time; radio.className = 'showtime-radio';
            radio.onchange = () => handleShowtimeSelection(time);
            const label = document.createElement('label');
            label.htmlFor = radioId; label.textContent = time; label.className = 'showtime-label';
            modalShowtimesList.appendChild(radio); modalShowtimesList.appendChild(label);
        });
    } else {
        modalShowtimesList.innerHTML = '<p class="text-gray-500 text-sm">No showtimes available.</p>';
    }
    seatMapContainer.classList.add('hidden');
    seatGrid.innerHTML = '';
    selectedSeats = [];
    updateSelectedSeatsInfo();
    confirmSelectionButton.disabled = true;
    showElement(movieDetailsModal); // Use showElement utility
    document.body.classList.add('overflow-hidden');
}

function closeModal() {
    // (This function remains the same as before, but use hideElement)
    // ... [Copy the existing closeModal function here, using hideElement] ...
     hideElement(movieDetailsModal); // Use hideElement utility
     document.body.classList.remove('overflow-hidden');
}

function handleShowtimeSelection(selectedTime) {
    // (This function remains the same as before)
    // ... [Copy the existing handleShowtimeSelection function here] ...
    renderSeatMap(5, 8);
    seatMapContainer.classList.remove('hidden'); // Direct class manipulation ok here as it's inside modal
    selectedSeats = [];
    updateSelectedSeatsInfo();
    confirmSelectionButton.disabled = true;
}

function renderSeatMap(rows, cols) {
     // (This function remains the same as before)
    // ... [Copy the existing renderSeatMap function here] ...
    seatGrid.innerHTML = '';
    for (let r = 0; r < rows; r++) {
        const rowDiv = document.createElement('div'); rowDiv.className = 'seat-row';
        const rowLetter = String.fromCharCode(65 + r);
        for (let c = 0; c < cols; c++) {
            if (c === 2 || c === 6) { const spacer = document.createElement('div'); spacer.className = 'seat-spacer'; rowDiv.appendChild(spacer); }
            const seatId = `${rowLetter}${c + 1}`;
            const seatDiv = document.createElement('div'); seatDiv.className = 'seat'; seatDiv.id = `seat-${seatId}`; seatDiv.dataset.seatId = seatId;
            seatDiv.innerHTML = `<i class="fas fa-chair"></i>`;
            seatDiv.onclick = () => toggleSeatSelection(seatId);
            rowDiv.appendChild(seatDiv);
        }
        seatGrid.appendChild(rowDiv);
    }
}

function toggleSeatSelection(seatId) {
    // (This function remains the same as before)
    // ... [Copy the existing toggleSeatSelection function here] ...
     const seatElement = document.getElementById(`seat-${seatId}`);
    if (!seatElement || seatElement.classList.contains('unavailable')) return;
    const index = selectedSeats.indexOf(seatId);
    if (index > -1) { selectedSeats.splice(index, 1); seatElement.classList.remove('selected'); }
    else { selectedSeats.push(seatId); seatElement.classList.add('selected'); }
    updateSelectedSeatsInfo();
}

function updateSelectedSeatsInfo() {
    // (This function remains the same as before)
    // ... [Copy the existing updateSelectedSeatsInfo function here] ...
     if (selectedSeats.length === 0) { selectedSeatsInfo.textContent = 'Selected Seats: None'; confirmSelectionButton.disabled = true; }
     else { selectedSeatsInfo.textContent = `Selected Seats: ${selectedSeats.sort().join(', ')}`; confirmSelectionButton.disabled = false; }
}


// --- Initialization ---
function initializeApp() {
    // Load data
    loadMoviesFromStorage();
    loadCustomersFromStorage();
    loadAuthFromStorage(); // Check if already logged in

    // Set up event listeners
    // Auth forms
    customerLoginForm.addEventListener('submit', handleCustomerLogin);
    customerRegisterForm.addEventListener('submit', handleRegistration);
    adminLoginForm.addEventListener('submit', handleAdminLogin);
    // Auth switching buttons
    showRegisterButton.addEventListener('click', showCustomerRegisterForm);
    showAdminLoginButton.addEventListener('click', showAdminLoginForm);
    backToCustomerLoginButtons.forEach(btn => btn.addEventListener('click', showCustomerLoginForm));
    // Logout
    logoutButton.addEventListener('click', handleLogout);
    // Admin movie form
    movieForm.addEventListener('submit', handleMovieFormSubmit);
    cancelEditButton.addEventListener('click', resetForm);
    // Modal
    modalCloseButton.addEventListener('click', closeModal);
    movieDetailsModal.addEventListener('click', (e) => { if (e.target === movieDetailsModal) closeModal(); });
    confirmSelectionButton.addEventListener('click', () => {
         if (selectedSeats.length > 0) { alert(`Seats ${selectedSeats.sort().join(', ')} selected! (Booking simulation complete)`); closeModal(); }
         else { alert("Please select at least one seat."); }
    });

    // Initial UI render based on auth state
    renderUI();
}

// --- Start the App ---
window.addEventListener('load', initializeApp);