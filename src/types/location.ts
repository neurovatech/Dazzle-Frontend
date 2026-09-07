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
  uuid: string;
  authorName: string;
  designation: string;
  quote: string;
  imageUrl?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  color: string;
}