const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Applicant = require('./models/Applicant');
const Job = require('./models/Job');

const debugScoring = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for scoring debug');

    // Get applications to process
    const applicantsToProcess = await Applicant.find({ 
      status: { $in: ['Pending', 'Under Review'] }
    }).populate('jobId');

    console.log(`\n🔍 Debugging scoring for ${applicantsToProcess.length} applications:\n`);

    for (const applicant of applicantsToProcess) {
      console.log(`\n📊 SCORING: ${applicant.name} (${applicant.email})`);
      console.log(`   Job: ${applicant.jobId?.title || 'N/A'}`);
      console.log(`   Current Status: ${applicant.status}`);

      // Replicate the scoring logic
      const daysSinceApplied = Math.floor((new Date() - new Date(applicant.appliedAt)) / (1000 * 60 * 60 * 24));
      const daysSinceReview = applicant.reviewedAt ? 
        Math.floor((new Date() - new Date(applicant.reviewedAt)) / (1000 * 60 * 60 * 24)) : 0;
      
      let score = applicant.status === 'Under Review' ? 60 : 50; // Base score
      let reasons = [];
      
      console.log(`   📈 Base Score: ${score} (${applicant.status === 'Under Review' ? 'Under Review bonus' : 'Pending'})`);

      // Under Review bonus
      if (applicant.status === 'Under Review') {
        score += 10;
        reasons.push('Already under review (+10)');
      }

      // Recent application
      if (daysSinceApplied <= 2) {
        score += 15;
        reasons.push('Recent application (+15)');
      }

      // Professional email
      const email = applicant.email.toLowerCase();
      const professionalDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'company.com'];
      const emailDomain = email.split('@')[1];
      if (professionalDomains.includes(emailDomain)) {
        score += 10;
        reasons.push('Professional email domain (+10)');
      }

      // Keywords
      const name = applicant.name.toLowerCase();
      const jobTitle = applicant.jobId?.title?.toLowerCase() || '';
      const skillKeywords = ['developer', 'engineer', 'analyst', 'manager', 'senior', 'lead', 'architect'];
      const hasRelevantKeywords = skillKeywords.some(keyword => 
        name.includes(keyword) || jobTitle.includes(keyword)
      );
      if (hasRelevantKeywords) {
        score += 20;
        reasons.push('Relevant skill keywords (+20)');
      }

      // Complete name
      if (applicant.name.split(' ').length >= 2) {
        score += 5;
        reasons.push('Complete name provided (+5)');
      }

      // Experience indicators
      if (name.includes('senior') || name.includes('lead') || name.includes('manager')) {
        score += 15;
        reasons.push('Experience indicators in name (+15)');
      }

      // High-demand roles
      if (jobTitle.includes('cloud') || jobTitle.includes('devops') || jobTitle.includes('full stack')) {
        score += 10;
        reasons.push('High-demand role (+10)');
      }

      // Time in review
      if (applicant.status === 'Under Review' && daysSinceReview >= 1) {
        score += 5;
        reasons.push('Time in review (+5)');
      }

      // Negative scoring
      if (daysSinceApplied > 30) {
        score -= 20;
        reasons.push('Old application (-20)');
      }
      if (email.includes('test') || email.includes('fake') || email.includes('temp')) {
        score -= 30;
        reasons.push('Suspicious email pattern (-30)');
      }
      if (applicant.name.length < 3 || !applicant.name.includes(' ')) {
        score -= 15;
        reasons.push('Incomplete name (-15)');
      }

      console.log(`   📋 Scoring Details:`);
      reasons.forEach(reason => console.log(`      • ${reason}`));
      console.log(`   🎯 FINAL SCORE: ${score}`);

      // Decision logic
      let decision = '';
      if (score >= 75) {
        decision = '✅ APPROVED';
      } else if (score >= 65) {
        decision = '📅 INTERVIEW SCHEDULED';
      } else if (score <= 35) {
        decision = '❌ REJECTED';
      } else if (applicant.status === 'Under Review') {
        if (score >= 55) {
          decision = '📅 INTERVIEW SCHEDULED (Under Review threshold)';
        } else {
          decision = '❌ REJECTED (Under Review threshold)';
        }
      } else {
        decision = '👁️  UNDER REVIEW';
      }

      console.log(`   🎪 DECISION: ${decision}`);
      console.log(`   ⏰ Days since applied: ${daysSinceApplied}`);
      console.log(`   ⏰ Days since review: ${daysSinceReview}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  }
};

debugScoring();