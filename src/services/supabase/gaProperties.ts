import { supabaseClient } from './client';

export interface GAProperty {
  id: string;
  url: string;
  property_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const gaPropertiesService = {
  async getAllProperties(): Promise<GAProperty[]> {
    try {
      const { data, error } = await supabaseClient
        .from('ga_properties')
        .select('*')
        .eq('is_active', true)
        .order('url', { ascending: true });

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  },

  async getPropertyByUrl(url: string): Promise<GAProperty | null> {
    try {
      // Normalize URL to match database format
      const normalizedUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      const { data, error } = await supabaseClient
        .from('ga_properties')
        .select('*')
        .eq('url', normalizedUrl)
        .eq('is_active', true)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  },

  async addProperty(url: string, propertyId: string): Promise<GAProperty | null> {
    try {
      const normalizedUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      const { data, error } = await supabaseClient
        .from('ga_properties')
        .insert([{
          url: normalizedUrl,
          property_id: propertyId,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  },

  async updateProperty(id: string, updates: Partial<Pick<GAProperty, 'url' | 'property_id' | 'is_active'>>): Promise<GAProperty | null> {
    try {
      const { data, error } = await supabaseClient
        .from('ga_properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  },

  async deleteProperty(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('ga_properties')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  },

  // Helper function to convert to the format expected by existing code
  async getPropertiesAsMap(): Promise<Record<string, string>> {
    try {
      const properties = await this.getAllProperties();
      const propertiesMap: Record<string, string> = {};
      
      properties.forEach(property => {
        propertiesMap[property.url] = property.property_id;
      });
      
      return propertiesMap;
    } catch (error) {
      return {};
    }
  }
};