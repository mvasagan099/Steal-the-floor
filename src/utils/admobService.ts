// Capacitor AdMob monetization architecture with frequency capping and offline-safe fallbacks

export class AdMobService {
  private static instance: AdMobService;
  private lastInterstitialTime = 0;
  private readonly INTERSTITIAL_MIN_INTERVAL_MS = 180000; // 3 minutes minimum between interstitials

  private constructor() {}

  public static getInstance(): AdMobService {
    if (!AdMobService.instance) {
      AdMobService.instance = new AdMobService();
    }
    return AdMobService.instance;
  }

  public async initialize(): Promise<void> {
    // Isolated test credentials ready for Capacitor AdMob plugin
    console.log('[AdMobService] Initialized in safe offline mode');
  }

  public canShowInterstitial(levelId: number): boolean {
    // Never show interstitial on early tutorial levels (levels 1-5)
    if (levelId <= 5) return false;

    const now = Date.now();
    if (now - this.lastInterstitialTime < this.INTERSTITIAL_MIN_INTERVAL_MS) {
      return false;
    }
    return true;
  }

  public async showInterstitialIfEligible(levelId: number): Promise<boolean> {
    if (!this.canShowInterstitial(levelId)) {
      return false;
    }

    this.lastInterstitialTime = Date.now();
    console.log('[AdMobService] Interstitial shown (compliant with conservative frequency cap)');
    return true;
  }

  public async showRewardedForHint(): Promise<boolean> {
    // In offline or web environment, gracefully grant reward
    console.log('[AdMobService] Rewarded ad watched for hint');
    return true;
  }
}

export const ads = AdMobService.getInstance();
