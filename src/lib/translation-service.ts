import { LanguageCode } from '@/config/languages';

interface TranslationCache {
  [key: string]: {
    [language: string]: string;
  };
}

class TranslationService {
  private cache: TranslationCache = {};
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.LINGODOTDEV_API_KEY || '';
  }

  async translate(text: string, targetLanguage: LanguageCode): Promise<string> {
    // Return original text for English
    if (targetLanguage === 'en') {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}_${targetLanguage}`;
    if (this.cache[text] && this.cache[text][targetLanguage]) {
      return this.cache[text][targetLanguage];
    }

    try {
      // For now, we'll use a simple mapping since lingo.dev integration requires server setup
      // In production, you would make an API call to lingo.dev here
      const translations = this.getStaticTranslations(text, targetLanguage);

      if (translations) {
        // Cache the result
        if (!this.cache[text]) {
          this.cache[text] = {};
        }
        this.cache[text][targetLanguage] = translations;
        return translations;
      }

      return text; // Fallback to original text
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  private getStaticTranslations(
    text: string,
    language: LanguageCode
  ): string | null {
    const staticTranslations: Record<string, Record<LanguageCode, string>> = {
      Dashboard: {
        fr: 'Tableau de bord',
        de: 'Dashboard',
        ru: 'Панель управления',
        zh: '仪表板',
        mn: 'Хяналтын самбар',
        en: 'Dashboard'
      },
      Products: {
        fr: 'Produits',
        de: 'Produkte',
        ru: 'Товары',
        zh: '产品',
        mn: 'Бүтээгдэхүүн',
        en: 'Products'
      },
      Orders: {
        fr: 'Commandes',
        de: 'Bestellungen',
        ru: 'Заказы',
        zh: '订单',
        mn: 'Захиалга',
        en: 'Orders'
      },
      Customers: {
        fr: 'Clients',
        de: 'Kunden',
        ru: 'Клиенты',
        zh: '客户',
        mn: 'Үйлчлүүлэгч',
        en: 'Customers'
      },
      Analytics: {
        fr: 'Analytique',
        de: 'Analytik',
        ru: 'Аналитика',
        zh: '分析',
        mn: 'Шинжилгээ',
        en: 'Analytics'
      },
      Settings: {
        fr: 'Paramètres',
        de: 'Einstellungen',
        ru: 'Настройки',
        zh: '设置',
        mn: 'Тохиргоо',
        en: 'Settings'
      },
      'Search...': {
        fr: 'Rechercher...',
        de: 'Suchen...',
        ru: 'Поиск...',
        zh: '搜索...',
        mn: 'Хайх...',
        en: 'Search...'
      },
      Profile: {
        fr: 'Profil',
        de: 'Profil',
        ru: 'Профиль',
        zh: '个人资料',
        mn: 'Профайл',
        en: 'Profile'
      },
      Logout: {
        fr: 'Se déconnecter',
        de: 'Abmelden',
        ru: 'Выйти',
        zh: '登出',
        mn: 'Гарах',
        en: 'Logout'
      }
    };

    return staticTranslations[text]?.[language] || null;
  }
}

export const translationService = new TranslationService();
