
export const routes = [
  {
    routeName: "Camino Francés",
    distance: 779,
    difficulty: "Средняя",
    days: 32,
    description: "Французский путь (Классика)",
    start: "Сен-Жан-Пье-де-Пор",
    image: "/routes/frances.jpg",
    stages: [
      {
        id: "frances-1",
        from: "Saint-Jean-Pied-de-Port",
        to: "Roncesvalles",
        distance: 25,
        completed: false
      },
      {
        id: "frances-2",
        from: "Roncesvalles",
        to: "Zubiri",
        distance: 21,
        completed: false
      }
    ]
  },
  {
    routeName: "Camino Portugués",
    distance: 242,
    difficulty: "Легкая",
    days: 12,
    description: "Португальский прибрежный путь",
    start: "Порту",
    image: "/routes/portugues.jpg",
    stages: [
      {
        id: "portugues-1",
        from: "Porto",
        to: "Vila do Conde",
        distance: 27,
        completed: false
      },
      {
        id: "portugues-2",
        from: "Vila do Conde",
        to: "Barcelos",
        distance: 28,
        completed: false
      }
    ]
  }
];

export const tabs = [
  { id: "routes", label: "Маршрут & Темп", number: "1", icon: "🗺️" },
  { id: "budget", label: "Бюджет & Комфорт", number: "2", icon: "Ⓢ" },
  { id: "stages", label: "Этапы по дням", number: "3", icon: "▣" },
  { id: "backpack", label: "Чеклист рюкзака", number: "4", icon: "☑" }
];
