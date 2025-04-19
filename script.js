// --- DOM Elements ---
const viewToggle = document.getElementById('view-toggle');
const adminView = document.getElementById('admin-view');
const customerView = document.getElementById('customer-view');
const movieForm = document.getElementById('movie-form');
// const editModal = document.getElementById('edit-modal'); // Keeping reference if needed later
// const editMovieForm = document.getElementById('edit-movie-form');
// const closeModalButton = document.getElementById('close-modal-button');
const adminMovieListContainer = document.getElementById('admin-movie-list');
const customerMovieListContainer = document.getElementById('customer-movie-list');
const customerPreviewContainer = document.getElementById('customer-movie-list-preview');
const formTitle = document.getElementById('form-title');
const submitButton = document.getElementById('submit-button');
const cancelEditButton = document.getElementById('cancel-edit-button');
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
let currentView = 'customer'; // 'customer' or 'admin'
let editingIndex = null; // Index of movie being edited in admin form, null if adding
let selectedSeats = []; // Array to hold IDs of selected seats in the modal

// --- Local Storage ---
const STORAGE_KEY = 'cinemaMovies';

function loadMovies() {
    const storedMovies = localStorage.getItem(STORAGE_KEY);
    if (storedMovies) {
        try {
            movies = JSON.parse(storedMovies);
            if (!Array.isArray(movies)) movies = []; // Ensure it's an array
        } catch (e) {
            console.error("Error parsing movies from local storage:", e);
            movies = []; // Reset if parsing fails
        }
    }

    // Add default movies ONLY if the array is empty after loading/parsing
    if (movies.length === 0) {
        movies = [
            {
                title: "Inception",
                poster: "https://placehold.co/400x600/3b82f6/ffffff?text=Inception",
                description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                genre: "Sci-Fi, Action, Thriller",
                duration: 148,
                showtimes: "11:00 AM, 2:00 PM, 5:00 PM, 8:00 PM"
            },
            {
                title: "The Grand Budapest Hotel",
                poster: "https://placehold.co/400x600/ef4444/ffffff?text=Grand+Budapest",
                description: "The adventures of Gustave H, a legendary concierge at a famous hotel from the fictional Republic of Zubrowka between the first and second World Wars, and Zero Moustafa, the lobby boy who becomes his most trusted friend.",
                genre: "Adventure, Comedy, Drama",
                duration: 100,
                showtimes: "10:30 AM, 1:30 PM, 4:30 PM, 7:30 PM"
            },
             {
                title: "Parasite",
                poster: "https://placehold.co/400x600/10b981/ffffff?text=Parasite",
                description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
                genre: "Comedy, Drama, Thriller",
                duration: 132,
                showtimes: "12:00 PM, 3:00 PM, 6:00 PM, 9:00 PM"
            }
        ];
        saveMovies(); // Save defaults to local storage only if we added them
    }
}

function saveMovies() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
    } catch (e) {
        console.error("Error saving movies to local storage:", e);
    }
}

// --- Rendering Functions ---

// Generic function to create a movie card
function createMovieCard(movie, index, viewType) {
    const card = document.createElement('div');
    card.className = 'movie-card flex flex-col';
    card.dataset.index = index;

    const img = document.createElement('img');
    img.src = movie.poster || 'https://placehold.co/400x600/cccccc/ffffff?text=No+Image';
    img.alt = `${movie.title} Poster`;
    img.className = 'movie-poster';
    img.onerror = function() {
        this.onerror=null;
        this.src='https://placehold.co/400x600/cccccc/ffffff?text=Image+Error';
    };

    const content = document.createElement('div');
    content.className = 'p-4 flex flex-col flex-grow'; // flex-grow allows content to expand

    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold mb-2 text-gray-800';
    title.textContent = movie.title;

    const details = document.createElement('p');
    details.className = 'text-sm text-gray-600 mb-1';
    details.innerHTML = `<i class="fas fa-tag mr-1 opacity-75"></i> ${movie.genre || 'N/A'} &bull; <i class="fas fa-clock mr-1 opacity-75"></i> ${movie.duration || 'N/A'} min`;

    const description = document.createElement('p');
    description.className = 'text-sm text-gray-700 mb-3 flex-grow'; // flex-grow pushes showtimes down
    description.textContent = movie.description || 'No description available.';

    const showtimes = document.createElement('p');
    showtimes.className = 'text-sm text-blue-600 font-medium mt-auto'; // mt-auto pushes to bottom
    showtimes.innerHTML = `<i class="fas fa-calendar-alt mr-1 opacity-75"></i> Showtimes: ${movie.showtimes || 'N/A'}`;

    content.appendChild(title);
    content.appendChild(details);
    content.appendChild(description);
    content.appendChild(showtimes);

    card.appendChild(img);
    card.appendChild(content);

    // Add Admin-specific controls
    if (viewType === 'admin') {
        const adminControls = document.createElement('div');
        adminControls.className = 'p-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2';

        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editButton.className = 'btn btn-secondary btn-icon text-xs';
        editButton.onclick = (e) => {
            e.stopPropagation(); // Prevent modal from opening when clicking edit
            showEditForm(index);
        };

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteButton.className = 'btn btn-danger btn-icon text-xs';
        deleteButton.onclick = (e) => {
             e.stopPropagation(); // Prevent modal from opening when clicking delete
             deleteMovie(index);
        };

        adminControls.appendChild(editButton);
        adminControls.appendChild(deleteButton);
        card.appendChild(adminControls);
    } else {
        // Add click listener for Customer and Preview views to open the modal
        card.classList.add('cursor-pointer');
        card.onclick = () => openModal(index);
    }

    return card;
}

