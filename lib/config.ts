// ⚠️ ПЛЕЙСХОЛДЕРЫ — замени на свои данные перед деплоем
export const siteConfig = {
  name: "Алекс Соколов",
  firstName: "Алекс",
  role: "Full Stack Developer",
  city: "Москва",
  email: "hello@alexsokolov.dev",
  telegram: "https://t.me/username",
  github: "https://github.com/username",
  linkedin: "https://linkedin.com/in/username",
  url: "https://portfolio.example.com",
  experienceYears: 5,
  available: true,
} as const;

export const navItems = [
  { id: "projects", label: "Проекты" },
  { id: "about", label: "Обо мне" },
  { id: "experience", label: "Опыт" },
  { id: "contact", label: "Контакты" },
] as const;
