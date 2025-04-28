// --- Firebase Imports ---
import {
    db, auth,
    collection, getDocs, addDoc, doc, setDoc, getDoc, query, where, updateDoc, deleteDoc, writeBatch, serverTimestamp, Timestamp, onSnapshot,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, orderBy
} from './firebase.js';

// --- Constants ---
// Removed Local Storage Keys
const ADMIN_EMAIL = 'admin@example.com'; // Kept for initial check, but ideally use Firebase role
// const ADMIN_PASSWORD = 'password'; // Password check now happens via Firebase Auth
const TOTAL_SEATS_PER_SCREENING = 5 * 8;
const TICKET_PRICE_EGP = 90;
const MAX_BOOKING_DAYS_AHEAD = 5;

// --- DOM Elements ---
const qrZoomModal = document.getElementById('qr-zoom-modal');
const qrZoomContent = document.getElementById('qr-zoom-content');
const qrZoomCloseBtn = document.getElementById('qr-zoom-close-btn');
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
const noMoviesAdminMsg = document.getElementById('no-movies-admin');
const analyticsAvgRatingsContainer = document.getElementById('analytics-avg-ratings');
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
const modalVendorElement = document.getElementById('modal-movie-vendor');
const modalVendorNameSpan = document.getElementById('modal-vendor-name');
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
const otpSection = document.getElementById('otp-section');
const otpInput = document.getElementById('register-otp');
const sendOtpButton = document.getElementById('send-otp-button');
const registerSubmitButton = document.getElementById('register-submit-button');
const bookingSuccessModal = document.getElementById('booking-success-modal');
const successModalCloseBtn = document.getElementById('success-modal-close-btn');
const successModalCloseBtnSecondary = document.getElementById('success-modal-close-btn-secondary');
const successMovieTitle = document.getElementById('success-movie-title');
const successSelectedDate = document.getElementById('success-selected-date');
const successShowtime = document.getElementById('success-showtime');
const successSeats = document.getElementById('success-seats');
const successTotalCost = document.getElementById('success-total-cost');
const successBookingId = document.getElementById('success-booking-id');

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
let generatedOtp = null;
let otpExpiry = null;

// --- Utility Functions ---
function showElement(el) {
    if (el && el.classList) {
        const originallyHidden = el.classList.contains('is-hidden');
        el.classList.remove('is-hidden');

        // Explicitly set display based on known flex containers
        // Add other flex container IDs here if needed
        if (el.id === 'auth-view' ||
            el.id === 'movie-details-modal' ||
            el.id === 'payment-modal' ||
            el.id === 'qr-validation-modal' ||
            el.id === 'booking-success-modal' ||
            el.id === 'qr-zoom-modal') {
             el.style.display = 'flex'; // Restore flex display
        } else {
            // For other elements, reset display to let CSS/defaults take over
            // This assumes non-flex elements use block, inline-block, etc. by default or via other classes
             el.style.display = '';
        }

        if (originallyHidden) { // Only log if it was actually hidden
             console.log(`showElement: Removed .is-hidden and set display for #${el.id || 'element'}`);
        }
    } else if (el === undefined || el === null) {
        // console.warn("showElement called with null or undefined element.");
    } else {
        // console.warn("showElement called with an unexpected type:", el);
    }
}

function hideElement(el) {
    if (el && el.classList) {
        // Only add the class. Let CSS handle display.
        if (!el.classList.contains('is-hidden')) { // Avoid redundant adds
             el.classList.add('is-hidden');
             console.log(`hideElement: Added .is-hidden to #${el.id || 'element'}`); // Add log
        }
    } else if (el === undefined || el === null) {
       // console.warn("hideElement called with null or undefined element.");
    } else {
       // console.warn("hideElement called with an unexpected type:", el);
    }
}

function displayError(element, message) {
    // Check if the element exists
    if (element) {
        element.textContent = message;
        showElement(element); // Use the safer showElement
    } else {
        // console.warn("displayError called with null or undefined element.");
         // Optionally alert the user if an essential error display is missing
         // alert("Error display element missing!");
    }
}

function hideError(element) {
    // Check if the element exists
    if (element) {
        element.textContent = '';
        hideElement(element); // Use the safer hideElement
    } else {
        // console.warn("hideError called with null or undefined element.");
    }
}
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
    container.innerHTML = ''; // Clear previous content
    container.classList.toggle('interactive', interactive);
    container.dataset.movieId = movieId || ''; // Use Firestore ID

    // Determine the rating to display
    const ratingValue = Math.round(averageRating);
    const displayRating = interactive && userRating !== null ? userRating : ratingValue;

    // Apply flexbox for non-interactive stars if needed (like on cards)
    if (!interactive) {
        container.style.display = 'flex';        // Make the container a flex container
        container.style.alignItems = 'center';  // Vertically align stars and text
    } else {
        container.style.display = ''; // Reset display if it was previously flex
        container.style.alignItems = ''; // Reset alignment
    }

    // Create star icons
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.classList.add(i <= displayRating ? 'fas' : 'fa-regular', 'fa-star');
        star.dataset.rating = i;
        if (interactive) {
            star.style.cursor = 'pointer';
            star.onclick = () => handleStarClick(movieId, i);
            star.onmouseover = () => highlightStars(container, i);
            star.onmouseout = () => highlightStars(container, userRating || 0);
        }
        container.appendChild(star);
    }

    // Conditionally add the rating text span
    if (!interactive) {
        const ratingText = document.createElement('span');
        // ***** ADDED 'rating-text' class *****
        ratingText.className = 'ml-1 text-xs text-gray-500 rating-text'; // Added specific class
        if (averageRating > 0 && count > 0) {
            ratingText.textContent = `${averageRating.toFixed(1)} (${count} rating${count > 1 ? 's' : ''})`;
        } else {
            ratingText.textContent = 'No ratings yet';
        }
        container.appendChild(ratingText);
    }
}

function generateSimpleOtp(length = 6) {
    // WARNING: Not cryptographically secure. For demo only.
    let otp = '';
    const digits = '0123456789';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

async function handleSendOtp() {
    hideError(registerError); // Clear previous errors
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    // Basic validation before sending OTP
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        displayError(registerError, "Please enter a valid email address.");
        return;
    }
    if (!password || password.length < 6) {
         displayError(registerError, "Password must be at least 6 characters.");
         return;
    }
     if (password !== confirmPassword) {
         displayError(registerError, "Passwords do not match.");
         return;
     }

    // REMOVED Firestore pre-check for existing email to avoid permission errors
    // Firebase Auth will handle 'auth/email-already-in-use' during registration attempt.

    // Generate OTP and set expiry (client-side - insecure)
    generatedOtp = generateSimpleOtp(); // Assumes generateSimpleOtp() exists and works
    const now = new Date();
    // Set expiry time (e.g., 15 minutes from now)
    otpExpiry = new Date(now.getTime() + 15 * 60 * 1000);
    // Format the expiry time for display in the email (e.g., "03:45 PM")
    const expiryTimeFormatted = otpExpiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Log generated OTP for debugging purposes ONLY (Remove in production)
    console.log(`Generated OTP: ${generatedOtp} for ${email}, expires at ${expiryTimeFormatted}`);

    // Prepare the parameters for the EmailJS template
    const templateParams = {
        // *** FIX: Use 'email' key to match template variable {{email}} ***
        email: email,
        passcode: generatedOtp, // This key must match {{passcode}} in your EmailJS template
        time: expiryTimeFormatted // This key must match {{time}} in your EmailJS template
    };
    console.log("Sending templateParams:", templateParams); // Log parameters being sent

    // Disable the "Send OTP" button to prevent multiple clicks while sending
    sendOtpButton.disabled = true;
    sendOtpButton.textContent = 'Sending OTP...'; // Provide visual feedback

    // Attempt to send the email using EmailJS
    // Ensure 'service_6rtlp5w' and 'template_s0272m8' are correct
    emailjs.send('service_6rtlp5w', 'template_s0272m8', templateParams)
        .then(
            // Success Callback
            function(response) {
               console.log('EmailJS SUCCESS!', response.status, response.text); // Log success details
               displayError(registerError, ""); // Clear any previous error messages
               alert(`OTP sent successfully to ${email}! Please check your inbox (and spam folder).`); // Inform the user

               // Update the UI to show the OTP input field and the final registration button
               showElement(otpSection);         // Make the OTP input area visible
               hideElement(sendOtpButton);        // Hide the 'Send OTP' button
               showElement(registerSubmitButton); // Show the 'Verify OTP & Register' button

               // Re-enable the 'Send OTP' button (even though it's hidden now) as good practice
               sendOtpButton.disabled = false;
               sendOtpButton.textContent = 'Send OTP';
           },
            // Failure Callback
            function(error) {
               // Log the failure details - VERY IMPORTANT FOR DEBUGGING
               console.error('EmailJS FAILED:', error); // Use console.error for better visibility
               // Display a user-friendly error message on the form
               // Check the error status code if available
               let errorMessage = "Failed to send OTP. Please check email or try again later.";
               if (error.status === 422) {
                    errorMessage = "Failed to send OTP. Please check EmailJS service/template configuration (422)."
                    console.error("EmailJS Error 422 suggests a problem with the Service or Template config (e.g., 'To' address field). Check EmailJS dashboard.");
               } else {
                   console.error("EmailJS Error Status:", error.status); // Log other status codes
               }
               displayError(registerError, errorMessage);

               // Re-enable the 'Send OTP' button on failure so the user can retry
               sendOtpButton.disabled = false;
               sendOtpButton.textContent = 'Send OTP';

               // Invalidate the generated OTP and expiry state since sending failed
               generatedOtp = null;
               otpExpiry = null;
           }
       ); // End of emailjs.send()
}

