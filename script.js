// --- Firebase Imports ---
import {
    db, auth,
    collection, getDocs, addDoc, doc, setDoc, getDoc, query, where, updateDoc, deleteDoc, writeBatch, serverTimestamp, Timestamp, onSnapshot,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from './firebase.js';

// --- Constants ---
// Removed Local Storage Keys
const ADMIN_EMAIL = 'admin@example.com'; // Kept for initial check, but ideally use Firebase role
// const ADMIN_PASSWORD = 'password'; // Password check now happens via Firebase Auth
const TOTAL_SEATS_PER_SCREENING = 5 * 8;
const TICKET_PRICE_EGP = 90;
const MAX_BOOKING_DAYS_AHEAD = 5;

// --- DOM Elements ---
// Removed splashScreen
const authView = document.getElementById('auth-view');
const customerLoginForm = document.getElementById('customer-login-form');
const customerRegisterForm = document.getElementById('customer-register-form');
const adminLoginForm = document.getElementById('admin-login-form');
const vendorLoginForm = document.getElementById('vendor-login-form');
const showRegisterButton = document.getElementById('show-register-button');
const showAdminLoginButton = document.getElementById('show-admin-login-button');
const showVendorLoginButton = document.getElementById('show-vendor-login-button');
const backToCustomerLoginButtons = document.querySelectorAll('.back-to-customer-login');
const customerLoginError = document.getElementById('customer-login-error');
const registerError = document.getElementById('register-error');
const adminLoginError = document.getElementById('admin-login-error');
const vendorLoginError = document.getElementById('vendor-login-error');
const appHeader = document.getElementById('app-header');
const loggedInUserInfo = document.getElementById('logged-in-user-info');
const logoutButton = document.getElementById('logout-button');
const adminView = document.getElementById('admin-view');
const adminNavButtons = document.querySelectorAll('.admin-nav-button');
const adminManageMoviesSection = document.getElementById('admin-manage-movies');
const adminAnalyticsSection = document.getElementById('admin-analytics');
const adminBookingsSection = document.getElementById('admin-bookings-section');
const adminQrScannerSection = document.getElementById('admin-qr-scanner-section');
const adminManageVendorsSection = document.getElementById('admin-manage-vendors');
const adminBookingsListContainer = document.getElementById('admin-bookings-list');
const adminVendorListContainer = document.getElementById('admin-vendor-list');
const adminQrReaderElement = document.getElementById('admin-qr-reader');
const startScanBtn = document.getElementById('start-scan-btn');
const scanStatusElement = document.getElementById('scan-status');
const movieForm = document.getElementById('movie-form');
const formTitle = document.getElementById('form-title');
const submitButton = document.getElementById('submit-button');
const cancelEditButton = document.getElementById('cancel-edit-button');
const movieVendorSelect = document.getElementById('movie-vendor');
const vendorForm = document.getElementById('vendor-form');
const vendorFormTitle = document.getElementById('vendor-form-title');
const vendorSubmitButton = document.getElementById('vendor-submit-button');
const vendorCancelEditButton = document.getElementById('vendor-cancel-edit-button');
const adminMovieListContainer = document.getElementById('admin-movie-list');
const customerPreviewContainer = document.getElementById('customer-movie-list-preview');
const noMoviesAdminMsg = document.getElementById('no-movies-admin');
const noMoviesPreviewMsg = document.getElementById('no-movies-preview');
const analyticsAvgRatingsContainer = document.getElementById('analytics-avg-ratings');
const analyticsOccupancyContainer = document.getElementById('analytics-occupancy');
const adminTotalRevenueElement = document.getElementById('admin-total-revenue');
const customerView = document.getElementById('customer-view');
const customerMovieListContainer = document.getElementById('customer-movie-list');
const noMoviesCustomerMsg = document.getElementById('no-movies-customer');
const toggleMyBookingsBtn = document.getElementById('toggle-my-bookings-btn');
const myBookingsView = document.getElementById('my-bookings-view');
const myBookingsListContainer = document.getElementById('my-bookings-list');
const backToMoviesBtn = document.getElementById('back-to-movies-btn');
const vendorDashboardView = document.getElementById('vendor-dashboard-view');
const vendorMovieListContainer = document.getElementById('vendor-movie-list');
const noVendorMoviesMsg = document.getElementById('no-vendor-movies');
const vendorAnalyticsAvgRatingsContainer = document.getElementById('vendor-analytics-avg-ratings');
const vendorAnalyticsOccupancyContainer = document.getElementById('vendor-analytics-occupancy');
const vendorTotalRevenueElement = document.getElementById('vendor-total-revenue');
const movieDetailsModal = document.getElementById('movie-details-modal');
const modalCloseButton = document.getElementById('modal-close-button');
const modalMovieTitle = document.getElementById('modal-movie-title');
const modalMoviePoster = document.getElementById('modal-movie-poster');
const modalAvgRatingContainer = document.getElementById('modal-avg-rating');
const modalMovieGenre = document.getElementById('modal-movie-genre');
const modalMovieDuration = document.getElementById('modal-movie-duration');
const modalMovieDescription = document.getElementById('modal-movie-description');
const modalDatepickerInput = document.getElementById('modal-datepicker');
const dateErrorElement = document.getElementById('date-error');
const calendarContainer = document.getElementById('calendar-container');
const modalShowtimesContainer = document.getElementById('modal-showtimes-container');
const modalShowtimesList = document.getElementById('modal-showtimes-list');
const modalRatingSection = document.getElementById('modal-rating-section');
const modalStarsContainer = document.getElementById('modal-stars');
const modalRatingMessage = document.getElementById('modal-rating-message');
const seatMapContainer = document.getElementById('seat-map-container');
const seatGrid = document.getElementById('seat-grid');
const selectedSeatsInfo = document.getElementById('selected-seats-info');
const confirmSelectionButton = document.getElementById('confirm-selection-button');
const qrValidationModal = document.getElementById('qr-validation-modal');
const validationModalCloseBtn = document.getElementById('validation-modal-close-btn');
const validationModalCloseBtnSecondary = document.getElementById('validation-modal-close-btn-secondary');
const validationMovieTitle = document.getElementById('validation-movie-title');
const validationShowtime = document.getElementById('validation-showtime');
const validationSeats = document.getElementById('validation-seats');
const validationEmail = document.getElementById('validation-email');
const validationBookingId = document.getElementById('validation-booking-id');
const validationStatusElement = document.getElementById('validation-status');
const markUsedBtn = document.getElementById('mark-used-btn');
const paymentModal = document.getElementById('payment-modal');
const paymentModalCloseBtn = document.getElementById('payment-modal-close-btn');
const paymentModalCloseBtnSecondary = document.getElementById('payment-modal-close-btn-secondary');
const paymentForm = document.getElementById('payment-form');
const paymentMovieTitle = document.getElementById('payment-movie-title');
const paymentSelectedDate = document.getElementById('payment-selected-date');
const paymentShowtime = document.getElementById('payment-showtime');
const paymentSeats = document.getElementById('payment-seats');
const paymentTotalCost = document.getElementById('payment-total-cost');
const paymentErrorElement = document.getElementById('payment-error');
const payNowBtn = document.getElementById('pay-now-btn');

// --- State ---
let movies = [];       // Holds movie data fetched from Firestore
let vendors = [];      // Holds vendor data fetched from Firestore
let allBookings = [];  // Holds booking data fetched from Firestore
let allRatings = [];   // Holds rating data fetched from Firestore
let authState = { isLoggedIn: false, user: null }; // Updated by onAuthStateChanged
let editingMovieId = null;    // Store Firestore ID for editing movie
let editingVendorId = null;   // Store Firestore ID for editing vendor
let selectedSeats = [];
let currentAdminTab = 'admin-manage-movies';
let currentModalMovieId = null;
let currentSelectedDate = null;
let isShowingMyBookings = false;
let html5QrCodeScanner = null;
let pikadayInstance = null;

// --- Utility Functions ---
function showElement(el) { if (el) { el.classList.remove('is-hidden'); el.style.height = ''; el.style.opacity = ''; el.style.visibility = ''; el.style.pointerEvents = ''; el.style.margin = ''; el.style.padding = ''; el.style.border = ''; } }
function hideElement(el) { if (el) { el.classList.add('is-hidden'); } }
function displayError(element, message) { if (element) { element.textContent = message; showElement(element); } }
function hideError(element) { if (element) { element.textContent = ''; hideElement(element); } }
// function generateId() { return '_' + Math.random().toString(36).substr(2, 9); } // Firestore generates IDs
function formatDateReadable(date) {
    if (!date) return 'N/A';
    // Handle both JS Date objects and Firebase Timestamps
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
function formatDateYYYYMMDD(date) {
    if (!date) return null;
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
}

// --- Firebase Data Loading ---
async function loadDataFromFirebase() {
    console.log("Loading data from Firebase...");
    try {
        // Load Movies
        const moviesSnapshot = await getDocs(collection(db, "movies"));
        movies = moviesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Movies loaded:", movies.length);

        // Load Vendors
        const vendorsSnapshot = await getDocs(collection(db, "vendors"));
        vendors = vendorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Vendors loaded:", vendors.length);

        // Load Bookings (can filter by user later if needed)
        const bookingsSnapshot = await getDocs(collection(db, "bookings"));
        allBookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Bookings loaded:", allBookings.length);

        // Load Ratings
        const ratingsSnapshot = await getDocs(collection(db, "ratings"));
        allRatings = ratingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Ratings loaded:", allRatings.length);

    } catch (error) {
        console.error("Error loading data from Firebase:", error);
        alert("Failed to load data from the server. Please check your connection and try again.");
    }
}

// --- Rating Functions ---
function calculateAverageRating(movie) { // movie object should contain the Firestore movie ID (movie.id)
    if (!movie || !movie.id) return { average: 0, count: 0 };
    const relevantRatings = allRatings.filter(r => r.movieId === movie.id); // Filter pre-loaded ratings
    if (relevantRatings.length === 0) {
        return { average: 0, count: 0 };
    }
    const sum = relevantRatings.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / relevantRatings.length;
    return { average: average, count: relevantRatings.length };
}

// Render Stars (Modified to accept Firestore movie ID)
function renderStars(container, averageRating, count = 0, interactive = false, userRating = null, movieId = null) {
    if (!container) return;
    container.innerHTML = '';
    container.classList.toggle('interactive', interactive);
    container.dataset.movieId = movieId || ''; // Use Firestore ID
    const ratingValue = Math.round(averageRating);
    const displayRating = interactive && userRating !== null ? userRating : ratingValue;

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.classList.add(i <= displayRating ? 'fas' : 'fa-regular', 'fa-star');
        star.dataset.rating = i;
        if (interactive) {
            star.style.cursor = 'pointer';
            star.onclick = () => handleStarClick(movieId, i); // Pass Firestore ID
            star.onmouseover = () => highlightStars(container, i);
            star.onmouseout = () => highlightStars(container, userRating || 0);
        }
        container.appendChild(star);
    }

    if (!interactive) {
        const ratingText = document.createElement('span');
        ratingText.className = 'ml-2 text-sm text-gray-500';
        if (averageRating > 0) {
            ratingText.textContent = `${averageRating.toFixed(1)} (${count} ${count === 1 ? 'rating' : 'ratings'})`;
        } else {
            ratingText.textContent = 'No ratings yet';
        }
        container.appendChild(ratingText);
    }
}

function highlightStars(container, rating) {
    const stars = container.querySelectorAll('i');
    stars.forEach(star => {
        const starRating = parseInt(star.dataset.rating, 10);
        star.classList.toggle('fas', starRating <= rating);
        star.classList.toggle('fa-regular', starRating > rating);
    });
}

// Handle Star Click (Modified to use Firestore)
async function handleStarClick(movieId, rating) {
    if (!authState.isLoggedIn || !authState.user || authState.user.type !== 'customer' || !movieId) return;
    const userId = authState.user.uid; // Use Firebase UID

    // Check if user already rated this movie by querying Firestore
    const q = query(collection(db, "ratings"), where("movieId", "==", movieId), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        console.log("User already rated this movie.");
        // Potentially update UI to show existing rating clearly
        return; // Already rated
    }

    try {
        // Add rating to Firestore 'ratings' collection
        const ratingData = {
            movieId: movieId,
            userId: userId,
            rating: rating,
            createdAt: serverTimestamp() // Use server timestamp
        };
        const docRef = await addDoc(collection(db, "ratings"), ratingData);
        console.log("Rating added with ID: ", docRef.id);

        // Optimistically update local ratings cache
        allRatings.push({ id: docRef.id, ...ratingData, createdAt: new Date() }); // Add temporary date

        // Update UI
        const movie = movies.find(m => m.id === movieId);
        if (movie) {
             const avgData = calculateAverageRating(movie);
             renderStars(modalAvgRatingContainer, avgData.average, avgData.count); // Re-render avg rating in modal
        }
        renderStars(modalStarsContainer, 0, 0, false, rating, movieId); // Show the user's submitted rating (non-interactive)
        modalRatingMessage.textContent = `You rated this movie ${rating} star${rating > 1 ? 's' : ''}.`;
        modalStarsContainer.classList.remove('interactive');
        modalStarsContainer.style.cursor = 'default';

        // Refresh movie list if needed (to update average rating display)
        renderCustomerContent(); // Or a more targeted update if possible

    } catch (error) {
        console.error("Error adding rating: ", error);
        alert("Failed to submit rating. Please try again.");
        // Optionally revert optimistic UI update here
    }
}


// --- UI Rendering Functions ---
function renderUI() {
    // loadAllBookingsFromStorage(); loadUsedQrCodes(); // Replaced by loadDataFromFirebase() triggered by auth state change
    closeModal();
    closePaymentModal();
    closeValidationModal();

    if (authState.isLoggedIn && authState.user) {
        hideElement(authView);
        showElement(appHeader);
        let userTypeDisplay = authState.user.type;
        // Use user's vendor name if available (fetched during login)
        if (authState.user.type === 'vendor' && authState.user.name) {
            userTypeDisplay = `vendor (${authState.user.name})`;
        }
        loggedInUserInfo.textContent = `Logged in as: ${authState.user.email} (${userTypeDisplay})`;

        if (authState.user.type === 'admin') {
            hideElement(customerView);
            hideElement(vendorDashboardView);
            showElement(adminView);
            renderAdminContent();
        } else if (authState.user.type === 'vendor') {
            hideElement(customerView);
            hideElement(adminView);
            showElement(vendorDashboardView);
            renderVendorDashboard();
        } else { // Customer
            hideElement(adminView);
            hideElement(vendorDashboardView);
            showElement(customerView);
            renderCustomerContent();
        }
    } else { // Logged out
        hideElement(appHeader);
        hideElement(adminView);
        hideElement(customerView);
        hideElement(myBookingsView);
        hideElement(vendorDashboardView);
        showElement(authView);
        showCustomerLoginForm();
    }
}

// --- Admin Content Rendering ---
function renderAdminContent() {
     resetForm(); resetVendorForm(); stopQrScanner();
     document.querySelectorAll('#admin-view > .admin-section').forEach(sec => hideElement(sec));
     const activeSection = document.getElementById(currentAdminTab);
     if(activeSection) {
         showElement(activeSection);
         adminNavButtons.forEach(btn => { btn.classList.toggle('active', btn.dataset.target === currentAdminTab); });
         console.log("Showing admin section:", currentAdminTab);
     } else {
         console.error("Could not find admin section with ID:", currentAdminTab);
         currentAdminTab = 'admin-manage-movies'; // Default fallback
         showElement(adminManageMoviesSection);
         adminNavButtons.forEach(btn => { btn.classList.toggle('active', btn.dataset.target === currentAdminTab); });
     }

     console.log("Rendering admin content for tab:", currentAdminTab);
     if (currentAdminTab === 'admin-manage-movies') {
         renderMovies(adminMovieListContainer, 'admin');
         renderMovies(customerPreviewContainer, 'preview');
         populateVendorDropdown('movie-vendor');
     }
     else if (currentAdminTab === 'admin-analytics') {
         renderAnalyticsDashboard();
     }
     else if (currentAdminTab === 'admin-bookings-section') {
         renderAdminBookingsList();
     }
     else if (currentAdminTab === 'admin-qr-scanner-section') {
         if(scanStatusElement) scanStatusElement.textContent = "Click Start Scanning.";
     }
     else if (currentAdminTab === 'admin-manage-vendors') {
         renderAdminVendorManagement();
     }
}

// Render Admin Bookings List (Using Firestore data)
function renderAdminBookingsList() {
    if (!adminBookingsListContainer) { console.error("Admin bookings list container not found!"); return; }
    adminBookingsListContainer.innerHTML = '';
    console.log("Rendering admin bookings list. Total bookings:", allBookings.length);

    if (allBookings.length === 0) {
        adminBookingsListContainer.innerHTML = '<p class="text-gray-500">No customer bookings found.</p>';
        return;
    }

    // --- Group bookings by movie title (optional, for better structure) ---
    const bookingsByMovie = allBookings.reduce((acc, booking) => {
        // Find movie title from local movies array using movieId from booking
        const movie = movies.find(m => m.id === booking.movieId);
        const title = movie ? movie.title : (booking.movieTitle || 'Unknown Movie'); // Fallback to stored title if movie deleted
        if (!acc[title]) {
            acc[title] = [];
        }
        acc[title].push(booking);
        return acc;
    }, {});

    const sortedMovieTitles = Object.keys(bookingsByMovie).sort();

    if (sortedMovieTitles.length === 0 && allBookings.length > 0) {
        // Render ungrouped if grouping fails but bookings exist
        adminBookingsListContainer.innerHTML = ''; // Clear again
        allBookings.sort((a, b) => (b.timestamp?.toDate?.() || 0) - (a.timestamp?.toDate?.() || 0)) // Sort by Firestore Timestamp
            .forEach(booking => adminBookingsListContainer.appendChild(createBookingListItem(booking, 'admin')));
        return;
    } else if (sortedMovieTitles.length === 0) {
         adminBookingsListContainer.innerHTML = '<p class="text-gray-500">No bookings found after grouping.</p>';
         return;
    }

    sortedMovieTitles.forEach(movieTitle => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'admin-booking-group mb-6';

        const titleHeading = document.createElement('h3');
        titleHeading.innerHTML = `<i class="fas fa-film mr-2 text-gray-500"></i>${movieTitle}`;
        groupDiv.appendChild(titleHeading);

        const bookingsForMovie = bookingsByMovie[movieTitle]
                                    .sort((a, b) => (b.timestamp?.toDate?.() || 0) - (a.timestamp?.toDate?.() || 0)); // Sort by Firestore Timestamp

        const listElement = document.createElement('div');
        listElement.className = 'space-y-3 pl-4';
        bookingsForMovie.forEach(booking => {
             listElement.appendChild(createBookingListItem(booking, 'admin'));
        });

        groupDiv.appendChild(listElement);
        adminBookingsListContainer.appendChild(groupDiv);
    });
}

