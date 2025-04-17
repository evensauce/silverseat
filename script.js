// --- DOM Elements ---
const viewToggle = document.getElementById('view-toggle');
const adminView = document.getElementById('admin-view');
const customerView = document.getElementById('customer-view');
const movieForm = document.getElementById('movie-form');
const editModal = document.getElementById('edit-modal');
const editMovieForm = document.getElementById('edit-movie-form');
const closeModalButton = document.getElementById('close-modal-button');
const adminMovieListContainer = document.getElementById('admin-movie-list');
const customerMovieListContainer = document.getElementById('customer-movie-list');
const customerPreviewContainer = document.getElementById('customer-movie-list-preview');
const formTitle = document.getElementById('form-title');
const submitButton = document.getElementById('submit-button');
const cancelEditButton = document.getElementById('cancel-edit-button');
const noMoviesAdminMsg = document.getElementById('no-movies-admin');
const noMoviesCustomerMsg = document.getElementById('no-movies-customer');
const noMoviesPreviewMsg = document.getElementById('no-movies-preview');

// --- State ---
let movies = []; // Array to hold movie objects
let currentView = 'customer'; // 'customer' or 'admin'
let editingIndex = null; // Index of movie being edited, null if adding

// --- Local Storage ---
const STORAGE_KEY = 'cinemaMovies';

function loadMovies() {
    const storedMovies = localStorage.getItem(STORAGE_KEY);
    if (storedMovies) {
        movies = JSON.parse(storedMovies);
    } else {
        // Add some default movies if none exist
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
        saveMovies(); // Save defaults to local storage
    }
}

function saveMovies() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

// --- Rendering Functions ---

// Generic function to create a movie card (can be adapted for admin/customer)
function createMovieCard(movie, index, viewType) {
    const card = document.createElement('div');
    card.className = 'movie-card flex flex-col'; // Added flex flex-col for structure
    card.dataset.index = index; // Store index for potential actions

    // Image with fallback
    const img = document.createElement('img');
    img.src = movie.poster || 'https://placehold.co/400x600/cccccc/ffffff?text=No+Image';
    img.alt = `${movie.title} Poster`;
    img.className = 'movie-poster';
    img.onerror = function() { // Fallback if the image fails to load
        this.onerror=null; // Prevent infinite loop if fallback also fails
        this.src='https://placehold.co/400x600/cccccc/ffffff?text=Image+Error';
    };

    // Content container
    const content = document.createElement('div');
    content.className = 'p-4 flex flex-col flex-grow'; // Added flex-grow

    // Title
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold mb-2 text-gray-800';
    title.textContent = movie.title;

    // Genre and Duration
    const details = document.createElement('p');
    details.className = 'text-sm text-gray-600 mb-1';
    details.innerHTML = `<i class="fas fa-tag mr-1 opacity-75"></i> ${movie.genre} &bull; <i class="fas fa-clock mr-1 opacity-75"></i> ${movie.duration} min`;

    // Description
    const description = document.createElement('p');
    description.className = 'text-sm text-gray-700 mb-3 flex-grow'; // Added flex-grow to push showtimes down
    description.textContent = movie.description;

    // Showtimes
    const showtimes = document.createElement('p');
    showtimes.className = 'text-sm text-blue-600 font-medium mt-auto'; // mt-auto pushes to bottom
    showtimes.innerHTML = `<i class="fas fa-calendar-alt mr-1 opacity-75"></i> Showtimes: ${movie.showtimes}`;

    // Append elements to content
    content.appendChild(title);
    content.appendChild(details);
    content.appendChild(description);
    content.appendChild(showtimes);

    // Append image and content to card
    card.appendChild(img);
    card.appendChild(content);

    // Add Admin-specific controls
    if (viewType === 'admin') {
        const adminControls = document.createElement('div');
        adminControls.className = 'p-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2'; // Use justify-end

        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editButton.className = 'btn btn-secondary btn-icon text-xs';
        editButton.onclick = () => showEditForm(index);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteButton.className = 'btn btn-danger btn-icon text-xs';
        deleteButton.onclick = () => deleteMovie(index);

        adminControls.appendChild(editButton);
        adminControls.appendChild(deleteButton);
        card.appendChild(adminControls); // Append controls below content
    }

    return card;
}

