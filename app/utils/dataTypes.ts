export enum ProductType {
  trip,
  tour,
  quest,
  event,
}

export type Product = {
  id: string;
  name: string;
  short: string;
  image: string;
  type: ProductType;
};

export function ProductTypeToLocalizedString(type: ProductType) {
  switch (type) {
    case ProductType.event:
      return "Событие";
    case ProductType.quest:
      return "Квест";
    case ProductType.tour:
      return "Тур";
    case ProductType.trip:
      return "Экскурсия";
  }
}

export function ProductTypeToString(type: ProductType) {
  switch (type) {
    case ProductType.event:
      return "event";
    case ProductType.quest:
      return "quest";
    case ProductType.tour:
      return "tour";
    case ProductType.trip:
      return "trip";
  }
}