// Helper to create a booking list item (for admin or customer)
function createBookingListItem(booking, viewType = 'customer') {
     const itemDiv = document.createElement('div');
     const isUsed = booking.qrCodeUsed || false; // Check Firestore field
     const movie = movies.find(m => m.id === booking.movieId); // Get movie details if available

     if (viewType === 'admin') {
         itemDiv.className = 'admin-booking-item';
         const statusLabelClass = isUsed ? 'status-used' : 'status-not-used';
         const statusText = isUsed ? '✅ QR Code Used' : '🔄 QR Code Not Used';
         const usedTimestamp = booking.qrUsedTimestamp ? formatDateReadable(booking.qrUsedTimestamp.toDate()) + ' ' + booking.qrUsedTimestamp.toDate().toLocaleTimeString() : 'N/A';
         itemDiv.innerHTML = `
             <span><i class="fas fa-user"></i>${booking.userEmail || 'N/A'}</span>
             <span><i class="fas fa-calendar-alt"></i>${formatDateReadable(booking.selectedDate)}</span>
             <span><i class="fas fa-clock"></i>${booking.showtime || 'N/A'}</span>
             <span><i class="fas fa-chair"></i><span class="seats">${booking.seats?.sort()?.join(', ') || 'N/A'}</span></span>
             <span><i class="fas fa-money-bill-wave"></i>${booking.totalAmount || 0} EGP</span>
             <span><i class="fas fa-receipt"></i><span class="text-xs text-gray-500 ml-1">ID: ${booking.id}</span></span>
             <div class="mt-2 flex justify-between items-center">
                <span class="status-label ${statusLabelClass}">${statusText}</span>
                ${isUsed ? `<span class="text-xs text-gray-500">Used: ${usedTimestamp}</span>` : ''}
             </div>
         `;
     } else { // Customer view ('my-bookings')
         itemDiv.className = 'booking-list-item';
          // Include Firestore booking ID in QR data
         const qrData = JSON.stringify({
             bookingId: booking.id, // Use Firestore ID
             movieTitle: movie?.title || booking.movieTitle || 'Unknown Movie',
             showtime: booking.showtime,
             seats: booking.seats,
             userEmail: booking.userEmail
             // DO NOT include payment details or user ID in QR
         });
         itemDiv.innerHTML = `
             <div class="booking-main-info">
                 <div class="booking-details">
                     <p class="text-lg font-semibold mb-1">${movie?.title || booking.movieTitle || 'Unknown Movie'}</p>
                     <p class="text-sm text-gray-600 mb-1"><strong>Date:</strong> ${formatDateReadable(booking.selectedDate)}</p>
                     <p class="text-sm text-gray-600 mb-1"><strong>Showtime:</strong> ${booking.showtime || 'N/A'}</p>
                     <p class="text-sm text-gray-600"><strong>Seats:</strong> <span class="seats">${booking.seats?.sort()?.join(', ') || 'N/A'}</span></p>
                 </div>
                 <div id="qr-code-${booking.id}" class="qr-code-container" title='${qrData.replace(/'/g, "&apos;")}'></div>
             </div>
             <div class="booking-meta">
                 <span>Booked: ${booking.timestamp ? new Date(booking.timestamp.toDate()).toLocaleString() : 'N/A'}</span> |
                 <span>Cost: ${booking.totalAmount || 0} EGP</span> |
                 <span class="text-xs text-gray-500">ID: ${booking.id}</span>
                 ${isUsed ? '<span class="ml-2 text-red-600 font-semibold">[USED]</span>' : ''}
             </div>
         `;
         // Generate QR code after appending
         setTimeout(() => { // Defer QR generation slightly
             try {
                 const qrElement = document.getElementById(`qr-code-${booking.id}`);
                 if (qrElement) {
                     new QRCode(qrElement, {
                         text: qrData,
                         width: 90, height: 90,
                         colorDark: "#000000", colorLight: "#ffffff",
                         correctLevel: QRCode.CorrectLevel.M
                     });
                 }
             } catch (e) {
                 console.error("QR Code generation failed:", e);
                 const qrElement = document.getElementById(`qr-code-${booking.id}`);
                 if(qrElement) qrElement.innerText = "QR Error";
             }
         }, 0);
     }
     return itemDiv;
}


