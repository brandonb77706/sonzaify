# Sonzaify - Custom Spotify Playlist Creator

## Description

Sonzaify is a modern web application that simplifies the process of creating and managing Spotify playlists. Built with React and the Spotify Web API, it offers an intuitive interface for searching, adding, and organizing tracks into custom playlists.

## Features

- **Spotify Authentication**: Secure OAuth 2.0 integration with Spotify's API
- **Real-time Search**: Instant track search results from Spotify's vast library
- **Playlist Management**:
  - Add/remove tracks with visual feedback
  - Custom playlist naming
  - Bulk track management
  - Duplicate track prevention
- **Modern UI/UX**:
  - Custom scrollbars for enhanced navigation
  - Inter font integration for improved readability
  - Responsive design for all screen sizes
  - Smooth animations and transitions
  - Visual feedback for user actions

## Technical Stack

- **Frontend**: React.js
- **Styling**: Custom CSS with flexbox layouts
- **Authentication**: Spotify OAuth 2.0
- **API**: Spotify Web API
- **State Management**: React Hooks
- **Font**: Inter (Google Fonts)

## Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Create `.env` file with Spotify API credentials
4. Run `npm start` for development

## Environment Setup

Required environment variables:

```properties
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id
REACT_APP_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

## Usage

1. Connect your Spotify account
2. Search for tracks using the search bar
3. Click '+' to add tracks to your playlist
4. Name your playlist
5. Save to your Spotify account

## Design Philosophy

- Clean and minimal interface
- Intuitive user interactions
- Spotify-inspired aesthetics
- Responsive and accessible design

## Future Enhancements

- Drag-and-drop track reordering
- Advanced playlist filtering
- Collaborative playlist features
- Audio previews
