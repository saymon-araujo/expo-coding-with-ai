import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';

type EmptyStateProps = {
  type: 'no-recordings' | 'no-favorites' | 'no-results';
};

export function EmptyState({ type }: EmptyStateProps) {
  let icon = 'mic-outline';
  let title = 'No recordings yet';
  let message = 'Tap the record button to create your first recording';

  if (type === 'no-favorites') {
    icon = 'heart-outline';
    title = 'No favorites yet';
    message = 'Mark recordings as favorites to see them here';
  } else if (type === 'no-results') {
    icon = 'search-outline';
    title = 'No matching recordings';
    message = 'Try adjusting your search or filters';
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={64} color="#8E8E93" />
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  iconContainer: {
    marginBottom: 16,
    opacity: 0.7,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#8E8E93',
    maxWidth: 250,
  },
});
