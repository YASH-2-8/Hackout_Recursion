const WEATHER_API_KEY = 'bd5e378503939ddaee76f12ad7a97608';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx7Q9IZ2aXfrdhH6V79UeVdZ8TOP4dJJTWPfIchnAvfw4xStiFGtaoBJbkYnIS1RbJ2cQ/exec';

let coastalMap, cycloneChart, floodChart, currentUser = null;
let foundUsers = [];
let initialLoginDetails = {};
let locationWatchId = null;
let isLocationTracking = false;
let chatbotInitialized = false; // Chatbot state variable


const allCoastalPoints = [
    { name: 'Kandla', lat: 23.03, lng: 70.22 }, { name: 'Porbandar', lat: 21.64, lng: 69.63 }, { name: 'Veraval', lat: 20.92, lng: 70.37 },
    { name: 'Diu', lat: 20.71, lng: 70.98 }, { name: 'Surat', lat: 21.17, lng: 72.83 }, { name: 'Okha', lat: 22.47, lng: 69.07 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 }, { name: 'Ratnagiri', lat: 16.99, lng: 73.31 }, { name: 'Alibag', lat: 18.64, lng: 72.87 },
    { name: 'Dahanu', lat: 19.97, lng: 72.73 },
    { name: 'Panaji', lat: 15.49, lng: 73.83 }, { name: 'Vasco da Gama', lat: 15.39, lng: 73.84 },
    { name: 'Mangalore', lat: 12.91, lng: 74.85 }, { name: 'Karwar', lat: 14.80, lng: 74.13 }, { name: 'Udupi', lat: 13.34, lng: 74.74 },
    { name: 'Kochi', lat: 9.9312, lng: 76.2673 }, { name: 'Kozhikode', lat: 11.25, lng: 75.78 }, { name: 'Thiruvananthapuram', lat: 8.52, lng: 76.93 },
    { name: 'Kannur', lat: 11.87, lng: 75.37 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 }, { name: 'Thoothukudi', lat: 8.80, lng: 78.14 }, { name: 'Rameswaram', lat: 9.28, lng: 79.31 },
    { name: 'Kanyakumari', lat: 8.08, lng: 77.53 }, { name: 'Nagapattinam', lat: 10.76, lng: 79.84 }, { name: 'Cuddalore', lat: 11.75, lng: 79.75 },
    { name: 'Puducherry', lat: 11.91, lng: 79.81 },
    { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 }, { name: 'Kakinada', lat: 16.98, lng: 82.24 }, { name: 'Machilipatnam', lat: 16.17, lng: 81.13 },
    { name: 'Nellore', lat: 14.44, lng: 79.98 },
    { name: 'Puri', lat: 19.81, lng: 85.83 }, { name: 'Paradeep', lat: 20.26, lng: 86.67 }, { name: 'Gopalpur', lat: 19.26, lng: 84.89 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 }, { name: 'Haldia', lat: 22.02, lng: 88.05 }, { name: 'Digha', lat: 21.62, lng: 87.52 },
    { name: 'Port Blair', lat: 11.62, lng: 92.72 }
];

