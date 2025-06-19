import { PostgrestError } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Generic hook for fetching data from Supabase
export function useSupabaseQuery<T>(
  tableName: string, 
  queryFn?: (query: any) => any, 
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase.from(tableName).select('*');
        
        // Apply any additional query modifiers
        if (queryFn) {
          query = queryFn(query);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setData(data);
      } catch (err) {
        setError(err as PostgrestError);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, error, loading };
}

// Hook for inserting data into Supabase
export function useSupabaseInsert<T>(tableName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const insert = async (data: Partial<T> | Partial<T>[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select();
        
      if (error) {
        throw error;
      }
      
      setLoading(false);
      return { data: result, error: null };
    } catch (err) {
      const postgrestError = err as PostgrestError;
      setError(postgrestError);
      setLoading(false);
      return { data: null, error: postgrestError };
    }
  };

  return { insert, loading, error };
}

// Hook for updating data in Supabase
export function useSupabaseUpdate<T>(tableName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const update = async (data: Partial<T>, match: Record<string, any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .match(match)
        .select();
        
      if (error) {
        throw error;
      }
      
      setLoading(false);
      return { data: result, error: null };
    } catch (err) {
      const postgrestError = err as PostgrestError;
      setError(postgrestError);
      setLoading(false);
      return { data: null, error: postgrestError };
    }
  };

  return { update, loading, error };
}

// Hook for deleting data from Supabase
export function useSupabaseDelete(tableName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const remove = async (match: Record<string, any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .match(match);
        
      if (error) {
        throw error;
      }
      
      setLoading(false);
      return { error: null };
    } catch (err) {
      const postgrestError = err as PostgrestError;
      setError(postgrestError);
      setLoading(false);
      return { error: postgrestError };
    }
  };

  return { remove, loading, error };
}
