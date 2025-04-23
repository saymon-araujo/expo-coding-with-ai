import { StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AboutScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8D0F0', dark: '#3D2A47' }}
      headerImage={
        <IconSymbol size={310} color="#9E7EB9" name="info.circle" style={styles.headerImage} />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">About Rosebud</ThemedText>
      </ThemedView>

      <ThemedText>
        Rosebud is a mobile application built with React Native and Expo, designed to showcase
        modern mobile development techniques.
      </ThemedText>

      <Collapsible title="Project Overview">
        <ThemedText>
          This project demonstrates a well-structured React Native application with multiple
          screens, custom components, and animations.
        </ThemedText>
        <ThemedText>
          The app follows best practices for mobile development including responsive design, theme
          support, and accessibility considerations.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Technologies">
        <ThemedText>• React Native - Cross-platform mobile framework</ThemedText>
        <ThemedText>• Expo - Development platform for React Native</ThemedText>
        <ThemedText>• React Navigation - Navigation library</ThemedText>
        <ThemedText>• Reanimated - Animation library</ThemedText>
        <ExternalLink href="https://reactnative.dev/">
          <ThemedText type="link">Learn more about React Native</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Features">
        <ThemedText>• File-based routing with Expo Router</ThemedText>
        <ThemedText>• Dark and light mode support</ThemedText>
        <ThemedText>• Custom animations and transitions</ThemedText>
        <ThemedText>• Platform-specific optimizations</ThemedText>
        <ThemedText>• Responsive design for various device sizes</ThemedText>
      </Collapsible>

      <Collapsible title="Team">
        <ThemedText>
          This project was created by a team of dedicated developers passionate about creating
          exceptional mobile experiences.
        </ThemedText>
        <ThemedText>
          We're constantly working to improve and expand the application with new features and
          optimizations.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Version">
        <ThemedText>Current Version: 1.0.0</ThemedText>
        <ThemedText>Last Updated: April 2024</ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    right: 50,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
});
