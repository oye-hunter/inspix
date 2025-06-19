# Inspix - Social Media App

Inspix is a mobile social media application built with Expo and React Native, using Supabase as the backend. The app allows users to create posts with images, like and comment on posts, and manage their profiles.

## Features

- 📱 **User Authentication**: Sign up, sign in, and profile management
- 🖼️ **Image Posting**: Upload images from camera or gallery
- ❤️ **Social Interactions**: Like and comment on posts
- 👤 **User Profiles**: View and edit user profiles
- 🌓 **Theme Support**: Light and dark mode
- 📊 **Feed and Trending**: View posts from all users or trending content

## Tech Stack

- **Frontend**
  - [React Native](https://reactnative.dev/) - Mobile app framework
  - [Expo](https://expo.dev/) - React Native toolchain and platform
  - [Expo Router](https://expo.github.io/router/docs/) - File-based routing for navigation
  - [TypeScript](https://www.typescriptlang.org/) - Type safety and developer experience
  - [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) - Animations

- **Backend**
  - [Supabase](https://supabase.com/) - Backend as a Service (BaaS)
    - Authentication
    - PostgreSQL Database
    - Storage for images
    - Row Level Security (RLS) for data protection

- **Other Libraries**
  - [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) - For capturing photos and selecting from gallery
  - [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/) - File operations
  - [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) - Secure credential storage
  - [React Native NetInfo](https://github.com/react-native-netinfo/react-native-netinfo) - Network connectivity

## Project Structure

```
inspix/
├── app/                      # Main application code with file-based routing
│   ├── (auth)/               # Authentication screens
│   ├── (tabs)/               # Main tab screens (Feed, Trending, Profile)
│   └── _layout.tsx           # Root layout
├── assets/                   # Static assets like images and fonts
├── components/               # Reusable React components
│   ├── ui/                   # UI components
│   ├── PostCard.tsx          # Post display component
│   └── PostCreationModal.tsx # Modal for creating new posts
├── constants/                # App constants
│   └── Colors.ts             # Color scheme definitions
├── context/                  # React Context providers
│   └── AuthContext.tsx       # Authentication state management
├── hooks/                    # Custom React hooks
│   ├── useColorScheme.ts     # Theme management
│   ├── useThemeColor.ts      # Theme color utilities
│   └── usePostsStorage.ts    # Post data management
├── lib/                      # Library configurations
│   └── supabase.ts           # Supabase client setup
├── styles/                   # Shared styles
│   └── authStyles.ts         # Styles for auth screens
├── supabase/                 # Supabase related files
│   ├── create_social_tables.sql  # SQL for creating social tables
│   └── create_storage_bucket.sql # SQL for storage setup
└── utils/                    # Utility functions
    ├── dateUtils.ts          # Date formatting
    └── networkUtils.ts       # Network connectivity helpers
```

## Supabase Schema

The app uses the following database tables:

1. **auth.users** - Managed by Supabase Auth
2. **user_info** - User profile information
3. **posts** - User posts with images
4. **likes** - Post likes
5. **comments** - Post comments

The app also uses Supabase Storage with the following bucket:
- **posts** - Stores post images in the structure: `posts/<user_id>/<post_id>.jpg`

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Supabase Account](https://supabase.com/)

### Environment Setup

1. Create a `.env` file in the root directory with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npx expo start
```

### Database Setup

1. Create a new Supabase project
2. Run the SQL scripts in the `supabase` folder to set up tables and storage
3. Configure authentication providers in the Supabase dashboard

## Running on Device/Simulator

- For iOS: `npx expo run:ios`
- For Android: `npx expo run:android`
- Using Expo Go: Scan the QR code from the Expo CLI with the Expo Go app

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Supabase](https://supabase.com/)
- [MaterialIcons](https://fonts.google.com/icons)
