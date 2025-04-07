# News Aggregator

A news aggregation website that fetches, summarizes, and converts news to audio in multiple Indian languages.

## Features

- Fetches top 100 English news articles using News API
- Ensures at least 50% of news content comes from India
- AI-powered summarization of articles
- Text-to-voice conversion
- Translation to multiple Indian languages
- Responsive design with mobile and desktop views
- Automatic news updates (hourly and every 6 hours)

## Tech Stack

- Frontend: React, Tailwind CSS, Shadcn UI
- Backend: Node.js, Express
- AI Services: Groq API for summarization and translation
## Deployment Instructions for Render

### Prerequisites

1. GitHub account
2. Render account
3. News API key
4. Groq API key

### Steps to Deploy

1. Push this repository to GitHub
2. Log in to Render and create a new Web Service
3. Connect your GitHub repository
4. Configure the service settings:
   - Environment: Node
   - Build Command: npm run build
   - Start Command: npm start
4. Configure the service with the following settings:
   - Environment: Node
   - Build Command: npm run build
   - Start Command: npm start
5. Add environment variables:
   - NEWS_API_KEY: Your News API key
   - GROQ_API_KEY: Your Groq API key
6. Deploy the service

## Local Development

1. Clone the repository
2. Create a .env file based on .env.example with your API keys
3. Install dependencies using npm
4. Run the development server with npm run dev

## License

MIT