// --- Customer Content Rendering ---
function renderCustomerContent() {
    if (isShowingMyBookings) {
        showMyBookingsView();
    } else {
        showCustomerMovieListView();
    }
}
function showCustomerMovieListView() {
    isShowingMyBookings = false;
    hideElement(myBookingsView);
    showElement(customerMovieListContainer);
    renderMovies(customerMovieListContainer, 'customer'); // Uses local 'movies' array
    toggleMyBookingsBtn.innerHTML = '<i class="fas fa-ticket-alt mr-2"></i>My Bookings';
}
function showMyBookingsView() {
    isShowingMyBookings = true;
    hideElement(customerMovieListContainer);
    renderMyBookings(); // Fetches and renders user's bookings
    showElement(myBookingsView);
    toggleMyBookingsBtn.innerHTML = '<i class="fas fa-film mr-2"></i>Now Showing';
}
// Render My Bookings (Using Firestore data)
function renderMyBookings() {
    myBookingsListContainer.innerHTML = '<p class="text-gray-500">Loading your bookings...</p>'; // Loading state
    if (!authState.isLoggedIn || !authState.user || !authState.user.uid) {
        myBookingsListContainer.innerHTML = '<p class="text-red-500">Error: Login required to view bookings.</p>';
        return;
    }
    const currentUserUid = authState.user.uid;

    // Filter pre-loaded bookings for the current user
    const userBookings = allBookings
        .filter(booking => booking.userId === currentUserUid)
        .sort((a, b) => (b.timestamp?.toDate?.() || 0) - (a.timestamp?.toDate?.() || 0)); // Sort by Firestore Timestamp

    if (userBookings.length === 0) {
        myBookingsListContainer.innerHTML = '<p class="text-gray-500">You have no bookings yet.</p>';
        return;
    }

    myBookingsListContainer.innerHTML = ''; // Clear loading/previous
    userBookings.forEach(booking => {
        myBookingsListContainer.appendChild(createBookingListItem(booking, 'customer'));
    });
}

// --- Admin/Vendor Analytics ---
function renderAnalyticsDashboard(targetVendorName = null) {
    const isVendor = targetVendorName !== null;
    const avgRatingsContainer = isVendor ? vendorAnalyticsAvgRatingsContainer : analyticsAvgRatingsContainer;
    const occupancyContainer = isVendor ? vendorAnalyticsOccupancyContainer : analyticsOccupancyContainer;
    const totalRevenueElement = isVendor ? vendorTotalRevenueElement : adminTotalRevenueElement;

    if (!avgRatingsContainer || !occupancyContainer || !totalRevenueElement) return;

    avgRatingsContainer.innerHTML = ''; occupancyContainer.innerHTML = ''; totalRevenueElement.textContent = '0 EGP';

    // Filter movies based on vendor or all
    const relevantMovies = isVendor ? movies.filter(m => m.vendorName === targetVendorName) : movies;
    const relevantMovieIds = relevantMovies.map(m => m.id); // Get Firestore IDs

    // Filter bookings based on the relevant movie IDs
    const relevantBookings = allBookings.filter(b => relevantMovieIds.includes(b.movieId));

    if (relevantMovies.length === 0) {
        avgRatingsContainer.innerHTML = `<p class="text-gray-500">No movies ${isVendor ? 'assigned' : ''}.</p>`;
        occupancyContainer.innerHTML = `<p class="text-gray-500">No movies ${isVendor ? 'assigned' : ''}.</p>`;
        return;
    }

    // Total Revenue
    const totalRevenue = relevantBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    totalRevenueElement.textContent = `${totalRevenue.toFixed(2)} EGP`;

    // Avg Ratings (Uses pre-loaded 'allRatings' and 'calculateAverageRating')
    let hasRatings = false;
    avgRatingsContainer.innerHTML = ''; // Clear previous
    relevantMovies.forEach(movie => {
        const { average, count } = calculateAverageRating(movie); // Pass movie object with ID
        if (count > 0) hasRatings = true;
        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'flex justify-between items-center text-sm pb-1 border-b border-gray-200';
        const titleSpan = document.createElement('span');
        titleSpan.textContent = movie.title;
        titleSpan.className = 'font-medium text-gray-700';
        const starsSpan = document.createElement('span');
        starsSpan.className = 'stars-container flex items-center';
        renderStars(starsSpan, average, count, false); // Render non-interactive stars
        ratingDiv.appendChild(titleSpan);
        ratingDiv.appendChild(starsSpan);
        avgRatingsContainer.appendChild(ratingDiv);
    });
    if (!hasRatings) {
        avgRatingsContainer.innerHTML = `<p class="text-gray-500">No ratings submitted ${isVendor ? 'for your movies' : ''} yet.</p>`;
    }

    // Occupancy
    let hasOccupancyData = false;
    occupancyContainer.innerHTML = ''; // Clear previous
    relevantMovies.forEach(movie => {
        const movieOccupancyDiv = document.createElement('div');
        movieOccupancyDiv.className = 'mb-4 pb-4 border-b border-gray-200 last:border-b-0';
        const movieTitleH4 = document.createElement('h4');
        movieTitleH4.className = 'text-lg font-semibold text-gray-800 mb-2';
        movieTitleH4.textContent = movie.title;
        movieOccupancyDiv.appendChild(movieTitleH4);

        // Use showtimes array directly from movie object
        const showtimes = Array.isArray(movie.showtimes) ? movie.showtimes : (movie.showtimes ? movie.showtimes.split(',').map(st => st.trim()).filter(st => st) : []);

        if (showtimes.length > 0) {
             showtimes.forEach(time => {
                 // Count booked seats for this specific movie, date (implicitly all dates here), and showtime
                 // NOTE: This basic occupancy doesn't filter by date. A more complex query would be needed.
                 const bookedCount = relevantBookings.reduce((count, booking) =>
                     (booking.movieId === movie.id && booking.showtime === time && Array.isArray(booking.seats))
                         ? count + booking.seats.length
                         : count,
                 0);

                 if (bookedCount > 0) hasOccupancyData = true; // Mark if any booking found

                 const occupancyPercent = TOTAL_SEATS_PER_SCREENING > 0 ? (bookedCount / TOTAL_SEATS_PER_SCREENING) * 100 : 0;
                 let occupancyLabel = 'Unpopular';
                 let occupancyClass = 'occupancy-unpopular';
                 if (occupancyPercent >= 67) { occupancyLabel = 'Popular'; occupancyClass = 'occupancy-popular'; }
                 else if (occupancyPercent >= 34) { occupancyLabel = 'Normal'; occupancyClass = 'occupancy-normal'; }

                 const showtimeDiv = document.createElement('div');
                 showtimeDiv.className = 'flex justify-between items-center text-sm mb-1';
                 showtimeDiv.innerHTML = `
                     <span class="text-gray-600">${time}</span>
                     <span>
                         <span class="text-gray-500 mr-2">(${bookedCount}/${TOTAL_SEATS_PER_SCREENING} seats booked across all dates)</span>
                         <span class="occupancy-tag ${occupancyClass}">${occupancyLabel}</span>
                     </span>`;
                 movieOccupancyDiv.appendChild(showtimeDiv);
             });
        } else {
            movieOccupancyDiv.innerHTML += '<p class="text-sm text-gray-500">No showtimes listed.</p>';
        }
        occupancyContainer.appendChild(movieOccupancyDiv);
    });
     if (!hasOccupancyData) {
        occupancyContainer.innerHTML = `<p class="text-gray-500">No booking data available ${isVendor ? 'for your movies' : ''}.</p>`;
    }
}


// --- Vendor Dashboard Rendering ---
function renderVendorDashboard() {
    if (!vendorMovieListContainer || !noVendorMoviesMsg || !vendorAnalyticsAvgRatingsContainer || !vendorAnalyticsOccupancyContainer) return;
    vendorMovieListContainer.innerHTML = ''; // Clear previous movies

    if (!authState.isLoggedIn || authState.user.type !== 'vendor' || !authState.user.name) {
        noVendorMoviesMsg.textContent = 'Error: Invalid vendor session.'; showElement(noVendorMoviesMsg);
        // Clear analytics too
         vendorAnalyticsAvgRatingsContainer.innerHTML = '<p class="text-gray-500">Login as vendor to see analytics.</p>';
         vendorAnalyticsOccupancyContainer.innerHTML = '<p class="text-gray-500">Login as vendor to see analytics.</p>';
         if(vendorTotalRevenueElement) vendorTotalRevenueElement.textContent = '0 EGP';
        return;
    }

    const vendorName = authState.user.name;
    // Filter locally loaded movies
    const vendorMovies = movies.filter(movie => movie.vendorName === vendorName);

    // Render Movie List for Vendor
    if (vendorMovies.length === 0) {
        noVendorMoviesMsg.textContent = `No movies assigned to vendor "${vendorName}".`;
        showElement(noVendorMoviesMsg);
    } else {
        hideElement(noVendorMoviesMsg);
        vendorMovies.forEach((movie) => {
            // Pass Firestore ID to createMovieCard
            const card = createMovieCard(movie, null, 'vendor_dashboard'); // Index not needed if using ID
            vendorMovieListContainer.appendChild(card);
        });
    }

    // Render Vendor Analytics (passing vendor name)
    renderAnalyticsDashboard(vendorName);
}


