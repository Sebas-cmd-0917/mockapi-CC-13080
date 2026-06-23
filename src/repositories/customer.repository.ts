import { supabase } from '../config/supabase';

// Interfaz para tipado estricto
export interface CustomerData {
  nit: string;
  name: string;
  phone?: string;
}

export const findByNit = async (nit: string) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('nit', nit)
    .single();

  // Supabase lanza un error si no encuentra filas (código PGRST116), lo manejamos devolviendo null
  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  
  return data;
};

export const create = async (customer: CustomerData) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()
    .single();

  if (error) throw error;
  return data;
};