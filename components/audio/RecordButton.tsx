'use client';
import { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';

type RecordButtonProps = {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
};

export function RecordButton({ isRecording, onStartRecording, onStopRecording }: RecordButtonProps) {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [recordingTime, setRecordingTime] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Pulse animation when recording
  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation | null = null;

    if (isRecording) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Start timer
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimer(interval);
    } else {
      // Reset timer
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
      setRecordingTime(0);
    }

    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={styles.timerContainer}>
          <View style={styles.recordingIndicator} />
          <ThemedText style={styles.timerText}>{formatTime(recordingTime)}</ThemedText>
        </View>
      )}

      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Pressable
          style={[styles.button, isRecording ? styles.recordingButton : styles.idleButton]}
          onPress={isRecording ? onStopRecording : onStartRecording}
          android_ripple={{ color: 'rgba(255,255,255,0.2)', radius: 70 }}
        >
          <Ionicons name={isRecording ? 'stop' : 'mic'} size={40} color="white" />
        </Pressable>
      </Animated.View>

      <ThemedText style={styles.buttonText}>{isRecording ? 'Tap to stop' : 'Tap to record'}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  buttonWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderRadius: 100,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleButton: {
    backgroundColor: '#007AFF',
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
