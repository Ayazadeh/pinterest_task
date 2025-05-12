export interface Pin {
    id: string;
    images: {
      [key: string]: {
        url: string;
        width: number;
        height: number;
      };
    };
    description: string;
    title: string;
  }