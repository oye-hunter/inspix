import { Redirect } from 'expo-router';

// This file redirects to the appropriate initial route
export default function IndexRedirect() {
  return <Redirect href="/(auth)/sign-in" />;
}
