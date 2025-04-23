import { StyleSheet, View, Modal, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type EditNameModalProps = {
  visible: boolean;
  recordingName: string;
  onNameChange: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function EditNameModal({
  visible,
  recordingName,
  onNameChange,
  onSave,
  onCancel,
}: EditNameModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Edit Recording Name</ThemedText>
            <Pressable onPress={onCancel} hitSlop={10}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </Pressable>
          </View>

          <TextInput
            style={styles.input}
            value={recordingName}
            onChangeText={onNameChange}
            placeholder="Enter recording name"
            placeholderTextColor="#8E8E93"
            autoFocus
            selectTextOnFocus
          />

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.saveButton, !recordingName.trim() && styles.disabledButton]}
              onPress={onSave}
              disabled={!recordingName.trim()}
            >
              <ThemedText style={styles.saveText}>Save</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  saveText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
});
