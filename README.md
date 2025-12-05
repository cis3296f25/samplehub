# SampleHub

A modern web application for discovering, organizing, and uploading audio loops & samples. Search through sounds, build your own packs, and spark new musical ideas!

<p align="center">
  <img width="1000" alt="SampleHub Image" src="https://github.com/user-attachments/assets/1ad4db44-cd9e-48fa-95f9-e7475b7d2f6d" />
</p>

## Live Demo
**[SampleHub website](https://samplehub.jyyhuang.com)**

## Features
- **Search**: Find samples by title, genre, and duration
- **YouTube Discovery**: Discover new sounds from a curated music sample playlist
- **Save Favorites**: Save your favorite samples for quick & easy access
- **Sample Packs**: Organize samples into custom collections
- **Upload Sounds**: Share your original audio creations

## Installation
### Prerequisites

- Node.js (v14 or higher)
- npm
- PostgreSQL database
- Firebase account
- Freesound API key
  
**Choose your branch:**
- `main` - Stable release version
- `dev` - Latest development features

1. To run locally, first **Clone the repository**:
```bash
git clone https://github.com/cis3296f25/samplehub.git
cd samplehub
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Setup

To run SampleHub with your own infrastructure, you'll need to set up:
1. **Firebase**
   - Create a Firebase project
   - Download your `serviceAccountKey.json`
   - Place it in the backend directory
   - Change `frontend/src/Components/firebaseConfig.jsx` to your project details

2. **API Keys**
   - Get a [Freesound API key](https://freesound.org/docs/api/)

3. **Environment Variables**

Create `.env` files in the backend directory with the following variables:
```bash
POSTGRES_HOST=your_postgres_host
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=your_database_name
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
FREESOUND_API_KEY=your_freesound_api_key
```

> **Note:** Adjust these variables based on your specific database provider

4. **Database Schema**
   - Upload the SQL schema to your PostgreSQL database

### Running the Application

1. **Start the backend server**
```bash
cd backend
npm run start
```

2. **Start the frontend development server**
```bash
cd frontend
npm run dev
```

3. **Open your browser**

Navigate to `http://localhost:5173`

## Contributing

We welcome contributions! Here's how you can help:

1. Check our [project board](https://github.com/orgs/cis3296f25/projects/58/views/1) for current tasks and status
2. Fork the repository
3. Create a feature branch (`git checkout -b feature/new-feature`)
4. Commit your changes (`git commit -m 'Add some new feature'`)
5. Push to the branch (`git push origin feature/new-feature`)
6. Open a Pull Request
