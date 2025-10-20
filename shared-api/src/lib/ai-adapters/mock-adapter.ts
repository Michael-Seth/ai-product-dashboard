/**
 * Mock Adapter Implementation
 * 
 * This module provides a mock implementation of the AI adapter for testing
 * and as a reliable fallback when other providers are unavailable.
 */

import {
  AIProviderConfig,
  MockConfig,
  Product,
  Recommendation
} from '@ai-product-dashboard/shared-types';
import { BaseAIAdapter } from './base-adapter';

/**
 * Mock adapter implementation
 */
export class MockAdapter extends BaseAIAdapter {
  private responseDelay: number = 1000;
  private failureRate: number = 0;

  constructor() {
    super('mock');
  }

  /**
   * Validate mock-specific configuration
   */
  protected async validateConfig(config: AIProviderConfig): Promise<void> {
    if (config.provider !== 'mock') {
      throw new Error('Invalid provider for Mock adapter');
    }

    const mockConfig = config as MockConfig;
    
    if (mockConfig.responseDelay !== undefined) {
      if (mockConfig.responseDelay < 0 || mockConfig.responseDelay > 10000) {
        throw new Error('Response delay must be between 0 and 10000ms');
      }
      this.responseDelay = mockConfig.responseDelay;
    }

    if (mockConfig.failureRate !== undefined) {
      if (mockConfig.failureRate < 0 || mockConfig.failureRate > 1) {
        throw new Error('Failure rate must be between 0 and 1');
      }
      this.failureRate = mockConfig.failureRate;
    }
  }

  /**
   * Setup mock client (always succeeds)
   */
  protected async setupClient(config: AIProviderConfig): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Generate mock recommendations
   */
  protected async callProvider(product: Product): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    if (this.failureRate > 0 && Math.random() < this.failureRate) {
      throw new Error('Simulated mock adapter failure');
    }

    const recommendations = this.generateMockRecommendations(product.name);
    
