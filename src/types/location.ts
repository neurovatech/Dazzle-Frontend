export interface Location {
  id: number;
  name: string;
  branch: string;
  address: string;
  dayOff: string;
  openDay: string;
  hours: string;
  contact: string;
  email: string;
  image: string;
  distance: string;
  slug: string;
}

export interface Review {
  id: number;
  text: string;
  author: string;
  role: string;
  avatar: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  color: string;
}