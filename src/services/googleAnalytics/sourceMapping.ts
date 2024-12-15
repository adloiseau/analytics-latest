export function mapSourceName(source: string): string {
  const sourceLower = source.toLowerCase();
  
  // Facebook sources
  if (sourceLower.includes('facebook') || sourceLower.includes('fb.com') || sourceLower.includes('l.facebook') || sourceLower.includes('m.facebook')) {
    return 'Facebook';
  }
  
  // Twitter sources
  if (sourceLower.includes('twitter') || sourceLower.includes('t.co')) {
    return 'Twitter';
  }
  
  // Instagram sources
  if (sourceLower.includes('instagram') || sourceLower.includes('l.instagram')) {
    return 'Instagram';
  }
  
  // YouTube sources
  if (sourceLower.includes('youtube') || sourceLower.includes('youtu.be')) {
    return 'YouTube';
  }
  
  // Search engines
  if (sourceLower.includes('google') || sourceLower.includes('bing') || sourceLower.includes('yahoo') || sourceLower.includes('duckduckgo')) {
    return 'Search';
  }
  
  // Direct traffic
  if (sourceLower === '(direct)' || sourceLower === '(none)' || sourceLower === 'direct') {
    return 'Direct';
  }
  
  // Other social networks
  if (sourceLower.includes('linkedin') || sourceLower.includes('pinterest')) {
    return 'Other Social';
  }
  
  // Default to Other
  return 'Other';
}