// --- Auth Form Switching ---
function showCustomerLoginForm() { hideElement(customerRegisterForm); hideElement(adminLoginForm); hideElement(vendorLoginForm); showElement(customerLoginForm); hideError(customerLoginError); hideError(registerError); hideError(adminLoginError); hideError(vendorLoginError); }
function showCustomerRegisterForm() { hideElement(customerLoginForm); hideElement(adminLoginForm); hideElement(vendorLoginForm); showElement(customerRegisterForm); hideError(customerLoginError); hideError(registerError); hideError(adminLoginError); hideError(vendorLoginError); customerRegisterForm.reset(); }
function showAdminLoginForm() { hideElement(customerLoginForm); hideElement(customerRegisterForm); hideElement(vendorLoginForm); showElement(adminLoginForm); hideError(customerLoginError); hideError(registerError); hideError(adminLoginError); hideError(vendorLoginError); }
function showVendorLoginForm() { hideElement(customerLoginForm); hideElement(customerRegisterForm); hideElement(adminLoginForm); showElement(vendorLoginForm); hideError(customerLoginError); hideError(registerError); hideError(adminLoginError); hideError(vendorLoginError); vendorLoginForm.reset(); }

// --- Auth Logic (Using Firebase Auth) ---
async function handleCustomerLogin(event) {
    event.preventDefault();
    hideError(customerLoginError);
    const email = document.getElementById('customer-email').value.trim();
    const password = document.getElementById('customer-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Success: onAuthStateChanged listener will handle UI update
        customerLoginForm.reset();
    } catch (error) {
        console.error("Customer Login Error:", error);
        displayError(customerLoginError, "Invalid email or password.");
    }
}

async function handleAdminLogin(event) {
    event.preventDefault();
    hideError(adminLoginError);
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Role check will happen in onAuthStateChanged
        adminLoginForm.reset();
        // No need to manually set state here, onAuthStateChanged handles it
    } catch (error) {
        console.error("Admin Login Error:", error);
        displayError(adminLoginError, "Invalid admin email or password.");
    }
}

async function handleRegistration(event) {
    event.preventDefault();
    hideError(registerError);
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (!email || !password) { displayError(registerError, "Email/password required."); return; }
    if (password !== confirmPassword) { displayError(registerError, "Passwords do not match."); return; }
    if (password.length < 6) { displayError(registerError, "Password must be at least 6 characters."); return; }

    try {
        // Check if email already exists in 'users' (optional, Firebase Auth handles this too)
        // const q = query(collection(db, "users"), where("email", "==", email));
        // const existingUserSnap = await getDocs(q);
        // if (!existingUserSnap.empty) {
        //     displayError(registerError, "Email already registered.");
        //     return;
        // }

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User registered in Auth:", user.uid);

        // Create user document in Firestore 'users' collection
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            role: 'customer', // Default role
            createdAt: serverTimestamp()
        });
        console.log("User document created in Firestore for:", user.uid);

        // Success: onAuthStateChanged handles UI update
        customerRegisterForm.reset();

    } catch (error) {
        console.error("Registration Error:", error);
        if (error.code === 'auth/email-already-in-use') {
            displayError(registerError, "Email already registered.");
        } else {
            displayError(registerError, "Registration failed. Please try again.");
        }
    }
}

async function handleVendorLogin(event) {
    event.preventDefault();
    hideError(vendorLoginError);
    const email = document.getElementById('vendor-email').value.trim();
    const password = document.getElementById('vendor-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Success: onAuthStateChanged handles role check and UI update
        vendorLoginForm.reset();
    } catch (error) {
        console.error("Vendor Login Error:", error);
        displayError(vendorLoginError, "Invalid vendor email or password.");
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
        // Success: onAuthStateChanged handles UI update and state reset
        currentAdminTab = 'admin-manage-movies';
        isShowingMyBookings = false;
        stopQrScanner();
        // Clear local volatile state if necessary
        movies = [];
        vendors = [];
        allBookings = [];
        allRatings = [];
        console.log("User logged out.");
    } catch (error) {
        console.error("Logout Error:", error);
        alert("Failed to log out.");
    }
}

// --- Movie Management (Admin - Using Firestore) ---
function resetForm() {
    movieForm.reset();
    editingMovieId = null; // Reset editing ID
    formTitle.textContent = 'Add New Movie';
    submitButton.textContent = 'Add Movie';
    cancelEditButton.classList.add('hidden');
    if (movieVendorSelect) movieVendorSelect.value = "";
    // No hidden index input needed anymore
}

async function handleMovieFormSubmit(event) {
    event.preventDefault();
    const isEditing = !!editingMovieId;

    // Extract showtimes as an array
    const showtimesInput = document.getElementById('showtimes').value.trim();
    const showtimesArray = showtimesInput ? showtimesInput.split(',').map(s => s.trim()).filter(s => s) : [];


    const movieData = {
        title: document.getElementById('title').value.trim(),
        posterUrl: document.getElementById('poster').value.trim(), // Changed field name to match Firestore example
        description: document.getElementById('description').value.trim(),
        genre: document.getElementById('genre').value.trim(),
        duration: parseInt(document.getElementById('duration').value, 10),
        showtimes: showtimesArray, // Store as array
        vendorName: movieVendorSelect.value || null,
        // 'ratings' array is not stored here anymore
    };

    if (!movieData.title || !movieData.posterUrl || !movieData.genre || showtimesArray.length === 0 || isNaN(movieData.duration) || movieData.duration <= 0) {
        alert("Please fill all fields correctly (including at least one showtime).");
        return;
    }

    try {
        if (isEditing) {
            // Update existing document
            const movieRef = doc(db, "movies", editingMovieId);
            await updateDoc(movieRef, movieData); // Use updateDoc to merge
            console.log("Movie updated:", editingMovieId);
            // Update local array
            const index = movies.findIndex(m => m.id === editingMovieId);
            if (index > -1) {
                movies[index] = { ...movies[index], ...movieData }; // Merge updates locally
            }

        } else {
            // Add new document
            movieData.createdAt = serverTimestamp(); // Add timestamp for new movies
            const docRef = await addDoc(collection(db, "movies"), movieData);
            console.log("Movie added with ID:", docRef.id);
            // Add to local array optimistically (or reload)
             movies.push({ id: docRef.id, ...movieData, createdAt: new Date() }); // Simulate timestamp locally
        }
        // Refresh relevant admin views & reset form
        renderAdminContent(); // Re-renders movies list
        resetForm();

    } catch (error) {
        console.error("Error saving movie:", error);
        alert(`Failed to ${isEditing ? 'update' : 'add'} movie. Please try again.`);
    }
}

// Show Edit Form (Using Firestore ID)
function showEditForm(movieId) {
    const movie = movies.find(m => m.id === movieId);
    if (!movie) {
        console.error("Movie not found for editing:", movieId);
        resetForm(); // Reset if movie isn't found
        return;
    }
    editingMovieId = movieId; // Set the ID being edited

    populateVendorDropdown('movie-vendor'); // Ensure dropdown is populated

    document.getElementById('title').value = movie.title || '';
    document.getElementById('poster').value = movie.posterUrl || ''; // Use posterUrl
    document.getElementById('description').value = movie.description || '';
    document.getElementById('genre').value = movie.genre || '';
    document.getElementById('duration').value = movie.duration || '';
    // Join showtimes array back into a string for the input field
    document.getElementById('showtimes').value = Array.isArray(movie.showtimes) ? movie.showtimes.join(', ') : (movie.showtimes || '');
    movieVendorSelect.value = movie.vendorName || "";

    formTitle.textContent = 'Edit Movie';
    submitButton.textContent = 'Save Changes';
    cancelEditButton.classList.remove('hidden');
    movieForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Delete Movie (Using Firestore ID and deleting related data)
async function deleteMovie(movieId) {
    const movie = movies.find(m => m.id === movieId);
    if (!movie) {
        console.error("Movie not found for deletion:", movieId);
        return;
    }
    const movieTitle = movie.title || 'this movie';

    if (confirm(`Delete "${movieTitle}"? This permanently removes the movie, its ratings, and ALL associated customer bookings.`)) {
        console.log("Deleting movie:", movieId);
        try {
            const batch = writeBatch(db); // Use a batch for atomic delete

            // 1. Delete the movie document
            const movieRef = doc(db, "movies", movieId);
            batch.delete(movieRef);

            // 2. Query and delete related ratings
            const ratingsQuery = query(collection(db, "ratings"), where("movieId", "==", movieId));
            const ratingsSnapshot = await getDocs(ratingsQuery);
            ratingsSnapshot.forEach(doc => {
                console.log("Queueing rating delete:", doc.id)
                batch.delete(doc.ref);
            });

            // 3. Query and delete related bookings
            const bookingsQuery = query(collection(db, "bookings"), where("movieId", "==", movieId));
            const bookingsSnapshot = await getDocs(bookingsQuery);
            bookingsSnapshot.forEach(doc => {
                 console.log("Queueing booking delete:", doc.id)
                 batch.delete(doc.ref);
            });

            // Commit the batch
            await batch.commit();
            console.log("Movie and related data deleted successfully.");

            // Remove from local arrays
            movies = movies.filter(m => m.id !== movieId);
            allRatings = allRatings.filter(r => r.movieId !== movieId);
            allBookings = allBookings.filter(b => b.movieId !== movieId);

             // Refresh UI
             renderAdminContent();
             if (editingMovieId === movieId) resetForm();

        } catch (error) {
            console.error("Error deleting movie and related data:", error);
            alert("Failed to delete movie. Please try again.");
        }
    }
}


// --- Vendor Management (Admin - Using Firestore) ---
function renderAdminVendorManagement() {
    resetVendorForm();
    renderVendorList(); // Uses local 'vendors' array loaded from Firebase
}
function renderVendorList() {
    if (!adminVendorListContainer) return;
    adminVendorListContainer.innerHTML = '';

    if (vendors.length === 0) {
        adminVendorListContainer.innerHTML = '<p class="text-gray-500">No vendors registered yet.</p>';
        return;
    }

    vendors.forEach((vendor) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'vendor-list-item';
        // Pass Firestore ID to edit/delete functions
        itemDiv.innerHTML = `
            <div class="flex-grow pr-4">
                <span class="font-medium text-gray-800">${vendor.name}</span>
                <span class="block text-sm text-gray-500">${vendor.email}</span>
            </div>
            <div class="flex-shrink-0 flex gap-2">
                <button class="btn btn-secondary btn-icon text-xs !py-1 !px-2" onclick="showEditVendorForm('${vendor.id}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-danger btn-icon text-xs !py-1 !px-2" onclick="deleteVendor('${vendor.id}')"><i class="fas fa-trash"></i> Delete</button>
            </div>`;
        adminVendorListContainer.appendChild(itemDiv);
    });
}