// Render movies for a specific view container
function renderMovies(container, viewType) {
    container.innerHTML = ''; // Clear previous content

    // Determine which 'no movies' message to use
    let noMoviesMsg;
    if (viewType === 'admin') noMoviesMsg = noMoviesAdminMsg;
    else if (viewType === 'preview') noMoviesMsg = noMoviesPreviewMsg;
    else noMoviesMsg = noMoviesCustomerMsg;

    if (movies.length === 0) {
        if(noMoviesMsg) noMoviesMsg.classList.remove('hidden');
        return; // Exit if no movies
    } else {
         if(noMoviesMsg) noMoviesMsg.classList.add('hidden');
    }

    movies.forEach((movie, index) => {
        const card = createMovieCard(movie, index, viewType);
        container.appendChild(card);
    });
}

// Render all views
function renderAllViews() {
    renderMovies(adminMovieListContainer, 'admin');
    renderMovies(customerMovieListContainer, 'customer');
    renderMovies(customerPreviewContainer, 'preview');
}

// --- View Toggling ---
function toggleView() {
    if (viewToggle.checked) { // Admin view
        currentView = 'admin';
        adminView.classList.remove('hidden');
        customerView.classList.add('hidden');
        adminView.style.opacity = '1';
        customerView.style.opacity = '0';
    } else { // Customer view
        currentView = 'customer';
        adminView.classList.add('hidden');
        customerView.classList.remove('hidden');
         adminView.style.opacity = '0';
        customerView.style.opacity = '1';
        resetForm(); // Reset admin form if switching away while editing
    }
     closeModal(); // Close modal when switching views
}

// --- Admin Form Handling ---
function resetForm() {
    movieForm.reset();
    editingIndex = null;
    formTitle.textContent = 'Add New Movie';
    submitButton.textContent = 'Add Movie';
    cancelEditButton.classList.add('hidden');
    document.getElementById('edit-index').value = '';
}

function handleFormSubmit(event) {
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

    // Basic validation
    if (!movieData.title || !movieData.poster || !movieData.genre || !movieData.showtimes) {
         // Using a simple browser alert for now, replace with a proper UI message if needed
         alert("Please fill in all required fields (Title, Poster URL, Genre, Showtimes).");
         return;
    }
     if (isNaN(movieData.duration) || movieData.duration <= 0) {
         alert("Please enter a valid positive number for duration.");
         return;
    }

    if (indexInput !== '') { // Editing existing movie
        const index = parseInt(indexInput, 10);
        if (index >= 0 && index < movies.length) {
            movies[index] = movieData;
        } else {
            console.error("Invalid index during edit:", index);
            alert("Error updating movie. Invalid index.");
            return;
        }
    } else { // Adding new movie
        movies.push(movieData);
    }

    saveMovies();
    renderAllViews();
    resetForm();
}

// Show the main admin form pre-filled for editing
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

// --- Delete Movie (Admin) ---
function deleteMovie(index) {
    if (index < 0 || index >= movies.length) return;

    const movieTitle = movies[index]?.title || 'this movie'; // Get title for confirmation
    if (confirm(`Are you sure you want to delete "${movieTitle}"?`)) {
        movies.splice(index, 1);
        saveMovies();
        renderAllViews();
        // If the deleted movie was being edited in the form, reset the form
        if (editingIndex === index) {
            resetForm();
        }
    }
}

// --- Movie Details Modal Logic ---