const locationsToMonitor = [
    { name: 'Kandla', lat: 23.03, lng: 70.22 }, { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Panaji', lat: 15.49, lng: 73.83 }, { name: 'Mangalore', lat: 12.91, lng: 74.85 },
    { name: 'Kochi', lat: 9.9312, lng: 76.2673 }, { name: 'Kanyakumari', lat: 8.08, lng: 77.53 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 }, { name: 'Thoothukudi', lat: 8.80, lng: 78.14 },
    { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 }, { name: 'Kakinada', lat: 16.98, lng: 82.24 },
    { name: 'Puri', lat: 19.81, lng: 85.83 }, { name: 'Paradeep', lat: 20.26, lng: 86.67 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 }, { name: 'Haldia', lat: 22.02, lng: 88.05 },
    { name: 'Digha', lat: 21.62, lng: 87.52 }, { name: 'Port Blair', lat: 11.62, lng: 92.72 }
];

const historicalThreats = [
    { year: 2024, name: "Cyclone Remal", type: 'cyclone', lat: 21.9, lng: 89.2, description: "Made landfall in West Bengal, causing significant rainfall and flooding." },
    { year: 2023, name: "Cyclone Biparjoy", type: 'cyclone', lat: 22.8, lng: 68.2, description: "A powerful cyclone that struck the Kutch region of Gujarat." },
    { year: 2023, name: "Chennai Floods", type: 'flood', lat: 13.0827, lng: 80.2707, description: "Caused by heavy rainfall from Cyclone Michaung, leading to widespread flooding." },
    { year: 2021, name: "Cyclone Tauktae", type: 'cyclone', lat: 20.9, lng: 71.5, description: "Extremely severe cyclonic storm that hit Gujarat." },
    { year: 2021, name: "Cyclone Yaas", type: 'cyclone', lat: 21.5, lng: 87.0, description: "Impacted Odisha and West Bengal with strong winds and storm surge." },
    { year: 2020, name: "Cyclone Amphan", type: 'cyclone', lat: 21.7, lng: 88.3, description: "A super cyclonic storm that caused widespread damage in West Bengal and Odisha." }
];

function generateWeatherAlert(weatherData) {
    if (!weatherData || !weatherData.main) return { message: 'Data unavailable.', type: 'nodata' };
    const temp = weatherData.main.temp;
    const windSpeedKmh = (weatherData.wind.speed * 3.6).toFixed(1);
    const description = weatherData.weather[0].main;
    if (description === "Thunderstorm" && windSpeedKmh > 40) return { message: `⛈️ Storm Alert: Thunderstorms with winds at ${windSpeedKmh} km/h.`, type: 'cyclone' };
    if (temp > 38) return { message: `🔥 Heatwave Warning: Temperature at ${temp}°C.`, type: 'cyclone' };
    if (description === "Rain" && windSpeedKmh > 35) return { message: `💧 Flood Risk: Heavy rain with strong winds.`, type: 'flood' };
    const capitalizedDesc = description.charAt(0).toUpperCase() + description.slice(1);
    return { message: `✅ Normal: ${capitalizedDesc}, ${temp}°C, ${windSpeedKmh} km/h winds.`, type: 'normal' };
}



$(document).ready(function() {
    
    initMap();
    initCharts();
    setupEventListeners();
    initLocationTracking();
    checkLoginStatus();

    setInterval(updateAllThreats, 300000);
    setInterval(updateDashboardMetrics, 15000);
    setInterval(updateChartsRandomly, 15000);
    setInterval(generateRandomAlert, 10000);
});



function initMap() {
    coastalMap = L.map('coastalMap').setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(coastalMap);

    updateAllThreats();
    plotStaticCoastalPoints();
    plotHistoricalData();
}

async function updateAllThreats() {
    const threatIcons = {
        cyclone: L.divIcon({ html: '<i class="fas fa-wind fa-2x" style="color: #dc3545;"></i>', className: 'threat-icon' }),
        flood: L.divIcon({ html: '<i class="fas fa-water fa-2x" style="color: #ffc107;"></i>', className: 'threat-icon' }),
        normal: L.divIcon({ html: '<i class="fas fa-check-circle fa-2x" style="color: #198754;"></i>', className: 'threat-icon' }),
        nodata: L.divIcon({ html: '<i class="fas fa-question-circle fa-2x" style="color: #6c757d;"></i>', className: 'threat-icon' })
    };
    const alertList = $('.alert-list');
    alertList.find('.fixed-location-alert').remove();

    for (const location of locationsToMonitor) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${WEATHER_API_KEY}&units=metric`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Network error');
            const weatherData = await response.json();
            const alert = generateWeatherAlert(weatherData);
            const icon = threatIcons[alert.type] || threatIcons['nodata'];
            L.marker([location.lat, location.lng], { icon: icon }).addTo(coastalMap).bindPopup(`<strong>${location.name}</strong><br>${alert.message.replace(/<[^>]*>/g, '')}`);
            if (alert.type !== 'normal' && alert.type !== 'nodata') {
                const alertHtml = `<div class="alert alert-warning fixed-location-alert"><h6><i class="fas fa-exclamation-triangle me-2"></i>${location.name} Alert</h6><p class="small mb-0">${alert.message.replace(/<[^>]*>/g, "")}</p></div>`;
                alertList.append(alertHtml);
            }
        } catch (error) { console.error(`Failed to fetch weather for ${location.name}:`, error); }
    }

    alertList.find('.no-threats-message').remove();
    if (alertList.children().not('#live-location-alert').length === 0 && $('#live-location-alert').length === 0) {
        alertList.html('<div class="alert alert-success no-threats-message"><p class="small mb-0">✅ No active threats detected across India.</p></div>');
    }
}

function plotStaticCoastalPoints() {
    const normalIcon = L.divIcon({ html: '<i class="fas fa-check-circle fa-lg" style="color: #198754;"></i>', className: 'threat-icon' });
    const monitoredNames = locationsToMonitor.map(loc => loc.name);
    allCoastalPoints.forEach(point => {
        if (!monitoredNames.includes(point.name)) {
            L.marker([point.lat, point.lng], { icon: normalIcon }).addTo(coastalMap).bindPopup(`<strong>${point.name}</strong><br>Status: Normal`);
        }
    });
}

function plotHistoricalData() {
    const historicalIcon = L.divIcon({
        html: '<i class="fas fa-history fa-2x" style="color: #adb5bd;"></i>',
        className: 'historical-threat-icon'
    });

    historicalThreats.forEach(event => {
        L.marker([event.lat, event.lng], { icon: historicalIcon })
            .addTo(coastalMap)
            .bindPopup(`<strong>${event.name} (${event.year})</strong><br>${event.description}`);
    });
}

function generateRandomAlert() {
    const alertList = $('.alert-list');
    const randomLocation = allCoastalPoints[Math.floor(Math.random() * allCoastalPoints.length)];
    const alertTypes = [
        { title: 'Cyclone Watch', icon: 'fa-wind', class: 'alert-danger' },
        { title: 'Flood Alert', icon: 'fa-water', class: 'alert-warning' },
        { title: 'High Tide Warning', icon: 'fa-water', class: 'alert-warning' },
        { title: 'Thunderstorm Advisory', icon: 'fa-bolt', class: 'alert-danger' }
    ];
    const messages = ["developing rapidly", "approaching the coast", "heavy activity detected", "expected to intensify"];
    const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    alertList.find('.no-threats-message').remove();
    const alertHtml = `
        <div class="alert ${randomType.class} alert-dismissible fade show" role="alert">
            <h6><i class="fas ${randomType.icon} me-2"></i>${randomType.title}</h6>
            <p class="small mb-0">Area: <strong>${randomLocation.name}</strong>. Status: ${randomMessage}.</p>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    alertList.prepend(alertHtml);
    if (alertList.children().length > 5) {
        alertList.children().last().remove();
    }
}

// --- Initialization & Event Listeners ---
function setupEventListeners() {
    $('#showHaveAccountBtn').on('click', () => showLoginStep('loginStep1'));
    $('#showCreateAccountBtn').on('click', showNewAccountForm);
    $('#initialLoginForm').on('submit', handleInitialLogin);
    $('#accountList').on('click', '.login-as-user-btn', function() {
        const userIndex = $(this).data('user-index');
        currentUser = foundUsers[userIndex];
        finalizeLogin();
    });
    $('#forceCreateNewAccountBtn').on('click', showNewAccountForm);
    $('#newUserForm').on('submit', handleNewUserFormSubmit);
    $('.login-back-btn').on('click', () => showLoginStep('loginChoiceStep'));
    $('#profilePicUpload').on('change', handleProfilePicPreview);
    $('#profileForm').on('submit', handleProfileFormSubmit);
    $(document).on('click', '#logoutButtonDropdown', handleLogout);
    $('#loginModal').on('show.bs.modal', function() {
        showLoginStep('loginChoiceStep');
        $('#loginModal .alert').remove();
    });

    // VALIDATION: Ensure phone number inputs only accept numbers
    $('#newPhone, #profilePhone').on('input', function() {
        this.value = this.value.replace(/\D/g, '');
    });

    // Chatbot event listeners
    $('#chatbot-toggle-btn, #close-chatbot').on('click', toggleChatbot);
    $('#chatbot-form').on('submit', handleUserMessage);
}

// --- Multi-Step Login and Registration Flow ---
async function handleInitialLogin(event) {
    event.preventDefault();
    const identifier = $('#loginEmailPhone').val().trim();
    const password = $('#loginPassword').val().trim();

    if (!identifier || !password) {
        showError('Please enter your email/phone and password.', '#loginStep1');
        return;
    }

    initialLoginDetails = { identifier, password };

    const submitButton = $(this).find('button[type="submit"]');
    submitButton.prop('disabled', true).text('Searching...');

    try {
        const checkUserUrl = `${SCRIPT_URL}?identifier=${encodeURIComponent(identifier)}&password=${encodeURIComponent(password)}`;
        const response = await fetch(checkUserUrl);
        const data = await response.json();

        if (data.result === 'success' && data.users.length > 0) {
            displayAccountSelection(data.users);
        } else {
            showError('No account found with these details.', '#loginStep1');
        }
    } catch (error) {
        showError('Could not connect to the server.', '#loginStep1');
    } finally {
        submitButton.prop('disabled', false).text('Continue');
    }
}

function displayAccountSelection(users) {
    foundUsers = users;
    const accountList = $('#accountList');
    accountList.empty();

    users.forEach((user, index) => {
        const userHtml = `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <img src="${user.profilePic || 'https://i.stack.imgur.com/34AD2.jpg'}" class="rounded-circle me-3" width="40" height="40" style="object-fit: cover;">
                    <span>${user.name} (${user.email || user.phone})</span>
                </div>
                <button class="btn btn-sm btn-primary login-as-user-btn" data-user-index="${index}">Login</button>
            </div>`;
        accountList.append(userHtml);
    });

    showLoginStep('loginStep2');
}

function showNewAccountForm() {
    const identifier = initialLoginDetails.identifier || '';
    if (isValidEmail(identifier)) {
        $('#newEmail').val(identifier);
        $('#newPhone').val('');
    } else {
        $('#newPhone').val(identifier);
        $('#newEmail').val('');
    }
    $('#newPassword').val(initialLoginDetails.password || '');
    $('#newFullName').val('');
    showLoginStep('loginStep3');
}

async function handleNewUserFormSubmit(event) {
    event.preventDefault();
    const fullName = $('#newFullName').val().trim();
    const email = $('#newEmail').val().trim();
    const phone = $('#newPhone').val().trim();
    const password = $('#newPassword').val().trim();

    if (!fullName || !password) {
        showError('Please enter your full name and password.', '#loginStep3');
        return;
    }
    if (!email && !phone) {
        showError('Please provide an email or a phone number.', '#loginStep3');
        return;
    }

    const submitButton = $(this).find('button[type="submit"]');
    submitButton.prop('disabled', true).text('Creating Account...');

    try {
        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('password', password);
        formData.append('profilePic', 'https://i.stack.imgur.com/34AD2.jpg');

        await fetch(SCRIPT_URL, { method: 'POST', body: formData });
        currentUser = { name: fullName, email, phone, profilePic: 'https://i.stack.imgur.com/34AD2.jpg' };
        finalizeLogin('Account created! Welcome.');
    } catch (error) {
        showError('Could not create account.', '#loginStep3');
    } finally {
        submitButton.prop('disabled', false).text('Create Account');
    }
}

function finalizeLogin(message = 'You have successfully logged in!') {
    saveUserToLocalStorage();
    updateUIAfterLogin();
    $('#loginModal').modal('hide');
    $('#profileModal').modal('hide');
    
    setTimeout(() => {
        showLoginStep('loginChoiceStep');
        $('#initialLoginForm')[0].reset();
        $('#newUserForm')[0].reset();
        initialLoginDetails = {};
    }, 500);
    $('#loginSuccessToast .toast-body').text(message);
    const toast = new bootstrap.Toast(document.getElementById('loginSuccessToast'));
    toast.show();
}

function showLoginStep(stepId) {
    $('.login-step').hide();
    $(`#${stepId}`).show();
}

// --- User Profile and Session Management ---
async function handleProfileFormSubmit(event) {
    event.preventDefault();
    const newName = $('#profileFullName').val().trim();
    const newEmail = $('#profileEmail').val().trim();
    const newPhone = $('#profilePhone').val().trim();
    const newProfilePicSrc = $('#profilePicPreview').attr('src');

    if (!newEmail && !newPhone) {
        alert('Please provide an email or a phone number.');
        return;
    }

    const formData = new FormData();

    formData.append('originalIdentifier', currentUser.email || currentUser.phone);
    formData.append('fullName', newName);
    formData.append('email', newEmail);
    formData.append('phone', newPhone);

    if (newProfilePicSrc.startsWith('data:image')) {
        formData.append('profilePic', newProfilePicSrc);
    } else {
        formData.append('profilePicUrl', newProfilePicSrc);
    }

    const saveButton = $(this).find('button[type="submit"]');
    saveButton.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Saving...');

    try {
        await fetch(SCRIPT_URL, { method: 'POST', body: formData });

        const identifier = newEmail || newPhone;
        const checkUserUrl = `${SCRIPT_URL}?identifier=${encodeURIComponent(identifier)}&password=FETCH_DATA_ONLY`;
        const getResponse = await fetch(checkUserUrl);
        const getData = await getResponse.json();
        const updatedUser = getData.users.find(u => (u.email === newEmail && u.email) || (u.phone === newPhone && u.phone));
        currentUser = updatedUser || { name: newName, email: newEmail, phone: newPhone, profilePic: newProfilePicSrc };
        finalizeLogin('Profile updated successfully!');
    } catch (error) {
        alert('Failed to update profile.');
        console.error("Profile Update Error:", error);
    } finally {
        saveButton.prop('disabled', false).html('<i class="fas fa-save me-1"></i> Save Changes');
    }
}

async function handleProfilePicPreview(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const resizedDataUrl = await resizeImage(file, 800, 800);
        $('#profilePicPreview').attr('src', resizedDataUrl);
    } catch (error) {
        console.error("Image resizing failed:", error);
        alert("Failed to process image. Please try another one.");
    }
}

