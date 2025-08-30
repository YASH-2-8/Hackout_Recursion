// Global variables
let coastalMap;
let cycloneChart;
let floodChart;
let otpTimer;
let emailOtpTimer;

// Initialize the application
$(document).ready(function() {
    initMap();
    initCharts();
    setupEventListeners();
    setupThemeToggle();
    initLocationTracking(); // Add this line
    
    // Simulate live alert after 3 seconds
    setTimeout(function() {
        $('#liveAlert').fadeIn();
    }, 3000);
    
    // Simulate data updates every 5 seconds
    setInterval(updateDashboardData, 5000);
});

// Initialize the map
function initMap() {
    // Create a map centered on the Indian coastline
    coastalMap = L.map('coastalMap').setView([15.2993, 74.1240], 5);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(coastalMap);
    
    // Add threat markers to the map
    addThreatMarkers();
}

// Add threat markers to the map
function addThreatMarkers() {
    const threatMarkers = [
        {
            lat: 13.0827,
            lng: 80.2707,
            type: 'cyclone',
            title: 'Cyclone Warning - Chennai Coast',
            message: 'Cyclone expected to make landfall in 72 hours. Wind speeds up to 120 km/h.'
        },
        {
            lat: 19.0760,
            lng: 72.8777,
            type: 'flood',
            title: 'Flood Risk - Mumbai',
            message: 'High tide combined with heavy rainfall expected. Flood risk: High.'
        },
        {
            lat: 8.5241,
            lng: 76.9366,
            type: 'pollution',
            title: 'Pollution Alert - Thiruvananthapuram',
            message: 'Industrial waste detected in coastal waters. Avoid contact with water.'
        },
        {
            lat: 16.5062,
            lng: 80.6480,
            type: 'algae',
            title: 'Algal Bloom - Andhra Pradesh Coast',
            message: 'Harmful algal bloom detected. Fishing activities suspended in the area.'
        }
    ];
    
    // Define custom icons for different threat types
    const threatIcons = {
        cyclone: L.divIcon({
            html: '<i class="fas fa-wind fa-2x" style="color: #dc3545;"></i>',
            className: 'threat-icon',
            iconSize: [30, 30]
        }),
        flood: L.divIcon({
            html: '<i class="fas fa-water fa-2x" style="color: #fd7e14;"></i>',
            className: 'threat-icon',
            iconSize: [30, 30]
        }),
        pollution: L.divIcon({
            html: '<i class="fas fa-industry fa-2x" style="color: #ffc107;"></i>',
            className: 'threat-icon',
            iconSize: [30, 30]
        }),
        algae: L.divIcon({
            html: '<i class="fas fa-leaf fa-2x" style="color: #20c997;"></i>',
            className: 'threat-icon',
            iconSize: [30, 30]
        })
    };
    
    // Add markers to the map
    threatMarkers.forEach(threat => {
        const marker = L.marker([threat.lat, threat.lng], {icon: threatIcons[threat.type]})
            .addTo(coastalMap)
            .bindPopup(`
                <strong>${threat.title}</strong><br>
                ${threat.message}
            `);
    });
    
    // Add a circle to show cyclone affected area
    const cycloneArea = L.circle([13.0827, 80.2707], {
        color: '#dc3545',
        fillColor: '#dc3545',
        fillOpacity: 0.2,
        radius: 120000
    }).addTo(coastalMap).bindPopup('Cyclone affected area');
}

