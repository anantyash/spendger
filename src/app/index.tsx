import { Redirect } from "expo-router";

export default function IndexPage() {
  // This is the absolute root route (/).
  // When a user lands here, we instantly route them to the onboarding/login section.
  // The global _layout.tsx will intercept this and auto-redirect them to /(tabs)/home if they are already logged in!
  return <Redirect href="/(auth)/welcome" />;
}