// Render movies for a specific view
function renderMovies(container, viewType) {
    container.innerHTML = ''; // Clear previous content

    const noMoviesMsg = viewType === 'admin' ? noMoviesAdminMsg : (viewType === 'preview' ? noMoviesPreviewMsg : noMoviesCustomerMsg);

    if (movies.length === 0) {
        noMoviesMsg.classList.remove('hidden');
        return; // Exit if no movies
    } else {
         noMoviesMsg.classList.add('hidden');
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
    renderMovies(customerPreviewContainer, 'preview'); // Render preview
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
        // Reset admin form if switching away while editing
        resetForm();
    }
}

// --- Form Handling ---
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

    if (isNaN(movieData.duration) || movieData.duration <= 0) {
         alert("Please enter a valid duration.");
         return;
    }

    if (indexInput !== '') { // Editing existing movie
        const index = parseInt(indexInput, 10);
        if (index >= 0 && index < movies.length) {
            movies[index] = movieData;
        }
    } else { // Adding new movie
        movies.push(movieData);
    }

    saveMovies();
    renderAllViews();
    resetForm(); // Reset form after adding/editing
}

// Show the main form pre-filled for editing
function showEditForm(index) {
     if (index < 0 || index >= movies.length) return;

     editingIndex = index;
     const movie = movies[index];

     document.getElementById('edit-index').value = index;
     document.getElementById('title').value = movie.title;
     document.getElementById('poster').value = movie.poster;
     document.getElementById('description').value = movie.description;
     document.getElementById('genre').value = movie.genre;
     document.getElementById('duration').value = movie.duration;
     document.getElementById('showtimes').value = movie.showtimes;

     formTitle.textContent = 'Edit Movie';
     submitButton.textContent = 'Save Changes';
     cancelEditButton.classList.remove('hidden');

     // Scroll to the form for better UX
     movieForm.scrollIntoView({ behavior: 'smooth' });
}

// --- Modal Handling (Alternative Edit Method - kept for potential future use or different UI) ---
function showEditModal(index) {
    if (index < 0 || index >= movies.length) return;

    editingIndex = index;
    const movie = movies[index];

    document.getElementById('modal-edit-index').value = index;
    document.getElementById('modal-title').value = movie.title;
    document.getElementById('modal-poster').value = movie.poster;
    document.getElementById('modal-description').value = movie.description;
    document.getElementById('modal-genre').value = movie.genre;
    document.getElementById('modal-duration').value = movie.duration;
    document.getElementById('modal-showtimes').value = movie.showtimes;

    editModal.classList.remove('hidden');
}

function closeEditModal() {
    editModal.classList.add('hidden');
    editMovieForm.reset();
    editingIndex = null;
}

function handleModalFormSubmit(event) {
     event.preventDefault();
     const index = parseInt(document.getElementById('modal-edit-index').value, 10);

     if (index >= 0 && index < movies.length) {
         movies[index] = {
            title: document.getElementById('modal-title').value.trim(),
            poster: document.getElementById('modal-poster').value.trim(),
            description: document.getElementById('modal-description').value.trim(),
            genre: document.getElementById('modal-genre').value.trim(),
            duration: parseInt(document.getElementById('modal-duration').value, 10),
            showtimes: document.getElementById('modal-showtimes').value.trim()
         };
         saveMovies();
         renderAllViews();
         closeEditModal();
     } else {
         console.error("Invalid index for editing:", index);
         alert("Error saving changes. Invalid movie index.");
     }
}


// --- Delete Movie ---
function deleteMovie(index) {
    if (index < 0 || index >= movies.length) return;

    // Confirmation dialog
    if (confirm(`Are you sure you want to delete the movie "${movies[index].title}"?`)) {
        movies.splice(index, 1); // Remove movie from array
        saveMovies();
        renderAllViews();
         // If the deleted movie was being edited in the form, reset the form
        if (editingIndex === index) {
            resetForm();
        }
    }
}

// --- Event Listeners ---
viewToggle.addEventListener('change', toggleView);
movieForm.addEventListener('submit', handleFormSubmit);
cancelEditButton.addEventListener('click', resetForm);

// Modal listeners (if using modal edit)
// editMovieForm.addEventListener('submit', handleModalFormSubmit);
// closeModalButton.addEventListener('click', closeEditModal);
// editModal.addEventListener('click', (e) => { // Close modal if clicking outside content
//     if (e.target === editModal) {
//         closeEditModal();
//     }
// });


// --- Initial Load ---
window.addEventListener('load', () => {
    loadMovies();
    renderAllViews();
    // Set initial view based on toggle (useful if page reloads)
    toggleView();
});