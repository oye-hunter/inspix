import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { useSupabaseDelete, useSupabaseInsert, useSupabaseQuery } from '@/hooks/useSupabase';
import React, { useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, TextInput, View } from 'react-native';

// Define a Todo type
type Todo = {
  id: number;
  task: string;
  is_complete: boolean;
  user_id: string;
};

export default function SupabaseDataExample() {
  const [newTask, setNewTask] = useState('');
  const { session } = useAuth();
  const userId = session?.user.id;

  // Fetch todos for the current user
  const { data: todos, loading: todosLoading, error: todosError } = useSupabaseQuery<Todo>(
    'todos',
    (query) => query.eq('user_id', userId || '').order('created_at', { ascending: false }),
    [userId]
  );

  // Set up insert hook
  const { insert, loading: insertLoading } = useSupabaseInsert<Todo>('todos');
  
  // Set up delete hook
  const { remove, loading: deleteLoading } = useSupabaseDelete('todos');

  const handleAddTodo = async () => {
    if (!newTask.trim() || !userId) return;
    
    await insert({
      task: newTask,
      is_complete: false,
      user_id: userId
    });
    
    setNewTask('');
  };

  const handleDeleteTodo = async (id: number) => {
    await remove({ id });
  };

  if (!session) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Please sign in to use Todo List</ThemedText>
      </ThemedView>
    );
  }

  if (todosLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (todosError) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.error}>Error loading todos: {todosError.message}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Todo List</ThemedText>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={newTask}
          onChangeText={setNewTask}
        />
        <Button 
          title="Add" 
          onPress={handleAddTodo} 
          disabled={insertLoading || !newTask.trim()} 
        />
      </View>
      
      {(insertLoading || deleteLoading) && (
        <ActivityIndicator size="small" style={styles.loadingIndicator} />
      )}
      
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <ThemedText>{item.task}</ThemedText>
            <Button 
              title="Delete" 
              onPress={() => handleDeleteTodo(item.id)} 
              color="red" 
            />
          </View>
        )}
        ListEmptyComponent={
          <ThemedText style={styles.emptyList}>No todos yet. Add one above!</ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emptyList: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  loadingIndicator: {
    marginVertical: 8,
  },
});
