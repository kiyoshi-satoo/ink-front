export interface TelegramCardType {
  tag: string;
  text: string;
}
export interface ReviewCardType {
  author: {
    image: Promise<{ default: ImageMetadata }>;
    username: string;
  };
  text: string;
}

export interface FurnitureCategoryCardType {
  image: Promise<{ default: ImageMetadata }>;
  title: string;
}

export interface InteriorCardType {
  title: string;
  tag: string;
  image: Promise<{ default: ImageMetadata }>;
  url: string;
}
