import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("seed: locations");
  await prisma.location.create({
    data: {
      slug: "zegelya",
      name: "Зегеля, 23А",
      address: "ул. Зегеля, 23А, Липецк, 398050",
      phone: "+7 958 654-38-63",
      hours: "08:00 – 23:00",
      yandexRating: 4.8,
      yandexCount: 287,
      sortOrder: 1,
    },
  });
  await prisma.location.create({
    data: {
      slug: "sviridova",
      name: "Свиридова, 22/2",
      address: "ул. И.В. Свиридова, 22/2, Липецк, 398004",
      phone: "+7 958 654-38-68",
      hours: "08:00 – 23:00",
      yandexRating: 5.0,
      yandexCount: 1205,
      sortOrder: 2,
    },
  });

  console.log("seed: admin user");
  await prisma.user.create({
    data: {
      email: "admin@ntm.ru",
      passwordHash: await bcrypt.hash("admin123", 10),
      name: "Администратор",
      role: "ADMIN",
    },
  });

  await prisma.settings.create({ data: {} });

  console.log("seed: menu");
  const cat = async (slug: string, title: string, story: string, sortOrder: number) =>
    prisma.category.create({ data: { slug, title, story, sortOrder } });

  const breakfasts = await cat("breakfasts", "Завтраки", "С восьми утра", 1);
  const pasta = await cat("pasta", "Паста", "Выбери свою форму", 2);
  const pizza = await cat("pizza", "Пицца", "Из печи", 3);
  const salads = await cat("salads", "Салаты", "Наш огород", 4);
  const starters = await cat("starters", "Закуски", "Начнём", 5);
  const mains = await cat("mains", "Горячее", "Главный акт", 6);
  const soups = await cat("soups", "Супы", "Первое", 7);
  const desserts = await cat("desserts", "Десерты", "Энкор", 8);
  const drinks = await cat("drinks", "Напитки", "В стакане", 9);

  const dish = (
    categoryId: string,
    title: string,
    price: number,
    weight: string | null,
    description: string | null,
    tags: string | null,
    sortOrder: number,
    isHitOfWeek = false
  ) =>
    prisma.dish.create({
      data: { categoryId, title, price, weight, description, tags, sortOrder, isHitOfWeek },
    });

  await dish(breakfasts.id, "Бенедикт с беконом и соусом голландез", 560, "240 г", null, null, 1);
  await dish(breakfasts.id, "Большой скрэмбл с лососем", 670, "380 г", null, "HIT", 2);
  await dish(breakfasts.id, "Большой скрэмбл с тигровыми креветками", 670, "380 г", null, null, 3);
  await dish(breakfasts.id, "Бриошь с лососем и яйцом пашот", 680, "240 г", null, null, 4);
  await dish(breakfasts.id, "Каша овсяная с карамелизированными фруктами, орехами, изюмом и корицей", 250, "310 г", null, "VEG", 5);
  await dish(breakfasts.id, "Каша рисовая с пряными ягодами и миндальными лепестками", 250, "310 г", null, "VEG", 6);
  await dish(breakfasts.id, "Ленивые вареники", 410, "300 г", null, null, 7);
  await dish(breakfasts.id, "Омлет с лососем и творожным сыром", 670, "280 г", null, null, 8);
  await dish(breakfasts.id, "Сырники с ванильным маскарпоне и соленой карамелью", 410, "170 г", null, "HIT", 9, true);
  await dish(breakfasts.id, "Шакшука из 3-х яиц со страчателлой и чиабаттой", 440, "400 г", null, null, 10);
  await dish(breakfasts.id, "Яичница с беконом", 370, "280 г", null, null, 11);
  await dish(breakfasts.id, "Омлет с тигровыми креветками в сливочном соусе", 670, "280 г", null, null, 12);

  await dish(pasta.id, "Болоньезе", 680, "280 г", null, null, 1);
  await dish(pasta.id, "Карбонара сливочная", 600, "270 г", null, null, 2);
  await dish(pasta.id, "Классическая лазанья", 790, "250 г", null, null, 3);
  await dish(pasta.id, "Креветки с песто и страчателлой", 790, "220 г", null, null, 4);
  await dish(pasta.id, "Креветки, томаты, моцарелла", 790, "280 г", null, null, 5);
  await dish(pasta.id, "Курица со шпинатом и грибами", 590, "280 г", null, null, 6);
  await dish(pasta.id, "Лосось с песто и черри", 910, "240 г", null, null, 7);
  await dish(pasta.id, "Очень сырная", 620, "270 г", null, "VEG", 8);
  await dish(pasta.id, "Паста с кальмарами и креветками в соусе биск", 790, "240 г", null, null, 9);
  await dish(pasta.id, "Паста с моллюсками вонголе", 790, "380 г", null, null, 10);
  await dish(pasta.id, "Равиоли с креветками в соусе Альо Ольо", 980, "200 г", null, null, 11);
  await dish(pasta.id, "С томлёной телятиной", 910, "290 г", null, null, 12);
  await dish(pasta.id, "Сливочная с натуральным крабом", 1830, "240 г", "Флагман кухни — мясо краба в части панциря", "HIT", 13, true);

  await dish(pizza.id, "Классическая Маргарита", 740, "33 см · 490 г", null, "VEG", 1);
  await dish(pizza.id, "Пепперони на томатном соусе с моцареллой", 830, "33 см · 480 г", null, null, 2);
  await dish(pizza.id, "Ветчина, бекон, пепперони на томатном соусе", 830, "33 см · 580 г", null, null, 3);
  await dish(pizza.id, "Ветчина, грибы на сливочном соусе", 795, "33 см · 580 г", null, null, 4);
  await dish(pizza.id, "Ветчина, грибы, бекон, лук фри", 1130, "33 см · 640 г", null, null, 5);
  await dish(pizza.id, "Грибная на сливочном соусе с руколой и трюфельным маслом", 795, "33 см · 510 г", null, "VEG", 6);
  await dish(pizza.id, "Груша с сыром горгондзола на сливочном соусе с медом и грецким орехом", 880, "33 см · 530 г", "Легенда заведения", "HIT", 7, true);
  await dish(pizza.id, "Пицца креветки, кальмар, песто, черри", 1485, "550 г", null, null, 8);
  await dish(pizza.id, "Пицца с лососем собственного посола", 1485, "580 г", "Лосось солим сами", null, 9);
  await dish(pizza.id, "Прошутто, страчателла на сливочном соусе", 1485, "33 см · 550 г", null, null, 10);
  await dish(pizza.id, "Сырная на сливочном соусе", 795, "33 см · 490 г", null, "VEG", 11);
  await dish(pizza.id, "Цыпленок, ветчина, бекон на сливочном соусе", 830, "33 см · 590 г", null, null, 12);
  await dish(pizza.id, "Фокачча с пармезаном", 260, "270 г", null, "VEG", 13);
  await dish(pizza.id, "Фокачча с прованскими травами", 230, "250 г", null, "VEG", 14);
  await dish(pizza.id, "Фокачча с трюфельным маслом", 230, "250 г", null, "VEG", 15);

  await dish(salads.id, "Зеленый салат с авокадо", 650, "145 г", null, "VEG", 1);
  await dish(salads.id, "Лосось / песто / сливочный сыр", 750, "170 г", null, null, 2);
  await dish(salads.id, "Салат с креветками и страчателлой", 750, "180 г", null, null, 3);
  await dish(salads.id, "Салат с морепродуктами", 850, "270 г", null, null, 4);
  await dish(salads.id, "Салат с ростбифом", 910, "220 г", null, null, 5);
  await dish(salads.id, "Салат с хрустящими баклажанами", 750, "250 г", null, null, 6);
  await dish(salads.id, "Цезарь с курицей", 560, "200 г", null, null, 7);
  await dish(salads.id, "Цезарь с тигровыми креветками", 680, "200 г", null, null, 8);
  await dish(salads.id, "Греческий салат", 750, "360 г", null, "VEG", 9);

  await dish(starters.id, "Брускетта Креветка и мандарин", 600, "150 г", null, null, 1);
  await dish(starters.id, "Брускетта лосось / страчателла", 670, "150 г", null, null, 2);
  await dish(starters.id, "Брускетта ростбиф / миндаль", 600, "150 г", null, null, 3);
  await dish(starters.id, "Вителло тонато", 1020, "175 г", null, null, 4);
  await dish(starters.id, "Жареные тигровые креветки с чесноком", 1020, "220 г", null, null, 5);
  await dish(starters.id, "Картофель фри с соусом", 290, "130 г", null, "VEG", 6);
  await dish(starters.id, "Магаданские креветки на льду", 2190, "460 г", null, "HIT", 7);
  await dish(starters.id, "Перец Рамиро с брынзой и соусом тоннато", 790, "250 г", null, null, 8);
  await dish(starters.id, "Чилийские мидии в соусе блю чиз", 790, "420 г", null, null, 9);

  await dish(mains.id, "Котлеты из индейки с картофельным пюре и соленым огурцом", 550, "350 г", null, null, 1);
  await dish(mains.id, "Мраморная говядина с трюфельным пюре и спаржей", 790, "320 г", null, null, 2);
  await dish(mains.id, "Стейк Стирплойн с перечным соусом", 2415, "350 г", "Прожарка по просьбе", null, 3);
  await dish(mains.id, "Стейк индейки с брокколи", 710, "300 г", null, null, 4);
  await dish(mains.id, "Стейк палтуса", 1288, "280 г", null, null, 5);
  await dish(mains.id, "Томлёные телячьи щечки с пюре из картофеля", 880, "350 г", null, "HIT", 6);

  await dish(soups.id, "Борщ с салом и пампушкой", 520, "380 г", "Пампушки собственного производства", "HIT", 1, true);
  await dish(soups.id, "Суп-лапша куриный", 440, "350 г", null, null, 2);
  await dish(soups.id, "Том ям с рисом", 910, "500 г", "Много морепродуктов", "SPICY", 3);

  await dish(desserts.id, "Камамбер", 630, "165 г", "Контраст сливочных, ягодных и ореховых нот", null, 1);
  await dish(desserts.id, "Медовик с медовой карамелью", 650, "180 г", null, null, 2);
  await dish(desserts.id, "Тарт с сезонной ягодой", 570, "120 г", null, null, 3);

  await dish(drinks.id, "Coca-Cola Classic в стекле", 310, "330 мл", null, null, 1);
  await dish(drinks.id, "Вода Maruha газированная", 300, "500 мл", null, null, 2);
  await dish(drinks.id, "Вода Maruha негазированная", 300, "500 мл", null, null, 3);
  await dish(drinks.id, "Фреш Апельсин", 420, "250 мл", null, null, 4);
  await dish(drinks.id, "Фреш Грейпфрут", 440, "250 мл", null, null, 5);

  console.log("seed: done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