function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                resolve(dataUrl);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

function checkLoginStatus() {
    const userData = localStorage.getItem('coastalUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateUIAfterLogin();
    }
}

function saveUserToLocalStorage() {
    if (currentUser) {
        localStorage.setItem('coastalUser', JSON.stringify(currentUser));
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('coastalUser');

    const loginButtonHtml = `
        <button class="btn btn-outline-light ms-2" data-bs-toggle="modal" data-bs-target="#loginModal">
            <i class="fas fa-sign-in-alt me-1"></i> Login
        </button>`;

    $('#user-nav-item').removeClass('dropdown').html(loginButtonHtml);
}

function updateUIAfterLogin() {
    const profilePicSrc = currentUser.profilePic || 'https://i.stack.imgur.com/34AD2.jpg';
    const firstName = currentUser.name.split(' ')[0];
    
    const profileDropdownHtml = `
        <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <img src="${profilePicSrc}" class="rounded-circle me-2" width="28" height="28" style="object-fit: cover;">
            ${firstName}
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#profileModal"><i class="fas fa-user-edit me-2"></i>Edit Profile</a></li>
            <li><a class="dropdown-item" href="#dashboard"><i class="fas fa-tachometer-alt me-2"></i>Dashboard</a></li>
            <li><a class="dropdown-item" href="#dashboard"><i class="fas fa-bell me-2"></i>Alerts</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#aboutModal"><i class="fas fa-info-circle me-2"></i>About Website</a></li>
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#contactModal"><i class="fas fa-envelope me-2"></i>Contact Us</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><button class="dropdown-item" type="button" id="logoutButtonDropdown"><i class="fas fa-sign-out-alt me-2"></i>Logout</button></li>
        </ul>`;

    $('#user-nav-item').addClass('dropdown').html(profileDropdownHtml);

    $('#profilePicPreview').attr('src', profilePicSrc);
    $('#profileFullName').val(currentUser.name);
    $('#profileEmail').val(currentUser.email);
    $('#profilePhone').val(currentUser.phone);
}


// --- Charts, UI Helpers, and Location Tracking ---
function initCharts() {
    const cycloneCtx = document.getElementById('cycloneChart').getContext('2d');
    cycloneChart = new Chart(cycloneCtx, {
        type: 'line', data: { labels: ['6h', '12h', '18h', '24h', '36h', '48h', '72h'], datasets: [{ label: 'Cyclone Probability', data: [], borderColor: '#dc3545', backgroundColor: 'rgba(220, 53, 69, 0.1)', tension: 0.4, fill: true }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
    const floodCtx = document.getElementById('floodChart').getContext('2d');
    floodChart = new Chart(floodCtx, {
        type: 'bar', data: { labels: ['Chennai', 'Mumbai', 'Kolkata', 'Kochi', 'Visakhapatnam'], datasets: [{ label: 'Flood Risk (%)', data: [65, 45, 70, 30, 55], backgroundColor: ['rgba(220, 53, 69, 0.7)', 'rgba(239, 102, 115, 0.7)', 'rgba(200, 40, 55, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(210, 60, 75, 0.7)'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function initLocationTracking() {
    $('#enableLocation').click(enableLocationTracking);
    $('#disableLocation').click(disableLocationTracking);
    $('#simulateLocation').click(simulateLocation);
    updateLocationStatus('Enable location tracking for personalized alerts.', 'inactive');
    updateLocationButtons(false);
}

function enableLocationTracking() {
    if (!navigator.geolocation) { updateLocationStatus('Geolocation is not supported by this browser.', 'error'); return; }
    updateLocationStatus('Requesting location access...', 'requesting');
    navigator.geolocation.getCurrentPosition(
        position => {
            updateLocationUI(position);
            updateLocationStatus('Live location tracking enabled.', 'active');
            locationWatchId = navigator.geolocation.watchPosition(updateLocationUI, handleLocationError, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
            isLocationTracking = true;
            updateLocationButtons(true);
        },
        handleLocationError
    );
}

function disableLocationTracking() {
    if (locationWatchId !== null) { navigator.geolocation.clearWatch(locationWatchId); }
    locationWatchId = null;
    isLocationTracking = false;
    updateLocationStatus('Enable location tracking for personalized alerts.', 'inactive');
    updateLocationButtons(false);
    $('#latitude, #longitude, #accuracy, #lastUpdate').text('--');
}

function simulateLocation() {
    const simulatedPosition = {
        coords: { latitude: 20.5937, longitude: 78.9629, accuracy: 50 },
        timestamp: Date.now()
    };
    updateLocationUI(simulatedPosition);
    if (!isLocationTracking) { updateLocationStatus('Simulated location data.', 'simulated'); }
}

function updateLocationUI(position) {
    const { latitude, longitude, accuracy } = position.coords;
    $('#latitude').text(latitude.toFixed(6));
    $('#longitude').text(longitude.toFixed(6));
    $('#accuracy').text(`${accuracy.toFixed(2)} meters`);
    $('#lastUpdate').text(new Date(position.timestamp).toLocaleTimeString());
    checkLiveLocationWeather(latitude, longitude);
    if (coastalMap) {
        const userLatLng = [latitude, longitude];
        coastalMap.setView(userLatLng, 13);
        if (window.userLocationMarker) {
            window.userLocationMarker.setLatLng(userLatLng);
        } else {
            window.userLocationMarker = L.marker(userLatLng, { icon: L.divIcon({ html: '<i class="fas fa-user-circle fa-2x" style="color: #dc3545;"></i>', className: 'user-location-icon' }) }).addTo(coastalMap).bindPopup('Your current location');
        }
    }
}

function handleLocationError(error) {
    let message = 'An unknown location error occurred.';
    switch(error.code) {
        case error.PERMISSION_DENIED: message = 'Location access denied by user.'; break;
        case error.POSITION_UNAVAILABLE: message = 'Location information is unavailable.'; break;
        case error.TIMEOUT: message = 'The location request timed out.'; break;
    }
    updateLocationStatus(message, 'error');
    updateLocationButtons(false);
}

function updateLocationStatus(message, status) {
    const statusEl = $('#tracingStatus');
    statusEl.removeClass().addClass(`tracing-status status-${status}`);
    statusEl.html(`<i class="fas fa-info-circle me-1"></i> ${message}`);
}

function updateLocationButtons(isTracking) {
    $('#enableLocation').prop('disabled', isTracking);
    $('#disableLocation').prop('disabled', !isTracking);
}

async function checkLiveLocationWeather(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Live weather data fetch failed');
        const weatherData = await response.json();
        const alert = generateWeatherAlert(weatherData);
        displayLiveLocationAlert(alert);
    } catch (error) {
        console.error('Failed to fetch live location weather:', error);
        displayLiveLocationAlert({ message: 'Could not load your local weather data.', type: 'nodata' });
    }
}

function displayLiveLocationAlert(alert) {
    const alertList = $('.alert-list');
    $('#live-location-alert').remove();
    alertList.find('.no-threats-message').remove();
    if (alert.type !== 'normal' && alert.type !== 'nodata') {
        const alertHtml = `<div class="alert alert-danger" id="live-location-alert"><h6><i class="fas fa-map-marker-alt me-2"></i>Alert for Your Location</h6><p class="small mb-0">${alert.message.replace(/<\/?[^>]+(>|$)/g, "")}</p></div>`;
        alertList.prepend(alertHtml);
    }
    if (alertList.children().length === 0) {
        alertList.html('<div class="alert alert-success no-threats-message"><p class="small mb-0">✅ No active threats detected.</p></div>');
    }
}

function showError(message, context = '#loginModal') {
    $(`${context} .alert`).remove();
    const alert = $(`<div class="alert alert-danger alert-dismissible fade show mt-3" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`);
    $(`${context} form`).first().before(alert);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// --- Dashboard Data Simulation Functions ---
function updateDashboardMetrics() {
    let currentWindSpeed = parseFloat($('.warning-card:contains("Wind Speed") h3').text()) || 45;
    let newWindSpeed = Math.max(10, Math.min(80, currentWindSpeed + (Math.random() * 10 - 5)));
    $('.warning-card:contains("Wind Speed") h3').text(`${newWindSpeed.toFixed(1)} km/h`);
    let currentSeaTemp = parseFloat($('.info-card:contains("Sea Temperature") h3').text()) || 28.7;
    let newSeaTemp = Math.max(20, Math.min(35, currentSeaTemp + (Math.random() * 0.5 - 0.25)));
    $('.info-card:contains("Sea Temperature") h3').text(`${newSeaTemp.toFixed(1)}°C`);
    let currentWaterQuality = parseFloat($('.success-card:contains("Water Quality") h3').text()) || 92;
    let newWaterQuality = Math.max(75, Math.min(100, currentWaterQuality + (Math.random() * 4 - 2)));
    $('.success-card:contains("Water Quality") h3').text(`${newWaterQuality.toFixed(0)}%`);
    let currentActiveSensors = parseInt($('.info-card:contains("Active Sensors") h3').text().split('/')[0]) || 187;
    if (Math.random() < 0.3) currentActiveSensors += (Math.random() < 0.5 ? 1 : -1);
    let newActiveSensors = Math.max(180, Math.min(192, currentActiveSensors));
    $('.info-card:contains("Active Sensors") h3').text(`${newActiveSensors}/192`);
}

function updateChartsRandomly() {
    if (floodChart) {
        floodChart.data.datasets[0].data = floodChart.data.datasets[0].data.map(() => Math.floor(Math.random() * 81) + 20);
        floodChart.update();
    }
    if (cycloneChart) {
        let newData = []; let lastValue = Math.random() * 10;
        for (let i = 0; i < cycloneChart.data.labels.length; i++) {
            lastValue += (Math.random() * 15);
            newData.push(Math.min(100, lastValue));
        }
        cycloneChart.data.datasets[0].data = newData;
        cycloneChart.update();
    }
}


// --- Chatbot Logic ---
function toggleChatbot() {
    $('.chatbot-container').toggleClass('active');
    if ($('.chatbot-container').hasClass('active') && !chatbotInitialized) {
        displayMessage("Hello! I'm the Coastal Safety Bot. How can I assist you today? You can ask me about alerts, cyclones, or floods.", 'bot');
        chatbotInitialized = true;
    }
}

function handleUserMessage(event) {
    event.preventDefault();
    const userInput = $('#chatbot-input').val().trim();
    if (userInput === '') return;

    displayMessage(userInput, 'user');
    $('#chatbot-input').val('');

    // Simulate bot thinking and get response
    setTimeout(() => {
        const botResponse = getBotResponse(userInput);
        displayMessage(botResponse, 'bot');
    }, 600);
}

function displayMessage(message, sender) {
    const chatbotBody = $('#chatbot-body');
    const messageClass = sender === 'user' ? 'user-message' : 'bot-message';
    const messageElement = $(`<div class="chat-message ${messageClass}"></div>`).text(message);
    chatbotBody.append(messageElement);

    // Auto-scroll to the bottom
    chatbotBody.scrollTop(chatbotBody[0].scrollHeight);
}

function getBotResponse(userInput) {
    const input = userInput.toLowerCase();

    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
        return "Hello there! How can I help you with coastal safety today?";
    }
    if (input.includes('help') || input.includes('support')) {
        return "I can provide information on current alerts, cyclones, floods, or tell you about the developers of this site. What would you like to know?";
    }
    if (input.includes('alert') || input.includes('threat')) {
        const activeAlerts = $('.alert-list .alert').not('.no-threats-message').length;
        if (activeAlerts > 0) {
             return `I've detected ${activeAlerts} active alert(s). Please check the 'Active Alerts' panel on the dashboard for detailed information.`;
        }
        return "Good news! There are currently no active threats detected in the monitored areas. You can see the live status on the dashboard.";
    }
    if (input.includes('cyclone')) {
        return "Cyclones are monitored using satellite imagery and weather sensors. The 'Cyclone Probability Forecast' chart on the dashboard shows the likelihood of cyclone formation over the next 72 hours.";
    }
    if (input.includes('flood')) {
        return "Flood risk is assessed based on rainfall, tide levels, and storm surge predictions. Check the 'Flood Risk Assessment' chart for risk levels in key coastal cities.";
    }
    if (input.includes('developer') || input.includes('creator') || input.includes('made this')) {
        return "This website was developed by a talented team: Tirri Madhan, Bhavya Bhetariya, Nancy Gujar, and Yash Desai.";
    }
    if (input.includes('bye') || input.includes('thank')) {
        return "You're welcome! Stay safe and feel free to ask if you have more questions. Goodbye!";
    }
    
    // Default response
    return "I'm not sure how to answer that. You can ask me about 'alerts', 'cyclones', 'floods', or who the 'developers' are.";
}