function openModal(index) {
    if (index < 0 || index >= movies.length) return;
    const movie = movies[index];

    // Populate basic details
    modalMovieTitle.textContent = movie.title || 'Movie Details';
    modalMoviePoster.src = movie.poster || 'https://placehold.co/400x600/cccccc/ffffff?text=No+Image';
    modalMoviePoster.alt = `${movie.title || 'Movie'} Poster`;
    modalMovieGenre.textContent = movie.genre || 'N/A';
    modalMovieDuration.textContent = movie.duration || 'N/A';
    modalMovieDescription.textContent = movie.description || 'No description available.';

    // Populate showtimes
    modalShowtimesList.innerHTML = ''; // Clear previous
    const showtimes = movie.showtimes ? movie.showtimes.split(',').map(st => st.trim()).filter(st => st) : [];

    if (showtimes.length > 0) {
        showtimes.forEach((time, i) => {
            const radioId = `showtime-${index}-${i}`;
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = radioId;
            radio.name = `movie-${index}-showtime`;
            radio.value = time;
            radio.className = 'showtime-radio'; // Hidden class
            radio.onchange = () => handleShowtimeSelection(time); // Add listener

            const label = document.createElement('label');
            label.htmlFor = radioId;
            label.textContent = time;
            label.className = 'showtime-label';

            modalShowtimesList.appendChild(radio);
            modalShowtimesList.appendChild(label);
        });
    } else {
        modalShowtimesList.innerHTML = '<p class="text-gray-500 text-sm">No showtimes available for this movie.</p>';
    }

    // Reset seat selection state
    seatMapContainer.classList.add('hidden');
    seatGrid.innerHTML = '';
    selectedSeats = [];
    updateSelectedSeatsInfo();
    confirmSelectionButton.disabled = true; // Disable confirm button initially

    // Show the modal
    movieDetailsModal.classList.remove('hidden');
    // Add class to body to prevent background scrolling
    document.body.classList.add('overflow-hidden');
}

function closeModal() {
    movieDetailsModal.classList.add('hidden');
    // Remove class from body to allow background scrolling
    document.body.classList.remove('overflow-hidden');
}

function handleShowtimeSelection(selectedTime) {
    console.log("Showtime selected:", selectedTime);
    renderSeatMap(5, 8); // Render a 5x8 grid
    seatMapContainer.classList.remove('hidden');
    // Reset seats when showtime changes
    selectedSeats = [];
    updateSelectedSeatsInfo();
    confirmSelectionButton.disabled = true; // Disable until seats are selected
}

function renderSeatMap(rows, cols) {
    seatGrid.innerHTML = ''; // Clear previous grid
    for (let r = 0; r < rows; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';
        const rowLetter = String.fromCharCode(65 + r); // A, B, C...

        for (let c = 0; c < cols; c++) {
            // Add a spacer for an aisle (e.g., after 2nd and 6th seat)
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
            seatDiv.innerHTML = `<i class="fas fa-chair"></i>`; // Use Font Awesome icon

            // Example: Make some seats unavailable (can be randomized or based on data later)
            // if (Math.random() > 0.8) {
            //     seatDiv.classList.add('unavailable');
            // } else {
                seatDiv.onclick = () => toggleSeatSelection(seatId);
            // }

            rowDiv.appendChild(seatDiv);
        }
        seatGrid.appendChild(rowDiv);
    }
}

function toggleSeatSelection(seatId) {
    const seatElement = document.getElementById(`seat-${seatId}`);
    if (!seatElement || seatElement.classList.contains('unavailable')) {
        return; // Ignore clicks on unavailable seats
    }

    const index = selectedSeats.indexOf(seatId);
    if (index > -1) {
        // Seat is currently selected, deselect it
        selectedSeats.splice(index, 1);
        seatElement.classList.remove('selected');
    } else {
        // Seat is available, select it
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
        confirmSelectionButton.disabled = false; // Enable confirm button
    }
}


// --- Event Listeners ---
viewToggle.addEventListener('change', toggleView);
movieForm.addEventListener('submit', handleFormSubmit);
cancelEditButton.addEventListener('click', resetForm);

// Modal Event Listeners
modalCloseButton.addEventListener('click', closeModal);
movieDetailsModal.addEventListener('click', (e) => {
    // Close modal if clicking on the background overlay
    if (e.target === movieDetailsModal) {
        closeModal();
    }
});
confirmSelectionButton.addEventListener('click', () => {
     // For now, just show an alert and close the modal
     if (selectedSeats.length > 0) {
         alert(`Seats ${selectedSeats.sort().join(', ')} selected! (Booking simulation complete)`);
         closeModal();
     } else {
         alert("Please select at least one seat.");
     }
});


// --- Initial Load ---
window.addEventListener('load', () => {
    loadMovies();
    renderAllViews();
    // Set initial view based on toggle (useful if page reloads)
    toggleView();
});