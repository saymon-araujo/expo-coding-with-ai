import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';

type PlaybackControlsProps = {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  currentTime: string;
  totalTime: string;
};

export function PlaybackControls({
  isPlaying,
  onPlayPause,
  onSeekBackward,
  onSeekForward,
  currentTime,
  totalTime,
}: PlaybackControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.timeInfo}>
        <ThemedText style={styles.timeText}>
          {currentTime} / {totalTime}
        </ThemedText>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={onSeekBackward} style={styles.controlButton} hitSlop={10}>
          <Ionicons name="play-back" size={22} color="#007AFF" />
        </Pressable>

        <Pressable onPress={onPlayPause} style={styles.playPauseButton}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="white" />
        </Pressable>

        <Pressable onPress={onSeekForward} style={styles.controlButton} hitSlop={10}>
          <Ionicons name="play-forward" size={22} color="#007AFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
  },
  playPauseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
});