function resetVendorForm() {
    vendorForm.reset();
    editingVendorId = null; // Reset editing ID
    vendorFormTitle.textContent = 'Add New Vendor';
    vendorSubmitButton.textContent = 'Add Vendor';
    vendorCancelEditButton.classList.add('hidden');
}

async function handleVendorFormSubmit(event) {
    event.preventDefault();
    const isEditing = !!editingVendorId;

    const vendorData = {
        name: document.getElementById('vendor-name').value.trim(),
        email: document.getElementById('new-vendor-email').value.trim(),
        // Security Warning: Storing plain passwords is not recommended!
        // Vendors should ideally authenticate via Firebase Auth.
        // This is kept for simplicity based on the request.
        password: document.getElementById('new-vendor-password').value.trim()
    };

    if (!vendorData.name || !vendorData.email || !vendorData.password) {
        alert("Please fill all vendor fields.");
        return;
    }
    if (!/^\S+@\S+\.\S+$/.test(vendorData.email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Check for duplicate email (excluding the one being edited)
    const duplicate = vendors.some(v => v.email === vendorData.email && v.id !== editingVendorId);
    if (duplicate) {
        alert("A vendor with this email already exists.");
        return;
    }

    try {
        if (isEditing) {
            // Update existing vendor
            const vendorRef = doc(db, "vendors", editingVendorId);
            await updateDoc(vendorRef, vendorData);
            console.log("Vendor updated:", editingVendorId);
            // Update local array
            const index = vendors.findIndex(v => v.id === editingVendorId);
            if (index > -1) {
                vendors[index] = { ...vendors[index], ...vendorData };
            }
        } else {
            // Add new vendor
            // CONSIDER: Create a corresponding Firebase Auth user for the vendor here?
            // For simplicity, just adding to Firestore as requested.
            vendorData.createdAt = serverTimestamp(); // Add timestamp for new vendors
            const docRef = await addDoc(collection(db, "vendors"), vendorData);
            console.log("Vendor added with ID:", docRef.id);
            // Add to local array
             vendors.push({ id: docRef.id, ...vendorData, createdAt: new Date() });
        }
        renderVendorList(); // Refresh list
        resetVendorForm();
        populateVendorDropdown('movie-vendor'); // Update movie form dropdown

    } catch (error) {
        console.error("Error saving vendor:", error);
        alert(`Failed to ${isEditing ? 'update' : 'add'} vendor. Please try again.`);
    }
}

// Show Edit Vendor Form (Using Firestore ID)
function showEditVendorForm(vendorId) {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) {
        console.error("Vendor not found for editing:", vendorId);
        resetVendorForm();
        return;
    }
    editingVendorId = vendorId; // Set the ID being edited

    document.getElementById('vendor-name').value = vendor.name;
    document.getElementById('new-vendor-email').value = vendor.email;
    // Security Warning: Displaying/editing stored passwords is bad practice.
    document.getElementById('new-vendor-password').value = vendor.password || ''; // Handle if password wasn't stored initially

    vendorFormTitle.textContent = 'Edit Vendor';
    vendorSubmitButton.textContent = 'Save Changes';
    vendorCancelEditButton.classList.remove('hidden');
    vendorForm.scrollIntoView({ behavior: 'smooth' });
}

// Delete Vendor (Using Firestore ID and unassigning movies)
async function deleteVendor(vendorId) {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) {
        console.error("Vendor not found for deletion:", vendorId)
        return;
    }
    const vendorName = vendor.name;

    if (confirm(`Delete vendor "${vendorName}"? Movies assigned to this vendor will be unassigned.`)) {
        console.log("Deleting vendor:", vendorId, "Name:", vendorName);
        try {
            const batch = writeBatch(db);

            // 1. Delete the vendor document
            const vendorRef = doc(db, "vendors", vendorId);
            batch.delete(vendorRef);

            // 2. Query movies assigned to this vendor
            const moviesQuery = query(collection(db, "movies"), where("vendorName", "==", vendorName));
            const moviesSnapshot = await getDocs(moviesQuery);

            // 3. Update assigned movies to have null vendorName
            moviesSnapshot.forEach(movieDoc => {
                console.log(`Unassigning vendor from movie: ${movieDoc.id}`);
                batch.update(movieDoc.ref, { vendorName: null });
            });

            // Commit the batch
            await batch.commit();
            console.log("Vendor deleted and movies unassigned.");

            // Update local state
            vendors = vendors.filter(v => v.id !== vendorId);
            movies.forEach(movie => {
                if (movie.vendorName === vendorName) {
                    movie.vendorName = null; // Update local movie cache
                }
            });

            // Refresh UI
            renderVendorList();
            resetVendorForm();
            populateVendorDropdown('movie-vendor'); // Refresh dropdown in movie form
             // If admin movie management tab is active, refresh it too
            if (currentAdminTab === 'admin-manage-movies') {
                renderMovies(adminMovieListContainer, 'admin');
                renderMovies(customerPreviewContainer, 'preview');
            }
            // If vendor dashboard was somehow visible (shouldn't be after delete), refresh it
             if (authState.user?.name === vendorName) {
                 handleLogout(); // Log out the deleted vendor if they were logged in
             }


        } catch (error) {
            console.error("Error deleting vendor and updating movies:", error);
            alert("Failed to delete vendor. Please try again.");
        }
    }
}

function populateVendorDropdown(selectElementId) {
    const select = document.getElementById(selectElementId);
    if (!select) return;
    const currentVal = select.value; // Preserve selection if possible
    select.innerHTML = '<option value="">-- None --</option>';
    vendors.forEach(vendor => {
        const option = document.createElement('option');
        option.value = vendor.name;
        option.textContent = vendor.name;
        select.appendChild(option);
    });
    // Try to restore previous selection if it still exists
    if (vendors.some(v => v.name === currentVal)) {
         select.value = currentVal;
    }
}


// --- Movie Card Creation (Using Firestore data) ---
// Takes movie object (with id) and viewType. Index is no longer needed.
function createMovieCard(movie, _indexUnused, viewType) {
    const card = document.createElement('div');
    card.className = 'movie-card flex flex-col';
    card.dataset.movieId = movie.id; // Use Firestore ID

    const img = document.createElement('img');
    img.src = movie.posterUrl || 'https://placehold.co/400x600/cccccc/ffffff?text=No+Image'; // Use posterUrl
    img.alt = `${movie.title} Poster`;
    img.className = 'movie-poster';
    img.onerror = function() { this.onerror=null; this.src='https://placehold.co/400x600/cccccc/ffffff?text=Image+Error'; };

    const content = document.createElement('div');
    content.className = 'p-4 flex flex-col flex-grow';

    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold mb-1 text-gray-800 flex items-center';
    title.textContent = movie.title;
    if (movie.vendorName) {
        const vendorBadge = document.createElement('span');
        vendorBadge.className = 'vendor-badge';
        vendorBadge.textContent = movie.vendorName;
        title.appendChild(vendorBadge);
    }

    const avgRatingDiv = document.createElement('div');
    avgRatingDiv.className = 'stars-container text-sm mb-2';
    // Calculate average rating using the movie object (which includes the ID)
    const { average, count } = calculateAverageRating(movie);
    renderStars(avgRatingDiv, average, count, false); // Render non-interactive stars

    const details = document.createElement('p');
    details.className = 'text-sm text-gray-600 mb-1';
    details.innerHTML = ` <i class="fas fa-tag mr-1 opacity-75"></i> ${movie.genre || 'N/A'} &bull; <i class="fas fa-clock mr-1 opacity-75"></i> ${movie.duration || 'N/A'} min `;

    const description = document.createElement('p');
    description.className = 'text-sm text-gray-700 mb-3 flex-grow';
    description.textContent = movie.description || 'No description available.';

    const showtimes = document.createElement('p');
    showtimes.className = 'text-sm text-blue-600 font-medium mt-auto';
    // Display showtimes array nicely
    const showtimesText = Array.isArray(movie.showtimes) ? movie.showtimes.join(', ') : (movie.showtimes || 'N/A');
    showtimes.innerHTML = ` <i class="fas fa-calendar-alt mr-1 opacity-75"></i> Showtimes: ${showtimesText} `;

    content.appendChild(title);
    content.appendChild(avgRatingDiv);
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
        editButton.className = 'btn btn-secondary btn-icon text-xs !py-1 !px-2';
        editButton.onclick = (e) => { e.stopPropagation(); showEditForm(movie.id); }; // Pass Firestore ID
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteButton.className = 'btn btn-danger btn-icon text-xs !py-1 !px-2';
        deleteButton.onclick = (e) => { e.stopPropagation(); deleteMovie(movie.id); }; // Pass Firestore ID
        adminControls.appendChild(editButton);
        adminControls.appendChild(deleteButton);
        card.appendChild(adminControls);
    } else if (viewType === 'customer' || viewType === 'preview') {
        card.classList.add('cursor-pointer');
        card.onclick = () => openModal(movie.id); // Pass Firestore ID
    } else if (viewType === 'vendor_dashboard') {
        // No controls needed for vendor dashboard view
    }

    return card;
}


// --- Movie List Rendering (Uses local 'movies' array) ---
function renderMovies(container, viewType) {
    container.innerHTML = ''; // Clear previous content
    let noMoviesMsg;
    if (viewType === 'admin') noMoviesMsg = noMoviesAdminMsg;
    else if (viewType === 'preview') noMoviesMsg = noMoviesPreviewMsg;
    else if (viewType === 'vendor_dashboard') noMoviesMsg = noVendorMoviesMsg; // This msg handling is done in renderVendorDashboard now
    else noMoviesMsg = noMoviesCustomerMsg; // Customer view

    let moviesToRender = movies; // Default to all movies

    // If vendor dashboard, filter again (although renderVendorDashboard does this too)
    if (viewType === 'vendor_dashboard' && authState.user?.type === 'vendor' && authState.user?.name) {
         moviesToRender = movies.filter(m => m.vendorName === authState.user.name);
         // Specific message handling is in renderVendorDashboard
    }

    if (moviesToRender.length === 0) {
        if (noMoviesMsg && viewType !== 'vendor_dashboard') { // Only show message if not vendor view
            if (viewType === 'customer') {
                 noMoviesMsg.textContent = "No movies currently showing.";
             } else if (viewType === 'admin') {
                 noMoviesMsg.textContent = "No movies added yet.";
             } else if (viewType === 'preview') {
                 noMoviesMsg.textContent = "No movies to preview.";
             }
            showElement(noMoviesMsg);
        }
        // For vendor view, the message is handled in renderVendorDashboard
        return;
    } else {
         if (noMoviesMsg) hideElement(noMoviesMsg);
    }

    moviesToRender.forEach((movie) => {
        // Create card using movie data (which includes the ID)
        const card = createMovieCard(movie, null, viewType); // Index is not needed
        container.appendChild(card);
    });
}


