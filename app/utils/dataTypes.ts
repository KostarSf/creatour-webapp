export function ProductTypeToLocalizedString(type: string) {
  switch (type) {
    case "event":
      return "Событие";
    case "quest":
      return "Квест";
    case "tour":
      return "Тур";
    case "excursion":
      return "Экскурсия";
    default:
      return type;
  }
}
