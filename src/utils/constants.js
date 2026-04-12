export const CATEGORIES = ['Protein', 'Carbs', 'Vegetables', 'Fruits', 'Snacks', 'Drinks', 'Dairy', 'Other'];

export const TRIGGER_TYPES = [
  'Texture issue',
  'Visual issue',
  'Wrong preparation',
  'Unexpected ingredient',
  'Cross-contamination',
  'Unknown food',
  'Food combination',
  'Other',
];

export const MOODS = [
  { value: 'great', label: 'Great', icon: '☀️' },
  { value: 'good', label: 'Good', icon: '🌤️' },
  { value: 'neutral', label: 'Neutral', icon: '☁️' },
  { value: 'anxious', label: 'Anxious', icon: '🌧️' },
  { value: 'stressed', label: 'Stressed', icon: '⛈️' },
];

export const CATEGORY_ICONS = {
  Protein: '🍗',
  Carbs: '🍞',
  Vegetables: '🥦',
  Fruits: '🍎',
  Snacks: '🍿',
  Drinks: '🥤',
  Dairy: '🧀',
  Other: '🍽️',
};

export const CATEGORY_COLORS = {
  Protein: '#E57373',
  Carbs: '#FFB74D',
  Vegetables: '#81C784',
  Fruits: '#F06292',
  Snacks: '#FFD54F',
  Drinks: '#4FC3F7',
  Dairy: '#FFF176',
  Other: '#B0BEC5',
};

export const TRIGGER_WEATHER = {
  'Texture issue': { icon: '🌧️', label: 'Rain' },
  'Visual issue': { icon: '🌫️', label: 'Fog' },
  'Wrong preparation': { icon: '⚡', label: 'Lightning' },
  'Unexpected ingredient': { icon: '🌨️', label: 'Hail' },
  'Cross-contamination': { icon: '🌪️', label: 'Tornado' },
  'Unknown food': { icon: '❄️', label: 'Snow' },
  'Food combination': { icon: '💨', label: 'Wind' },
  'Other': { icon: '☁️', label: 'Cloudy' },
};

export const MEAL_TIMES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other'];

export const SESSION_TYPES = ['Initial Assessment', 'Follow-up', 'Check-in', 'Crisis'];