// --- Movie Details Modal Logic (Integrate Calendar, Use Firestore ID) ---
async function openModal(movieId) { // Accepts Firestore ID
    const movie = movies.find(m => m.id === movieId);
    if (!movie) {
        console.error("Movie not found for modal:", movieId);
        return;
    }
    currentModalMovieId = movieId; // Store Firestore ID
    currentSelectedDate = null; // Reset date on open

    modalMovieTitle.textContent = movie.title || 'Movie Details';
    modalMoviePoster.src = movie.posterUrl || 'https://placehold.co/400x600/cccccc/ffffff?text=No+Image'; // Use posterUrl
    modalMoviePoster.alt = `${movie.title || 'Movie'} Poster`;
    modalMovieGenre.textContent = movie.genre || 'N/A';
    modalMovieDuration.textContent = movie.duration || 'N/A';
    modalMovieDescription.textContent = movie.description || 'No description available.';

    // Calculate and render average rating
    const avgData = calculateAverageRating(movie);
    renderStars(modalAvgRatingContainer, avgData.average, avgData.count, false); // Non-interactive avg rating

    // Reset fields related to selection
    modalShowtimesList.innerHTML = '<p class="text-gray-500 text-sm">Select a date first.</p>';
    hideElement(modalShowtimesContainer);
    hideElement(seatMapContainer);
    seatGrid.innerHTML = '';
    selectedSeats = [];
    updateSelectedSeatsInfo();
    confirmSelectionButton.disabled = true;
    confirmSelectionButton.textContent = 'Proceed to Payment'; // Reset button text

    // Initialize/Reset Pikaday
    if (pikadayInstance) { pikadayInstance.destroy(); pikadayInstance = null; } // Destroy previous if exists
    modalDatepickerInput.value = ''; // Clear input
    hideError(dateErrorElement);

    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + MAX_BOOKING_DAYS_AHEAD);

     pikadayInstance = new Pikaday({
         field: modalDatepickerInput,
         bound: false, // Allow calendar to float
         container: calendarContainer, // Optional: attach to specific container
         minDate: today,
         maxDate: maxDate,
         toString(date, format) { return formatDateReadable(date); },
         onSelect: function(date) {
             console.log("Date selected:", date);
             hideError(dateErrorElement);
             currentSelectedDate = new Date(date); // Store the selected date object
             modalDatepickerInput.value = formatDateReadable(date); // Update input field display
             renderAndValidateShowtimes(movie, currentSelectedDate);
             showElement(modalShowtimesContainer);
             hideElement(seatMapContainer); // Hide seats until showtime selected
             selectedSeats = []; // Reset seats
             updateSelectedSeatsInfo(); // Update button state etc.
         }
     });

    // Rating section logic (check if user already rated this movie)
    if (authState.isLoggedIn && authState.user.type === 'customer') {
        showElement(modalRatingSection);
        const userId = authState.user.uid;
        // Check pre-loaded ratings
        const userRatingData = allRatings.find(r => r.movieId === movieId && r.userId === userId);
        const userCurrentRating = userRatingData ? userRatingData.rating : null;
        const hasRated = userCurrentRating !== null;

        renderStars(modalStarsContainer, 0, 0, !hasRated, userCurrentRating, movieId); // Pass Firestore ID
        modalRatingMessage.textContent = hasRated ? `You rated this ${userCurrentRating} star${userCurrentRating > 1 ? 's' : ''}.` : 'Click stars to rate!';
        modalStarsContainer.classList.toggle('interactive', !hasRated);
        modalStarsContainer.style.cursor = hasRated ? 'default' : 'pointer';
    } else {
        hideElement(modalRatingSection);
    }

    showElement(movieDetailsModal);
    document.body.classList.add('overflow-hidden');
}

function closeModal() {
    hideElement(movieDetailsModal);
    document.body.classList.remove('overflow-hidden');
    currentModalMovieId = null;
    currentSelectedDate = null;
    if (pikadayInstance) { pikadayInstance.destroy(); pikadayInstance = null; } // Destroy calendar on close
}

// Render and Validate Showtimes based on selected date
function renderAndValidateShowtimes(movie, selectedDate) {
    modalShowtimesList.innerHTML = ''; // Clear previous
    // Use showtimes array from movie object
    const showtimes = Array.isArray(movie.showtimes) ? movie.showtimes : [];

    if (showtimes.length === 0) {
        modalShowtimesList.innerHTML = '<p class="text-gray-500 text-sm">No showtimes available for this movie.</p>';
        return;
    }

    const now = new Date();
    const todayStr = formatDateYYYYMMDD(now);
    const selectedDateStr = formatDateYYYYMMDD(selectedDate);
    const isToday = (todayStr === selectedDateStr);

    let hasAvailableShowtimes = false;

    showtimes.forEach((time, i) => {
        const radioId = `showtime-${movie.id}-${i}`; // Use Firestore ID
        const radio = document.createElement('input');
        radio.type = 'radio'; radio.id = radioId; radio.name = `movie-${movie.id}-showtime`; radio.value = time; radio.className = 'showtime-radio';
        const label = document.createElement('label');
        label.htmlFor = radioId; label.textContent = time; label.className = 'showtime-label';

        let isPast = false;
        if (isToday) {
            // Basic time parsing (assumes HH:MM AM/PM format)
             const timeParts = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
             if (timeParts) {
                 let hours = parseInt(timeParts[1], 10);
                 const minutes = parseInt(timeParts[2], 10);
                 const ampm = timeParts[3].toUpperCase();
                 if (ampm === 'PM' && hours < 12) hours += 12;
                 if (ampm === 'AM' && hours === 12) hours = 0; // Midnight case

                 const showtimeDate = new Date(selectedDate);
                 showtimeDate.setHours(hours, minutes, 0, 0);

                 if (showtimeDate < now) { isPast = true; }
             } else {
                 console.warn("Could not parse showtime:", time);
                 // Decide how to handle unparseable times - treat as valid?
             }
        }

        if (isPast) {
            radio.disabled = true;
            label.classList.add('disabled');
            label.title = "This showtime has already passed.";
        } else {
            radio.onchange = () => handleShowtimeSelection(currentModalMovieId, time, currentSelectedDate); // Pass date
            hasAvailableShowtimes = true;
        }

        modalShowtimesList.appendChild(radio);
        modalShowtimesList.appendChild(label);
    });

     if (!hasAvailableShowtimes && showtimes.length > 0) {
          modalShowtimesList.innerHTML = '<p class="text-orange-600 text-sm">All showtimes for today have passed.</p>';
     } else if (showtimes.length === 0) { // Should be caught earlier, but double-check
         modalShowtimesList.innerHTML = '<p class="text-gray-500 text-sm">No showtimes available for this movie.</p>';
     }
}

// Handle Showtime Selection -> Render Seat Map
async function handleShowtimeSelection(movieId, selectedTime, selectedDate) {
    console.log(`Showtime selected: ${selectedTime} on ${formatDateYYYYMMDD(selectedDate)} for movie ${movieId}`);
    await renderSeatMap(movieId, selectedTime, selectedDate, 5, 8); // Make async
    showElement(seatMapContainer);
    selectedSeats = [];
    updateSelectedSeatsInfo();
}

// Render Seat Map (Fetch booked seats from Firestore)
async function renderSeatMap(movieId, showtime, date, rows, cols) {
    seatGrid.innerHTML = '<p class="text-gray-500 text-center">Loading seats...</p>'; // Loading state
    if (!movieId || !showtime || !date) {
        seatGrid.innerHTML = '<p class="text-red-500 text-center">Error: Cannot load seats without movie/showtime/date.</p>';
        return;
    }

    const dateStr = formatDateYYYYMMDD(date);
    let bookedSeatIds = [];

    try {
        // Query Firestore for bookings matching movie, showtime, and date
        const q = query(collection(db, "bookings"),
            where("movieId", "==", movieId),
            where("showtime", "==", showtime),
            where("selectedDate", "==", dateStr) // Ensure selectedDate is stored as YYYY-MM-DD string
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            const bookingData = doc.data();
            if (Array.isArray(bookingData.seats)) {
                bookedSeatIds.push(...bookingData.seats);
            }
        });
        bookedSeatIds = [...new Set(bookedSeatIds)]; // Ensure uniqueness
        console.log(`Rendering seat map for ${movieId} at ${showtime} on ${dateStr}. Booked:`, bookedSeatIds);

    } catch (error) {
        console.error("Error fetching booked seats:", error);
        seatGrid.innerHTML = '<p class="text-red-500 text-center">Error loading seat availability.</p>';
        return;
    }

    // Render the grid
    seatGrid.innerHTML = ''; // Clear loading/previous
    for (let r = 0; r < rows; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';
        const rowLetter = String.fromCharCode(65 + r);
        for (let c = 0; c < cols; c++) {
            // Add aisle spacers
            if (c === 2 || c === 6) {
                const spacer = document.createElement('div');
                spacer.className = 'seat-spacer';
                rowDiv.appendChild(spacer);
            }
            const seatId = `${rowLetter}${c + 1}`;
            const seatDiv = document.createElement('div');
            seatDiv.className = 'seat';
            seatDiv.id = `seat-${seatId}`;
            seatDiv.dataset.seatId = seatId;
            seatDiv.innerHTML = `<i class="fas fa-chair"></i>`;

            if (bookedSeatIds.includes(seatId)) {
                seatDiv.classList.add('unavailable');
            } else {
                seatDiv.onclick = () => toggleSeatSelection(seatId);
            }
            rowDiv.appendChild(seatDiv);
        }
        seatGrid.appendChild(rowDiv);
    }
}

function toggleSeatSelection(seatId) {
    const seatElement = document.getElementById(`seat-${seatId}`);
    if (!seatElement || seatElement.classList.contains('unavailable')) {
        return;
    }
    const index = selectedSeats.indexOf(seatId);
    if (index > -1) {
        selectedSeats.splice(index, 1);
        seatElement.classList.remove('selected');
    } else {
        selectedSeats.push(seatId);
        seatElement.classList.add('selected');
    }
    updateSelectedSeatsInfo();
}
function updateSelectedSeatsInfo() {
    if (selectedSeats.length === 0) {
        selectedSeatsInfo.textContent = 'Selected Seats: None';
        confirmSelectionButton.disabled = true;
    } else {
        selectedSeatsInfo.textContent = `Selected Seats: ${selectedSeats.sort().join(', ')}`;
        const selectedShowtimeRadio = modalShowtimesList.querySelector('input[type="radio"]:checked:not(:disabled)');
        const selectedDateValid = !!currentSelectedDate;
        confirmSelectionButton.disabled = !selectedShowtimeRadio || !selectedDateValid;
    }
}