    return {
      recommendations
    };
  }

  /**
   * Generate contextual mock recommendations based on product name
   */
  private generateMockRecommendations(productName: string): Recommendation[] {
    const lowerName = productName.toLowerCase();
    if (lowerName.includes('macbook') || lowerName.includes('laptop') || lowerName.includes('notebook')) {
      return this.getLaptopRecommendations(productName);
    }
    if (lowerName.includes('iphone') || lowerName.includes('phone') || lowerName.includes('smartphone')) {
      return this.getPhoneRecommendations(productName);
    }
    if (lowerName.includes('ipad') || lowerName.includes('tablet')) {
      return this.getTabletRecommendations(productName);
    }
    if (lowerName.includes('monitor') || lowerName.includes('display') || lowerName.includes('screen')) {
      return this.getMonitorRecommendations(productName);
    }
    if (lowerName.includes('headphone') || lowerName.includes('earphone') || lowerName.includes('airpods')) {
      return this.getHeadphoneRecommendations(productName);
    }
    if (lowerName.includes('gaming') || lowerName.includes('game') || lowerName.includes('console')) {
      return this.getGamingRecommendations(productName);
    }
    if (lowerName.includes('camera') || lowerName.includes('lens') || lowerName.includes('photography')) {
      return this.getCameraRecommendations(productName);
    }
    return this.getGenericRecommendations(productName);
  }

  private getLaptopRecommendations(productName: string): Recommendation[] {
    const recommendations = [
      {
        name: 'Wireless Mouse',
        reason: 'Enhance productivity with precise cursor control and ergonomic design for extended use.'
      },
      {
        name: 'Laptop Stand',
        reason: 'Improve ergonomics and cooling with an adjustable stand that elevates your screen to eye level.'
      },
      {
        name: 'USB-C Hub',
        reason: 'Expand connectivity with multiple ports for peripherals, external displays, and charging.'
      },
      {
        name: 'External Monitor',
        reason: 'Boost productivity with a larger display for multitasking and better visual workspace.'
      },
      {
        name: 'Laptop Sleeve',
        reason: 'Protect your investment with a padded sleeve designed for safe transport and storage.'
      }
    ];
    return this.shuffleArray(recommendations).slice(0, 3 + Math.floor(Math.random() * 2));
  }

  private getPhoneRecommendations(productName: string): Recommendation[] {
    const recommendations = [
      {
        name: 'Wireless Charger',
        reason: 'Convenient charging solution that eliminates cable clutter and supports fast wireless charging.'
      },
      {
        name: 'Phone Case',
        reason: 'Essential protection against drops and scratches while maintaining easy access to all features.'
      },
      {
        name: 'Screen Protector',
        reason: 'Preserve your display with tempered glass protection that maintains touch sensitivity.'
      },
      {
        name: 'Car Mount',
        reason: 'Safe hands-free navigation and calls while driving with secure phone positioning.'
      },
      {
        name: 'Portable Battery Pack',
        reason: 'Extended battery life for long days out with fast-charging portable power solution.'
      }
    ];

    return this.shuffleArray(recommendations).slice(0, 3 + Math.floor(Math.random() * 2));
  }

  private getTabletRecommendations(productName: string): Recommendation[] {
    const recommendations = [
      {
        name: 'Tablet Keyboard',
        reason: 'Transform your tablet into a productivity powerhouse with a comfortable typing experience.'
      },
      {
        name: 'Stylus Pen',
        reason: 'Precise input for drawing, note-taking, and creative work with pressure sensitivity.'
      },
      {
        name: 'Tablet Stand',
        reason: 'Hands-free viewing for video calls, streaming, and reading with adjustable angles.'
      },
      {
        name: 'Tablet Case',
        reason: 'All-around protection with convenient stand functionality and secure closure.'
      }
    ];

    return this.shuffleArray(recommendations).slice(0, 3 + Math.floor(Math.random() * 2));
  }

  private getMonitorRecommendations(productName: string): Recommendation[] {
    const recommendations = [
      {
        name: 'Monitor Arm',
        reason: 'Ergonomic positioning and desk space optimization with adjustable height and tilt.'
      },
      {
        name: 'HDMI Cable',
        reason: 'High-quality video connection for crisp display output and reliable signal transmission.'
      },
      {
        name: 'Monitor Light Bar',
        reason: 'Reduce eye strain with bias lighting that improves contrast and viewing comfort.'
      },
      {
        name: 'Webcam',
        reason: 'Professional video calls and streaming with high-definition video quality.'
      }
    ];

    return this.shuffleArray(recommendations).slice(0, 3 + Math.floor(Math.random() * 2));
  }

  private getHeadphoneRecommendations(productName: string): Recommendation[] {
    const recommendations = [
      {
        name: 'Headphone Stand',
        reason: 'Organize your workspace and protect your headphones with an elegant display stand.'
      },
      {
        name: 'Audio Interface',
        reason: 'Enhanced audio quality for professional recording and high-fidelity music listening.'
      },
      {
        name: 'Replacement Ear Pads',
        reason: 'Maintain comfort and hygiene with soft, replaceable ear cushions for extended use.'
      },
      {
        name: 'Headphone Amplifier',
        reason: 'Drive high-impedance headphones to their full potential with dedicated amplification.'
      }
    ];

    return this.shuffleArray(recommendations).slice(0, 3 + Math.floor(Math.random() * 2));
  }

  private getGamingRecommendations(productName: string): Recommendation[] {
    const recommendations = [
      {
        name: 'Gaming Mouse',
        reason: 'Precision gaming with high DPI, programmable buttons, and ergonomic design for long sessions.'
      },
      {
        name: 'Gaming Keyboard',
        reason: 'Mechanical switches and customizable RGB lighting for competitive gaming advantage.'
      },
      {
        name: 'Gaming Headset',
        reason: 'Immersive audio and clear communication with teammates through high-quality microphone.'
      },
      {
        name: 'Gaming Chair',
        reason: 'Comfortable seating for extended gaming sessions with ergonomic support and adjustability.'
      },
      {
        name: 'Controller',
        reason: 'Alternative input method for different game genres with precise analog controls.'
      }
    ];

    return this.shuffleArray(recommendations).slice(0, 3 + Math.floor(Math.random() * 2));
  }

  private getCameraRecommendations(productName: string): Recommendation[] {
    const recommendations = [
      {
        name: 'Camera Lens',
        reason: 'Expand your creative possibilities with specialized focal lengths for different photography styles.'
      },
      {
        name: 'Tripod',
        reason: 'Stable shots and long exposures with adjustable height and professional stability.'
      },
      {
        name: 'Memory Card',
        reason: 'High-speed storage for continuous shooting and 4K video recording without buffer delays.'
      },
      {
        name: 'Camera Bag',
        reason: 'Protect your equipment during transport with padded compartments and weather resistance.'
      },
      {
        name: 'External Flash',
        reason: 'Professional lighting control for portraits and low-light photography situations.'
      }
    ];

    return this.shuffleArray(recommendations).slice(0, 3 + Math.floor(Math.random() * 2));
  }

  private getGenericRecommendations(productName: string): Recommendation[] {
    const recommendations = [
      {
        name: 'Extended Warranty',
        reason: 'Peace of mind with additional coverage beyond the standard warranty period.'
      },
      {
        name: 'Cleaning Kit',
        reason: 'Maintain your device in pristine condition with specialized cleaning solutions and tools.'
      },
      {
        name: 'Carrying Case',
        reason: 'Safe transport and storage with custom-fit protection and convenient portability.'
      },
      {
        name: 'Power Adapter',
        reason: 'Backup power solution for uninterrupted use and convenient charging in multiple locations.'
      }
    ];

    return this.shuffleArray(recommendations).slice(0, 3 + Math.floor(Math.random() * 2));
  }

  /**
   * Shuffle array for randomized recommendations
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get mock-specific information
   */
  getInfo() {
    const baseInfo = super.getInfo();
    return {
      ...baseInfo,
      responseDelay: this.responseDelay,
      failureRate: this.failureRate,
      supportsJsonMode: true,
      supportsStreaming: false,
      provider: 'Mock Provider (Testing/Fallback)'
    };
  }
}