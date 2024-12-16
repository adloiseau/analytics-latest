import { createClient } from '@supabase/supabase-js';
import { format, subDays } from 'date-fns';

// Configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Sample sites
const sites = [
  'https://www.sofilms.fr',
  'https://kaalam.fr',
  'https://www.emplois-medecins-normandie.fr',
  'https://mon-shilajit.fr',
  'https://velo-electrique-sans-batterie.fr',
  'https://ladysextoy.fr'
];

// Sample metrics with realistic ranges
const metricRanges = {
  TO: { min: 10000, max: 20000 }, // Trafic organique
  AS: { min: 1, max: 10 },        // Authority Score
  BL: { min: 50, max: 150 },      // Backlinks
  RD: { min: 40, max: 100 },      // Domaines référents
  KD: { min: 2000, max: 5000 },   // Number of keywords
  VI: { min: 20, max: 40 },       // Indice de visibilité (%)
  TF: { min: 20, max: 50 },       // Trust Flow
  CF: { min: 15, max: 40 }        // Citation Flow
};

// Generate random value within a range
const randomValue = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate metrics for a single day
const generateDailyMetrics = (siteUrl: string, date: string) => {
  const metrics = [];
  
  for (const [metricType, range] of Object.entries(metricRanges)) {
    metrics.push({
      site_url: siteUrl,
      date,
      metric_type: metricType,
      value: randomValue(range.min, range.max)
    });
  }
  
  return metrics;
};

// Main function to add metrics
async function addMetrics() {
  try {
    // Generate metrics for the last 30 days
    const allMetrics = [];
    
    for (const site of sites) {
      for (let i = 0; i < 30; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const dailyMetrics = generateDailyMetrics(site, date);
        allMetrics.push(...dailyMetrics);
      }
    }
    
    // Insert metrics in batches of 100
    const batchSize = 100;
    for (let i = 0; i < allMetrics.length; i += batchSize) {
      const batch = allMetrics.slice(i, i + batchSize);
      const { error } = await supabase
        .from('site_metrics')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting batch:', error);
        continue;
      }
      
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(allMetrics.length / batchSize)}`);
    }
    
    console.log('Successfully added all metrics!');
  } catch (error) {
    console.error('Error adding metrics:', error);
  }
}

// Run the script
addMetrics();