// --- Payment Modal Logic ---
function openPaymentModal() {
    if (!currentModalMovieId || !currentSelectedDate || selectedSeats.length === 0) {
        alert("Please select a movie, date, showtime, and seats first.");
        return;
    }
    const selectedShowtimeRadio = modalShowtimesList.querySelector('input[type="radio"]:checked');
    if (!selectedShowtimeRadio) {
        alert("Please select a showtime.");
        return;
    }

    const movie = movies.find(m => m.id === currentModalMovieId); // Find by Firestore ID
    const showtime = selectedShowtimeRadio.value;
    const totalCost = selectedSeats.length * TICKET_PRICE_EGP;

    // Populate payment modal details
    paymentMovieTitle.textContent = movie?.title || 'N/A';
    paymentSelectedDate.textContent = formatDateReadable(currentSelectedDate);
    paymentShowtime.textContent = showtime;
    paymentSeats.textContent = selectedSeats.sort().join(', ');
    paymentTotalCost.textContent = `${totalCost} EGP`;

    hideError(paymentErrorElement); // Clear previous errors
    paymentForm.reset(); // Clear form fields
    showElement(paymentModal);
}

function closePaymentModal() {
    hideElement(paymentModal);
}

// Handle Payment and Create Booking in Firestore
async function handlePaymentFormSubmit(event) {
     event.preventDefault();
     hideError(paymentErrorElement);
     payNowBtn.disabled = true; // Disable button during processing
     payNowBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';

     // --- Gather data and validate ---
     const selectedShowtimeRadio = modalShowtimesList.querySelector('input[type="radio"]:checked');
     if (!currentModalMovieId || !currentSelectedDate || selectedSeats.length === 0 || !selectedShowtimeRadio || !authState.isLoggedIn || !authState.user?.uid) {
         displayError(paymentErrorElement, "Booking information incomplete or invalid session.");
         payNowBtn.disabled = false; payNowBtn.innerHTML = '<i class="fas fa-credit-card mr-2"></i>Pay Now';
         return;
     }

     const cardName = document.getElementById('cardholder-name').value.trim();
     const cardNumber = document.getElementById('card-number').value.trim();
     const cardCvv = document.getElementById('card-cvv').value.trim();
     const cardExpiry = document.getElementById('card-expiry').value.trim();

     if (!cardName || !cardNumber || !cardCvv || !cardExpiry) {
         displayError(paymentErrorElement, "Please fill in all payment details.");
          payNowBtn.disabled = false; payNowBtn.innerHTML = '<i class="fas fa-credit-card mr-2"></i>Pay Now';
         return;
     }
     // Add more robust card validation if needed (Luhn algorithm, expiry format check)

     const movie = movies.find(m => m.id === currentModalMovieId);
     const showtime = selectedShowtimeRadio.value;
     const totalAmount = selectedSeats.length * TICKET_PRICE_EGP;
     const userUid = authState.user.uid;
     const userEmail = authState.user.email;
     const selectedDateStr = formatDateYYYYMMDD(currentSelectedDate);

     // --- Check Seat Availability AGAIN (Race Condition Check) ---
     // It's possible seats were booked between selection and payment confirmation
     try {
         const q = query(collection(db, "bookings"),
             where("movieId", "==", currentModalMovieId),
             where("showtime", "==", showtime),
             where("selectedDate", "==", selectedDateStr)
         );
         const querySnapshot = await getDocs(q);
         let alreadyBooked = [];
         querySnapshot.forEach(doc => {
             const data = doc.data();
             if (Array.isArray(data.seats)) {
                 alreadyBooked.push(...data.seats);
             }
         });
         alreadyBooked = [...new Set(alreadyBooked)];

         const conflicts = selectedSeats.filter(seat => alreadyBooked.includes(seat));
         if (conflicts.length > 0) {
             displayError(paymentErrorElement, `Seats unavailable: ${conflicts.join(', ')}. Please select different seats.`);
              payNowBtn.disabled = false; payNowBtn.innerHTML = '<i class="fas fa-credit-card mr-2"></i>Pay Now';
              // Maybe re-render seat map here to show conflicts
              await renderSeatMap(currentModalMovieId, showtime, currentSelectedDate, 5, 8); // Re-render
             return;
         }

     } catch(error) {
          console.error("Error re-checking seat availability:", error);
          displayError(paymentErrorElement, "Could not verify seat availability. Please try again.");
           payNowBtn.disabled = false; payNowBtn.innerHTML = '<i class="fas fa-credit-card mr-2"></i>Pay Now';
          return;
     }


     // --- Create Booking Document in Firestore ---
     const newBookingData = {
         userId: userUid,
         userEmail: userEmail,
         movieId: currentModalMovieId,
         movieTitle: movie?.title || 'Unknown Movie', // Store for convenience
         selectedDate: selectedDateStr, // Store as YYYY-MM-DD string
         showtime: showtime,
         seats: [...selectedSeats].sort(), // Store sorted array
         paymentInfo: { // Store only non-sensitive info
             cardName: cardName,
             last4: cardNumber.slice(-4), // Store only last 4 digits
             expiry: cardExpiry
             // DO NOT store full card number or CVV
         },
         totalAmount: totalAmount,
         timestamp: serverTimestamp(), // Use Firestore server timestamp
         qrCodeUsed: false, // Initialize as not used
         qrUsedTimestamp: null // Initialize as null
     };

     try {
         const docRef = await addDoc(collection(db, "bookings"), newBookingData);
         console.log("Booking added with ID:", docRef.id);

          // Add the new booking to the local cache immediately
         allBookings.push({ id: docRef.id, ...newBookingData, timestamp: new Date() }); // Use local date temporarily

         // --- Success Feedback ---
         alert(`Booking Successful!\nMovie: ${newBookingData.movieTitle}\nDate: ${formatDateReadable(newBookingData.selectedDate)}\nTime: ${newBookingData.showtime}\nSeats: ${newBookingData.seats.join(', ')}\nAmount: ${newBookingData.totalAmount} EGP`);

         closePaymentModal();
         closeModal(); // Close movie details modal too

         // Refresh relevant views
         if (isShowingMyBookings) { renderMyBookings(); } // Refresh 'My Bookings' if active
         if (adminView && !adminView.classList.contains('is-hidden')) {
            if (currentAdminTab === 'admin-bookings-section') renderAdminBookingsList();
            if (currentAdminTab === 'admin-analytics') renderAnalyticsDashboard();
         }
          if (vendorDashboardView && !vendorDashboardView.classList.contains('is-hidden') && movie?.vendorName === authState.user?.name) {
              renderVendorDashboard(); // Refresh vendor view if the booked movie belongs to them
          }

     } catch (error) {
         console.error("Error creating booking:", error);
         displayError(paymentErrorElement, "Booking failed. Please try again.");
         payNowBtn.disabled = false; payNowBtn.innerHTML = '<i class="fas fa-credit-card mr-2"></i>Pay Now';
     }
}


// --- Admin Tab Switching ---
function handleAdminTabClick(event) {
    const targetId = event.currentTarget.dataset.target; // Use currentTarget
    const validTargets = ['admin-manage-movies', 'admin-analytics', 'admin-bookings-section', 'admin-qr-scanner-section', 'admin-manage-vendors'];
    if (!targetId || targetId === currentAdminTab || !validTargets.includes(targetId)) {
        return;
    }
    currentAdminTab = targetId;
    adminNavButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.target === targetId);
    });
    renderAdminContent(); // Re-render content for the selected tab
}

// --- QR Code Scanner Logic ---
function startQrScanner() {
    if (html5QrCodeScanner?.getState() === 2) { // 2 is SCANNING state
         console.log("Scanner already running.");
         return;
     }
     if (!adminQrReaderElement) { scanStatusElement.textContent = "Error: Scanner display area missing."; return; }

     scanStatusElement.textContent = "Initializing Camera...";
     startScanBtn.disabled = true;
     startScanBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Starting...';
     adminQrReaderElement.innerHTML = ""; // Clear previous scanner UI

     if (!html5QrCodeScanner) {
         html5QrCodeScanner = new Html5Qrcode("admin-qr-reader"); // Use the element ID
     }

     const qrboxFunction = (viewfinderWidth, viewfinderHeight) => {
        let minEdgePercentage = 0.7; // 70%
        let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
        let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
        return { width: qrboxSize, height: qrboxSize };
     };


     const config = {
         fps: 10,
         qrbox: qrboxFunction,
         // supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] // Use constants if available
     };

     // Request camera permissions and start scanning
     html5QrCodeScanner.start(
         { facingMode: "environment" }, // Use rear camera
         config,
         onScanSuccess, // Success callback
         (errorMessage) => {
             // console.warn(`QR Code no match: ${errorMessage}`); // Optional: log failures
         } // Failure callback (ignore non-matches)
     ).then(() => {
         scanStatusElement.textContent = "Scanning... Point camera at QR code.";
         startScanBtn.textContent = "Stop Scanning";
         startScanBtn.disabled = false;
         startScanBtn.onclick = stopQrScanner; // Change button action
         console.log("QR Scanner started successfully.");
     }).catch(err => {
         console.error("Error starting QR scanner:", err);
         scanStatusElement.textContent = `Error: Could not start scanner (${err})`;
         startScanBtn.textContent = "Start Scanning";
         startScanBtn.disabled = false;
         startScanBtn.onclick = startQrScanner; // Revert button action
     });
}

async function stopQrScanner() {
     if (html5QrCodeScanner && html5QrCodeScanner.getState() === 2) { // Check if scanning
         try {
             await html5QrCodeScanner.stop();
             console.log("QR Scanner stopped successfully.");
             scanStatusElement.textContent = "Scanner stopped. Click Start Scanning to scan again.";
             startScanBtn.textContent = "Start Scanning";
             startScanBtn.onclick = startQrScanner;
             adminQrReaderElement.innerHTML = ""; // Clear scanner UI
         } catch (err) {
             console.error("Error stopping QR scanner:", err);
             scanStatusElement.textContent = "Error stopping scanner.";
             // Attempt to reset button anyway
             startScanBtn.textContent = "Start Scanning";
             startScanBtn.onclick = startQrScanner;
         }
     } else {
         console.log("Scanner not running or already stopped.");
         if(scanStatusElement) scanStatusElement.textContent = "Scanner is not running.";
         if(startScanBtn) { startScanBtn.textContent = "Start Scanning"; startScanBtn.onclick = startQrScanner; }
         if(adminQrReaderElement) adminQrReaderElement.innerHTML = "";
     }
 }

