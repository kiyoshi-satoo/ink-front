export interface ServiceCardType {
  number: string | number;
  title: string;
  price: {
    current: string;
    old?: string;
  };
  button: { [key: string]: any };
  info?: string;
}
