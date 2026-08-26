export const site = {
  name: "Не только макароны",
  latin: "Non Solo Pasta",
  city: "Липецк",
  phoneMain: "+7 958 654-38-63",
  phoneMainHref: "tel:+79586543863",
  telegram: "https://t.me/ne_tolko_makarony",
  vk: "https://vk.com/club_non_solo_pasta",
  whatsapp: "https://wa.me/79586543868",
  yandexEda: "https://eda.yandex.ru/lipetsk/r/ne_tol_ko_makarony",
  rating: 4.9,
  ratingCount: 1492,
  award: "Лучший ресторан 2026 · Премия 2ГИС",
} as const;

export const nav = [
  { href: "/menu", label: "Меню" },
  { href: "/gallery", label: "Галерея" },
  { href: "/locations", label: "Адреса" },
  { href: "/events", label: "События" },
] as const;
