import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Department, Platform } from './database.types';

// Define types for AI service responses
export interface EnhancedContent {
  title: string;
  description: string;
  hashtags: string[];
  suggestedImages?: string[];
}

export class AIService {
  private static generativeAI: GoogleGenerativeAI;
  private static model: string;

  private static initialize() {
    if (!this.generativeAI) {
      // Use the provided API key or try to get it from environment variables
      const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDFq4cBT5-KjHjma4dtMFgPh7uN_8l3XqU';
      
      if (!apiKey || apiKey === '') {
        console.error('Missing Gemini API key');
        throw new Error('Gemini API key is not configured');
      }
      
      console.log('Initializing Gemini AI with API key');
      this.generativeAI = new GoogleGenerativeAI(apiKey);
      this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20';
      console.log(`Using model: ${this.model}`);
    }
  }

  private static async getModel() {
    this.initialize();
    return this.generativeAI.getGenerativeModel({
      model: this.model,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
  }

  static async enhancePostContent(
    title: string, 
    description: string, 
    platforms: Platform[]
  ): Promise<EnhancedContent> {
    try {
      console.log('Enhancing content with the following inputs:');
      console.log(`Title: ${title.substring(0, 30)}...`);
      console.log(`Description length: ${description.length} chars`);
      console.log(`Platforms: ${platforms.join(', ')}`);
      
      const model = await this.getModel();
      
      const prompt = `Enhance the following content for a business social media post:
        Title: ${title}
        Description: ${description}
        Target Platforms: ${platforms.join(', ')}
        
        Please provide:
        1. An improved title (max 80 characters)
        2. An enhanced description that's engaging and professional (max 600 characters)
        3. 5-8 relevant hashtags
        
        Format your response as JSON:
        {
          "title": "improved title",
          "description": "enhanced description",
          "hashtags": ["hashtag1", "hashtag2", ...]
        }`;
      
      console.log('Sending request to Gemini API...');
      const result = await model.generateContent(prompt);
      console.log('Received response from Gemini API');
      const response = result.response;
      const text = response.text();
      
      console.log('Raw response text:');
      console.log(text.substring(0, 100) + '...');
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('AI response did not contain valid JSON:', text);
        throw new Error('AI response did not contain valid JSON');
      }
      
      try {
        const enhancedContent = JSON.parse(jsonMatch[0]) as EnhancedContent;
        console.log('Successfully parsed JSON response');
        return enhancedContent;
      } catch (jsonError) {
        console.error('Error parsing JSON from AI response:', jsonError);
        console.error('Raw text that failed to parse:', jsonMatch[0]);
        throw new Error('Failed to parse JSON from AI response');
      }
    } catch (error) {
      console.error('Error enhancing content:', error);
      
      // Check if it's a rate limit error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('quota') || errorMessage.includes('Too Many Requests') || errorMessage.includes('429')) {
        console.log('Rate limit detected, using fallback content enhancement');
        return this.getFallbackEnhancedContent(title, description, platforms);
      }
      
      throw new Error(`Failed to enhance content: ${errorMessage}`);
    }
  }
  
  /**
   * Provide fallback enhanced content when API rate limits are hit
   */
  private static getFallbackEnhancedContent(
    title: string,
    description: string,
    platforms: Platform[]
  ): EnhancedContent {
    // Create a simple enhanced title with better capitalization and phrasing
    const enhancedTitle = title.trim().length > 5 
      ? this.capitalizeWords(title)
      : "Engaging Content for Your Professional Network";
      
    // Add some professional framing to the description
    let enhancedDescription = description;
    if (!description.includes('professionals') && !description.includes('industry')) {
      enhancedDescription = `${description.trim()} This insight is valuable for professionals in our industry looking to improve their practices.`;
    }
    
    // Generate some generic hashtags based on platforms
    const hashtags = platforms.includes('LinkedIn')
      ? ['#ProfessionalDevelopment', '#BusinessInsights', '#IndustryTrends', '#Leadership', '#Innovation']
      : ['#Business', '#Professional', '#Growth', '#Success', '#Insights'];
      
    return {
      title: enhancedTitle,
      description: enhancedDescription,
      hashtags: hashtags
    };
  }
  
  /**
   * Helper to capitalize words properly for titles
   */
  private static capitalizeWords(text: string): string {
    const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'];
    
    return text.split(' ')
      .map((word, index) => {
        // Always capitalize first and last word
        if (index === 0 || index === text.split(' ').length - 1) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        // Don't capitalize small words
        if (smallWords.includes(word.toLowerCase())) {
          return word.toLowerCase();
        }
        // Capitalize other words
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  static async generatePostIdeas(department: Department): Promise<string[]> {
    const model = await this.getModel();
    
    const prompt = `Generate 5 compelling content ideas for posts related to the "${department}" department of a professional services firm.
      Each idea should be a short title (max 10 words) that would grab attention on social media.
      The ideas should be relevant to current business trends and suitable for LinkedIn or a corporate website.
      Format your response as a JSON array of strings: ["Idea 1", "Idea 2", ...]`;
    
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('AI response did not contain valid JSON array');
      }
      
      const ideas = JSON.parse(jsonMatch[0]) as string[];
      return ideas;
    } catch (error) {
      console.error('Error generating post ideas:', error);
      throw new Error('Failed to generate post ideas with AI');
    }
  }

  static async optimizeForPlatform(content: string, platform: Platform): Promise<string> {
    const model = await this.getModel();
    
    const prompt = `Optimize the following content specifically for ${platform}:
      "${content}"
      
      Consider the best practices, character limits, and formatting typical for ${platform}.
      Maintain the professional tone and key messages.
      Return only the optimized content as plain text.`;
    
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error optimizing for platform:', error);
      throw new Error(`Failed to optimize content for ${platform}`);
    }
  }

  static async generateHashtags(content: string): Promise<string[]> {
    const model = await this.getModel();
    
    const prompt = `Generate 5-8 relevant business hashtags for the following content:
      "${content}"
      
      The hashtags should be professional, relevant to the content, and suitable for business social media.
      Format your response as a JSON array of strings: ["#hashtag1", "#hashtag2", ...]`;
    
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('AI response did not contain valid JSON array');
      }
      
      const hashtags = JSON.parse(jsonMatch[0]) as string[];
      return hashtags;
    } catch (error) {
      console.error('Error generating hashtags:', error);
      throw new Error('Failed to generate hashtags with AI');
    }
  }
} 