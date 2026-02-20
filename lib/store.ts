import bcrypt from 'bcryptjs';

export interface Creator {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  bio: string;
  niche: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  followers: number;
  avatarUrl?: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  description: string;
  industry: string;
  website?: string;
  logoUrl?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  brandId: string;
  creatorId: string;
  title: string;
  description: string;
  budget: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

class Store {
  creators: Creator[] = [];
  brands: Brand[] = [];
  campaigns: Campaign[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const hash = (pw: string) => bcrypt.hashSync(pw, 10);

    this.creators = [
      {
        id: 'creator-1',
        email: 'alex@techcreator.com',
        passwordHash: hash('password123'),
        name: 'Alex Tech',
        bio: 'Tech reviewer and gadget enthusiast. Sharing the latest in consumer electronics.',
        niche: 'tech',
        youtube: 'alextech',
        instagram: 'alextechofficial',
        followers: 250000,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'creator-2',
        email: 'bella@fashionista.com',
        passwordHash: hash('password123'),
        name: 'Bella Fashion',
        bio: 'Fashion blogger and style consultant. Curating looks for every occasion.',
        niche: 'fashion',
        instagram: 'bellafashionista',
        tiktok: 'bellafashion',
        followers: 180000,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bella',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'creator-3',
        email: 'chef@foodlover.com',
        passwordHash: hash('password123'),
        name: 'Chef Marco',
        bio: 'Professional chef sharing recipes, kitchen tips, and food adventures.',
        niche: 'food',
        youtube: 'chefmarco',
        instagram: 'chefmarcocooks',
        followers: 320000,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marco',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'creator-4',
        email: 'zara@gamezone.com',
        passwordHash: hash('password123'),
        name: 'Zara Games',
        bio: 'Professional gamer and streamer. Gaming news, reviews, and live streams.',
        niche: 'gaming',
        youtube: 'zaragames',
        tiktok: 'zaragaming',
        followers: 450000,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zara',
        createdAt: new Date().toISOString(),
      },
    ];

    this.brands = [
      {
        id: 'brand-1',
        email: 'marketing@techgadgets.com',
        passwordHash: hash('password123'),
        name: 'TechGadgets Co.',
        description: 'Leading consumer electronics brand specializing in smart home devices.',
        industry: 'Technology',
        website: 'https://techgadgets.example.com',
        logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=TG',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'brand-2',
        email: 'collab@stylehaus.com',
        passwordHash: hash('password123'),
        name: 'StyleHaus',
        description: 'Premium fashion brand with sustainable clothing lines.',
        industry: 'Fashion',
        website: 'https://stylehaus.example.com',
        logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SH',
        createdAt: new Date().toISOString(),
      },
    ];

    this.campaigns = [
      {
        id: 'campaign-1',
        brandId: 'brand-1',
        creatorId: 'creator-1',
        title: 'Smart Home Hub Review',
        description: 'We would love for you to review our new Smart Home Hub X200 on your channel.',
        budget: 2500,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'campaign-2',
        brandId: 'brand-2',
        creatorId: 'creator-2',
        title: 'Summer Collection Feature',
        description: 'Feature our new summer sustainable collection in your next fashion post.',
        budget: 1800,
        status: 'accepted',
        createdAt: new Date().toISOString(),
      },
    ];
  }
}

const store = new Store();
export default store;
