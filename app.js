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
                // Convert attended arrays back to Date objects if they exist
                this.data.courses.forEach(course => {
                    if (Array.isArray(course.attended)) {
                        course.attended = course.attended.map(timestamp => new Date(timestamp));
                    } else if (typeof course.attended === 'number') {
                        // Migrate old number format to array format
                        course.attended = [];
                    }
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.data = { courses: [], settings: { darkMode: false } };
        }
    }

    saveData() {
        try {
            // Convert Date objects to ISO strings for JSON storage
            const dataToSave = {
                ...this.data,
                courses: this.data.courses.map(course => ({
                    ...course,
                    attended: course.attended.map(date => date.toISOString())
                }))
            };
            localStorage.setItem('attendanceData', JSON.stringify(dataToSave));
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

        // Detail modal
        document.getElementById('close-detail-modal').addEventListener('click', () => {
            this.closeDetailModal();
        });

        document.getElementById('detail-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeDetailModal();
            }
        });

        // Detail modal actions
        document.getElementById('mark-from-detail').addEventListener('click', () => {
            const courseId = document.getElementById('detail-modal').dataset.courseId;
            this.markAttendance(courseId);
            this.updateDetailModal(courseId);
        });

        document.getElementById('edit-from-detail').addEventListener('click', () => {
            const courseId = document.getElementById('detail-modal').dataset.courseId;
            this.closeDetailModal();
            this.editCourse(courseId);
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
            attended: [] // Changed to array of timestamps
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
            const currentPercent = (course.attended.length / course.totalLectures) * 100; // Changed to use length
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
        const attendedCount = course.attended.length; // Get count from array length
        const currentPercent = (attendedCount / course.totalLectures) * 100;
        const remainingLectures = course.totalLectures - attendedCount;
        const neededToReachTarget = Math.ceil((course.totalLectures * (course.targetPercent / 100)) - attendedCount);
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

        // Get last marked time
        const lastMarked = attendedCount > 0 ? course.attended[attendedCount - 1] : null;
        const lastMarkedText = lastMarked ?
            `Last marked: ${lastMarked.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} on ${lastMarked.toLocaleDateString()}` :
            'No attendance marked yet';

        const card = document.createElement('div');
        card.className = 'course-card';
        card.onclick = (e) => {
            // Don't open detail modal if clicking on buttons
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('.course-settings')) {
                this.showDetailModal(course.id);
            }
        };
        card.innerHTML = `
            <div class="course-header">
                <h3>${course.name}</h3>
                <button class="course-settings" onclick="event.stopPropagation(); app.editCourse('${course.id}')">⚙️</button>
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
                        <div class="stat-value">${attendedCount}/${course.totalLectures}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Need</div>
                        <div class="stat-value">${Math.max(0, neededToReachTarget)}</div>
                    </div>
                </div>

                <div class="last-marked-info">${lastMarkedText}</div>

                <div class="status-message ${statusClass}">${statusMessage}</div>

                <div class="course-actions">
                    <button class="mark-attended-btn" onclick="event.stopPropagation(); app.markAttendance('${course.id}')">
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

        const now = new Date();
        course.attended.push(now);
        this.saveData();
        this.renderDashboard();

        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        const dateString = now.toLocaleDateString();
        this.showToast(`✅ Attendance logged at ${timeString} on ${dateString}!`);

        // Check if target reached
        const currentPercent = (course.attended.length / course.totalLectures) * 100;
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
        document.getElementById('edit-attended').value = course.attended.length; // Use length for editing

        document.getElementById('edit-modal').style.display = 'flex';
    }

    saveCourseEdit() {
        const courseId = document.getElementById('edit-course-id').value;
        const course = this.data.courses.find(c => c.id === courseId);
        if (!course) return;

        const name = document.getElementById('edit-course-name').value.trim();
        const totalLectures = parseInt(document.getElementById('edit-total-lectures').value);
        const targetPercent = parseInt(document.getElementById('edit-target-percent').value);
        const attendedCount = parseInt(document.getElementById('edit-attended').value);

        if (!name || !totalLectures || !targetPercent || attendedCount === undefined) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        if (totalLectures < 1 || attendedCount < 0 || attendedCount > totalLectures) {
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
        // Adjust attended array to match the new count
        if (attendedCount > course.attended.length) {
            // Add dummy timestamps for new attendance
            const now = new Date();
            while (course.attended.length < attendedCount) {
                course.attended.push(new Date(now.getTime() - (course.attended.length * 60000))); // Space them 1 minute apart
            }
        } else if (attendedCount < course.attended.length) {
            // Remove excess attendance records
            course.attended = course.attended.slice(0, attendedCount);
        }

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
            course.attended = [];
            this.saveData();
            this.renderDashboard();
            this.closeEditModal();
            this.showToast('Attendance reset successfully!');
        }
    }

    closeEditModal() {
        document.getElementById('edit-modal').style.display = 'none';
    }

    // Detail Modal
    showDetailModal(courseId) {
        const course = this.data.courses.find(c => c.id === courseId);
        if (!course) return;

        document.getElementById('detail-modal').dataset.courseId = courseId;
        document.getElementById('detail-course-title').textContent = course.name;
        document.getElementById('detail-modal').style.display = 'flex';

        this.updateDetailModal(courseId);
    }

    closeDetailModal() {
        document.getElementById('detail-modal').style.display = 'none';
    }

    updateDetailModal(courseId) {
        const course = this.data.courses.find(c => c.id === courseId);
        if (!course) return;

        // Update overview stats
        const attendedCount = course.attended.length;
        const currentPercent = (attendedCount / course.totalLectures) * 100;
        const remainingLectures = course.totalLectures - attendedCount;
        const neededToReachTarget = Math.ceil((course.totalLectures * (course.targetPercent / 100)) - attendedCount);
        const safeSkips = Math.max(0, remainingLectures - neededToReachTarget);

        // Update stats
        document.getElementById('detail-attended').textContent = attendedCount;
        document.getElementById('detail-remaining').textContent = remainingLectures;
        document.getElementById('detail-percentage').textContent = `${currentPercent.toFixed(1)}%`;

        // Update progress bar
        document.getElementById('detail-progress-fill').style.width = `${Math.min(currentPercent, 100)}%`;
        document.getElementById('detail-target-status').textContent = `Target: ${course.targetPercent}%`;

        // Update quick info
        const lastMarked = attendedCount > 0 ? course.attended[attendedCount - 1] : null;
        const lastMarkedText = lastMarked ?
            `${lastMarked.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} on ${lastMarked.toLocaleDateString()}` :
            'Never';
        document.getElementById('detail-last-marked').textContent = lastMarkedText;
        document.getElementById('detail-safe-skip').textContent = safeSkips;
        document.getElementById('detail-need-attend').textContent = Math.max(0, neededToReachTarget);

        // Update history
        const historyList = document.getElementById('history-list');
        const noHistory = document.getElementById('no-history');

        if (course.attended.length === 0) {
            historyList.innerHTML = '';
            noHistory.style.display = 'block';
        } else {
            noHistory.style.display = 'none';
            historyList.innerHTML = '';

            // Sort attendance records by date (most recent first)
            const sortedAttendance = [...course.attended].sort((a, b) => b.getTime() - a.getTime());

            sortedAttendance.forEach((timestamp, index) => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div class="history-date">${timestamp.toLocaleDateString()}</div>
                    <div class="history-time">${timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                    <div class="history-number">#${course.attended.length - index}</div>
                `;
                historyList.appendChild(historyItem);
            });
        }

        // Update statistics
        // Basic stats
        document.getElementById('stat-total-days').textContent = attendedCount;

        // Calculate longest streak
        const longestStreak = this.calculateLongestStreak(course.attended);
        document.getElementById('stat-longest-streak').textContent = longestStreak;

        // Calculate average per week
        const avgPerWeek = this.calculateAveragePerWeek(course.attended);
        document.getElementById('stat-avg-week').textContent = avgPerWeek.toFixed(1);

        // Most active day
        const mostActiveDay = this.calculateMostActiveDay(course.attended);
        document.getElementById('stat-most-active').textContent = mostActiveDay;

        // Time slot statistics
        const timeSlots = document.getElementById('time-slot-stats');
        timeSlots.innerHTML = '';

        if (course.attended.length === 0) {
            timeSlots.innerHTML = '<p>No attendance data available</p>';
        } else {
            const slotCounts = { 'Morning (6-12)': 0, 'Afternoon (12-18)': 0, 'Evening (18-24)': 0, 'Night (0-6)': 0 };

            course.attended.forEach(date => {
                const hour = date.getHours();
                if (hour >= 6 && hour < 12) slotCounts['Morning (6-12)']++;
                else if (hour >= 12 && hour < 18) slotCounts['Afternoon (12-18)']++;
                else if (hour >= 18 && hour < 24) slotCounts['Evening (18-24)']++;
                else slotCounts['Night (0-6)']++;
            });

            Object.entries(slotCounts).forEach(([slot, count]) => {
                const percentage = course.attended.length > 0 ? ((count / course.attended.length) * 100).toFixed(1) : 0;
                const slotDiv = document.createElement('div');
                slotDiv.className = 'time-slot-item';
                slotDiv.innerHTML = `
                    <span class="slot-name">${slot}</span>
                    <span class="slot-count">${count} (${percentage}%)</span>
                `;
                timeSlots.appendChild(slotDiv);
            });
        }

        // Weekday statistics
        const weekdayStats = document.getElementById('weekday-stats');
        weekdayStats.innerHTML = '';

        if (course.attended.length === 0) {
            weekdayStats.innerHTML = '<p>No attendance data available</p>';
        } else {
            const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const weekdayCounts = weekdays.map(() => 0);

            course.attended.forEach(date => {
                const dayIndex = date.getDay();
                weekdayCounts[dayIndex]++;
            });

            const maxCount = Math.max(...weekdayCounts);

            weekdays.forEach((day, index) => {
                const count = weekdayCounts[index];
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                const dayDiv = document.createElement('div');
                dayDiv.className = 'weekday-item';
                dayDiv.innerHTML = `
                    <span class="weekday-name">${day.slice(0, 3)}</span>
                    <div class="weekday-bar">
                        <div class="weekday-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="weekday-count">${count}</span>
                `;
                weekdayStats.appendChild(dayDiv);
            });
        }
    }

    calculateLongestStreak(attendance) {
        if (attendance.length === 0) return 0;

        const sortedDates = attendance.map(date => date.toDateString()).sort();
        let currentStreak = 1;
        let longestStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1]);
            const currentDate = new Date(sortedDates[i]);
            const diffTime = currentDate.getTime() - prevDate.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return longestStreak;
    }

    calculateAveragePerWeek(attendance) {
        if (attendance.length === 0) return 0;

        const sortedAttendance = attendance.sort((a, b) => a.getTime() - b.getTime());
        const firstDate = sortedAttendance[0];
        const lastDate = sortedAttendance[sortedAttendance.length - 1];
        const weeksDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7);

        return weeksDiff > 0 ? attendance.length / weeksDiff : attendance.length;
    }

    calculateMostActiveDay(attendance) {
        if (attendance.length === 0) return 'N/A';

        const dayCounts = {};
        attendance.forEach(date => {
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
        });

        const mostActive = Object.entries(dayCounts).reduce((a, b) => a[1] > b[1] ? a : b);
        return mostActive[0];
    }

    populateTimeSlotStats(attendance) {
        const timeSlots = document.getElementById('time-slot-stats');
        timeSlots.innerHTML = '';

        if (attendance.length === 0) {
            timeSlots.innerHTML = '<p>No attendance data available</p>';
            return;
        }

        const slotCounts = { 'Morning (6-12)': 0, 'Afternoon (12-18)': 0, 'Evening (18-24)': 0, 'Night (0-6)': 0 };

        attendance.forEach(date => {
            const hour = date.getHours();
            if (hour >= 6 && hour < 12) slotCounts['Morning (6-12)']++;
            else if (hour >= 12 && hour < 18) slotCounts['Afternoon (12-18)']++;
            else if (hour >= 18 && hour < 24) slotCounts['Evening (18-24)']++;
            else slotCounts['Night (0-6)']++;
        });

        Object.entries(slotCounts).forEach(([slot, count]) => {
            const percentage = attendance.length > 0 ? ((count / attendance.length) * 100).toFixed(1) : 0;
            const slotDiv = document.createElement('div');
            slotDiv.className = 'time-slot-item';
            slotDiv.innerHTML = `
                <span class="slot-name">${slot}</span>
                <span class="slot-count">${count} (${percentage}%)</span>
            `;
            timeSlots.appendChild(slotDiv);
        });
    }

    populateWeekdayStats(attendance) {
        const weekdayStats = document.getElementById('weekday-stats');
        weekdayStats.innerHTML = '';

        if (attendance.length === 0) {
            weekdayStats.innerHTML = '<p>No attendance data available</p>';
            return;
        }

        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const weekdayCounts = weekdays.map(() => 0);

        attendance.forEach(date => {
            const dayIndex = date.getDay();
            weekdayCounts[dayIndex]++;
        });

        const maxCount = Math.max(...weekdayCounts);

        weekdays.forEach((day, index) => {
            const count = weekdayCounts[index];
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

            const dayDiv = document.createElement('div');
            dayDiv.className = 'weekday-item';
            dayDiv.innerHTML = `
                <span class="weekday-name">${day.slice(0, 3)}</span>
                <div class="weekday-bar">
                    <div class="weekday-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="weekday-count">${count}</span>
            `;
            weekdayStats.appendChild(dayDiv);
        });
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
