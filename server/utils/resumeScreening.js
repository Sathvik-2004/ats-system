const STOP_WORDS = new Set([
  'and', 'or', 'the', 'a', 'an', 'to', 'of', 'for', 'with', 'in', 'on', 'at', 'by', 'from',
  'is', 'are', 'be', 'as', 'this', 'that', 'will', 'you', 'your', 'we', 'our', 'their', 'they',
  'have', 'has', 'had', 'it', 'its', 'into', 'using', 'used', 'about', 'plus', 'ability', 'strong'
]);

const normalizeText = (value) => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();

const tokenize = (text) => {
  const normalized = normalizeText(text);
  const tokens = normalized.match(/[a-z0-9+#.\-]+/g) || [];
  return tokens.filter((token) => token.length > 1 && !STOP_WORDS.has(token));
};

const uniqueCaseInsensitive = (items = []) => {
  const map = new Map();
  for (const item of items) {
    const value = String(item || '').trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (!map.has(key)) map.set(key, value);
  }
  return Array.from(map.values());
};

const extractKeywordsFromJobDescription = (jobDescription = '', jobRequirements = []) => {
  const normalizedRequirements = Array.isArray(jobRequirements)
    ? jobRequirements
    : String(jobRequirements || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const reqKeywords = normalizedRequirements.flatMap((item) => {
    const parts = String(item)
      .split(/[|,/]/)
      .map((part) => part.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts : [String(item).trim()];
  });

  const descTokens = tokenize(jobDescription);
  const merged = uniqueCaseInsensitive([...reqKeywords, ...descTokens]);

  return merged.slice(0, 80);
};

const containsSkill = (resumeText, resumeTokenSet, skill) => {
  const normalizedSkill = normalizeText(skill);
  if (!normalizedSkill) return false;

  if (normalizedSkill.includes(' ')) {
    return resumeText.includes(normalizedSkill);
  }

  return resumeTokenSet.has(normalizedSkill);
};

const screenResumeAgainstJob = ({ resumeText = '', jobDescription = '', jobRequirements = [] }) => {
  const normalizedResume = normalizeText(resumeText);
  const resumeTokenSet = new Set(tokenize(normalizedResume));

  const requiredSkills = extractKeywordsFromJobDescription(jobDescription, jobRequirements);
  if (requiredSkills.length === 0) {
    return {
      matchScore: 0,
      matchedSkills: [],
      missingSkills: []
    };
  }

  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of requiredSkills) {
    if (containsSkill(normalizedResume, resumeTokenSet, skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const matchScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  return {
    matchScore,
    matchedSkills,
    missingSkills
  };
};

module.exports = {
  normalizeText,
  extractKeywordsFromJobDescription,
  screenResumeAgainstJob
};
