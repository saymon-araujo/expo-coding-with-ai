'use client';

import { useRef } from 'react';
import { StyleSheet, View, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PlaybackControls } from '@/components/audio/PlaybackControls';
import { formatTime } from '@/utils/formatTime';

export type Recording = {
  id: string;
  uri: string;
  date: number;
  durationMillis: number;
  isFavorite: boolean;
  name: string;
};

type PlaybackStatus = {
  isLoaded: boolean;
  uri?: string;
  positionMillis: number;
  durationMillis: number;
  isPlaying: boolean;
  didJustFinish: boolean;
  isLooping: boolean;
  error?: string;
};

type RecordingItemProps = {
  recording: Recording;
  isPlaying: boolean;
  playbackStatus: PlaybackStatus | null;
  onPlay: (recording: Recording) => void;
  onPause: () => void;
  onResume: () => void;
  onSeek: (forward: boolean) => void;
  onDelete: (recording: Recording) => void;
  onToggleFavorite: (recording: Recording) => void;
  onRename: (recording: Recording) => void;
};

export function RecordingItem({
  recording,
  isPlaying,
  playbackStatus,
  onPlay,
  onPause,
  onResume,
  onSeek,
  onDelete,
  onToggleFavorite,
  onRename,
}: RecordingItemProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
    });

    return (
      <View style={styles.rightActions}>
        <Animated.View style={[styles.actionButton, { transform: [{ translateX: trans }] }]}>
          <Pressable
            onPress={() => {
              onRename(recording);
              swipeableRef.current?.close();
            }}
            style={[styles.actionButtonInner, styles.renameButton]}
          >
            <Ionicons name="pencil" size={22} color="white" />
          </Pressable>
        </Animated.View>
        <Animated.View style={[styles.actionButton, { transform: [{ translateX: trans }] }]}>
          <Pressable
            onPress={() => {
              onDelete(recording);
              swipeableRef.current?.close();
            }}
            style={[styles.actionButtonInner, styles.deleteButton]}
          >
            <Ionicons name="trash" size={22} color="white" />
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  const formattedDate = new Date(recording.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = new Date(recording.date).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} friction={2} rightThreshold={40}>
      <ThemedView style={styles.container}>
        <Pressable
          onPress={() => (isPlaying ? onPause() : onPlay(recording))}
          style={({ pressed }) => [styles.content, pressed && styles.pressed]}
        >
          <View style={styles.mainContent}>
            <View style={styles.iconContainer}>
              <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={36} color="#007AFF" />
            </View>

            <View style={styles.textContent}>
              <View style={styles.titleRow}>
                <ThemedText numberOfLines={1} style={styles.title}>
                  {recording.name}
                </ThemedText>
                <Pressable
                  onPress={() => onToggleFavorite(recording)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={recording.isFavorite ? 'heart' : 'heart-outline'}
                    size={20}
                    color={recording.isFavorite ? '#FF3B30' : '#8E8E93'}
                  />
                </Pressable>
              </View>

              <View style={styles.metaRow}>
                <ThemedText style={styles.duration}>{formatTime(recording.durationMillis)}</ThemedText>
                <ThemedText style={styles.date}>
                  {formattedDate} • {formattedTime}
                </ThemedText>
              </View>

              {isPlaying && playbackStatus && (
                <View style={styles.playbackContainer}>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${
                            playbackStatus.durationMillis
                              ? (playbackStatus.positionMillis / playbackStatus.durationMillis) * 100
                              : 0
                          }%`,
                        },
                      ]}
                    />
                  </View>

                  <PlaybackControls
                    isPlaying={playbackStatus.isPlaying}
                    onPlayPause={playbackStatus.isPlaying ? onPause : onResume}
                    onSeekBackward={() => onSeek(false)}
                    onSeekForward={() => onSeek(true)}
                    currentTime={formatTime(playbackStatus.positionMillis)}
                    totalTime={formatTime(playbackStatus.durationMillis)}
                  />
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </ThemedView>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    padding: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  date: {
    fontSize: 14,
    color: '#8E8E93',
  },
  playbackContainer: {
    marginTop: 12,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  rightActions: {
    flexDirection: 'row',
    width: 160,
    height: '100%',
  },
  actionButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  renameButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
});
