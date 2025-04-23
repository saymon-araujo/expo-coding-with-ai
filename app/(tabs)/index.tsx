'use client';

import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, FlatList, Alert, Platform, SafeAreaView } from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RecordButton } from '@/components/audio/RecordButton';
import { RecordingItem, type Recording } from '@/components/audio/RecordingItem';
import { FilterBar } from '@/components/audio/FilterBar';
import { EditNameModal } from '@/components/audio/EditNameModal';
import { EmptyState } from '@/components/audio/EmptyState';

// Define the directory to store recordings
const RECORDING_DIR = FileSystem.documentDirectory + 'recordings/';
const METADATA_STORAGE_KEY = '@AudioRecordingsMetadata';

// Ensure the recording directory exists
async function ensureDirExists() {
  const dirInfo = await FileSystem.getInfoAsync(RECORDING_DIR);
  if (!dirInfo.exists) {
    console.log("Recording directory doesn't exist, creating...");
    await FileSystem.makeDirectoryAsync(RECORDING_DIR, { intermediates: true });
  }
}

// Type for playback status
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

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentPlaying, setCurrentPlaying] = useState<Recording | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [editingRecording, setEditingRecording] = useState<Recording | null>(null);
  const [newRecordingName, setNewRecordingName] = useState('');

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // --- Effects ---

  useEffect(() => {
    // Request permissions on mount
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permissions required', 'Audio recording permission is needed to use this feature.');
      } else {
        // Set audio mode for playback and recording
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: false, // Play through speaker
        });
        // Ensure directory exists and load recordings
        await ensureDirExists();
        loadRecordings();
      }
    })();

    // Cleanup function to unload sound
    return () => {
      unloadSound();
      // Optional: Stop recording if component unmounts while recording
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  // --- Recording Logic ---

  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert('Permissions denied', 'Cannot record without audio permissions.');
      return;
    }
    if (isRecording) return; // Prevent starting multiple recordings

    // Make sure any previous sound is unloaded
    if (soundRef.current) {
      await unloadSound();
    }

    try {
      console.log('Preparing to record...');
      // Ensure directory exists
      await ensureDirExists();

      // Configure audio mode explicitly before recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });

      // Custom options with specific output format
      const recordingOptions: Audio.RecordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      console.log('Creating recording with options:', JSON.stringify(recordingOptions));
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      recordingRef.current = recording;
      setIsRecording(true);
      console.log('Recording started successfully');
    } catch (err: any) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
      Alert.alert('Error', `Failed to start recording: ${err.message || 'Unknown error'}`);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) {
      console.warn('No active recording to stop');
      setIsRecording(false);
      return;
    }

    console.log('Stopping recording...');
    try {
      setIsRecording(false);

      // Get status before stopping to ensure we have access to duration
      const status = await recordingRef.current.getStatusAsync();
      console.log('Recording status before stopping:', JSON.stringify(status));

      // Stop the recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      console.log('Recording stopped, URI:', uri);

      // Verify file exists and has content
      if (uri) {
        const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });
        console.log('File info:', JSON.stringify(fileInfo));

        if (fileInfo.exists && (fileInfo as any).size > 0 && status.durationMillis > 0) {
          console.log('Recording saved successfully. Duration:', status.durationMillis);
          // Generate default name based on date and time
          const now = new Date();
          const defaultName = `Recording ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

          const newRecording: Recording = {
            id: Date.now().toString(),
            uri: uri,
            date: Date.now(),
            durationMillis: status.durationMillis,
            isFavorite: false,
            name: defaultName,
          };

          const updatedRecordings = [...recordings, newRecording].sort((a, b) => b.date - a.date);
          setRecordings(updatedRecordings);
          await saveRecordings(updatedRecordings);
          Alert.alert('Success', 'Recording saved successfully.');
        } else {
          console.warn(
            'Recording file issue: exists=',
            fileInfo.exists,
            'size=',
            (fileInfo as any).size,
            'duration=',
            status.durationMillis
          );
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(uri);
          }
          Alert.alert(
            'Recording Failed',
            'The recording was either empty or too short. Please try again and speak closer to the microphone.'
          );
        }
      } else {
        console.error('No URI returned from recording');
        Alert.alert('Error', 'Failed to save recording: No file path returned');
      }
    } catch (error: any) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', `Failed to stop recording: ${error?.message || 'Unknown error'}`);
    }

    // Always clean up the recording reference
    recordingRef.current = null;
  };

  // --- Playback Logic ---

  const unloadSound = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setPlaybackStatus(null);
    setCurrentPlaying(null);
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) {
      // Handle unloading or errors during playback
      if (status.error) {
        console.error(`Playback Error: ${status.error}`);
        Alert.alert('Playback Error', status.error);
        unloadSound();
      }
    } else {
      // Update playback status state
      setPlaybackStatus(status as PlaybackStatus);

      // If playback just finished
      if (status.didJustFinish && !status.isLooping) {
        console.log('Playback finished');
      }
    }
  };

  const playRecording = async (recording: Recording) => {
    // If another sound is playing or loading, unload it first
    if (soundRef.current) {
      await unloadSound();
    }
    if (currentPlaying?.id === recording.id && playbackStatus?.isPlaying) {
      // If the same recording is already playing, pause it
      pausePlayback();
      return;
    }

    console.log('Loading Sound for URI:', recording.uri);
    setCurrentPlaying(recording);
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: recording.uri },
        { shouldPlay: true }, // Start playing immediately
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      console.log('Playback started');
    } catch (error: any) {
      console.error('Failed to load or play sound', error);
      Alert.alert('Error', `Failed to play recording: ${error?.message || 'Unknown error'}`);
      setCurrentPlaying(null); // Reset current playing if loading fails
      setPlaybackStatus(null);
    }
  };

  const pausePlayback = async () => {
    if (soundRef.current && playbackStatus?.isPlaying) {
      await soundRef.current.pauseAsync();
      console.log('Playback paused');
      // Status update will be triggered by onPlaybackStatusUpdate
    }
  };

  const resumePlayback = async () => {
    if (soundRef.current && !playbackStatus?.isPlaying) {
      await soundRef.current.playAsync();
      console.log('Playback resumed');
      // Status update will be triggered by onPlaybackStatusUpdate
    }
  };

  const seekPlayback = async (forward: boolean) => {
    if (soundRef.current && playbackStatus?.isLoaded && playbackStatus.durationMillis) {
      const seekMillis = 15000; // 15 seconds
      const currentPosition = playbackStatus.positionMillis;
      const duration = playbackStatus.durationMillis;
      let newPosition = forward ? currentPosition + seekMillis : currentPosition - seekMillis;

      // Clamp position within bounds [0, duration]
      newPosition = Math.max(0, Math.min(newPosition, duration));

      await soundRef.current.setPositionAsync(newPosition);
      console.log(`Seeked ${forward ? 'forward' : 'backward'} to ${newPosition}ms`);
    }
  };

  // --- Data Management ---

  const saveRecordings = async (data: Recording[]) => {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(METADATA_STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Failed to save recordings metadata.', e);
      Alert.alert('Error', 'Could not save recording data.');
    }
  };

  const loadRecordings = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(METADATA_STORAGE_KEY);
      const loadedRecordings = jsonValue != null ? JSON.parse(jsonValue) : [];

      // Optional: Verify files still exist, remove metadata if not
      const verifiedRecordings = [];
      for (const rec of loadedRecordings) {
        const fileInfo = await FileSystem.getInfoAsync(rec.uri);
        if (fileInfo.exists) {
          verifiedRecordings.push(rec);
        } else {
          console.warn(`Recording file not found, removing metadata: ${rec.uri}`);
        }
      }

      // Sort by date descending
      verifiedRecordings.sort((a, b) => b.date - a.date);
      setRecordings(verifiedRecordings);

      // If metadata was cleaned, save the updated list
      if (verifiedRecordings.length < loadedRecordings.length) {
        await saveRecordings(verifiedRecordings);
      }
    } catch (e) {
      console.error('Failed to load recordings metadata.', e);
      setRecordings([]); // Start fresh if loading fails
      Alert.alert('Error', 'Could not load existing recordings.');
    }
  };

  const deleteRecording = async (recordingToDelete: Recording) => {
    Alert.alert('Delete Recording', 'Are you sure you want to delete this recording?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          // If this recording is currently playing, stop it
          if (currentPlaying?.id === recordingToDelete.id) {
            await unloadSound();
          }

          // Delete the file
          try {
            await FileSystem.deleteAsync(recordingToDelete.uri);
            console.log('Deleted file:', recordingToDelete.uri);
          } catch (error) {
            console.error('Failed to delete recording file:', error);
            Alert.alert('Error', 'Failed to delete the recording file.');
            // Decide if you want to proceed with removing metadata even if file deletion fails
          }

          // Remove from state and storage
          const updatedRecordings = recordings.filter(rec => rec.id !== recordingToDelete.id);
          setRecordings(updatedRecordings);
          await saveRecordings(updatedRecordings);
        },
      },
    ]);
  };

  const toggleFavorite = async (recordingToToggle: Recording) => {
    const updatedRecordings = recordings.map(rec =>
      rec.id === recordingToToggle.id ? { ...rec, isFavorite: !rec.isFavorite } : rec
    );
    setRecordings(updatedRecordings);
    await saveRecordings(updatedRecordings);
  };

  // --- Name Editing ---

  const openEditNameModal = (recording: Recording) => {
    setEditingRecording(recording);
    setNewRecordingName(recording.name);
  };

  const saveRecordingName = async () => {
    if (!editingRecording || !newRecordingName.trim()) return;

    const updatedRecordings = recordings.map(rec =>
      rec.id === editingRecording.id ? { ...rec, name: newRecordingName.trim() } : rec
    );

    setRecordings(updatedRecordings);
    await saveRecordings(updatedRecordings);

    // Update currentPlaying if it's the edited recording
    if (currentPlaying?.id === editingRecording.id) {
      setCurrentPlaying({ ...currentPlaying, name: newRecordingName.trim() });
    }

    // Close modal
    setEditingRecording(null);
    setNewRecordingName('');
  };

  // --- Filtering ---

  const handleClearFilters = () => {
    setSearchQuery('');
    setIsDateFilterActive(false);
    setStartDate(null);
    setEndDate(null);
  };

  const handleSelectStartDate = () => {
    // In a real app, you would show a date picker here
    // For now, we'll simulate by setting a date directly
    const date = new Date();
    date.setDate(date.getDate() - 7); // One week ago
    setStartDate(date);
    Alert.alert('Start Date', 'Selected: ' + date.toLocaleDateString());
  };

  const handleSelectEndDate = () => {
    // In a real app, you would show a date picker here
    const date = new Date();
    setEndDate(date);
    Alert.alert('End Date', 'Selected: ' + date.toLocaleDateString());
  };

  const toggleDateFilter = () => {
    if (startDate && endDate) {
      setIsDateFilterActive(!isDateFilterActive);
    } else {
      Alert.alert('Invalid Date Range', 'Please select both start and end dates.');
    }
  };

  // Filter recordings based on active tab, search query, and date filter
  const getFilteredRecordings = () => {
    return recordings
      .filter(rec => activeTab === 'all' || rec.isFavorite)
      .filter(rec => {
        // Search by name
        if (searchQuery.trim()) {
          return rec.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      })
      .filter(rec => {
        // Filter by date range
        if (isDateFilterActive && startDate && endDate) {
          const recordingDate = new Date(rec.date);
          // Set end date time to end of day for inclusive comparison
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);

          return recordingDate >= startDate && recordingDate <= endDateTime;
        }
        return true;
      });
  };

  const filteredRecordings = getFilteredRecordings();

  // --- Empty State Logic ---

  const getEmptyStateType = () => {
    if (recordings.length === 0) {
      return 'no-recordings';
    }
    if (activeTab === 'favorites' && !recordings.some(rec => rec.isFavorite)) {
      return 'no-favorites';
    }
    if (filteredRecordings.length === 0) {
      return 'no-results';
    }
    return null;
  };

  // --- Main Render ---

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Requesting permissions...</ThemedText>
      </ThemedView>
    );
  }
  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No access to microphone. Please enable it in settings.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <ThemedText type="title">Voice Recorder</ThemedText>
          </View>

          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isDateFilterActive={isDateFilterActive}
            onToggleDateFilter={toggleDateFilter}
            onClearFilters={handleClearFilters}
            onSelectStartDate={handleSelectStartDate}
            onSelectEndDate={handleSelectEndDate}
            startDate={startDate}
            endDate={endDate}
          />

          <FlatList
            data={filteredRecordings}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <RecordingItem
                recording={item}
                isPlaying={currentPlaying?.id === item.id}
                playbackStatus={currentPlaying?.id === item.id ? playbackStatus : null}
                onPlay={playRecording}
                onPause={pausePlayback}
                onResume={resumePlayback}
                onSeek={seekPlayback}
                onDelete={deleteRecording}
                onToggleFavorite={toggleFavorite}
                onRename={openEditNameModal}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={getEmptyStateType() && <EmptyState type={getEmptyStateType() as any} />}
          />

          <View style={styles.footer}>
            <RecordButton
              isRecording={isRecording}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
            />
          </View>

          <EditNameModal
            visible={!!editingRecording}
            recordingName={newRecordingName}
            onNameChange={setNewRecordingName}
            onSave={saveRecordingName}
            onCancel={() => setEditingRecording(null)}
          />
        </ThemedView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
    marginTop: Platform.OS === 'android' ? 20 : 0,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for the record button
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  },
});