// Initialize charts
function initCharts() {
    const cycloneCtx = document.getElementById('cycloneChart').getContext('2d');
    cycloneChart = new Chart(cycloneCtx, {
        type: 'line',
        data: {
            labels: ['6h', '12h', '18h', '24h', '36h', '48h', '72h'],
            datasets: [{
                label: 'Cyclone Probability',
                data: [15, 25, 40, 60, 75, 85, 95],
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Cyclone Formation Probability Over Time'
                }
            }
        }
    });
    
    const floodCtx = document.getElementById('floodChart').getContext('2d');
    floodChart = new Chart(floodCtx, {
        type: 'bar',
        data: {
            labels: ['Chennai', 'Mumbai', 'Kolkata', 'Kochi', 'Visakhapatnam'],
            datasets: [{
                label: 'Flood Risk (%)',
                data: [65, 45, 70, 30, 55],
                backgroundColor: [
                    'rgba(13, 110, 253, 0.7)',
                    'rgba(13, 202, 240, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(25, 135, 84, 0.7)',
                    'rgba(220, 53, 69, 0.7)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Flood Risk Assessment by Coastal City'
                }
            }
        }
    });
}

// Set up event listeners
function setupEventListeners() {
    // Login functionality
    $('#sendOtpPhone').click(sendPhoneOtp);
    $('#verifyPhoneOtp').click(verifyPhoneOtp);
    $('#backToPhoneEntry').click(backToPhoneEntry);
    $('#resendOtpPhone').click(resendPhoneOtp);
    
    $('#sendOtpEmail').click(sendEmailOtp);
    $('#verifyEmailOtp').click(verifyEmailOtp);
    $('#backToEmailEntry').click(backToEmailEntry);
    $('#resendOtpEmail').click(resendEmailOtp);
}

// Set up theme toggle
function setupThemeToggle() {
    const toggleSwitch = document.querySelector('#checkbox');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleSwitch.checked = true;
        document.querySelector('.theme-text').textContent = 'Light Mode';
    } else {
        document.querySelector('.theme-text').textContent = 'Dark Mode';
    }
    
    toggleSwitch.addEventListener('change', switchTheme, false);
}

// Location tracking variables
let locationWatchId = null;
let isLocationTracking = false;

// Setup location tracking event listeners
function setupLocationTracking() {
    $('#enableLocation').click(enableLocationTracking);
    $('#disableLocation').click(disableLocationTracking);
    $('#simulateLocation').click(simulateLocation);
}

// Enable location tracking
function enableLocationTracking() {
    if (!navigator.geolocation) {
        updateLocationStatus('Geolocation is not supported by this browser.', 'error');
        return;
    }

    updateLocationStatus('Requesting location access...', 'requesting');
    
    // Request high accuracy location
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };
    
    // Get current position first
    navigator.geolocation.getCurrentPosition(
        (position) => {
            updateLocationUI(position);
            updateLocationStatus('Location tracking enabled', 'active');
            
            // Start watching position
            locationWatchId = navigator.geolocation.watchPosition(
                (position) => {
                    updateLocationUI(position);
                },
                (error) => {
                    handleLocationError(error);
                },
                options
            );
            
            isLocationTracking = true;
            updateLocationButtons(true);
        },
        (error) => {
            handleLocationError(error);
        },
        options
    );
}

// Disable location tracking
function disableLocationTracking() {
    if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
        locationWatchId = null;
    }
    
    isLocationTracking = false;
    updateLocationStatus('Location tracing disabled', 'inactive');
    updateLocationButtons(false);
    
    // Clear location data
    $('#latitude').text('--');
    $('#longitude').text('--');
    $('#accuracy').text('--');
    $('#lastUpdate').text('--');
}

// Simulate location for testing
function simulateLocation() {
    const simulatedPosition = {
        coords: {
            latitude: 12.9716 + (Math.random() * 0.1 - 0.05), // Random near Chennai
            longitude: 77.5946 + (Math.random() * 0.1 - 0.05),
            accuracy: 10 + Math.random() * 100
        },
        timestamp: Date.now()
    };
    
    updateLocationUI(simulatedPosition);
    
    if (!isLocationTracking) {
        updateLocationStatus('Simulated location data', 'simulated');
    }
}

// Update location UI with position data
function updateLocationUI(position) {
    const { latitude, longitude, accuracy } = position.coords;
    const lastUpdate = new Date(position.timestamp).toLocaleTimeString();
    
    $('#latitude').text(latitude.toFixed(6));
    $('#longitude').text(longitude.toFixed(6));
    $('#accuracy').text(`${accuracy.toFixed(2)} meters`);
    $('#lastUpdate').text(lastUpdate);
    
    // Update map if needed
    if (coastalMap && isLocationTracking) {
        coastalMap.setView([latitude, longitude], 13);
        
        // Add or update user location marker
        if (window.userLocationMarker) {
            userLocationMarker.setLatLng([latitude, longitude]);
        } else {
            window.userLocationMarker = L.marker([latitude, longitude], {
                icon: L.divIcon({
                    html: '<i class="fas fa-user-circle fa-2x" style="color: #0d6efd;"></i>',
                    className: 'user-location-icon',
                    iconSize: [30, 30]
                })
            }).addTo(coastalMap)
            .bindPopup('Your current location');
        }
    }
}

