'use client';

import { useState } from 'react';
import { StyleSheet, View, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type FilterBarProps = {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  activeTab: 'all' | 'favorites';
  onTabChange: (tab: 'all' | 'favorites') => void;
  isDateFilterActive: boolean;
  onToggleDateFilter: () => void;
  onClearFilters: () => void;
  onSelectStartDate: () => void;
  onSelectEndDate: () => void;
  startDate: Date | null;
  endDate: Date | null;
};

export function FilterBar({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  isDateFilterActive,
  onToggleDateFilter,
  onClearFilters,
  onSelectStartDate,
  onSelectEndDate,
  startDate,
  endDate,
}: FilterBarProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerHeight = useSharedValue(0);

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
    datePickerHeight.value = withTiming(showDatePicker ? 0 : 80);
  };

  const datePickerStyle = useAnimatedStyle(() => {
    return {
      height: datePickerHeight.value,
      opacity: datePickerHeight.value === 0 ? 0 : 1,
      overflow: 'hidden',
    };
  });

  return (
    <ThemedView style={styles.container}>
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => onTabChange('all')}
          android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
        >
          <ThemedText style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => onTabChange('favorites')}
          android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
        >
          <Ionicons name="heart" size={16} color={activeTab === 'favorites' ? 'white' : '#8E8E93'} />
          <ThemedText style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
            Favorites
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recordings..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={onSearchChange}
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterButton, isDateFilterActive && styles.activeFilterButton]}
          onPress={toggleDatePicker}
        >
          <Ionicons name="calendar" size={18} color={isDateFilterActive ? 'white' : '#007AFF'} />
          <ThemedText style={[styles.filterText, isDateFilterActive && styles.activeFilterText]}>
            {isDateFilterActive ? 'Date Filter Active' : 'Date Filter'}
          </ThemedText>
        </Pressable>

        {(searchQuery.length > 0 || isDateFilterActive) && (
          <Pressable style={styles.clearButton} onPress={onClearFilters}>
            <ThemedText style={styles.clearText}>Clear All</ThemedText>
          </Pressable>
        )}
      </View>

      <Animated.View style={[styles.datePickerContainer, datePickerStyle]}>
        <View style={styles.dateRow}>
          <Pressable style={styles.dateButton} onPress={onSelectStartDate}>
            <Ionicons name="calendar-outline" size={16} color="#007AFF" />
            <ThemedText style={styles.dateText}>
              {startDate ? startDate.toLocaleDateString() : 'Start Date'}
            </ThemedText>
          </Pressable>

          <ThemedText style={styles.dateToText}>to</ThemedText>

          <Pressable style={styles.dateButton} onPress={onSelectEndDate}>
            <Ionicons name="calendar-outline" size={16} color="#007AFF" />
            <ThemedText style={styles.dateText}>
              {endDate ? endDate.toLocaleDateString() : 'End Date'}
            </ThemedText>
          </Pressable>
        </View>

        <Pressable
          style={[styles.applyButton, (!startDate || !endDate) && styles.disabledButton]}
          onPress={onToggleDateFilter}
          disabled={!startDate || !endDate}
        >
          <ThemedText style={styles.applyText}>Apply Filter</ThemedText>
        </Pressable>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  activeTabText: {
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  datePickerContainer: {
    marginTop: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 14,
  },
  dateToText: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  applyText: {
    color: 'white',
    fontWeight: '500',
  },
});
