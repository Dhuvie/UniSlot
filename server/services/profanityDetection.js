const axios = require('axios');

const HF_API_URL = 'https://api-inference.huggingface.co/models/parsawar/profanity_model_3.1';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

async function checkProfanity(message) {
  try {
    const response = await axios.post(
      HF_API_URL,
      { inputs: message },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

    const results = response.data[0];
    
    let isProfane = false;
    let confidence = 0;
    
    if (Array.isArray(results)) {
      const profaneResult = results.find(r => 
        r.label.toLowerCase().includes('profane') || 
        r.label.toLowerCase().includes('offensive') ||
        r.label === '1'
      );
      
      if (profaneResult && profaneResult.score > 0.5) {
        isProfane = true;
        confidence = profaneResult.score;
      }
    }

    return {
      isProfane,
      confidence,
      isPositive: !isProfane
    };

  } catch (error) {
    return fallbackProfanityCheck(message);
  }
}

function fallbackProfanityCheck(message) {
  const negativeWords = [
    'hate', 'stupid', 'dumb', 'idiot', 'worst', 'suck',
    'damn', 'hell', 'crap', 'shit', 'fuck', 'ass', 'bitch'
  ];
  
  const lowerMessage = message.toLowerCase();
  const hasNegative = negativeWords.some(word => lowerMessage.includes(word));
  
  return {
    isProfane: hasNegative,
    confidence: hasNegative ? 0.8 : 0.2,
    isPositive: !hasNegative,
    fallback: true
  };
}

function getEncouragement() {
  const encouragements = [
    "Great teamwork! 🌟",
    "Love the positive energy! ✨",
    "Keep up the collaboration! 🤝",
    "Awesome communication! 💪",
    "That's the spirit! 🎉",
    "Fantastic attitude! 🚀",
    "You're doing great! 👏",
    "Keep it up! 💫"
  ];
  
  if (Math.random() > 0.7) {
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }
  
  return null;
}

function getSuggestion() {
  const suggestions = [
    "Let's keep our conversation positive and constructive! 😊",
    "How about rephrasing that in a more positive way? 🌟",
    "Let's maintain a respectful tone! 🤝",
    "Remember, we're all here to help each other! 💪",
    "Let's keep things friendly and supportive! ✨"
  ];
  
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

async function moderateMessage(message) {
  const profanityCheck = await checkProfanity(message);
  
  if (profanityCheck.isProfane) {
    return {
      isPositive: false,
      isProfane: true,
      confidence: profanityCheck.confidence,
      suggestion: getSuggestion(),
      fallback: profanityCheck.fallback || false
    };
  }
  
  return {
    isPositive: true,
    isProfane: false,
    confidence: profanityCheck.confidence,
    encouragement: getEncouragement(),
    fallback: profanityCheck.fallback || false
  };
}

module.exports = {
  checkProfanity,
  moderateMessage,
  getEncouragement,
  getSuggestion
};
