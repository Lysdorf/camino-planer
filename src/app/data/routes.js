import francesData from "./camino-frances.json";

const francesRoute = {
  routeName: "Camino Francés",
  distance: francesData.distance,
  difficulty: "Средняя",
  description: "Французский путь (Классика)",
  start: "Saint-Jean-Pied-de-Port",
  image: "/routes/frances.jpg",
  segments: francesData.segments
};

export const routes = [
    francesRoute,
    {
    routeName: "Camino Portugués Coastal",
    distance: 270.9,
    difficulty: "Легкая",
    description: "Португальский прибрежный путь",
    start: "Porto",
    image: "/routes/portugues.jpg",
    segments: [
        {
        id: "coastal-1",
        from: "Porto",
        to: "Labruge",
        distance: 24.5,
        intermediateStops: [
            { id: "coastal-matosinhos", name: "Matosinhos", distanceFromStart: 11.3 },
            { id: "coastal-angeiras", name: "Praia de Angeiras", distanceFromStart: 22.8 }
        ]
        },
        {
        id: "coastal-2",
        from: "Labruge",
        to: "Póvoa de Varzim",
        distance: 14.0,
        intermediateStops: [
            { id: "coastal-vila-do-conde", name: "Vila do Conde", distanceFromStart: 10.7 }
        ]
        },
        {
        id: "coastal-3",
        from: "Póvoa de Varzim",
        to: "Marinhas",
        distance: 24.5,
        intermediateStops: []
        },
        {
        id: "coastal-4",
        from: "Marinhas",
        to: "Viana do Castelo",
        distance: 20.8,
        intermediateStops: []
        },
        {
        id: "coastal-5",
        from: "Viana do Castelo",
        to: "Caminha",
        distance: 26.8,
        intermediateStops: []
        },
        {
        id: "coastal-6",
        from: "Caminha",
        to: "Porto Mougás",
        distance: 23.5,
        intermediateStops: [
            { id: "coastal-a-guarda", name: "A Guarda", distanceFromStart: 4.3 }
        ]
        },
        {
        id: "coastal-7",
        from: "Porto Mougás",
        to: "A Ramallosa",
        distance: 16.0,
        intermediateStops: []
        },
        {
        id: "coastal-8",
        from: "A Ramallosa",
        to: "Vigo",
        distance: 21.5,
        intermediateStops: []
        },
        {
        id: "coastal-9",
        from: "Vigo",
        to: "Redondela",
        distance: 15.4,
        intermediateStops: []
        },
        {
        id: "coastal-10",
        from: "Redondela",
        to: "Pontevedra",
        distance: 19.8,
        intermediateStops: []
        },
        {
        id: "coastal-11",
        from: "Pontevedra",
        to: "Caldas de Reis",
        distance: 21.1,
        intermediateStops: []
        },
        {
        id: "coastal-12",
        from: "Caldas de Reis",
        to: "Padrón",
        distance: 18.6,
        intermediateStops: []
        },
        {
        id: "coastal-13",
        from: "Padrón",
        to: "Santiago de Compostela",
        distance: 24.4,
        intermediateStops: []
        }
    ]
    },
    {
    routeName: "Camino Inglés",
    distance: 112.5,
    difficulty: "Средняя",
    description: "Английский путь из Галисии",
    start: "Ferrol",
    image: "/routes/ingles.jpg",
    segments: [
        {
        id: "ingles-1",
        from: "Ferrol",
        to: "Neda",
        distance: 15.4,
        intermediateStops: []
        },
        {
        id: "ingles-2",
        from: "Neda",
        to: "Pontedeume",
        distance: 12.9,
        intermediateStops: []
        },
        {
        id: "ingles-3",
        from: "Pontedeume",
        to: "Betanzos",
        distance: 19.9,
        intermediateStops: [
            {
            id: "miño",
            name: "Miño",
            distanceFromStart: 9.8
            }
        ]
        },
        {
        id: "ingles-4",
        from: "Betanzos",
        to: "Hospital de Bruma",
        distance: 24.1,
        intermediateStops: []
        },
        {
        id: "ingles-5",
        from: "Hospital de Bruma",
        to: "Sigüeiro",
        distance: 24.2,
        intermediateStops: []
        },
        {
        id: "ingles-6",
        from: "Sigüeiro",
        to: "Santiago de Compostela",
        distance: 16.5,
        intermediateStops: []
        }
    ]
    },
    {
    routeName: "Camino Primitivo",
    distance: 311.2,
    difficulty: "Высокая",
    description: "Первоначальный путь через горы Астурии",
    start: "Oviedo",
    image: "/routes/primitivo.jpg",
    segments: [
        { id: "primitivo-1", from: "Oviedo", to: "Grado", distance: 25.2 },
        { id: "primitivo-2", from: "Grado", to: "Salas", distance: 22.3 },
        { id: "primitivo-3", from: "Salas", to: "Tineo", distance: 19.8,
            intermediateStops: [{
                id: "ingles-mino",
                name: "Miño",
                distanceFromStart: 9.8
            }]
        },
        { id: "primitivo-4", from: "Tineo", to: "Borres", distance: 15.9 },
        { id: "primitivo-5", from: "Borres", to: "Berducedo", distance: 28.6 },
        { id: "primitivo-6", from: "Berducedo", to: "Grandas de Salime", distance: 20.4 },
        { id: "primitivo-7", from: "Grandas de Salime", to: "A Fonsagrada", distance: 25.2 },
        { id: "primitivo-8", from: "A Fonsagrada", to: "O Cádavo", distance: 24.3 },
        { id: "primitivo-9", from: "O Cádavo", to: "Lugo", distance: 29.5 },
        { id: "primitivo-10", from: "Lugo", to: "A Ponte Ferreira", distance: 26.5 },
        { id: "primitivo-11", from: "A Ponte Ferreira", to: "Melide", distance: 20.0 },
        { id: "primitivo-12", from: "Melide", to: "Arzúa", distance: 14.3 },
        { id: "primitivo-13", from: "Arzúa", to: "O Pedrouzo", distance: 19.2 },
        { id: "primitivo-14", from: "O Pedrouzo", to: "Santiago de Compostela", distance: 19.4 }
    ]
    },
    {
    routeName: "Camino del Norte",
    distance: 820.3,
    difficulty: "Высокая",
    description: "Северный путь вдоль побережья Испании",
    start: "Irún",
    image: "/routes/norte.jpg",
    segments: [
        { id: "norte-1", from: "Irún", to: "San Sebastián", distance: 24.7, intermediateStops: [] },
        { id: "norte-2", from: "San Sebastián", to: "Zarautz", distance: 22.1, intermediateStops: [] },
        { id: "norte-3", from: "Zarautz", to: "Deba", distance: 21.0, intermediateStops: [] },
        { id: "norte-4", from: "Deba", to: "Markina-Xemein", distance: 23.3, intermediateStops: [] },
        { id: "norte-5", from: "Markina-Xemein", to: "Gernika", distance: 25.4, intermediateStops: [] },
        { id: "norte-6", from: "Gernika", to: "Lezama", distance: 19.8, intermediateStops: [] },
        { id: "norte-7", from: "Lezama", to: "Bilbao", distance: 11.0, intermediateStops: [] },
        { id: "norte-8", from: "Bilbao", to: "Portugalete", distance: 19.2, intermediateStops: [] },
        { id: "norte-9", from: "Portugalete", to: "Castro Urdiales", distance: 32.1, intermediateStops: [] },
        { id: "norte-10", from: "Castro Urdiales", to: "Laredo", distance: 30.5, intermediateStops: [] },
        { id: "norte-11", from: "Laredo", to: "Güemes", distance: 28.7, intermediateStops: [] },
        { id: "norte-12", from: "Güemes", to: "Santander", distance: 15.3, intermediateStops: [] },
        { id: "norte-13", from: "Santander", to: "Santillana del Mar", distance: 36.3, intermediateStops: [] },
        { id: "norte-14", from: "Santillana del Mar", to: "Comillas", distance: 22.2, intermediateStops: [] },
        { id: "norte-15", from: "Comillas", to: "Colombres", distance: 28.0, intermediateStops: [] },
        { id: "norte-16", from: "Colombres", to: "Llanes", distance: 22.9, intermediateStops: [] },
        { id: "norte-17", from: "Llanes", to: "Ribadesella", distance: 30.0, intermediateStops: [] },
        { id: "norte-18", from: "Ribadesella", to: "Colunga", distance: 20.1, intermediateStops: [] },
        { id: "norte-19", from: "Colunga", to: "Villaviciosa", distance: 17.5, intermediateStops: [] },
        { id: "norte-20", from: "Villaviciosa", to: "Gijón", distance: 29.8, intermediateStops: [] },
        { id: "norte-21", from: "Gijón", to: "Avilés", distance: 25.4, intermediateStops: [] },
        { id: "norte-22", from: "Avilés", to: "Muros de Nalón", distance: 21.2, intermediateStops: [] },
        { id: "norte-23", from: "Muros de Nalón", to: "Soto de Luiña", distance: 15.3, intermediateStops: [] },
        { id: "norte-24", from: "Soto de Luiña", to: "Cadavedo", distance: 18.5, intermediateStops: [] },
        { id: "norte-25", from: "Cadavedo", to: "Luarca", distance: 15.3, intermediateStops: [] },
        { id: "norte-26", from: "Luarca", to: "La Caridad", distance: 30.5, intermediateStops: [] },
        { id: "norte-27", from: "La Caridad", to: "Ribadeo", distance: 21.3, intermediateStops: [] },
        { id: "norte-28", from: "Ribadeo", to: "Gondán", distance: 20.9, intermediateStops: [] },
        { id: "norte-29", from: "Gondán", to: "Mondoñedo", distance: 15.6, intermediateStops: [] },
        { id: "norte-30", from: "Mondoñedo", to: "Abadín", distance: 16.6, intermediateStops: [] },
        { id: "norte-31", from: "Abadín", to: "Vilalba", distance: 20.8, intermediateStops: [] },
        { id: "norte-32", from: "Vilalba", to: "Baamonde", distance: 18.5, intermediateStops: [] },
        { id: "norte-33", from: "Baamonde", to: "Sobrado dos Monxes", distance: 39.8, intermediateStops: [] },
        { id: "norte-34", from: "Sobrado dos Monxes", to: "Arzúa", distance: 22.0, intermediateStops: [] },
        { id: "norte-35", from: "Arzúa", to: "O Pedrouzo", distance: 19.3, intermediateStops: [] },
        { id: "norte-36", from: "O Pedrouzo", to: "Santiago de Compostela", distance: 19.4, intermediateStops: [] }
    ]
    }




];
