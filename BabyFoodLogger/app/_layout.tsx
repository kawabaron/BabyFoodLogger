import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initializeDatabase } from '../src/repositories/database';
import { seedDefaultMastersIfNeeded } from '../src/repositories/masterRepository';
import { useMasterStore } from '../src/stores/masterStore';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const loadMasters = useMasterStore(s => s.loadMasters);

  useEffect(() => {
    (async () => {
      try {
        await initializeDatabase();
        await seedDefaultMastersIfNeeded();
        await loadMasters();
        setIsReady(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsReady(true);
      }
    })();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>🍼</Text>
        <Text style={styles.loadingText}>準備中...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FFF' },
          headerTintColor: '#FF8C94',
          headerTitleStyle: { fontWeight: '700', color: '#333' },
          headerBackTitle: 'カレンダー',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="meal/edit"
          options={{
            presentation: 'modal',
            title: '記録',
            headerTitle: '食事記録',
          }}
        />
        <Stack.Screen
          name="foods/select"
          options={{
            presentation: 'modal',
            title: '食材選択',
          }}
        />
        <Stack.Screen
          name="foods/manage"
          options={{ title: '食材・料理管理' }}
        />
        <Stack.Screen
          name="foods/edit"
          options={{
            presentation: 'modal',
            title: '食材・料理 追加/編集',
          }}
        />
        <Stack.Screen
          name="first-foods"
          options={{ title: '初めての食材' }}
        />
        <Stack.Screen
          name="stats"
          options={{ title: '統計' }}
        />

        <Stack.Screen
          name="settings"
          options={{ title: '設定' }}
        />
      </Stack>
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },
});
