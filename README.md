# 📚 Attendr - Attendance Tracker PWA

A Progressive Web App for students to track their lecture attendance in real-time and maintain their target attendance percentage. Built with vanilla HTML, CSS, and JavaScript. Now optimized for both Android and iOS!

## ✨ Features

### Core Functionality
- **Course Setup**: Add multiple courses with custom attendance targets
- **Real-time Tracking**: Mark attendance for each lecture with one tap
- **Smart Calculations**: Automatically calculates attendance percentage and safe skips
- **Progress Visualization**: Visual progress bars and statistics for each course
- **Dark Mode**: Toggle between light and dark themes
- **Offline Support**: Works completely offline after first load

### PWA Features
- **Installable**: Add to home screen on mobile devices (Android & iOS)
- **Offline Ready**: Service worker caches all assets for offline use
- **Responsive Design**: Works perfectly on phones, tablets, and desktop
- **App-like Experience**: Standalone mode with native app feel
- **iOS Optimized**: Custom install banner, status bar styling, and icons

### User Experience
- **Clean Interface**: Modern, card-based design with glassmorphism effects
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

## 📱 Platform-Specific Installation

### Android/Chrome
- Look for the **"Install"** or **"Add to Home Screen"** icon in the address bar
- Or tap the three-dot menu → "Install app" or "Add to Home screen"

### iOS/Safari
- iOS shows a custom banner: "Add Attendr to Your Home Screen"
- Tap **Share** (square with arrow) → Scroll down → **Add to Home Screen**
- The app will appear on your home screen with a native icon
- **Note**: Dismiss the banner once by tapping the × if you prefer manual installation

### Desktop
- The app works as a responsive web app
- Bookmark for quick access

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
- **iOS Users**: The app runs in standalone mode (no browser UI) for a native feel

## 🛠 Technical Details

### File Structure
```
attendr/
├── index.html          # Main HTML structure with iOS metas
├── app.css            # Styling with dark mode and iOS banner
├── app.js             # Core logic + iOS detection
├── manifest.json      # PWA manifest (Android-focused)
├── service-worker.js  # Offline functionality
├── generate-icons.js  # Icon generation script
├── icons/             # Platform-specific icons
│   ├── icon-180.png   # iOS iPhone icon
│   ├── icon-192.png   # Android/web icon
│   ├── icon-512.png   # High-res icon
│   └── splash.png     # iOS launch screen (optional)
├── README.md          # This file
└── app.css            # Modern, responsive styles
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
    darkMode: false,
    iosBannerDismissed: true  // Tracks if iOS banner was shown
  }
}
```

### Key Calculations
- **Current Percentage**: `(attended / totalLectures) * 100`
- **Needed to Reach Target**: `Math.ceil((totalLectures * targetPercent/100) - attended)`
- **Safe Skips**: `Math.max(0, remainingLectures - neededToReachTarget)`

### iOS-Specific Optimizations
- **Meta Tags**: Black translucent status bar for native look
- **Icons**: 180x180 PNG for iPhone home screen
- **Install Detection**: Custom banner guides users to Share → Add to Home Screen
- **Standalone Mode**: Hides Safari UI when installed
- **Splash Screen**: Optional launch image (replace placeholder)

### Browser Support
- ✅ Chrome 60+ (Android)
- ✅ Safari 11.1+ (iOS 11.3+)
- ✅ Firefox 44+
- ✅ Edge 79+
- ✅ Mobile browsers with PWA support

## 🎨 Customization

### Colors
Edit the CSS variables in `app.css`:
```css
:root {
    --primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);  /* App theme */
    --success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);   /* Success */
}
```

### Icons
- Replace placeholders in `/icons/` with your designs
- Use [maskable.app](https://maskable.app) for adaptive icons
- iOS: 180x180 PNG (icon-180.png)
- Android: 192x192 & 512x512 PNGs
- Splash: 1242x2688 PNG for iOS launch (optional)

### iOS Banner
Customize the message or styling in `app.js` and `app.css`:
- Detection uses `navigator.platform` and touch events
- Banner auto-hides after dismissal (stored in localStorage)

## 🔧 Development

### Local Development
1. Make changes to the files
2. Refresh the browser (or hard refresh with Ctrl+F5)
3. Test on different screen sizes
4. For iOS: Use Safari DevTools or iOS Simulator

### Testing PWA Features
1. **Android Install**: Chrome address bar → Install icon
2. **iOS Install**: Safari → Share → Add to Home Screen (banner guides you)
3. **Offline**: Disable network and refresh - app should still work
4. **Service Worker**: DevTools > Application > Service Workers
5. **Standalone Mode**: Check `window.matchMedia('(display-mode: standalone)')`

### iOS Testing Tips
- **Simulator**: Use Xcode iOS Simulator + Safari DevTools
- **Real Device**: Serve over local network (e.g., `python -m http.server 8000 --bind 0.0.0.0`)
- **Common Issues**:
  - Icons not showing: Ensure HTTPS for production; local HTTP works for testing
  - Banner not appearing: Clear localStorage (`iosBannerDismissed`)
  - Status bar: Test in standalone mode only

### Common Issues
- **Icons not loading**: Ensure paths match in manifest.json and HTML
- **PWA not installing**: Requires HTTPS in production; local HTTP for dev
- **Data not persisting**: Ensure localStorage is enabled
- **iOS Banner**: Only shows on first visit; dismisses permanently

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🤝 Contributing

Submit issues or PRs for features like:
- Push notifications for reminders
- Calendar view for history
- Data export (PDF/CSV)
- More iOS optimizations

---

**Built with ❤️ using vanilla web technologies | iOS & Android Ready**
