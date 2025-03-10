import axios from 'axios';

export type WeatherCondition = 
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'thunderstorm'
  | 'snow'
  | 'mist'
  | 'fog';

export type WeatherData = {
  condition: WeatherCondition;
  description: string;
  temperature: number;
  visibility: number;
  cloudiness: number;
  isNight: boolean;
};

export type WeatherEffects = {
  sanityModifier: number;       // Affects sanity drain rate
  difficultyModifier: number;   // Affects overall difficulty
  visibilityRange: number;      // Affects map visibility
  narrativeModifier: string;    // Special narrative elements
  audioModifier: number;        // Affects audio distortion
};

const mapWeatherCondition = (openWeatherCode: string): WeatherCondition => {
  // Map OpenWeather condition codes to our simplified conditions
  if (openWeatherCode.startsWith('01')) return 'clear';
  if (openWeatherCode.startsWith('02') || openWeatherCode.startsWith('03') || openWeatherCode.startsWith('04')) return 'clouds';
  if (openWeatherCode.startsWith('09') || openWeatherCode.startsWith('10')) return 'rain';
  if (openWeatherCode.startsWith('11')) return 'thunderstorm';
  if (openWeatherCode.startsWith('13')) return 'snow';
  if (openWeatherCode.startsWith('50')) return openWeatherCode === '50d' ? 'mist' : 'fog';
  return 'clear';
};

const calculateWeatherEffects = (weather: WeatherData): WeatherEffects => {
  const baseEffects: WeatherEffects = {
    sanityModifier: 1,
    difficultyModifier: 1,
    visibilityRange: 1,
    narrativeModifier: '',
    audioModifier: 1
  };

  // Apply condition-specific effects
  switch (weather.condition) {
    case 'thunderstorm':
      return {
        sanityModifier: 1.5,      // Increased sanity drain
        difficultyModifier: 1.3,  // Harder to navigate
        visibilityRange: 0.6,     // Reduced visibility
        narrativeModifier: 'The thunderous sky seems to pulse with eldritch energy...',
        audioModifier: 1.4        // Enhanced audio distortion
      };
    case 'rain':
      return {
        sanityModifier: 1.2,
        difficultyModifier: 1.2,
        visibilityRange: 0.7,
        narrativeModifier: 'The rain carries whispers of ancient secrets...',
        audioModifier: 1.2
      };
    case 'snow':
      return {
        sanityModifier: 1.1,
        difficultyModifier: 1.4,
        visibilityRange: 0.5,
        narrativeModifier: 'The snow conceals otherworldly patterns...',
        audioModifier: 0.9
      };
    case 'fog':
    case 'mist':
      return {
        sanityModifier: 1.3,
        difficultyModifier: 1.5,
        visibilityRange: 0.4,
        narrativeModifier: 'Shapes in the mist seem to twist with impossible geometry...',
        audioModifier: 1.3
      };
    case 'clouds':
      return {
        sanityModifier: 1.1,
        difficultyModifier: 1.1,
        visibilityRange: 0.8,
        narrativeModifier: 'The clouds above form unsettling patterns...',
        audioModifier: 1.1
      };
    case 'clear':
    default:
      // Base effects for clear weather
      return baseEffects;
  }
};

export const getWeatherData = async (lat: number, lon: number): Promise<WeatherData | null> => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric`
    );

    const data = response.data;
    const condition = mapWeatherCondition(data.weather[0].icon);
    const hour = new Date().getHours();

    return {
      condition,
      description: data.weather[0].description,
      temperature: data.main.temp,
      visibility: data.visibility / 10000, // Normalize to 0-1 range (max visibility is 10km)
      cloudiness: data.clouds.all / 100,   // Normalize to 0-1 range
      isNight: hour < 6 || hour > 20       // Simple day/night check
    };
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    return null;
  }
};

export const getWeatherEffects = async (lat: number, lon: number): Promise<WeatherEffects | null> => {
  const weatherData = await getWeatherData(lat, lon);
  if (!weatherData) return null;

  const effects = calculateWeatherEffects(weatherData);

  // Apply time-of-day modifications
  if (weatherData.isNight) {
    effects.sanityModifier *= 1.2;
    effects.difficultyModifier *= 1.2;
    effects.visibilityRange *= 0.7;
    effects.audioModifier *= 1.2;
    effects.narrativeModifier = 'The darkness amplifies ' + effects.narrativeModifier.toLowerCase();
  }

  return effects;
};