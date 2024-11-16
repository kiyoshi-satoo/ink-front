import type { ServiceCardType } from "@ctypes/service";

export const ServiceCardsData: ServiceCardType[] = [
  {
    number: "01",
    title: "дизайн-проект",
    price: {
      current: "11 900 ₽/м²",
      old: "13 900 ₽/м²",
    },
    button: {
      text: "хочу проект",
      href: "#contact",
    },
    info: "цена действительна до конца октября",
  },
  {
    number: "02",
    title: "проект дома",
    price: {
      current: "15 900 ₽/м²",
      old: "19 900 ₽/м²",
    },
    button: {
      text: "хочу проект",
      href: "#contact",
    },
    info: "цена действительна до конца октября",
  },
  {
    number: "03",
    title: "строительно-отделочные работы",
    price: {
      current: "от 55 000₽/м²",
    },
    button: {
      text: "хочу проект",
      href: "#contact",
    },
    info: "",
  },
];