// Handle location errors
function handleLocationError(error) {
    let errorMessage = '';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
        case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        default:
            errorMessage = 'Unknown location error';
            break;
    }
    
    updateLocationStatus(errorMessage, 'error');
    updateLocationButtons(false);
}

// Update location status display
function updateLocationStatus(message, status) {
    const statusElement = $('#tracingStatus');
    statusElement.removeClass('status-active status-inactive status-error status-requesting status-simulated');
    
    switch(status) {
        case 'active':
            statusElement.html('<i class="fas fa-check-circle me-1"></i> ' + message).addClass('status-active');
            break;
        case 'inactive':
            statusElement.html('<i class="fas fa-times-circle me-1"></i> ' + message).addClass('status-inactive');
            break;
        case 'error':
            statusElement.html('<i class="fas fa-exclamation-circle me-1"></i> ' + message).addClass('status-error');
            break;
        case 'requesting':
            statusElement.html('<i class="fas fa-spinner fa-spin me-1"></i> ' + message).addClass('status-requesting');
            break;
        case 'simulated':
            statusElement.html('<i class="fas fa-location-dot me-1"></i> ' + message).addClass('status-simulated');
            break;
    }
}

// Update location buttons state
function updateLocationButtons(isTracking) {
    $('#enableLocation').prop('disabled', isTracking);
    $('#disableLocation').prop('disabled', !isTracking);
}

// Initialize location tracking
function initLocationTracking() {
    setupLocationTracking();
    updateLocationStatus('Location tracing disabled', 'inactive');
    updateLocationButtons(false);
}
// Switch between light and dark themes
function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        document.querySelector('.theme-text').textContent = 'Light Mode';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        document.querySelector('.theme-text').textContent = 'Dark Mode';
    }    
}

// Send OTP for phone login
function sendPhoneOtp() {
    const phoneNumber = $('#phoneNumber').val().trim();
    
    if (!phoneNumber) {
        showError('Please enter a phone number');
        return;
    }
    
    if (!isValidPhoneNumber(phoneNumber)) {
        showError('Please enter a valid phone number');
        return;
    }
    
    // Simulate sending OTP (in a real app, this would call your backend)
    $('#phoneNumberDisplay').text(phoneNumber);
    $('#phoneLoginStep1').hide();
    $('#phoneLoginStep2').show();
    // Start OTP countdown timer
    startOtpTimer('otpCountdown', 'resendOtpPhone');
    
    // For demo purposes, show the OTP in console
    const demoOtp = '123456';
    console.log(`Demo OTP for ${phoneNumber}: ${demoOtp}`);
}

// Verify phone OTP
function verifyPhoneOtp() {
    const enteredOtp = $('#phoneOtp').val().trim();
    
    if (!enteredOtp || enteredOtp.length !== 6) {
        showError('Please enter a valid 6-digit OTP');
        return;
    }
    
    // Simulate OTP verification (in a real app, this would call your backend)
    if (enteredOtp === '123456') {
        // Successful login
        clearInterval(otpTimer);
        $('#loginModal').modal('hide');
        showLoginSuccess();
        updateLoginButton(true);
    } else {
        showError('Invalid OTP. Please try again.');
    }
}