async function handleVerifyOtpAndRegister(event) {
    event.preventDefault(); // Keep preventing default form submission
    hideError(registerError); // Clear previous errors first

    // --- Retrieve current values from the form ---
    const enteredOtp = otpInput.value.trim();
    const email = document.getElementById('register-email').value.trim(); // Get email again
    const password = document.getElementById('register-password').value; // Get password again

    // --- Add Debugging Logs ---
    console.log("--- Verifying OTP ---");
    console.log("Entered OTP:", enteredOtp, "(Type:", typeof enteredOtp + ")");
    console.log("Generated OTP in state:", generatedOtp, "(Type:", typeof generatedOtp + ")");
    console.log("OTP Expiry in state:", otpExpiry);
    console.log("Current Time:", new Date());
    // Check expiry carefully, ensuring otpExpiry is a Date object
    let isExpired = false;
    if (otpExpiry instanceof Date) {
        isExpired = new Date() > otpExpiry;
    } else {
        console.warn("otpExpiry is not a valid Date object:", otpExpiry);
        // Decide how to handle this - treat as expired?
        isExpired = true; // Safer to treat as expired if state is invalid
    }
    console.log("Is OTP Expired?", isExpired);
    console.log("Does entered OTP === generated OTP?", enteredOtp === generatedOtp);
    // --- End Debugging Logs ---

    // --- OTP Validation ---
    if (!enteredOtp || enteredOtp.length !== 6) {
         console.log("Validation Fail: Invalid OTP length/format.");
         displayError(registerError, "Please enter the 6-digit OTP.");
         // No need to reset button state here, let the user try again
         return; // Stop execution
    }
    if (!generatedOtp || !otpExpiry) {
        console.log("Validation Fail: generatedOtp or otpExpiry missing in state.");
        displayError(registerError, "OTP not generated or potentially expired. Please request a new one.");
        // Optionally hide OTP section and show Send OTP button again if state is clearly lost
        hideElement(otpSection);
        hideElement(registerSubmitButton);
        showElement(sendOtpButton);
        // Reset button state (though it's hidden now)
        registerSubmitButton.disabled = false;
        registerSubmitButton.textContent = 'Verify OTP & Register';
        return; // Stop execution
    }
     // Use the calculated 'isExpired' variable from logging
     if (isExpired) {
         console.log("Validation Fail: OTP expired.");
         displayError(registerError, "OTP has expired. Please request a new one.");
         generatedOtp = null; otpExpiry = null; otpInput.value = ''; // Clear expired OTP state and input
         // Reset UI to request OTP again
         hideElement(otpSection);
         hideElement(registerSubmitButton);
         showElement(sendOtpButton);
         // Reset button state (though it's hidden now)
         registerSubmitButton.disabled = false;
         registerSubmitButton.textContent = 'Verify OTP & Register';
         return; // Stop execution
     }
      // Use strict equality check (both type and value)
      if (enteredOtp !== generatedOtp) {
          console.log("Validation Fail: Entered OTP does not match generated OTP.");
          displayError(registerError, "Invalid OTP entered. Please check and try again.");
          // Do NOT clear generatedOtp here, allow retries until expiry
          // No need to reset button state here, let the user try again
          return; // Stop execution
      }
    // --- End OTP Validation ---

    // If we reach here, OTP is valid and not expired
    console.log("OTP Verified Successfully! Proceeding to Firebase registration...");

    // Disable button during Firebase registration process
    registerSubmitButton.disabled = true;
    registerSubmitButton.textContent = 'Registering...';

    // --- Firebase Registration ---
    try {
        // Step 1: Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User registered in Firebase Auth:", user.uid, user.email);

        // Step 2: Create corresponding user document in Firestore 'users' collection
        // Using the user's UID as the document ID for easy lookup
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,       // Store email
            role: 'customer',        // Assign default role
            createdAt: serverTimestamp() // Add a server-side timestamp
        });
        console.log("User document created in Firestore for UID:", user.uid);

        // --- Success Handling ---
        // Clear sensitive OTP state now that registration is complete
        generatedOtp = null;
        otpExpiry = null;

        // Reset the registration form completely
        customerRegisterForm.reset();

         // Reset the UI state: Hide OTP section, hide verify button, show send OTP button again
         hideElement(otpSection);
         hideElement(registerSubmitButton);
         showElement(sendOtpButton); // Make 'Send OTP' visible for potential next registration

         // Re-enable the verify button and reset its text (even though it's hidden) for consistency
         registerSubmitButton.disabled = false;
         registerSubmitButton.textContent = 'Verify OTP & Register';

         // Notify user of success
         alert("Registration successful! You are now logged in.");
         // The onAuthStateChanged listener will automatically detect the new user,
         // update the global authState, load data, and call renderUI() to show the customer view.

    } catch (error) {
        // --- Firebase Error Handling ---
        console.error("Firebase Registration Error after OTP Verification:", error);
        console.error("Error Code:", error.code); // Log the specific Firebase error code
        console.error("Error Message:", error.message);

        // Re-enable the verify button on error so the user can potentially try again
        registerSubmitButton.disabled = false;
        registerSubmitButton.textContent = 'Verify OTP & Register';

        // Provide specific user feedback based on the error code
        if (error.code === 'auth/email-already-in-use') {
            // This *should* have been caught by the check in handleSendOtp ideally,
            // but handle defensively here as well.
            displayError(registerError, "This email address is already registered. Please login instead or use a different email.");
             // Optionally hide OTP section and show login links again here
             hideElement(otpSection);
             hideElement(registerSubmitButton);
             showElement(sendOtpButton); // Or potentially switch to login form view
        } else if (error.code === 'auth/weak-password') {
             displayError(registerError, "The password is too weak. Please use a stronger password (at least 6 characters).");
             // Keep the OTP section visible so they can retry with a new password after requesting a new OTP if needed.
        } else {
            // General error message for other Firebase issues
            displayError(registerError, "Registration failed after OTP verification due to a server error. Please try again later.");
        }
        // Note: If Auth succeeded but Firestore 'setDoc' failed, you might have an Auth user
        // without a corresponding Firestore document. This usually requires manual cleanup
        // or more robust server-side handling.
    }
    // --- End Firebase Registration ---
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
    // Initial checks
    if (!authState.isLoggedIn || !authState.user || authState.user.type !== 'customer' || !movieId) {
        console.warn("User not logged in or not a customer, cannot rate.");
        return;
    }
    const userId = authState.user.uid;
    const movie = movies.find(m => m.id === movieId); // Find movie locally for title

    console.log(`Attempting to rate movie ${movieId} with rating ${rating} by user ${userId}`);

    // Disable stars briefly to prevent double-clicks (optional but good UX)
    if(modalStarsContainer) modalStarsContainer.style.pointerEvents = 'none';

    try {
        // Check if user already rated this movie by querying Firestore
        const q = query(collection(db, "ratings"), where("movieId", "==", movieId), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        let isUpdate = false; // Flag to track if we are updating or adding

        if (!querySnapshot.empty) {
            // ----- UPDATE Existing Rating -----
            isUpdate = true;
            const existingRatingDoc = querySnapshot.docs[0]; // Get the first (should be only) doc
            const existingRatingRef = existingRatingDoc.ref;
            const currentRating = existingRatingDoc.data().rating;

            // Optional: If user clicks the same star again, maybe just update timestamp or do nothing?
            // For now, we'll update even if the rating value is the same.
            console.log(`Found existing rating (ID: ${existingRatingDoc.id}), updating rating from ${currentRating} to ${rating}.`);

            await updateDoc(existingRatingRef, {
                rating: rating,
                lastUpdatedAt: serverTimestamp() // Add/Update a timestamp
            });

            // Update local cache
            const index = allRatings.findIndex(r => r.id === existingRatingDoc.id);
            if (index > -1) {
                allRatings[index].rating = rating;
                // Simulate timestamp update locally if needed immediately elsewhere
                allRatings[index].lastUpdatedAt = new Date();
            }
             console.log("Rating updated successfully in Firestore and local cache.");

        } else {
            // ----- ADD New Rating -----
            isUpdate = false;
            console.log(`No existing rating found, adding new rating.`);
            const ratingData = {
                movieId: movieId,
                userId: userId,
                rating: rating,
                createdAt: serverTimestamp(), // Use server timestamp for creation
                lastUpdatedAt: serverTimestamp() // Also set initial update timestamp
            };
            const docRef = await addDoc(collection(db, "ratings"), ratingData);

            // Add to local cache optimistically
            allRatings.push({ id: docRef.id, ...ratingData, createdAt: new Date(), lastUpdatedAt: new Date() }); // Simulate timestamps locally
            console.log("Rating added successfully to Firestore and local cache with ID:", docRef.id);
        }

        // ----- Common UI Update (After Add OR Update) -----
        // 1. Re-calculate and render average rating (non-interactive)
        if (movie) { // Check if movie data is available
             const avgData = calculateAverageRating(movie);
             renderStars(modalAvgRatingContainer, avgData.average, avgData.count, false); // Render average stars
        }

        // 2. Re-render the USER'S rating stars (now showing the new/updated rating, still interactive)
        renderStars(modalStarsContainer, 0, 0, true, rating, movieId); // Force interactive, show current 'rating'

        // 3. Update the rating message
        modalRatingMessage.textContent = isUpdate
            ? `Rating updated to ${rating} star${rating > 1 ? 's' : ''}.`
            : `You rated this movie ${rating} star${rating > 1 ? 's' : ''}.`;

        // 4. Ensure stars remain interactive visually (may be redundant if renderStars handles it, but safe)
        modalStarsContainer.classList.add('interactive');
        modalStarsContainer.style.cursor = 'pointer';

        // Refresh main movie list if needed (to update average rating display on cards)
        if (customerView && !customerView.classList.contains('is-hidden')) {
             renderMovies(customerMovieListContainer, 'customer');
        }
        // Add similar refresh for admin/vendor views if necessary

    } catch (error) {
        console.error("Error adding/updating rating: ", error);
        modalRatingMessage.textContent = "Failed to save rating. Please try again."; // Show error message
        alert("Failed to save rating. Please try again.");
        // Optionally re-render stars to previous state if needed
    } finally {
         // Re-enable stars after operation completes
         if(modalStarsContainer) modalStarsContainer.style.pointerEvents = 'auto';
    }
}
// --- UI Rendering Functions ---
function renderUI() {
    console.log("--- renderUI called ---"); // Log start
    console.log("Current authState:", JSON.stringify(authState)); // Log current state

    closeModal();
    closePaymentModal();
    closeValidationModal();

    const bodyElement = document.body;
    const userInfoSpan = document.getElementById('logged-in-user-info');

    if (authState.isLoggedIn && authState.user) {
        // User is logged in
        console.log("State: Logged In. Hiding auth, showing header.");
        hideElement(authView);
        showElement(appHeader);

        let userTypeDisplay = authState.user.type;
        if (authState.user.type === 'vendor' && authState.user.name) {
            userTypeDisplay = `vendor (${authState.user.name})`;
        }

        if (userInfoSpan) {
             userInfoSpan.textContent = `Logged in as: ${authState.user.email} (${userTypeDisplay})`;
        } else {
             console.warn("User info span not found in renderUI (logged in state).");
        }

        console.log("Adding 'logged-in' class to body.");
        bodyElement.classList.add('logged-in');

        // Main view switching
        console.log(`Determining view for user type: ${authState.user.type}`);
        if (authState.user.type === 'admin') {
            console.log("Hiding customer/vendor, showing admin view.");
            hideElement(customerView);
            hideElement(vendorDashboardView);
            showElement(adminView);
            renderAdminContent();
        } else if (authState.user.type === 'vendor') {
            console.log("Hiding customer/admin, showing vendor view.");
            hideElement(customerView);
            hideElement(adminView);
            showElement(vendorDashboardView);
            renderVendorDashboard();
        } else { // Customer
            console.log("Hiding admin/vendor, showing customer view.");
            hideElement(adminView);
            hideElement(vendorDashboardView);
            showElement(customerView);
            renderCustomerContent();
        }
    } else {
        // User is logged out
        console.log("State: Logged Out. Showing auth, hiding header/main views.");
        hideElement(appHeader);
        hideElement(adminView);
        hideElement(customerView);
        hideElement(myBookingsView); // Ensure this is hidden too
        hideElement(vendorDashboardView);
        showElement(authView); // Make sure auth view is shown
        showCustomerLoginForm(); // Show the default login form within auth view

        if (userInfoSpan) {
            userInfoSpan.textContent = '';
        }

        console.log("Removing 'logged-in' class from body.");
        bodyElement.classList.remove('logged-in');
    }

    // Call visibility update at the end, AFTER potential text changes
    updateHeaderVisibility();
    console.log("--- renderUI finished ---"); // Log end
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
        // ***** REMOVED: renderMovies(customerPreviewContainer, 'preview'); *****
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
        itemDiv.className = 'admin-booking-item !pl-3 !pr-3 !pb-3 !pt-2'; // Added padding classes

        const statusLabelClass = isUsed ? 'status-used' : 'status-not-used';
        const statusText = isUsed ? '✅ QR Code Used' : '🔄 QR Code Not Used';
        const usedTimestamp = booking.qrUsedTimestamp ? formatDateReadable(booking.qrUsedTimestamp.toDate()) + ' ' + booking.qrUsedTimestamp.toDate().toLocaleTimeString() : 'N/A';

        // ***** CHANGE: Use paragraphs for better formatting *****
        itemDiv.innerHTML = `
           <p class="text-sm"><i class="fas fa-user w-4 mr-1 text-gray-400"></i> ${booking.userEmail || 'N/A'}</p>
           <p class="text-sm"><i class="fas fa-calendar-alt w-4 mr-1 text-gray-400"></i> ${formatDateReadable(booking.selectedDate)}</p>
           <p class="text-sm"><i class="fas fa-clock w-4 mr-1 text-gray-400"></i> ${booking.showtime || 'N/A'}</p>
           <p class="text-sm"><i class="fas fa-chair w-4 mr-1 text-gray-400"></i> <span class="seats">${booking.seats?.sort()?.join(', ') || 'N/A'}</span></p>
           <p class="text-sm"><i class="fas fa-money-bill-wave w-4 mr-1 text-gray-400"></i> ${booking.totalAmount || 0} EGP</p>
           <p class="text-xs text-gray-500"><i class="fas fa-receipt w-4 mr-1 text-gray-400"></i> ID: ${booking.id}</p>
            <div class="mt-2 flex justify-between items-center border-t border-gray-600 pt-2">
               <span class="status-label ${statusLabelClass}">${statusText}</span>
               ${isUsed ? `<span class="text-xs text-gray-500">Used: ${usedTimestamp}</span>` : ''}
            </div>
        `;
        // ***** END CHANGE *****

    } else { // Customer view ('my-bookings')
        // ... customer view rendering remains the same ...
        itemDiv.className = 'booking-list-item';
        const qrData = JSON.stringify({
            bookingId: booking.id,
            movieTitle: movie?.title || booking.movieTitle || 'Unknown Movie',
            showtime: booking.showtime,
            seats: booking.seats,
            userEmail: booking.userEmail
        });
        itemDiv.innerHTML = `
            <div class="booking-main-info flex justify-between items-start">
                <div class="booking-details flex-grow pr-4">
                    <p class="text-lg font-semibold mb-1">${movie?.title || booking.movieTitle || 'Unknown Movie'}</p>
                    <p class="text-sm text-gray-600 mb-1"><strong>Date:</strong> ${formatDateReadable(booking.selectedDate)}</p>
                    <p class="text-sm text-gray-600 mb-1"><strong>Showtime:</strong> ${booking.showtime || 'N/A'}</p>
                    <p class="text-sm text-gray-600"><strong>Seats:</strong> <span class="seats">${booking.seats?.sort()?.join(', ') || 'N/A'}</span></p>
                </div>
                <div id="qr-code-${booking.id}" class="qr-code-container cursor-pointer flex-shrink-0" title="Booking ID: ${booking.id}" onclick="window.openQrZoomModal(this)"></div>
            </div>
            <div class="booking-meta">
                <span>Booked: ${booking.timestamp ? new Date(booking.timestamp.toDate()).toLocaleString() : 'N/A'}</span> |
                <span>Cost: ${booking.totalAmount || 0} EGP</span> |
                <span class="text-xs text-gray-500">ID: ${booking.id}</span>
                ${isUsed ? '<span class="ml-2 text-red-600 font-semibold">[USED]</span>' : ''}
            </div>
        `;
        setTimeout(() => {
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

// Render My Bookings (Fetch directly from Firestore on demand)

async function renderMyBookings() {
    myBookingsListContainer.innerHTML = '<p class="text-gray-500">Loading your bookings...</p>'; // Set loading state

    // 1. Check if user is logged in
    if (!authState.isLoggedIn || !authState.user || !authState.user.uid) {
        myBookingsListContainer.innerHTML = '<p class="text-red-500">Error: Login required to view bookings.</p>';
        return;
    }
    const currentUserUid = authState.user.uid;

    try {
        // 2. Query Firestore specifically for this user's bookings, ordered by time
        console.log(`Fetching bookings from Firestore for user: ${currentUserUid}`);
        const q = query(
            collection(db, "bookings"),
            where("userId", "==", currentUserUid),
            orderBy("timestamp", "desc") // Order by newest first
        );
        const querySnapshot = await getDocs(q);

        // 3. Process the results
        const userBookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`Found ${userBookings.length} bookings for user.`);

        if (userBookings.length === 0) {
            myBookingsListContainer.innerHTML = '<p class="text-gray-500">You have no bookings yet.</p>';
            return;
        }

        // 4. Render the fetched bookings
        myBookingsListContainer.innerHTML = ''; // Clear loading/previous messages
        userBookings.forEach(booking => {
            // createBookingListItem should still work as it takes a booking object
            myBookingsListContainer.appendChild(createBookingListItem(booking, 'customer'));
        });

    } catch (error) {
        // 5. Handle errors during fetch
        console.error("Error fetching user bookings:", error);
        myBookingsListContainer.innerHTML = '<p class="text-red-600">Could not load your bookings. Please try again.</p>';
    }
}

// --- Refactored Analytics Function ---
function renderAnalyticsDashboard(targetVendorName = null) {
    console.log(`Rendering analytics for ${targetVendorName ? 'Vendor: ' + targetVendorName : 'Admin'}`);
    const isVendor = targetVendorName !== null;

    // --- Get DOM Elements ---
    // (Keep all the getElementById/querySelector calls as they are)
    const avgRatingsContainer = isVendor ? vendorAnalyticsAvgRatingsContainer : analyticsAvgRatingsContainer;
    const totalRevenueElement = isVendor ? vendorTotalRevenueElement : adminTotalRevenueElement;
    const analyticsSection = isVendor ? document.getElementById('vendor-analytics') : adminAnalyticsSection;
    const seatsTodayElement = !isVendor ? document.getElementById('admin-seats-today') : null;
    const capacityTodayElement = !isVendor ? document.getElementById('admin-capacity-today') : null;
    const capacityDetailElement = !isVendor ? document.getElementById('admin-capacity-detail') : null;
    const mostBookedElement = !isVendor ? document.getElementById('admin-most-booked-today') : null;
    const leastBookedElement = !isVendor ? document.getElementById('admin-least-booked-today') : null;
    const weeklyTableBody = !isVendor ? document.querySelector('#admin-weekly-occupancy-table tbody') : null;
    const dailyMoviePerfList = !isVendor ? document.getElementById('daily-movie-perf-list') : null;

    // --- Basic Check & Clear/Loading States ---
    if (!analyticsSection || !totalRevenueElement || !avgRatingsContainer) {
         console.error("Essential analytics containers not found for", isVendor ? "vendor" : "admin");
         return;
    }
     // Check admin-specific elements (This check itself is fine)
     if (!isVendor && (!seatsTodayElement || !capacityTodayElement || !capacityDetailElement || !mostBookedElement || !leastBookedElement || !weeklyTableBody || !dailyMoviePerfList)) {
         // Log which element might be null for detailed debugging if needed
         console.error("One or more specific admin analytics elements are missing.", {
             seatsTodayElement, capacityTodayElement, capacityDetailElement, mostBookedElement, leastBookedElement, weeklyTableBody, dailyMoviePerfList
         });
         if (avgRatingsContainer) avgRatingsContainer.innerHTML = '<p class="text-red-500">Error: UI elements missing.</p>';
         if (totalRevenueElement) totalRevenueElement.textContent = 'Error';
         return;
     }

    // Set loading/default states
    totalRevenueElement.textContent = '0 EGP';
    avgRatingsContainer.innerHTML = '<p class="text-gray-500">Loading ratings...</p>';
    if (!isVendor) {
        seatsTodayElement.textContent = '0';
        capacityTodayElement.textContent = '0%';
        capacityDetailElement.textContent = 'Calculating...';
        mostBookedElement.textContent = '--';
        leastBookedElement.textContent = '--';
        // *** FIX: Removed the duplicate line below ***
        weeklyTableBody.innerHTML = `<tr class="bg-white border-b"><td colspan="4" class="px-4 py-3 text-center text-gray-500">Loading weekly data...</td></tr>`;
        dailyMoviePerfList.innerHTML = '<p class="text-gray-500 md:col-span-2">Loading daily movie data...</p>';
        // The second assignment to weeklyTableBody.innerHTML was removed here
    }

    // Remove previous monthly card (still generated later)
    const oldMonthlyCard = analyticsSection.querySelector('#admin-monthly-seats-card');
    if (oldMonthlyCard) oldMonthlyCard.remove();


    // --- Filter Data ---
    console.log("Analytics: Global data state:", { movies: movies.length, allBookings: allBookings.length }); // Log global counts
    const relevantMovies = isVendor ? movies.filter(m => m.vendorName === targetVendorName) : movies;
    const relevantMovieIds = relevantMovies.map(m => m.id);
    // Filter bookings for relevant movies only ONCE
    const relevantBookings = allBookings.filter(b => relevantMovieIds.includes(b.movieId));
    console.log("Analytics: Filtered data:", { relevantMovies: relevantMovies.length, relevantBookings: relevantBookings.length }); // Log filtered counts


    // --- Handle No Movies Case ---
    if (relevantMovies.length === 0) {
        console.log("Analytics: No relevant movies found."); // Log path
        const noMovieMsg = `<p class="text-gray-500">No movies ${isVendor ? 'assigned' : ''}.</p>`;
        avgRatingsContainer.innerHTML = noMovieMsg;
        if (!isVendor) {
            seatsTodayElement.textContent = '0';
            capacityTodayElement.textContent = 'N/A';
            capacityDetailElement.textContent = 'No movies scheduled.';
            mostBookedElement.textContent = 'N/A';
            leastBookedElement.textContent = 'N/A';
            weeklyTableBody.innerHTML = `<tr class="bg-white border-b"><td colspan="4" class="px-4 py-3 text-center text-gray-500">No movie data for weekly analysis.</td></tr>`;
            dailyMoviePerfList.innerHTML = '<p class="text-gray-500 md:col-span-2">No movies scheduled for daily analysis.</p>';
        }
        appendMonthlySeatsCard(analyticsSection, {}, isVendor ? 'for your movies' : ''); // Pass empty data
        return; // Exit if no movies
    }

    // --- Calculate Total Revenue ---
    const totalRevenue = relevantBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    totalRevenueElement.textContent = `${totalRevenue.toFixed(2)} EGP`;
    console.log("Analytics: Total Revenue Calculated:", totalRevenue); // Log revenue

    // --- Calculate and Render Avg Ratings ---
    console.log("Analytics: Calling renderAverageRatings...");
    renderAverageRatings(avgRatingsContainer, relevantMovies, isVendor);

    // --- Calculate Daily Metrics (Admin Only) ---
    if (!isVendor) {
        console.log("Analytics: Calling calculateAndRenderDailyMetrics...");
        calculateAndRenderDailyMetrics(relevantMovies, relevantBookings, seatsTodayElement, capacityTodayElement, capacityDetailElement, mostBookedElement, leastBookedElement);
        console.log("Analytics: Calling calculateAndRenderDailyMoviePerformance...");
        calculateAndRenderDailyMoviePerformance(relevantMovies, relevantBookings, dailyMoviePerfList);
    }

    // --- Calculate Weekly Metrics (Admin Only) ---
    if (!isVendor) {
         console.log("Analytics: Calling calculateAndRenderWeeklyMetrics...");
         calculateAndRenderWeeklyMetrics(relevantMovies, relevantBookings, weeklyTableBody);
    }

    // --- Calculate and Render Monthly Booked Seats (Appended at the end) ---
    console.log("Analytics: Calling calculateMonthlyBookedSeats...");
    const monthlyData = calculateMonthlyBookedSeats(relevantBookings);
    console.log("Analytics: Calling appendMonthlySeatsCard...");
    appendMonthlySeatsCard(analyticsSection, monthlyData, isVendor ? 'for your movies' : '');

    console.log("Analytics: Rendering finished.");

}

function calculateAndRenderDailyMoviePerformance(movies, bookings, listContainer) {
    listContainer.innerHTML = ''; // Clear loading message
    const todayStr = formatDateYYYYMMDD(new Date());
    let moviesWithShowtimesToday = 0;

    // Sort movies alphabetically by title for consistent display order
    const sortedMovies = [...movies].sort((a, b) => a.title.localeCompare(b.title));

    sortedMovies.forEach(movie => {
        const showtimesTodayCount = Array.isArray(movie.showtimes) ? movie.showtimes.length : 0;

        // Skip movies with no showtimes scheduled at all today (or ever listed)
        if (showtimesTodayCount === 0) {
            return; // Go to the next movie
        }

        moviesWithShowtimesToday++; // Count movies that *could* have bookings today

        const totalPossibleSeatsToday = showtimesTodayCount * TOTAL_SEATS_PER_SCREENING;
        let seatsBookedToday = 0;

        // Sum bookings for *this specific movie* today
        bookings.forEach(booking => {
            if (booking.movieId === movie.id && booking.selectedDate === todayStr && Array.isArray(booking.seats)) {
                seatsBookedToday += booking.seats.length;
            }
        });

        const occupancyPercent = totalPossibleSeatsToday > 0 ? (seatsBookedToday / totalPossibleSeatsToday) * 100 : 0;
        const { text: labelText, class: labelClass } = getOccupancyLabel(occupancyPercent);

        // Create the performance card element
        const card = document.createElement('div');
        card.className = 'daily-perf-card';

        card.innerHTML = `
            <div class="movie-title">${movie.title}</div>
            <div class="details">
                <span class="seats">Seats Booked: <strong>${seatsBookedToday} / ${totalPossibleSeatsToday}</strong></span>
                <span class="percentage">Occupancy: <strong>${occupancyPercent.toFixed(1)}%</strong></span>
            </div>
            <div class="occupancy-bar-container" title="${occupancyPercent.toFixed(1)}% Occupancy">
                <div class="occupancy-bar-fill ${labelClass}" style="width: ${occupancyPercent.toFixed(1)}%;"></div>
            </div>
            <div class="performance-label-container">
                 <span class="occupancy-label ${labelClass}">${labelText}</span>
            </div>
        `;

        listContainer.appendChild(card);
    });

    // Handle case where movies exist, but none have showtimes scheduled today
    if (moviesWithShowtimesToday === 0 && movies.length > 0) {
         listContainer.innerHTML = '<p class="text-gray-500 md:col-span-2">No movies have scheduled showtimes for today.</p>';
    } else if (movies.length === 0) { // Should be caught earlier, but double-check
        listContainer.innerHTML = '<p class="text-gray-500 md:col-span-2">No movies to analyze.</p>';
    }
}

// --- Helper function to render average ratings ---
function renderAverageRatings(container, moviesToRate, isVendor) {
    container.innerHTML = ''; // Clear loading state
    let hasRatings = false;
    moviesToRate.forEach(movie => {
        const { average, count } = calculateAverageRating(movie); // Pass movie object with ID
        if (count > 0) hasRatings = true;
        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'flex justify-between items-center text-sm pb-1 border-b border-gray-200 last:border-b-0';
        const titleSpan = document.createElement('span');
        titleSpan.textContent = movie.title;
        titleSpan.className = 'font-medium text-gray-700 truncate pr-2'; // Added truncate
        const starsSpan = document.createElement('span');
        starsSpan.className = 'stars-container flex items-center flex-shrink-0'; // Added shrink
        renderStars(starsSpan, average, count, false); // Render non-interactive stars
        ratingDiv.appendChild(titleSpan);
        ratingDiv.appendChild(starsSpan);
        container.appendChild(ratingDiv);
    });
    if (!hasRatings) {
        container.innerHTML = `<p class="text-gray-500">No ratings submitted ${isVendor ? 'for your movies' : ''} yet.</p>`;
    }
}

// --- Helper function for Daily Metrics (Admin only) ---
function calculateAndRenderDailyMetrics(movies, bookings, seatsEl, capacityEl, capacityDetailEl, mostEl, leastEl) {
    const todayStr = formatDateYYYYMMDD(new Date());
    let totalSeatsBookedToday = 0;
    let totalScheduledShowtimesToday = 0;
    const dailyBookingsByMovie = {}; // { movieId: seatsBooked }

    // Calculate total scheduled showtimes today across relevant movies
    movies.forEach(movie => {
        totalScheduledShowtimesToday += Array.isArray(movie.showtimes) ? movie.showtimes.length : 0;
    });

    const totalAvailableSeatsToday = totalScheduledShowtimesToday * TOTAL_SEATS_PER_SCREENING;

    // Calculate seats booked today and group by movie
    bookings.forEach(booking => {
        if (booking.selectedDate === todayStr && Array.isArray(booking.seats)) {
            const seatsCount = booking.seats.length;
            totalSeatsBookedToday += seatsCount;
            if (!dailyBookingsByMovie[booking.movieId]) {
                dailyBookingsByMovie[booking.movieId] = 0;
            }
            dailyBookingsByMovie[booking.movieId] += seatsCount;
        }
    });

    // Calculate capacity percentage
    const dailyCapacityPercentage = totalAvailableSeatsToday > 0
        ? (totalSeatsBookedToday / totalAvailableSeatsToday) * 100
        : 0;

    // Update DOM for summary box
    seatsEl.textContent = totalSeatsBookedToday;
    capacityEl.textContent = `${dailyCapacityPercentage.toFixed(1)}%`;
    capacityDetailEl.textContent = `(${totalSeatsBookedToday} / ${totalAvailableSeatsToday} seats)`;


    // Determine Most/Least Booked Movie Today
    let mostBookedSeats = -1;
    let leastBookedSeats = Infinity;
    let mostBookedMovieId = null;
    let leastBookedMovieId = null;

     // Initialize with all movie IDs having 0 bookings today
     const movieSeatsToday = movies.reduce((acc, movie) => {
        acc[movie.id] = dailyBookingsByMovie[movie.id] || 0;
        return acc;
    }, {});

    for (const movieId in movieSeatsToday) {
        const seats = movieSeatsToday[movieId];
        // Most booked
        if (seats > mostBookedSeats) {
            mostBookedSeats = seats;
            mostBookedMovieId = movieId;
        }
        // Least booked (must have had at least one booking to qualify, otherwise all 0s are least)
        // Correction: Find minimum among *all* movies today, including those with 0 bookings.
        if (seats < leastBookedSeats) {
            leastBookedSeats = seats;
            leastBookedMovieId = movieId;
        }
    }


    // Find movie titles
    const mostBookedMovie = movies.find(m => m.id === mostBookedMovieId);
    const leastBookedMovie = movies.find(m => m.id === leastBookedMovieId);

    // Update DOM for daily highlights
    if (totalSeatsBookedToday > 0) {
         mostEl.textContent = mostBookedMovie ? `${mostBookedMovie.title} (${mostBookedSeats} seats)` : 'N/A';
         leastEl.textContent = leastBookedMovie ? `${leastBookedMovie.title} (${leastBookedSeats} seats)` : 'N/A';
    } else {
         mostEl.textContent = 'None';
         leastEl.textContent = 'None';
    }

}

// --- Helper function for Weekly Metrics (Admin only) ---
function calculateAndRenderWeeklyMetrics(movies, bookings, tableBody) {
    tableBody.innerHTML = ''; // Clear loading/previous content

    const weeklyOccupancyData = {}; // { movieId: { booked: totalSeats, screenings: totalScheduledScreenings } }
    const pastWeekDates = getPastWeekDates(); // Get ['today', 'yesterday', ...] YYYY-MM-DD

    // Initialize weekly data structure for all relevant movies
    movies.forEach(movie => {
        const scheduledScreeningsWeekly = (Array.isArray(movie.showtimes) ? movie.showtimes.length : 0) * 7; // Approx. total scheduled
        weeklyOccupancyData[movie.id] = {
            booked: 0,
            screenings: scheduledScreeningsWeekly, // Store scheduled screenings
            title: movie.title // Store title for easy access later
        };
    });

    // Aggregate booked seats over the past week
    bookings.forEach(booking => {
        if (pastWeekDates.includes(booking.selectedDate) && Array.isArray(booking.seats)) {
            if (weeklyOccupancyData[booking.movieId]) { // Check if movie exists in our structure
                 weeklyOccupancyData[booking.movieId].booked += booking.seats.length;
            }
        }
    });

    // Calculate averages and render table rows
    const movieIdsSorted = Object.keys(weeklyOccupancyData).sort((a, b) => weeklyOccupancyData[a].title.localeCompare(weeklyOccupancyData[b].title));

     if (movieIdsSorted.length === 0) {
          tableBody.innerHTML = `<tr class="bg-white border-b"><td colspan="4" class="px-4 py-3 text-center text-gray-500">No movie data for weekly analysis.</td></tr>`;
          return;
     }

    movieIdsSorted.forEach(movieId => {
        const data = weeklyOccupancyData[movieId];
        const totalPossibleSeatsWeekly = data.screenings * TOTAL_SEATS_PER_SCREENING;

        const avgSeatsBooked = data.screenings > 0 ? (data.booked / 7) : 0; // Average per day
        const avgOccupancyPercent = totalPossibleSeatsWeekly > 0 ? (data.booked / totalPossibleSeatsWeekly) * 100 : 0;

        const { text: labelText, class: labelClass } = getOccupancyLabel(avgOccupancyPercent);

        const row = document.createElement('tr');
        row.className = 'bg-white border-b';
        row.innerHTML = `
            <td class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">${data.title}</td>
            <td class="px-4 py-2 text-right">${avgSeatsBooked.toFixed(1)}</td>
            <td class="px-4 py-2 text-right">${avgOccupancyPercent.toFixed(1)}%</td>
            <td class="px-4 py-2 text-center">
                <span class="occupancy-label ${labelClass}">${labelText}</span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// --- Helper function for Monthly Metrics ---
function calculateMonthlyBookedSeats(bookings) {
    const monthlyData = bookings.reduce((acc, booking) => {
        if (booking.timestamp && booking.seats && Array.isArray(booking.seats) && booking.seats.length > 0) {
            try {
                const date = booking.timestamp instanceof Timestamp ? booking.timestamp.toDate() : new Date(booking.timestamp);
                if (isNaN(date.getTime())) { throw new Error("Invalid Date"); }
                const year = date.getFullYear();
                const month = date.getMonth(); // 0-indexed
                const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
                if (!acc[monthKey]) acc[monthKey] = 0;
                acc[monthKey] += booking.seats.length;
            } catch (e) {
                console.warn("Could not process timestamp for monthly analytics:", booking.id, booking.timestamp, e);
            }
        }
        return acc;
    }, {});
    return monthlyData;
}

// --- Helper function to append Monthly Seats Card ---
function appendMonthlySeatsCard(analyticsSection, monthlyData, contextSuffix) {
    const monthlySeatsContainer = document.createElement('div');
    monthlySeatsContainer.className = 'analytics-card';
    monthlySeatsContainer.id = 'admin-monthly-seats-card'; // Keep ID for potential removal
    monthlySeatsContainer.innerHTML = `
        <h3 class="text-lg font-semibold mb-3 text-gray-600">Total Seats Booked Per Month</h3>
        <div class="space-y-2 text-sm" id="monthly-seats-list">
            <!-- Monthly data populated here -->
        </div>
    `;
    const monthlyList = monthlySeatsContainer.querySelector('#monthly-seats-list');
    const sortedMonths = Object.keys(monthlyData).sort().reverse();

    if (sortedMonths.length > 0) {
        sortedMonths.forEach(monthKey => {
            const [year, monthNum] = monthKey.split('-');
            const dateForMonthName = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
            const monthName = dateForMonthName.toLocaleString('default', { month: 'long' });
            const seats = monthlyData[monthKey];
            const item = document.createElement('div');
            item.className = 'flex justify-between items-center pb-1 border-b border-gray-200 last:border-b-0';
            item.innerHTML = `
                <span class="font-medium text-gray-700">${monthName} ${year}</span>
                <span class="font-semibold text-blue-600">${seats} ${seats === 1 ? 'seat' : 'seats'}</span>
            `;
            monthlyList.appendChild(item);
        });
    } else {
        monthlyList.innerHTML = `<p class="text-gray-500">No monthly booking data available ${contextSuffix}.</p>`;
    }
    analyticsSection.appendChild(monthlySeatsContainer);
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
    console.log("Attempting Vendor Login..."); // ADD THIS LOG
    event.preventDefault();
    hideError(vendorLoginError);
    const email = document.getElementById('vendor-email').value.trim();
    const password = document.getElementById('vendor-password').value;
    try {
        // Attempt sign in
        await signInWithEmailAndPassword(auth, email, password);
        // !! IMPORTANT: If this line succeeds, Firebase Auth considers the user logged in.
        // The rest depends on onAuthStateChanged correctly identifying the role.
        console.log("Vendor signInWithEmailAndPassword successful (waiting for onAuthStateChanged)..."); // ADD THIS LOG

        // We don't set local storage here; onAuthStateChanged handles confirmation
        vendorLoginForm.reset();
    } catch (error) {
        // This block runs if signInWithEmailAndPassword FAILS (wrong password, user not found etc.)
        console.error("Vendor Login Firebase Auth Error:", error.code, error.message); // Log specific code
        displayError(vendorLoginError, "Invalid vendor email or password.");
        // Clear potentially stale optimistic login data if login fails
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
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
    adminVendorListContainer.innerHTML = ''; // Clear previous

    if (vendors.length === 0) {
        adminVendorListContainer.innerHTML = '<p class="text-gray-500">No vendors registered yet.</p>';
        return;
    }

    vendors.forEach((vendor) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'vendor-list-item';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'flex-grow pr-4';
        infoDiv.innerHTML = `<span class="font-medium text-gray-800">${vendor.name}</span><span class="block text-sm text-gray-500">${vendor.email}</span>`;

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'flex-shrink-0 flex gap-2';

        // Edit Button
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-secondary btn-icon text-xs !py-1 !px-2 edit-vendor-btn'; // Add class
        editButton.dataset.vendorId = vendor.id; // Add data attribute
        editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
        // REMOVE inline onclick logic

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-icon text-xs !py-1 !px-2 delete-vendor-btn'; // Add class
        deleteButton.dataset.vendorId = vendor.id; // Add data attribute
        deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
        // REMOVE inline onclick logic

        controlsDiv.appendChild(editButton);
        controlsDiv.appendChild(deleteButton);
        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(controlsDiv);
        adminVendorListContainer.appendChild(itemDiv);
    });
}

function resetVendorForm() {
    vendorForm.reset();
    editingVendorId = null; // Reset editing ID
    vendorFormTitle.textContent = 'Add New Vendor';
    vendorSubmitButton.textContent = 'Add Vendor';
    vendorCancelEditButton.classList.add('hidden');

    // Re-enable potentially disabled fields
    const emailInput = document.getElementById('new-vendor-email');
    const passwordInput = document.getElementById('new-vendor-password');
    if (emailInput) emailInput.disabled = false;
    if (passwordInput) {
         passwordInput.disabled = false;
         passwordInput.placeholder = ''; // Reset placeholder
    }
}

async function handleVendorFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission
    const isEditing = !!editingVendorId; // True if editingVendorId has a value

    // Get form values
    const vendorName = document.getElementById('vendor-name').value.trim();
    const vendorEmail = document.getElementById('new-vendor-email').value.trim();
    const vendorPassword = document.getElementById('new-vendor-password').value.trim();

    // --- Validation ---
    if (!vendorName) {
        alert("Vendor Name is required.");
        return;
    }
    // Email is always required, check format
    if (!vendorEmail || !/^\S+@\S+\.\S+$/.test(vendorEmail)) {
        alert("Please enter a valid email address.");
        return;
    }
    // Password required only when *adding* a new vendor
    if (!isEditing && !vendorPassword) {
        alert("Password is required when adding a new vendor.");
        return;
    }
    // Password length check only when adding
    if (!isEditing && vendorPassword.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    // Disable submit button during processing
    vendorSubmitButton.disabled = true;
    vendorSubmitButton.textContent = isEditing ? 'Saving...' : 'Adding...';

    // --- Handle Editing (Name Only) ---
    if (isEditing) {
        console.log("Attempting to edit vendor name for UID:", editingVendorId);
        const vendorRef = doc(db, "vendors", editingVendorId); // Document ref using UID

        try {
            // Update only the name field in the /vendors/{uid} document
            await updateDoc(vendorRef, { name: vendorName });
            console.log("Vendor name updated successfully for UID:", editingVendorId);

            // Update local 'vendors' array
            const index = vendors.findIndex(v => v.id === editingVendorId);
            if (index > -1) {
                vendors[index].name = vendorName; // Update name locally
            } else {
                console.warn("Vendor not found in local array after successful update, might need refresh.");
                // Optionally force reload data here if needed, but usually renderVendorList is enough
                 await loadDataFromFirebase(); // Force reload if inconsistency detected
            }

            // Refresh UI elements
            renderVendorList(); // Refresh the list displayed to the admin
            resetVendorForm(); // Clear and reset the form
            populateVendorDropdown('movie-vendor'); // Update dropdowns in movie form

        } catch (error) {
            console.error("Error updating vendor name in Firestore:", error);
            alert(`Failed to update vendor name. Please check console for details. Error: ${error.message}`);
        } finally {
            // Re-enable button regardless of success/error
            vendorSubmitButton.disabled = false;
            // Text content was set by resetVendorForm() if successful, otherwise reset here
             if (!vendorSubmitButton.textContent.includes('Add')) { // Avoid resetting if form reset already happened
                 vendorSubmitButton.textContent = 'Save Name Change';
             }
        }
        return; // Stop execution after handling edit
    }

    // --- Handle Adding New Vendor ---
    console.log("Attempting to add new vendor:", vendorName, vendorEmail);
    try {
        // 1. Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, vendorEmail, vendorPassword);
        const user = userCredential.user;
        console.log("Vendor Auth user created:", user.uid, user.email);

        // 2. Create user role document in /users/{uid} collection
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            email: user.email,
            role: 'vendor', // Assign vendor role
            createdAt: serverTimestamp()
        });
        console.log("Vendor role document created in /users/", user.uid);

        // 3. Create vendor details document in /vendors/{uid} collection (using UID as ID)
        const vendorDocRef = doc(db, "vendors", user.uid);
        const vendorData = {
            name: vendorName,
            email: user.email, // Use email from Auth user for consistency
            userId: user.uid, // Explicitly link to Auth UID
            // DO NOT store password here - it's managed by Firebase Auth
            createdAt: serverTimestamp()
        };
        await setDoc(vendorDocRef, vendorData);
        console.log("Vendor details document created in /vendors/", user.uid);

        // Add new vendor to the local 'vendors' array (use UID as the main ID)
        vendors.push({ id: user.uid, ...vendorData, createdAt: new Date() }); // Simulate timestamp locally

        // Refresh UI elements
        renderVendorList(); // Refresh the list displayed to the admin
        resetVendorForm(); // Clear and reset the form
        populateVendorDropdown('movie-vendor'); // Update dropdowns in movie form
        alert(`Vendor "${vendorName}" added successfully!`); // Success feedback

    } catch (error) {
        console.error("Error adding vendor:", error);
        // Provide specific feedback based on error code
        if (error.code === 'auth/email-already-in-use') {
            alert("Error: This email is already registered. Please use a different email.");
        } else if (error.code === 'auth/weak-password') {
             alert("Error: Password is too weak. It must be at least 6 characters.");
        } else {
            // General error message
            alert(`Failed to add vendor. Please check the console. Error: ${error.message}`);
        }
        // IMPORTANT: If Auth creation succeeded but Firestore failed,
        // the admin might need to manually delete the Auth user from the Firebase Console.
        // No easy rollback client-side.
    } finally {
         // Re-enable button regardless of success/error
        vendorSubmitButton.disabled = false;
         // Text content was set by resetVendorForm() if successful, otherwise reset here
         if (!vendorSubmitButton.textContent.includes('Add')) { // Avoid resetting if form reset already happened
             vendorSubmitButton.textContent = 'Add Vendor';
         }
    }
}

// Show Edit Vendor Form (Using Firestore ID)
function showEditVendorForm(vendorId) { // vendorId is now the Auth UID
    const vendor = vendors.find(v => v.id === vendorId); // Find by UID
    if (!vendor) {
        console.error("Vendor not found for editing:", vendorId);
        resetVendorForm();
        return;
    }
    editingVendorId = vendorId; // Store the UID being edited

    document.getElementById('vendor-name').value = vendor.name;
    document.getElementById('new-vendor-email').value = vendor.email;
    document.getElementById('new-vendor-password').value = ''; // Clear password field

    // --- Disable email and password editing ---
    document.getElementById('new-vendor-email').disabled = true;
    document.getElementById('new-vendor-password').disabled = true;
    document.getElementById('new-vendor-password').placeholder = 'Cannot edit password here';


    vendorFormTitle.textContent = 'Edit Vendor Name'; // Clarify what can be edited
    vendorSubmitButton.textContent = 'Save Name Change';
    vendorCancelEditButton.classList.remove('hidden');
    vendorForm.scrollIntoView({ behavior: 'smooth' });
}

// Delete Vendor (Using Firestore ID and unassigning movies)
async function deleteVendor(vendorId) { // vendorId is Auth UID
    const vendor = vendors.find(v => v.id === vendorId); // Find locally first
    if (!vendor) {
        console.error("Vendor not found in local state for deletion:", vendorId);
         alert("Could not find vendor data to delete. Please refresh.");
        return;
    }
    const vendorName = vendor.name;
    const vendorEmail = vendor.email; // For confirmation message

    // Confirmation dialog
    if (confirm(`Delete vendor "${vendorName}" (${vendorEmail})?\n\nThis removes vendor details and role from Firestore, and unassigns their movies.\n\nNOTE: The underlying login (Firebase Auth user) for ${vendorEmail} must be deleted manually in the Firebase Console.`)) {
        console.log("Proceeding with deletion of Firestore data for vendor UID:", vendorId, "Name:", vendorName);
        try {
            const batch = writeBatch(db); // Use a batch for atomic operations

            // 1. Reference and schedule deletion of the vendor document from /vendors/{uid}
            const vendorDetailsRef = doc(db, "vendors", vendorId);
            batch.delete(vendorDetailsRef);
            console.log("Scheduled deletion for /vendors/", vendorId);

            // 2. Reference and schedule deletion of the user role document from /users/{uid}
            const userRoleRef = doc(db, "users", vendorId);
            batch.delete(userRoleRef);
            console.log("Scheduled deletion for /users/", vendorId);

            // 3. Query movies currently assigned to this vendor's *name*
            //    Note: If vendor name was changed previously, this might miss movies.
            //    A more robust approach might involve querying by vendorId if stored on movies,
            //    but current structure uses vendorName.
            console.log(`Querying movies with vendorName: "${vendorName}"`);
            const moviesQuery = query(collection(db, "movies"), where("vendorName", "==", vendorName));
            const moviesSnapshot = await getDocs(moviesQuery); // Execute the query

            // 4. Schedule updates for assigned movies to set vendorName to null
            moviesSnapshot.forEach(movieDoc => {
                console.log(`Scheduling update to unassign vendor from movie: ${movieDoc.id} (${movieDoc.data().title})`);
                batch.update(movieDoc.ref, { vendorName: null });
            });
            console.log(`Found ${moviesSnapshot.size} movies to unassign.`);

            // Commit all scheduled operations in the batch
            await batch.commit();
            console.log("Firestore batch commit successful. Vendor documents deleted and movies unassigned.");

            // Update local state arrays *after* successful commit
            vendors = vendors.filter(v => v.id !== vendorId); // Remove vendor from local array
            movies.forEach(movie => {
                if (movie.vendorName === vendorName) {
                    movie.vendorName = null; // Update local movie cache
                }
            });

            // Refresh relevant UI sections
            renderVendorList(); // Update the displayed vendor list
            resetVendorForm(); // Reset the form in case it was in edit mode for the deleted vendor
            populateVendorDropdown('movie-vendor'); // Update dropdown in movie form
            // If admin is viewing movies, refresh those lists too
             if (currentAdminTab === 'admin-manage-movies') {
                renderMovies(adminMovieListContainer, 'admin');
             }
             alert(`Vendor "${vendorName}" data deleted successfully from Firestore.`);

        } catch (error) {
            console.error("Error deleting vendor Firestore data and updating movies:", error);
            alert(`Failed to delete vendor data. Please check the console for details and ensure you have Firestore permissions. Error: ${error.message}\n\nRemember to manually delete the Auth user ${vendorEmail} if needed.`);
        }
    } else {
         console.log("Vendor deletion cancelled by admin.");
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
    // Add viewType class for specific CSS targeting
    card.className = `movie-card flex flex-col view-${viewType}`;
    card.dataset.movieId = movie.id;

    const img = document.createElement('img');
    img.src = movie.posterUrl || 'https://placehold.co/400x600/cccccc/ffffff?text=No+Image';
    img.alt = `${movie.title} Poster`;
    img.className = 'movie-poster';
    img.onerror = function() { this.onerror=null; this.src='https://placehold.co/400x600/cccccc/ffffff?text=Image+Error'; };

    const content = document.createElement('div');
    content.className = 'p-3 flex flex-col flex-grow'; // Use slightly less padding: p-3

    const title = document.createElement('h3');
    // Removed mb-1, added title class
    title.className = 'movie-card-title font-semibold flex items-center mb-1';
    title.textContent = movie.title;

    // ***** REMOVED VENDOR BADGE FROM TITLE LOGIC *****
    // if (movie.vendorName) { ... } code block removed

    const avgRatingDiv = document.createElement('div');
     // Removed text-sm, mb-2. Added specific class
    avgRatingDiv.className = 'movie-card-rating stars-container';
    const { average, count } = calculateAverageRating(movie);
    renderStars(avgRatingDiv, average, count, false); // Rating stars remain visible

    // ***** START MODIFICATION *****
    // Genre Element (Now VISIBLE)
    const genreElement = document.createElement('p');
    genreElement.className = 'movie-card-genre text-xs'; // Specific class, smaller text
     genreElement.innerHTML = `<i class="fas fa-tag mr-1 opacity-75"></i> ${movie.genre || 'N/A'}`;

    // Wrapper for HIDDEN details
    const detailsWrapper = document.createElement('div');
    detailsWrapper.className = 'movie-card-details'; // Class to hide this wrapper

    // Duration element (Goes inside hidden wrapper)
    const durationElement = document.createElement('p');
    durationElement.className = 'text-xs'; // Smaller text
    durationElement.innerHTML = `<i class="fas fa-clock mr-1 opacity-75"></i> ${movie.duration || 'N/A'} min`;

    // Description (Goes inside hidden wrapper)
    const description = document.createElement('p');
    description.className = 'text-sm mt-1'; // Add margin top
    description.textContent = movie.description || 'No description available.';


    // Showtimes (Goes inside hidden wrapper)
    const showtimes = document.createElement('p');
    showtimes.className = 'text-sm font-medium mt-2'; // Add margin top
    const showtimesText = Array.isArray(movie.showtimes) ? movie.showtimes.join(', ') : (movie.showtimes || 'N/A');
    showtimes.innerHTML = `<i class="fas fa-calendar-alt mr-1 opacity-75"></i> Showtimes: ${showtimesText}`;

    // Append hidden details to the wrapper
    detailsWrapper.appendChild(durationElement);
    detailsWrapper.appendChild(description);
    detailsWrapper.appendChild(showtimes);
    // ***** END MODIFICATION *****

    // Append elements to the main content div
    content.appendChild(title);
    content.appendChild(avgRatingDiv);
    content.appendChild(genreElement);    // Append VISIBLE genre here
    content.appendChild(detailsWrapper); // Append HIDDEN wrapper here

    card.appendChild(img);
    card.appendChild(content);

    // --- Keep Admin Controls and Click Logic ---
    if (viewType === 'admin') {
        const adminControls = document.createElement('div');
        adminControls.className = 'admin-controls p-2 border-t flex justify-end gap-2'; // Smaller padding
        // ... Add buttons ...
         const editButton = document.createElement('button');
         editButton.innerHTML = '<i class="fas fa-edit"></i>'; // Icon only maybe?
         editButton.className = 'btn btn-secondary btn-icon text-xs !p-1 edit-movie-btn'; // Smaller button
         editButton.dataset.movieId = movie.id;
         editButton.title = "Edit Movie"; // Tooltip

         const deleteButton = document.createElement('button');
         deleteButton.innerHTML = '<i class="fas fa-trash"></i>'; // Icon only
         deleteButton.className = 'btn btn-danger btn-icon text-xs !p-1 delete-movie-btn'; // Smaller button
         deleteButton.dataset.movieId = movie.id;
         deleteButton.title = "Delete Movie"; // Tooltip

         adminControls.appendChild(editButton);
         adminControls.appendChild(deleteButton);
         card.appendChild(adminControls);

    } else if (viewType === 'customer' || viewType === 'preview') { // Keep preview here for click logic if needed elsewhere
        card.classList.add('cursor-pointer');
        // Prevent admin booking from customer view
        if (viewType === 'customer' && authState.isLoggedIn && authState.user?.type === 'admin') {
            card.title = "Admins cannot book movies from this view.";
            card.style.cursor = 'not-allowed';
        } else {
            card.onclick = () => openModal(movie.id);
        }
    }
    // Vendor view needs no controls

    return card;
}

function updateHeaderVisibility() {
    // --- Handle User Info Span ---
    const userInfoSpan = document.getElementById('logged-in-user-info');
    const isCustomer = authState.isLoggedIn && authState.user?.type === 'customer';
    const isMobileWidth = window.innerWidth <= 580; // Mobile breakpoint

    console.log(`Header Visibility Check: isCustomer=${isCustomer}, isMobileWidth=${isMobileWidth}`);

    if (userInfoSpan) { // Check if the element exists
        if (isCustomer && isMobileWidth) {
            // Hide user info span for customers on mobile
            console.log("Hiding user info span via style.display.");
            userInfoSpan.style.display = 'none';
        } else {
            // Show user info span otherwise
             console.log("Showing user info span via style.display.");
            userInfoSpan.style.display = 'block'; // Or 'inline-block'
        }
    } else {
        // console.warn("User info span not found for visibility update.");
    }

    // --- Handle Movie Card Rating Text Visibility ---
    console.log(`Card Rating Text Check: isMobileWidth=${isMobileWidth}`);
    // Select ALL elements with the 'rating-text' class that are children of '.movie-card'
    const cardRatingTexts = document.querySelectorAll('.movie-card .rating-text');

    cardRatingTexts.forEach(textElement => {
        if (isMobileWidth) {
            // Hide rating text on mobile
            if (textElement.style.display !== 'none') { // Avoid redundant style changes
                console.log("Hiding card rating text via style.display.");
                textElement.style.display = 'none';
            }
        } else {
            // Show rating text on desktop
            if (textElement.style.display === 'none') { // Avoid redundant style changes
                console.log("Showing card rating text via style.display.");
                 // Set display back to its default (likely inline or inline-block for a span)
                 // Setting to '' lets the browser/CSS decide the default display.
                textElement.style.display = '';
            }
        }
    });
}

// --- Movie List Rendering (Uses local 'movies' array) ---
function renderMovies(container, viewType) {
    // ***** ADDED LOGGING *****
    console.log(`>>> renderMovies called for viewType: ${viewType}. Container: #${container?.id || 'unknown'}`);
    if (!container) {
        console.error(`Error: Container element is null for renderMovies (viewType: ${viewType})`);
        return;
    }
    container.innerHTML = ''; // Clear previous content
    let noMoviesMsg;

    if (viewType === 'admin') {
        noMoviesMsg = noMoviesAdminMsg;
    } else if (viewType === 'customer') {
        noMoviesMsg = noMoviesCustomerMsg;
    } else if (viewType === 'vendor_dashboard') {
        noMoviesMsg = noVendorMoviesMsg;
    }

    let moviesToRender = movies;

    if (viewType === 'vendor_dashboard' && authState.user?.type === 'vendor' && authState.user?.name) {
         moviesToRender = movies.filter(m => m.vendorName === authState.user.name);
    }

    console.log(`   - Found ${moviesToRender.length} movies to render for ${viewType}.`); // Log count

    if (moviesToRender.length === 0) {
        if (noMoviesMsg && viewType !== 'vendor_dashboard') {
            console.log(`   - Showing 'no movies' message for ${viewType}.`); // Log message display
            if (viewType === 'customer') {
                 noMoviesMsg.textContent = "No movies currently showing.";
             } else if (viewType === 'admin') {
                 noMoviesMsg.textContent = "No movies added yet.";
             }
            showElement(noMoviesMsg);
        }
        return; // Exit if no movies
    } else {
         if (noMoviesMsg) {
             console.log(`   - Hiding 'no movies' message for ${viewType}.`); // Log message hide
             hideElement(noMoviesMsg);
         }
    }

    moviesToRender.forEach((movie, index) => {
        // ***** ADDED LOGGING *****
        console.log(`   - Creating card for movie ${index + 1}: ${movie.title} (ID: ${movie.id})`);
        try {
            const card = createMovieCard(movie, null, viewType);
            container.appendChild(card);
        } catch (error) {
            console.error(`Error creating movie card for ${movie.title} (ID: ${movie.id}):`, error);
        }
    });
    console.log(`<<< renderMovies finished for viewType: ${viewType}.`); // Log end
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

    // ***** CORRECTED VENDOR DISPLAY LOGIC *****
    // Use the variables defined in the DOM Elements section
    if (modalVendorElement && modalVendorNameSpan) { // Check if modal elements exist
        if (movie.vendorName) {
            modalVendorNameSpan.textContent = movie.vendorName; // Set the name
            showElement(modalVendorElement); // Show the paragraph containing the vendor info
        } else {
            hideElement(modalVendorElement); // Hide the paragraph if no vendor name
        }
    } else {
        console.warn("Vendor display elements not found in modal.");
    }
    // ***** END VENDOR DISPLAY LOGIC *****

    // Calculate and render average rating
    const avgData = calculateAverageRating(movie);
    // Pass the correct container for average rating display
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
        const hasRated = userCurrentRating !== null; // This flag is now just for the initial message

        // ***** CHANGE: Always render interactive stars for customers *****
        // Render stars in the INTERACTIVE container (modalStarsContainer)
        // The 'interactive' parameter is now hardcoded to 'true' for customers
        renderStars(modalStarsContainer, 0, 0, true, userCurrentRating, movieId);

        // Set the initial message based on whether a rating exists
        modalRatingMessage.textContent = hasRated
            ? `You previously rated this ${userCurrentRating} star${userCurrentRating > 1 ? 's' : ''}. Click to change.`
            : 'Click stars to rate!';

        // Ensure container is visually interactive
        modalStarsContainer.classList.add('interactive');
        modalStarsContainer.style.cursor = 'pointer';
    } else {
        hideElement(modalRatingSection);
    }

    showElement(movieDetailsModal);
    document.body.classList.add('overflow-hidden'); // Keep this to prevent background scroll
}

function closeModal() {
    hideElement(movieDetailsModal);
    document.body.classList.remove('overflow-hidden');
    currentModalMovieId = null;
    currentSelectedDate = null;
    if (pikadayInstance) { pikadayInstance.destroy(); pikadayInstance = null; } // Destroy calendar on close
}

// --- Utility Functions (Add if not present) ---
function getPastWeekDates(today = new Date()) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(formatDateYYYYMMDD(date)); // Store as YYYY-MM-DD
    }
    return dates; // Returns [today, yesterday, day_before, ...]
}

// Revised Occupancy Label Function
function getOccupancyLabel(percentage) {
    if (percentage === null || isNaN(percentage)) return { text: 'N/A', class: 'occupancy-empty' };
    if (percentage === 0) return { text: 'Empty', class: 'occupancy-empty' };
    if (percentage < 25) return { text: 'Low', class: 'occupancy-low' };
    if (percentage <= 60) return { text: 'Moderate', class: 'occupancy-moderate' };
    // if (percentage > 60)
    return { text: 'High', class: 'occupancy-high' };
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
    hideError(paymentErrorElement); // Clear previous errors

    // --- Gather raw input values ---
    const cardName = document.getElementById('cardholder-name').value.trim();
    const cardNumberRaw = document.getElementById('card-number').value;
    const cardCvv = document.getElementById('card-cvv').value.trim();
    const cardExpiryRaw = document.getElementById('card-expiry').value.trim();

    // --- FORM VALIDATION ---
    let isValid = true;
    let errorMsg = '';

    // 1. Cardholder Name
    if (!cardName) {
        errorMsg = 'Cardholder Name is required.';
        isValid = false;
    }

    // 2. Card Number (Basic length check after removing spaces)
    const cardNumberDigits = cardNumberRaw.replace(/\s/g, ''); // Remove spaces for validation
    if (isValid && (!cardNumberDigits || cardNumberDigits.length !== 16)) {
       errorMsg = 'Card Number must be 16 digits.';
       isValid = false;
    }
    // Optional: Add Luhn algorithm check here for better validation if needed

    // 3. CVV (Length check)
    if (isValid && (!cardCvv || !/^\d{3,4}$/.test(cardCvv))) {
       errorMsg = 'CVV must be 3 or 4 digits.';
       isValid = false;
    }

    // 4. Expiry Date (Format and Logic check)
    if (isValid) {
       if (!cardExpiryRaw || !/^\d{2}\/\d{2}$/.test(cardExpiryRaw)) {
           errorMsg = 'Expiry Date must be in MM/YY format.';
           isValid = false;
       } else {
           const [monthStr, yearStr] = cardExpiryRaw.split('/');
           const month = parseInt(monthStr, 10);
           const year = parseInt(`20${yearStr}`, 10); // Assume 20xx

           if (month < 1 || month > 12) {
               errorMsg = 'Invalid Expiry Month.';
               isValid = false;
           } else {
               const now = new Date();
               const currentYear = now.getFullYear();
               const currentMonth = now.getMonth() + 1; // JS months are 0-indexed

               // Check if year is in the past OR
               // if year is current year but month is in the past
               if (year < currentYear || (year === currentYear && month < currentMonth)) {
                   errorMsg = 'Card has expired.';
                   isValid = false;
               }
           }
       }
    }

    // If validation failed, display error and stop
    if (!isValid) {
        displayError(paymentErrorElement, errorMsg);
        return; // Stop processing
    }
    // --- END FORM VALIDATION ---


    // If validation passes, proceed with processing
    payNowBtn.disabled = true; // Disable button during processing
    payNowBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';

    // --- Gather data for booking (rest of the function) ---
    const selectedShowtimeRadio = modalShowtimesList.querySelector('input[type="radio"]:checked');
    // Check essential booking data again (belt and suspenders)
    if (!currentModalMovieId || !currentSelectedDate || selectedSeats.length === 0 || !selectedShowtimeRadio || !authState.isLoggedIn || !authState.user?.uid) {
        displayError(paymentErrorElement, "Booking information incomplete or invalid session.");
        payNowBtn.disabled = false; payNowBtn.innerHTML = '<i class="fas fa-credit-card mr-2"></i>Pay Now';
        return;
    }

    const movie = movies.find(m => m.id === currentModalMovieId);
    const showtime = selectedShowtimeRadio.value;
    const totalAmount = selectedSeats.length * TICKET_PRICE_EGP;
    const userUid = authState.user.uid;
    const userEmail = authState.user.email;
    const selectedDateStr = formatDateYYYYMMDD(currentSelectedDate);

    // --- Check Seat Availability AGAIN (Race Condition Check) ---
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
            last4: cardNumberDigits.slice(-4), // Use the digit-only string here
            expiry: cardExpiryRaw // Store the raw MM/YY string
            // DO NOT store full card number or CVV
        },
        totalAmount: totalAmount,
        timestamp: serverTimestamp(), // Use Firestore server timestamp
        qrCodeUsed: false, // Initialize as not used
        qrUsedTimestamp: null // Initialize as null
    };

    try {
        const docRef = await addDoc(collection(db, "bookings"), newBookingData);
        const newBookingId = docRef.id; // Get the newly created booking ID
        console.log("Booking added with ID:", newBookingId);
    
        // Add the new booking to the local cache immediately
        // Ensure timestamp is handled appropriately if needed immediately elsewhere
        allBookings.push({ id: newBookingId, ...newBookingData, timestamp: Timestamp.now() }); // Use Firestore Timestamp for consistency
    
        // --- Success: Show Custom Modal ---
        // Populate the success modal
        if(successMovieTitle) successMovieTitle.textContent = newBookingData.movieTitle;
        // Format date string back to readable format for modal display
        const dateForModal = newBookingData.selectedDate ? new Date(newBookingData.selectedDate.replace(/-/g, '/')) : null; // Handle potential null date
        if(successSelectedDate && dateForModal) successSelectedDate.textContent = formatDateReadable(dateForModal); else if (successSelectedDate) successSelectedDate.textContent = 'N/A';
        if(successShowtime) successShowtime.textContent = newBookingData.showtime;
        if(successSeats) successSeats.textContent = newBookingData.seats.join(', ');
        if(successTotalCost) successTotalCost.textContent = `${newBookingData.totalAmount} EGP`;
        if(successBookingId) successBookingId.textContent = newBookingId; // Display the ID
    
        closePaymentModal(); // Close payment modal first
        closeModal(); // Close movie details modal
        if (bookingSuccessModal) { // Check if modal exists
            showElement(bookingSuccessModal); // Show the success modal
        } else { // Fallback alert if modal element is missing
            alert(`Booking Successful!\nMovie: ${newBookingData.movieTitle}\nDate: ${formatDateReadable(dateForModal)}\nTime: ${newBookingData.showtime}\nSeats: ${newBookingData.seats.join(', ')}\nAmount: ${newBookingData.totalAmount} EGP\nBooking ID: ${newBookingId}`);
        }
        // --- End Success Modal Handling ---
    
    
        // Refresh relevant views using the updated local allBookings array
        if (isShowingMyBookings) { await renderMyBookings(); } // Refresh if already on bookings view

        if (adminView && !adminView.classList.contains('is-hidden')) {
            if (currentAdminTab === 'admin-bookings-section') {
                renderAdminBookingsList(); // Uses updated allBookings
            }
            // Re-render analytics completely to reflect new booking
            if (currentAdminTab === 'admin-analytics') {
                renderAnalyticsDashboard(); // Uses updated allBookings
            }
        }
        // Refresh vendor dashboard if the booked movie belongs to the logged-in vendor
        if (vendorDashboardView && !vendorDashboardView.classList.contains('is-hidden') && movie?.vendorName === authState.user?.name) {
             renderVendorDashboard(); // Also uses updated allBookings/movies for analytics
        }
        // No full page reload needed - UI updates based on state change + local data update

    } catch (error) {
        console.error("Error creating booking:", error); // Log booking creation error
        displayError(paymentErrorElement, "Failed to save booking after payment validation. Please try again."); // Specific error
    } finally { // Make sure button is re-enabled even on success/error
        payNowBtn.disabled = false;
        payNowBtn.innerHTML = '<i class="fas fa-credit-card mr-2"></i>Pay Now';
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

function openQrZoomModal(qrElement) {
    if (!qrElement || !qrZoomModal || !qrZoomContent) return;

    // ***** DETERMINE SIZE BASED ON SCREEN WIDTH *****
    const isMobileWidth = window.innerWidth <= 640; // Example breakpoint for mobile (adjust as needed, maybe 768?)
    const qrSize = isMobileWidth ? 200 : 300; // Smaller size for mobile, larger for desktop
    console.log(`Opening QR Zoom. Mobile: ${isMobileWidth}, QR Size: ${qrSize}px`);
    // ***** END SIZE DETERMINATION *****

    // Clear previous content
    qrZoomContent.innerHTML = '';

    // Try cloning first (more efficient if source is img)
    const existingImg = qrElement.querySelector('img');
    if (existingImg) {
        const zoomedImg = existingImg.cloneNode(true);
        // Set size based on determination
        zoomedImg.style.width = `${qrSize}px`;
        zoomedImg.style.height = `${qrSize}px`;
        qrZoomContent.appendChild(zoomedImg);
        showElement(qrZoomModal); // Show the modal
    } else { // Customer view ('my-bookings')
        itemDiv.className = 'booking-list-item';
        const bookingId = booking.id; // Store booking ID for listener
        const movie = movies.find(m => m.id === booking.movieId); // Get movie details

        // Prepare QR Data (no change here)
        const qrData = JSON.stringify({
            bookingId: bookingId,
            movieTitle: movie?.title || booking.movieTitle || 'Unknown Movie',
            showtime: booking.showtime,
            seats: booking.seats,
            userEmail: booking.userEmail
        });

        itemDiv.innerHTML = `
            <div class="booking-main-info flex justify-between items-start">
                <div class="booking-details flex-grow pr-4">
                    <p class="text-lg font-semibold mb-1">${movie?.title || booking.movieTitle || 'Unknown Movie'}</p>
                    <p class="text-sm text-gray-600 mb-1"><strong>Date:</strong> ${formatDateReadable(booking.selectedDate)}</p>
                    <p class="text-sm text-gray-600 mb-1"><strong>Showtime:</strong> ${booking.showtime || 'N/A'}</p>
                    <p class="text-sm text-gray-600"><strong>Seats:</strong> <span class="seats">${booking.seats?.sort()?.join(', ') || 'N/A'}</span></p>
                </div>
                <div id="qr-code-${bookingId}" class="qr-code-container cursor-pointer flex-shrink-0" title="Booking ID: ${bookingId}">
                   <!-- QR Code will be generated here -->
                </div>
            </div>
            <div class="booking-meta">
                <span>Booked: ${booking.timestamp ? new Date(booking.timestamp.toDate()).toLocaleString() : 'N/A'}</span> |
                <span>Cost: ${booking.totalAmount || 0} EGP</span> |
                <span class="text-xs text-gray-500">ID: ${bookingId}</span>
                ${isUsed ? '<span class="ml-2 text-red-600 font-semibold">[USED]</span>' : ''}
            </div>
        `;

        // Generate QR code after appending
        setTimeout(() => {
            const qrElement = itemDiv.querySelector(`#qr-code-${bookingId}`); // Find element *after* innerHTML set
            if (qrElement) {
                try {
                    new QRCode(qrElement, {
                        text: qrData,
                        width: 90, height: 90,
                        colorDark: "#000000", colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.M
                    });
                    // ***** CHANGE: Add Event Listener instead of inline onclick *****
                    qrElement.addEventListener('click', () => {
                        console.log(`QR container clicked for booking ${bookingId}`); // Log click
                        window.openQrZoomModal(qrElement); // Call the existing function
                    });
                    // ***** END CHANGE *****

                } catch (e) {
                    console.error("QR Code generation failed:", e);
                    if(qrElement) qrElement.innerText = "QR Error";
                }
            } else {
                 console.error(`Could not find QR element #qr-code-${bookingId} after timeout.`);
            }
        }, 0);
    }
    return itemDiv;
}

window.openQrZoomModal = openQrZoomModal;

function closeQrZoomModal() {
    if (qrZoomModal) {
        hideElement(qrZoomModal);
        qrZoomContent.innerHTML = ''; // Clear content
    }
}

function closeSuccessModal() {
    if (bookingSuccessModal) { // Check if element exists
        hideElement(bookingSuccessModal);
    }
}

function formatCardNumber(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove non-digit characters
    let formattedValue = '';

    // Limit to 16 digits
    value = value.substring(0, 16);

    // Add spaces every 4 digits
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }

    input.value = formattedValue;
}