// QR Scan Success -> Validate against Firestore
async function onScanSuccess(decodedText, decodedResult) {
    console.log(`Code matched = ${decodedText}`, decodedResult);
    stopQrScanner(); // Stop scanning immediately
    scanStatusElement.textContent = `Scan successful! Validating...`;

    let bookingData;
    try {
        bookingData = JSON.parse(decodedText);
        // Basic validation of parsed structure
        if (!bookingData || !bookingData.bookingId || !bookingData.movieTitle || !bookingData.showtime || !Array.isArray(bookingData.seats) || !bookingData.userEmail) {
            throw new Error("Invalid QR code data structure.");
        }
        // **Crucially, bookingData.bookingId MUST be the Firestore Document ID**
        await handleValidScan(bookingData.bookingId); // Pass only the ID for fetching

    } catch (e) {
        console.error("Error parsing or validating QR code data:", e);
        scanStatusElement.textContent = "Error: Invalid QR code data format or missing fields.";
        alert("Scanned code does not contain valid booking information.");
    }
}

// Handle Valid Scan (Fetch from Firestore and Check Status)
async function handleValidScan(bookingId) { // Accepts Firestore booking ID
    if (!bookingId) {
        console.error("No booking ID received for validation.");
        scanStatusElement.textContent = "Error: Missing Booking ID in QR Code.";
        return;
    }
    console.log("Validating booking ID from Firestore:", bookingId);

    try {
        const bookingRef = doc(db, "bookings", bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) {
            console.error("Booking document not found in Firestore:", bookingId);
            validationStatusElement.textContent = "Booking not found in database.";
            validationStatusElement.className = 'status-error'; // Use a general error style
            markUsedBtn.disabled = true;
             showElement(qrValidationModal); // Show modal even if not found, to indicate result
             qrValidationModal.dataset.bookingId = ''; // Clear ID if not found
             // Clear other fields
            validationMovieTitle.textContent = 'N/A';
            validationShowtime.textContent = 'N/A';
            validationSeats.textContent = 'N/A';
            validationEmail.textContent = 'N/A';
            validationBookingId.textContent = bookingId;
            return;
        }

        const bookingData = bookingSnap.data();
        const isUsed = bookingData.qrCodeUsed || false;

        // Populate validation modal
        validationMovieTitle.textContent = bookingData.movieTitle || 'N/A';
        validationShowtime.textContent = bookingData.showtime || 'N/A';
        validationSeats.textContent = Array.isArray(bookingData.seats) ? bookingData.seats.sort().join(', ') : 'N/A';
        validationEmail.textContent = bookingData.userEmail || 'N/A';
        validationBookingId.textContent = bookingId; // Show the scanned ID
        qrValidationModal.dataset.bookingId = bookingId; // Store ID for 'Mark Used' button

        if (isUsed) {
            const usedTime = bookingData.qrUsedTimestamp ? new Date(bookingData.qrUsedTimestamp.toDate()).toLocaleString() : 'Previously';
            validationStatusElement.textContent = `This QR Code was already used (${usedTime}).`;
            validationStatusElement.className = 'status-used';
            markUsedBtn.disabled = true;
        } else {
            validationStatusElement.textContent = "QR Code is valid and not yet used.";
            validationStatusElement.className = 'status-ok';
            markUsedBtn.disabled = false; // Enable button only if valid and unused
        }
        showElement(qrValidationModal);

    } catch (error) {
        console.error("Error fetching or validating booking from Firestore:", error);
        scanStatusElement.textContent = "Error validating booking status.";
        alert("An error occurred while checking the booking status.");
        closeValidationModal(); // Close modal on fetch error
    }
}

// Mark QR Code as Used in Firestore
async function markQrCodeAsUsed() {
    const bookingIdToMark = qrValidationModal.dataset.bookingId;
    if (!bookingIdToMark) {
        console.error("No booking ID available to mark as used.");
        validationStatusElement.textContent = "Error: Booking ID missing.";
        validationStatusElement.className = 'status-error';
        markUsedBtn.disabled = true;
        return;
    }

    markUsedBtn.disabled = true; // Disable button during update
    markUsedBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Marking...';

    try {
        const bookingRef = doc(db, "bookings", bookingIdToMark);
        await updateDoc(bookingRef, {
            qrCodeUsed: true,
            qrUsedTimestamp: serverTimestamp() // Record the time it was marked used
        });

        console.log("Successfully marked booking as used:", bookingIdToMark);
        validationStatusElement.textContent = "Successfully marked as used!";
        validationStatusElement.className = 'status-used';
        markUsedBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Mark as Used'; // Reset text, keep disabled

         // Update local booking cache if necessary
        const index = allBookings.findIndex(b => b.id === bookingIdToMark);
        if (index > -1) {
            allBookings[index].qrCodeUsed = true;
             allBookings[index].qrUsedTimestamp = new Date(); // Simulate timestamp locally
            // Refresh admin bookings list if it's the active tab
            if (currentAdminTab === 'admin-bookings-section') {
                renderAdminBookingsList();
            }
        }

    } catch (error) {
        console.error("Error marking booking as used:", error);
        validationStatusElement.textContent = "Error occurred while marking used.";
        validationStatusElement.className = 'status-error';
        markUsedBtn.disabled = false; // Re-enable on error
        markUsedBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Mark as Used';
        alert("Failed to mark the ticket as used. Please try again.");
    }
}

function closeValidationModal() {
    hideElement(qrValidationModal);
    // Reset modal content
    validationMovieTitle.textContent = '--';
    validationShowtime.textContent = '--';
    validationSeats.textContent = '--';
    validationEmail.textContent = '--';
    validationBookingId.textContent = '--';
    validationStatusElement.textContent = 'Checking status...';
    validationStatusElement.className = '';
    markUsedBtn.disabled = true;
    markUsedBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Mark as Used';
    qrValidationModal.dataset.bookingId = ''; // Clear stored ID
    // Reset scan status message if needed
    if (currentAdminTab === 'admin-qr-scanner-section' && scanStatusElement) {
         scanStatusElement.textContent = "Click Start Scanning.";
    }
}

// --- Initialization ---
function initializeApp() {
    console.log("Initializing App...");
    // hideElement(splashScreen); // Splash screen removed

    // Event listeners (Mostly unchanged)
    customerLoginForm.addEventListener('submit', handleCustomerLogin);
    customerRegisterForm.addEventListener('submit', handleRegistration);
    adminLoginForm.addEventListener('submit', handleAdminLogin);
    vendorLoginForm.addEventListener('submit', handleVendorLogin);
    showRegisterButton.addEventListener('click', showCustomerRegisterForm);
    showAdminLoginButton.addEventListener('click', showAdminLoginForm);
    showVendorLoginButton.addEventListener('click', showVendorLoginForm);
    backToCustomerLoginButtons.forEach(btn => btn.addEventListener('click', showCustomerLoginForm));
    logoutButton.addEventListener('click', handleLogout);
    adminNavButtons.forEach(btn => btn.addEventListener('click', handleAdminTabClick)); // Use currentTarget in handler
    movieForm.addEventListener('submit', handleMovieFormSubmit);
    cancelEditButton.addEventListener('click', resetForm);
    vendorForm.addEventListener('submit', handleVendorFormSubmit);
    vendorCancelEditButton.addEventListener('click', resetVendorForm);
    modalCloseButton.addEventListener('click', closeModal);
    movieDetailsModal.addEventListener('click', (e) => { if (e.target === movieDetailsModal) closeModal(); });
    toggleMyBookingsBtn.addEventListener('click', () => { isShowingMyBookings ? showCustomerMovieListView() : showMyBookingsView(); });
    backToMoviesBtn.addEventListener('click', showCustomerMovieListView);
    startScanBtn.addEventListener('click', startQrScanner); // Initial setup
    validationModalCloseBtn.addEventListener('click', closeValidationModal);
    validationModalCloseBtnSecondary.addEventListener('click', closeValidationModal);
    markUsedBtn.addEventListener('click', markQrCodeAsUsed); // Call async function
    confirmSelectionButton.addEventListener('click', openPaymentModal);
    paymentModalCloseBtn.addEventListener('click', closePaymentModal);
    paymentModalCloseBtnSecondary.addEventListener('click', closePaymentModal);
    payNowBtn.addEventListener('click', handlePaymentFormSubmit); // Call async function

    // --- Firebase Auth State Listener ---
    onAuthStateChanged(auth, async (user) => {
        console.log("Auth State Changed. User:", user ? user.email : 'None');
        if (user) {
            // User is signed in
            let userType = 'customer'; // Default
            let vendorName = null;
            let userData = null;

            try {
                 // Fetch user role/data from Firestore 'users' collection using UID
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    userData = userDocSnap.data();
                    userType = userData.role || 'customer'; // Expect 'admin', 'vendor', or 'customer'
                    console.log(`User role from Firestore for ${user.email}: ${userType}`);

                    // If vendor, fetch vendor details (like name) based on email match
                    // Assumes vendor email in Auth matches email in 'vendors' collection
                    if (userType === 'vendor') {
                        const vendorQuery = query(collection(db, "vendors"), where("email", "==", user.email));
                        const vendorSnap = await getDocs(vendorQuery);
                        if (!vendorSnap.empty) {
                            // Should only be one vendor per email
                            vendorName = vendorSnap.docs[0].data().name;
                            console.log(`Vendor name found: ${vendorName}`);
                        } else {
                            console.warn(`Vendor document not found for email: ${user.email}, but role is 'vendor'.`);
                             // Potential inconsistency: User has 'vendor' role but no matching vendor doc.
                             // Handle this case - maybe default to customer or show error?
                             userType = 'customer'; // Fallback to customer type if vendor details missing
                        }
                    }
                } else {
                    // User exists in Auth but not in Firestore 'users' collection
                    console.warn(`User document NOT found in Firestore for UID: ${user.uid}, Email: ${user.email}. Defaulting to customer.`);
                     // Optional: Create a default user document if missing
                     // await setDoc(userDocRef, { email: user.email, role: 'customer', createdAt: serverTimestamp() });
                     userType = 'customer'; // Assign default role
                }

                 // Update authState
                 authState = {
                    isLoggedIn: true,
                    user: {
                        uid: user.uid,
                        email: user.email,
                        type: userType,
                        name: vendorName // Will be null unless type is 'vendor' and name was found
                    }
                 };


            } catch (error) {
                console.error("Error fetching user role:", error);
                // Handle error fetching role - log out or default to customer?
                authState = { isLoggedIn: false, user: null }; // Log out on error
                await signOut(auth); // Force sign out if role check fails critically
            }

        } else {
            // User is signed out
            authState = { isLoggedIn: false, user: null };
        }

        // Load data AFTER auth state is determined (or clear data on logout)
        if (authState.isLoggedIn) {
             await loadDataFromFirebase(); // Load fresh data on login/refresh
        } else {
             // Clear local data on logout
             movies = [];
             vendors = [];
             allBookings = [];
             allRatings = [];
        }

        // Render the UI based on the final authState and loaded data
        renderUI();
    });

    console.log("App Initialized. Waiting for Auth State...");
}

// --- Start the App ---
window.addEventListener('DOMContentLoaded', initializeApp); // Use DOMContentLoaded instead of load