// Send OTP for email login
function sendEmailOtp() {
    const email = $('#emailAddress').val().trim();
    
    if (!email) {
        showError('Please enter an email address');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Simulate sending OTP (in a real app, this would call your backend)
    $('#emailAddressDisplay').text(email);
    $('#emailLoginStep1').hide();
    $('#emailLoginStep2').show();
    
    // Start OTP countdown timer
    startOtpTimer('emailOtpCountdown', 'resendOtpEmail');
    
    // For demo purposes, show the OTP in console
    const demoOtp = '654321';
    console.log(`Demo OTP for ${email}: ${demoOtp}`);
}

// Verify email OTP
function verifyEmailOtp() {
    const enteredOtp = $('#emailOtp').val().trim();
    
    if (!enteredOtp || enteredOtp.length !== 6) {
        showError('Please enter a valid 6-digit OTP');
        return;
    }
    
    // Simulate OTP verification (in a real app, this would call your backend)
    if (enteredOtp === '654321') {
        // Successful login
        clearInterval(emailOtpTimer);
        $('#loginModal').modal('hide');
        showLoginSuccess();
        updateLoginButton(true);
    } else {
        showError('Invalid OTP. Please try again.');
    }
}

// Start OTP countdown timer
function startOtpTimer(countdownElementId, resendButtonId) {
    let timeLeft = 120; // 2 minutes in seconds
    const countdownElement = $(`#${countdownElementId}`);
    const resendButton = $(`#${resendButtonId}`);
    
    // Clear any existing timer
    if (countdownElementId === 'otpCountdown') {
        clearInterval(otpTimer);
    } else {
        clearInterval(emailOtpTimer);
    }
    
    // Update timer every second
    const timer = setInterval(function() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        countdownElement.text(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            countdownElement.hide();
            resendButton.show();
        }
        
        timeLeft--;
    }, 1000);
    
    // Store the timer reference
    if (countdownElementId === 'otpCountdown') {
        otpTimer = timer;
    } else {
        emailOtpTimer = timer;
    }
}

// Resend phone OTP
function resendPhoneOtp() {
    $('#resendOtpPhone').hide();
    $('#otpCountdown').show();
    sendPhoneOtp();
}

// Resend email OTP
function resendEmailOtp() {
    $('#resendOtpEmail').hide();
    $('#emailOtpCountdown').show();
    sendEmailOtp();
}

// Go back to phone entry
function backToPhoneEntry() {
    $('#phoneLoginStep2').hide();
    $('#phoneLoginStep1').show();
    clearInterval(otpTimer);
}

// Go back to email entry
function backToEmailEntry() {
    $('#emailLoginStep2').hide();
    $('#emailLoginStep1').show();
    clearInterval(emailOtpTimer);
}

// Show login success toast
function showLoginSuccess() {
    const toast = new bootstrap.Toast(document.getElementById('loginSuccessToast'));
    toast.show();
}

// Update login button after successful login
function updateLoginButton(isLoggedIn) {
    if (isLoggedIn) {
        $('.navbar-nav .btn').html('<i class="fas fa-user me-1"></i> My Account');
    }
}

// Validate phone number
function isValidPhoneNumber(phone) {
    const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
    return phoneRegex.test(phone);
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show error message
function showError(message) {
    // Create and show a temporary error alert
    const alert = $(`<div class="alert alert-danger alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`);
    
    $('#loginModal .modal-body').prepend(alert);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        alert.alert('close');
    }, 3000);
}

// Update dashboard data
function updateDashboardData() {
    // Update wind speed with random value between 40-50
    const windSpeed = 40 + Math.floor(Math.random() * 10);
    $('.warning-card h3').text(windSpeed + ' km/h');
    
    // Randomly change status indicators
    const statuses = ['Normal', 'Increasing', 'Decreasing'];
    const statusClasses = ['text-success', 'text-warning', 'text-info'];
    const arrows = ['fa-arrow-down', 'fa-arrow-up', 'fa-arrow-right'];
    
    $('.warning-card p, .info-card p, .success-card p').each(function() {
        const randomIndex = Math.floor(Math.random() * 3);
        $(this).removeClass('text-success text-warning text-info')
            .addClass(statusClasses[randomIndex])
            .html('<i class="fas ' + arrows[randomIndex] + ' me-1"></i> ' + statuses[randomIndex]);
    });
    
    // Add a small animation to cards to indicate data refresh
    $('.card').css('transform', 'translateY(0)');
    setTimeout(function() {
        $('.card').css('transform', 'translateY(-5px)');
    }, 100);
}