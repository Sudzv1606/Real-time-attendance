// Attendance Tracker PWA - Main JavaScript
class AttendanceTracker {
    constructor() {
        this.data = {
            courses: [],
            settings: {
                darkMode: false
            }
        };

        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.applyTheme();
        this.checkForIOSInstall();
        this.showInitialScreen();
    }

    // Data Management
    loadData() {
        try {
            const saved = localStorage.getItem('attendanceData');
            if (saved) {
                this.data = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.data = { courses: [], settings: { darkMode: false } };
        }
    }

    saveData() {
        try {
            localStorage.setItem('attendanceData', JSON.stringify(this.data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // Theme Management
    applyTheme() {
        const isDark = this.data.settings.darkMode;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        this.updateDarkModeToggle();
    }

    toggleDarkMode() {
        this.data.settings.darkMode = !this.data.settings.darkMode;
        this.applyTheme();
        this.saveData();
    }

    updateDarkModeToggle() {
        const toggle = document.getElementById('dark-mode-toggle');
        if (toggle) {
            toggle.textContent = this.data.settings.darkMode ? '☀️' : '🌙';
        }
    }

    // Screen Management
    showInitialScreen() {
        if (this.data.courses.length === 0) {
            this.showSetupScreen();
        } else {
            this.showDashboard();
        }
    }

    showSetupScreen() {
        document.getElementById('setup-screen').style.display = 'block';
        document.getElementById('dashboard-screen').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('setup-screen').style.display = 'none';
        document.getElementById('dashboard-screen').style.display = 'block';
        this.renderDashboard();
    }

    // Setup Screen
    setupEventListeners() {
        // Course form submission
        document.getElementById('course-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCourse();
        });

        // Done setup button
        document.getElementById('done-setup').addEventListener('click', () => {
            this.showDashboard();
        });

        // Dark mode toggle
        document.getElementById('dark-mode-toggle').addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Add course from dashboard
        document.getElementById('add-course-btn').addEventListener('click', () => {
            this.showSetupScreen();
        });

        // Edit course modal
        document.getElementById('close-edit-modal').addEventListener('click', () => {
            this.closeEditModal();
        });

        document.getElementById('edit-course-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCourseEdit();
        });

        document.getElementById('reset-attendance').addEventListener('click', () => {
            this.resetCourseAttendance();
        });

        // Close modal on backdrop click
        document.getElementById('edit-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeEditModal();
            }
        });

        // iOS install banner close
        document.getElementById('close-ios-banner').addEventListener('click', () => {
            this.hideIOSBanner();
        });
    }

    addCourse() {
        const name = document.getElementById('course-name').value.trim();
        const totalLectures = parseInt(document.getElementById('total-lectures').value);
        const targetPercent = parseInt(document.getElementById('target-percent').value);

        if (!name || !totalLectures || !targetPercent) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        if (totalLectures < 1) {
            this.showToast('Total lectures must be at least 1', 'error');
            return;
        }

        if (targetPercent < 1 || targetPercent > 100) {
            this.showToast('Target percentage must be between 1 and 100', 'error');
            return;
        }

        const course = {
            id: this.generateId(),
            name,
            totalLectures,
            targetPercent,
            attended: 0
        };

        this.data.courses.push(course);
        this.saveData();
        this.renderSetupCourses();
        this.clearForm();

        if (this.data.courses.length >= 1) {
            document.getElementById('done-setup').style.display = 'inline-flex';
        }
    }

    renderSetupCourses() {
        const container = document.getElementById('courses-list');
        container.innerHTML = '';

        this.data.courses.forEach(course => {
            const courseItem = document.createElement('div');
            courseItem.className = 'course-item';
            courseItem.innerHTML = `
                <div class="course-item-info">
                    <h3>${course.name}</h3>
                    <p>Total: ${course.totalLectures} lectures | Target: ${course.targetPercent}%</p>
                </div>
                <div class="course-item-actions">
                    <button onclick="app.removeCourse('${course.id}')">🗑️</button>
                </div>
            `;
            container.appendChild(courseItem);
        });
    }

    removeCourse(courseId) {
        this.data.courses = this.data.courses.filter(c => c.id !== courseId);
        this.saveData();
        this.renderSetupCourses();

        if (this.data.courses.length === 0) {
            document.getElementById('done-setup').style.display = 'none';
        }
    }

    clearForm() {
        document.getElementById('course-name').value = '';
        document.getElementById('total-lectures').value = '';
        document.getElementById('target-percent').value = '75';
    }

    // Dashboard
    renderDashboard() {
        this.renderOverallSummary();
        this.renderCoursesGrid();
    }

    renderOverallSummary() {
        const container = document.getElementById('overall-summary');
        const totalCourses = this.data.courses.length;
        const onTrackCourses = this.data.courses.filter(course => {
            const currentPercent = (course.attended / course.totalLectures) * 100;
            return currentPercent >= course.targetPercent;
        }).length;

        container.innerHTML = `
            <h2>📊 Overall Progress</h2>
            <p>You're maintaining ${this.data.settings.darkMode ? '☀️' : '🌙'} ${this.data.settings.darkMode ? 'Light' : 'Dark'} mode</p>
            <p>You're on track in <strong>${onTrackCourses}/${totalCourses}</strong> courses</p>
        `;
    }

    renderCoursesGrid() {
        const container = document.getElementById('courses-grid');
        container.innerHTML = '';

        this.data.courses.forEach(course => {
            const courseCard = this.createCourseCard(course);
            container.appendChild(courseCard);
        });
    }

    createCourseCard(course) {
        const currentPercent = (course.attended / course.totalLectures) * 100;
        const remainingLectures = course.totalLectures - course.attended;
        const neededToReachTarget = Math.ceil((course.totalLectures * (course.targetPercent / 100)) - course.attended);
        const safeSkips = Math.max(0, remainingLectures - neededToReachTarget);

        let statusMessage = '';
        let statusClass = '';

        if (neededToReachTarget <= 0) {
            statusMessage = "🎉 You've met your target!";
            statusClass = 'success';
        } else if (neededToReachTarget > remainingLectures) {
            statusMessage = "⚠️ Attend all remaining lectures!";
            statusClass = 'danger';
        } else {
            statusMessage = `😌 Safe to skip: ${safeSkips} lectures`;
            statusClass = 'normal';
        }

        const card = document.createElement('div');
        card.className = 'course-card';
        card.innerHTML = `
            <div class="course-header">
                <h3>${course.name}</h3>
                <button class="course-settings" onclick="app.editCourse('${course.id}')">⚙️</button>
            </div>
            <div class="course-body">
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(currentPercent, 100)}%"></div>
                    </div>
                    <div class="progress-text">${currentPercent.toFixed(1)}% Complete</div>
                </div>

                <div class="course-stats">
                    <div class="stat-item">
                        <div class="stat-label">Attended</div>
                        <div class="stat-value">${course.attended}/${course.totalLectures}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Need</div>
                        <div class="stat-value">${Math.max(0, neededToReachTarget)}</div>
                    </div>
                </div>

                <div class="status-message ${statusClass}">${statusMessage}</div>

                <div class="course-actions">
                    <button class="mark-attended-btn" onclick="app.markAttendance('${course.id}')">
                        + Mark Attended
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    // Attendance Management
    markAttendance(courseId) {
        const course = this.data.courses.find(c => c.id === courseId);
        if (!course) return;

        course.attended++;
        this.saveData();
        this.renderDashboard();

        this.showToast('✅ Attendance logged!');

        // Check if target reached
        const currentPercent = (course.attended / course.totalLectures) * 100;
        if (currentPercent >= course.targetPercent) {
            this.showConfetti();
        }
    }

    // Course Editing
    editCourse(courseId) {
        const course = this.data.courses.find(c => c.id === courseId);
        if (!course) return;

        document.getElementById('edit-course-id').value = course.id;
        document.getElementById('edit-course-name').value = course.name;
        document.getElementById('edit-total-lectures').value = course.totalLectures;
        document.getElementById('edit-target-percent').value = course.targetPercent;
        document.getElementById('edit-attended').value = course.attended;

        document.getElementById('edit-modal').style.display = 'flex';
    }

    saveCourseEdit() {
        const courseId = document.getElementById('edit-course-id').value;
        const course = this.data.courses.find(c => c.id === courseId);
        if (!course) return;

        const name = document.getElementById('edit-course-name').value.trim();
        const totalLectures = parseInt(document.getElementById('edit-total-lectures').value);
        const targetPercent = parseInt(document.getElementById('edit-target-percent').value);
        const attended = parseInt(document.getElementById('edit-attended').value);

        if (!name || !totalLectures || !targetPercent || attended === undefined) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        if (totalLectures < 1 || attended < 0 || attended > totalLectures) {
            this.showToast('Invalid lecture numbers', 'error');
            return;
        }

        if (targetPercent < 1 || targetPercent > 100) {
            this.showToast('Target percentage must be between 1 and 100', 'error');
            return;
        }

        course.name = name;
        course.totalLectures = totalLectures;
        course.targetPercent = targetPercent;
        course.attended = attended;

        this.saveData();
        this.renderDashboard();
        this.closeEditModal();
        this.showToast('Course updated successfully!');
    }

    resetCourseAttendance() {
        const courseId = document.getElementById('edit-course-id').value;
        const course = this.data.courses.find(c => c.id === courseId);
        if (!course) return;

        if (confirm('Are you sure you want to reset attendance for this course? This cannot be undone.')) {
            course.attended = 0;
            this.saveData();
            this.renderDashboard();
            this.closeEditModal();
            this.showToast('Attendance reset successfully!');
        }
    }

    closeEditModal() {
        document.getElementById('edit-modal').style.display = 'none';
    }

    // iOS Detection and Install Banner
    isIOS() {
        return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    }

    checkForIOSInstall() {
        if (this.isIOS() && !window.matchMedia('(display-mode: standalone)').matches) {
            // Show banner after a short delay to avoid interrupting initial load
            setTimeout(() => {
                const banner = document.getElementById('ios-install-banner');
                if (banner && !localStorage.getItem('iosBannerDismissed')) {
                    banner.style.display = 'block';
                }
            }, 2000);
        }
    }

    hideIOSBanner() {
        const banner = document.getElementById('ios-install-banner');
        if (banner) {
            banner.style.display = 'none';
            localStorage.setItem('iosBannerDismissed', 'true');
        }
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');

        toastMessage.textContent = message;
        toast.style.backgroundColor = type === 'error' ? '#ef4444' : '#10b981';
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    showConfetti() {
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti';

        for (let i = 0; i < 50; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.animationDelay = Math.random() * 3 + 's';
            piece.style.backgroundColor = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 4)];
            confettiContainer.appendChild(piece);
        }

        document.body.appendChild(confettiContainer);

        setTimeout(() => {
            document.body.removeChild(confettiContainer);
        }, 4000);
    }
}

// Initialize the app
const app = new AttendanceTracker();

// Make functions globally available for onclick handlers
window.app = app;
