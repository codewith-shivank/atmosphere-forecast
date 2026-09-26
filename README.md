# 🌦️ Atmosphere Weather

A clean, modern, and production-ready **Weather Dashboard** built with **React 19**, **TypeScript**, and **Tailwind CSS**. It provides real-time weather updates, a 24-hour hourly forecast, and a 7-day extended forecast — **100% free with NO API key required**!

---

## ✨ Features

- **🌡️ Live Weather Conditions**: Instant updates for temperature, feels-like, humidity, wind speed, pressure, visibility, UV index, and dew point.
- **⏱️ 24-Hour Hourly Forecast**: Smooth horizontal scroll showing temperature trends and precipitation chances hour by hour.
- **📅 7-Day Extended Forecast**: Daily high & low temperature range indicators and weather condition icons.
- **🔍 Smart City Search**: Search any city in the world with instant suggestions (debounced for performance).
- **📍 Auto-Location Detection**: One-click geolocation button to fetch local weather automatically.
- **⭐ Favorites & Recents**: Star your favorite cities for quick 1-click access.
- **🌡️ °C / °F Unit Toggle**: Easily switch between Celsius and Fahrenheit (also converts wind speed, pressure, and visibility).
- **🌙 Light & Dark Mode**: Supports Light mode, Dark mode, and System default auto-switching.
- **📱 Fully Responsive**: Optimized for Mobile, Tablet, and Desktop screens.
- **⚡ Fast & Cached**: Built-in 2-minute memory cache to avoid unnecessary network requests.

---

## 🛠️ Tech Stack

| Tool / Library | Purpose |
| :--- | :--- |
| **[React 19](https://react.dev/)** | Frontend UI Framework |
| **[TypeScript](https://www.typescriptlang.org/)** | Type-safe JavaScript |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Modern Utility-First Styling |
| **[Framer Motion](https://www.framer.com/motion/)** | Smooth UI Animations |
| **[Lucide React](https://lucide.dev/)** | Weather & UI Icons |
| **[Vite 6](https://vitejs.dev/)** | Lightning-fast Build Tool |
| **[Open-Meteo API](https://open-meteo.com/)** | Free Weather Data (No API Key Required) |

---

## 📂 Project Structure Explained

```text
atmosphere-weather/
├── src/
│   ├── components/         # Reusable UI parts (Header, Weather cards, Forecast lists)
│   ├── hooks/              # Custom React hooks (useWeather for data fetching & state)
│   ├── services/           # API handlers for weather data and geocoding
│   ├── types/              # TypeScript definitions & data models
│   ├── utils/              # Helper functions (unit conversions, date formatting)
│   ├── App.tsx             # Main dashboard layout
│   └── index.css           # Global styles and Tailwind imports
├── public/                 # Static assets (favicons, icons)
├── package.json            # Project dependencies & scripts
├── vite.config.ts          # Vite build configuration
└── README.md               # Project documentation
```

---

## 🚀 Quick Start Guide

Follow these simple steps to run Atmosphere Weather on your computer:

### 1. Prerequisites
Make sure you have **[Node.js](https://nodejs.org/)** installed (version 18 or higher recommended).

### 2. Clone the Repository
```bash
git clone https://github.com/codewithshivank/atmosphere-weather.git
cd atmosphere-weather
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Local Development Server
```bash
npm run dev
```

Open your browser and navigate to **`http://localhost:3000`** to view the app!

---

## 🔑 Environment Variables

> **Note:** Atmosphere Weather works out of the box without any API keys! 

If you want to customize port or prepare for future backend integrations, check [`.env.example`](.env.example).

---

## 📜 Available Scripts

In the project directory, you can run:

- **`npm run dev`**: Starts the dev server at `http://localhost:3000`.
- **`npm run build`**: Builds the production-ready bundle into the `dist/` folder.
- **`npm run preview`**: Previews the production build locally.
- **`npm run lint`**: Checks TypeScript type safety across all files.

---

## 🌐 Deployment

You can easily deploy this project for free on platforms like **Vercel** or **Netlify**:

1. Push your code to GitHub.
2. Import your repository into **[Vercel](https://vercel.com/)** or **[Netlify](https://netlify.com/)**.
3. Framework preset will automatically be detected as **Vite**.
4. Click **Deploy**!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [Issues page](https://github.com/codewithshivank/atmosphere-weather/issues).

---

## 📄 License

This project is [MIT](LICENSE) licensed. Made with ❤️ by [CodeWithShivank](https://github.com/codewithshivank).