function formatExpiryDate(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove non-digit chars
    let formattedValue = '';

    // Handle MM
    if (value.length > 0) {
        formattedValue += value.substring(0, 2);
    }
    // Handle YY and add slash automatically
    if (value.length >= 2) {
         // Add slash only if month is complete and year started
        if (formattedValue.length === 2 && value.length > 2) {
             formattedValue += '/';
        }
         // Add YY (limit total digits to 4: MMYY)
        formattedValue += value.substring(2, 4);
    }

     // Special handling for backspace after slash
     // If user deletes slash, also delete last digit of month if present
     if (event.inputType === 'deleteContentBackward' && input.value.length === 3 && input.value.endsWith('/')) {
         formattedValue = formattedValue.substring(0, 1);
     }

    input.value = formattedValue;
}

// --- Initialization ---
function initializeApp() {
    console.log("Initializing App...");

    // --- Standard Event Listeners ---
    customerLoginForm.addEventListener('submit', handleCustomerLogin);
    sendOtpButton.addEventListener('click', handleSendOtp);
    customerRegisterForm.addEventListener('submit', handleVerifyOtpAndRegister);
    adminLoginForm.addEventListener('submit', handleAdminLogin);
    vendorLoginForm.addEventListener('submit', handleVendorLogin);
    showVendorLoginButton.addEventListener('click', showVendorLoginForm);
    showRegisterButton.addEventListener('click', showCustomerRegisterForm);
    showAdminLoginButton.addEventListener('click', showAdminLoginForm);
    showVendorLoginButton.addEventListener('click', showVendorLoginButton);
    backToCustomerLoginButtons.forEach(btn => btn.addEventListener('click', showCustomerLoginForm));
    logoutButton.addEventListener('click', handleLogout);
    adminNavButtons.forEach(btn => btn.addEventListener('click', handleAdminTabClick));
    movieForm.addEventListener('submit', handleMovieFormSubmit);
    cancelEditButton.addEventListener('click', resetForm);
    vendorForm.addEventListener('submit', handleVendorFormSubmit);
    vendorCancelEditButton.addEventListener('click', resetVendorForm);
    modalCloseButton.addEventListener('click', closeModal);
    movieDetailsModal.addEventListener('click', (e) => { if (e.target === movieDetailsModal) closeModal(); });
    toggleMyBookingsBtn.addEventListener('click', () => { isShowingMyBookings ? showCustomerMovieListView() : showMyBookingsView(); });
    backToMoviesBtn.addEventListener('click', showCustomerMovieListView);
    startScanBtn.addEventListener('click', startQrScanner);
    validationModalCloseBtn.addEventListener('click', closeValidationModal);
    validationModalCloseBtnSecondary.addEventListener('click', closeValidationModal);
    markUsedBtn.addEventListener('click', markQrCodeAsUsed);
    confirmSelectionButton.addEventListener('click', openPaymentModal);
    paymentModalCloseBtn.addEventListener('click', closePaymentModal);
    paymentModalCloseBtnSecondary.addEventListener('click', closePaymentModal);
    payNowBtn.addEventListener('click', handlePaymentFormSubmit);
    qrZoomCloseBtn.addEventListener('click', closeQrZoomModal);
    qrZoomModal.addEventListener('click', (e) => { if (e.target === qrZoomModal) closeQrZoomModal(); });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        // Debounce resize event to avoid excessive calls
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateHeaderVisibility, 150);
    });

    // --- Get Payment Form Input Elements ---
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCvvInput = document.getElementById('card-cvv'); // CVV needed if you add validation later

    // --- *** FIX: ADD PAYMENT FORM INPUT EVENT LISTENERS HERE *** ---
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
        // Optional: Add blur validation if needed
        // cardNumberInput.addEventListener('blur', validateCardNumber);
        console.log("Card number listener attached."); // Add log
    } else {
        console.warn("Card number input not found for listener attachment.");
    }
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', formatExpiryDate);
        // Optional: Add blur validation if needed
        // cardExpiryInput.addEventListener('blur', validateExpiryDate);
        console.log("Card expiry listener attached."); // Add log
    } else {
        console.warn("Card expiry input not found for listener attachment.");
    }

    if (successModalCloseBtn) {
        successModalCloseBtn.addEventListener('click', closeSuccessModal);
    }
    if (successModalCloseBtnSecondary) {
        successModalCloseBtnSecondary.addEventListener('click', closeSuccessModal);
    }
    // Optional: Add blur validation for CVV if needed
    // if (cardCvvInput) {
    //    cardCvvInput.addEventListener('blur', validateCvv);
    // }
    // --- *** END OF FIX *** ---
    

    // --- Event Delegation for Dynamic Buttons (Admin Lists) ---
    if (adminMovieListContainer) { // Check if container exists
        adminMovieListContainer.addEventListener('click', (event) => {
            const targetButton = event.target.closest('button'); // Find the clicked button
            if (!targetButton) return; // Exit if click wasn't on or inside a button

            if (targetButton.classList.contains('delete-movie-btn')) {
                event.stopPropagation(); // Prevent card click if needed
                const movieId = targetButton.dataset.movieId;
                if (movieId) {
                    deleteMovie(movieId); // Call your delete function
                } else {
                    console.error("Missing data-movie-id on delete button");
                }
            } else if (targetButton.classList.contains('edit-movie-btn')) {
                 event.stopPropagation();
                 const movieId = targetButton.dataset.movieId;
                 if (movieId) {
                    showEditForm(movieId); // Call your edit function
                 } else {
                     console.error("Missing data-movie-id on edit button");
                 }
            }
        });
    } else {
        console.warn("Admin movie list container not found for event delegation.");
    }


    if (adminVendorListContainer) { // Check if container exists
        adminVendorListContainer.addEventListener('click', (event) => {
            const targetButton = event.target.closest('button'); // Find the clicked button
            if (!targetButton) return; // Exit if click wasn't on or inside a button

            if (targetButton.classList.contains('delete-vendor-btn')) {
                const vendorId = targetButton.dataset.vendorId;
                if (vendorId) {
                    deleteVendor(vendorId); // Call your delete function
                } else {
                     console.error("Missing data-vendor-id on delete button");
                }
            } else if (targetButton.classList.contains('edit-vendor-btn')) {
                 const vendorId = targetButton.dataset.vendorId;
                 if (vendorId) {
                    showEditVendorForm(vendorId); // Call your edit function
                 } else {
                     console.error("Missing data-vendor-id on edit button");
                 }
            }
        });
    } else {
        console.warn("Admin vendor list container not found for event delegation.");
    }

    // --- Firebase Auth State Listener ---
    onAuthStateChanged(auth, async (user) => {
        console.log("Auth State Changed Callback Fired."); // Added log
        if (user) {
            console.log("User detected:", user.email, user.uid); // Added log
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
                    if (userType === 'vendor') {
                        const vendorDetailsRef = doc(db, "vendors", user.uid); // Use UID
                        const vendorDetailsSnap = await getDoc(vendorDetailsRef);
                        if (vendorDetailsSnap.exists()) {
                            vendorName = vendorDetailsSnap.data().name;
                            console.log(`Vendor name found from /vendors: ${vendorName}`);
                        } else {
                             console.warn(`Vendor details document NOT found in /vendors/${user.uid} for vendor role user ${user.email}.`);
                             vendorName = user.email; // Fallback display name
                        }
                    }
                } else {
                    console.warn(`User document NOT found in Firestore for UID: ${user.uid}, Email: ${user.email}. Defaulting to customer.`);
                     userType = 'customer'; // Assign default role
                }
                 console.log("User role fetched:", userType); // Added log

                 // Update authState
                 authState = {
                    isLoggedIn: true,
                    user: {
                        uid: user.uid,
                        email: user.email,
                        type: userType,
                        name: vendorName // Contains name if vendor, null otherwise
                    }
                 };


            } catch (error) {
                console.error("Error fetching user role inside onAuthStateChanged:", error); // Added log
                authState = { isLoggedIn: false, user: null }; // Log out on error
                await signOut(auth); // Force sign out if role check fails critically
            }

        } else {
             console.log("No user detected (Logged out state)."); // Added log
            // User is signed out
            authState = { isLoggedIn: false, user: null };
        }

        if (authState.isLoggedIn) {
            await loadDataFromFirebase();
       } else {
            // Clear local data on logout
            movies = []; vendors = []; allBookings = []; allRatings = [];
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
        console.log("Calling renderUI from onAuthStateChanged..."); // Added log
        renderUI();

        updateHeaderVisibility();
    });

    console.log("App Initialized. Waiting for Auth State...");
}

// --- Start the App ---
window.addEventListener('DOMContentLoaded', initializeApp); // Use DOMContentLoaded instead of load
