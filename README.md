# 📚 Attendance Tracker PWA

A Progressive Web App for students to track their lecture attendance in real-time and maintain their target attendance percentage. Built with vanilla HTML, CSS, and JavaScript.

## ✨ Features

### Core Functionality
- **Course Setup**: Add multiple courses with custom attendance targets
- **Real-time Tracking**: Mark attendance for each lecture with one tap
- **Smart Calculations**: Automatically calculates attendance percentage and safe skips
- **Progress Visualization**: Visual progress bars and statistics for each course
- **Dark Mode**: Toggle between light and dark themes
- **Offline Support**: Works completely offline after first load

### PWA Features
- **Installable**: Add to home screen on mobile devices
- **Offline Ready**: Service worker caches all assets for offline use
- **Responsive Design**: Works perfectly on phones, tablets, and desktop
- **App-like Experience**: Standalone mode with native app feel

### User Experience
- **Clean Interface**: Minimalist, card-based design
- **Toast Notifications**: Instant feedback for actions
- **Confetti Animation**: Celebration when reaching attendance targets
- **Edit Courses**: Modify course settings and reset attendance
- **Data Persistence**: All data saved in localStorage

## 🚀 Quick Start

1. **Clone or download** the project files
2. **Serve the files** using any HTTP server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve .

   # Using PHP
   php -S localhost:8000
   ```
3. **Open** http://localhost:8000 in your browser
4. **Install** the app by clicking the install button in your browser

## 📱 How to Use

### First Time Setup
1. Open the app - you'll see the setup screen
2. Add your courses:
   - Course name (e.g., "Math 101")
   - Total number of lectures
   - Target attendance percentage (default: 75%)
3. Click "Done Setup" when finished

### Daily Usage
1. **Mark Attendance**: Tap the green "+ Mark Attended" button after each lecture
2. **View Progress**: See your attendance percentage and remaining requirements
3. **Safe Skips**: Check how many lectures you can safely miss
4. **Edit Courses**: Use the ⚙️ button to modify course settings

### Tips
- 🎯 **Target Reached**: You'll see confetti when you hit your attendance goal
- ⚠️ **Below Target**: Get warnings when you're at risk of falling below target
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📱 **Mobile First**: Designed to work great on phones

## 🛠 Technical Details

### File Structure
```
attendance-tracker/
├── index.html          # Main HTML structure
├── app.css            # Styling and responsive design
├── app.js             # Core application logic
├── manifest.json      # PWA manifest
├── service-worker.js  # Offline functionality
├── generate-icons.js  # Icon generation script
├── icons/             # Icon files (placeholder)
└── README.md          # This file
```

### Data Structure
```javascript
{
  courses: [
    {
      id: "unique-id",
      name: "Course Name",
      totalLectures: 40,
      targetPercent: 75,
      attended: 25
    }
  ],
  settings: {
    darkMode: false
  }
}
```

### Key Calculations
- **Current Percentage**: `(attended / totalLectures) * 100`
- **Needed to Reach Target**: `Math.ceil((totalLectures * targetPercent/100) - attended)`
- **Safe Skips**: `Math.max(0, remainingLectures - neededToReachTarget)`

### Browser Support
- ✅ Chrome 60+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Edge 79+
- ✅ Mobile browsers with PWA support

## 🎨 Customization

### Colors
Edit the CSS variables in `app.css`:
```css
:root {
    --primary-color: #4f46e5;    /* Main theme color */
    --success-color: #10b981;    /* Success/green */
    --danger-color: #ef4444;     /* Error/red */
    --warning-color: #f59e0b;    /* Warning/orange */
}
```

### Icons
Replace the data URL icons in `manifest.json` and `index.html` with your own PNG/SVG files.

### Course Limits
The app supports unlimited courses - add as many as needed!

## 🔧 Development

### Local Development
1. Make changes to the files
2. Refresh the browser (or hard refresh with Ctrl+F5)
3. Test on different screen sizes
4. Check PWA installation flow

### Testing PWA Features
1. **Install**: Look for "Install" or "Add to Home Screen" in browser menu
2. **Offline**: Disable network and refresh - app should still work
3. **Service Worker**: Check DevTools > Application > Service Workers

### Common Issues
- **Icons not loading**: Ensure manifest.json paths are correct
- **PWA not installing**: Check HTTPS requirement for some features
- **Data not persisting**: Ensure localStorage is enabled

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Built with ❤️ using vanilla web technologies**
