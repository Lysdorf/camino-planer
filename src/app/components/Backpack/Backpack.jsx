import styles from "./Backpack.module.css";

import { useMemo, useState, useSyncExternalStore } from "react";

import {
  getBackpackSnapshot,
  getBackpackServerSnapshot,
  saveBackpackItems,
  subscribeBackpack
} from "../../lib/caminoStore";

import {
  getCustomBackpackSnapshot,
  getCustomBackpackServerSnapshot,
  saveCustomBackpackItems,
  subscribeCustomBackpack,
  getBackpackDetailsSnapshot,
  getBackpackDetailsServerSnapshot,
  saveBackpackDetails,
  subscribeBackpackDetails
} from "../../lib/caminoStore";



const equipment = [
  {
    id: "clothes",
    category: "Одежда и обувь",
    items: [
      { id: "boots", name: "Треккинговые ботинки", weight: 900, price: 85 },
      { id: "socks", name: "Запасные носки", weight: 80, price: 8 },
      { id: "shirts", name: "Футболки", weight: 180, price: 15 },
      { id: "pants", name: "Штаны", weight: 300, price: 25 }
    ]
  },
  {
    id: "hygiene",
    category: "Гигиена",
    items: [
      { id: "toothbrush", name: "Зубная щётка", weight: 20, price: 2 },
      { id: "toothpaste", name: "Зубная паста", weight: 75, price: 3 },
      { id: "towel", name: "Полотенце", weight: 150, price: 12 },
      { id: "sunscreen", name: "Солнцезащитный крем", weight: 100, price: 8 }
    ]
  },
  {
    id: "electronics",
    category: "Электроника",
    items: [
      { id: "phone", name: "Телефон", weight: 200, price: 0 },
      { id: "charger", name: "Зарядное устройство", weight: 100, price: 15 },
      { id: "powerbank", name: "Пауэрбанк", weight: 250, price: 25 },
      { id: "headphones", name: "Наушники", weight: 50, price: 20 }
    ]
  },
  {
    id: "documents",
    category: "Документы",
    items: [
      { id: "passport", name: "Паспорт", weight: 50, price: 0 },
      { id: "insurance", name: "Страховка", weight: 10, price: 0 },
      { id: "credential", name: "Credencial del Peregrino", weight: 30, price: 2 }
    ]
  },
  {
    id: "first-aid",
    category: "Аптечка",
    items: [
      { id: "plasters", name: "Пластыри", weight: 20, price: 3 },
      { id: "blister-treatment", name: "Средство от мозолей", weight: 30, price: 6 },
      { id: "painkillers", name: "Обезболивающее", weight: 20, price: 4 }
    ]
  },
  {
    id: "other",
    category: "Прочее",
    items: [
      { id: "backpack", name: "Рюкзак", weight: 1200, price: 100 },
      { id: "water-bottle", name: "Бутылка для воды", weight: 150, price: 10 },
      { id: "raincoat", name: "Дождевик", weight: 250, price: 20 }
    ]
  }
];




export default function Backpack() {
    const [editingItemId, setEditingItemId] = useState(null);
    const [editedName, setEditedName] = useState("");
    const [editedWeight, setEditedWeight] = useState("");
    const [editedPrice, setEditedPrice] = useState("");

  const checkedItems = useSyncExternalStore(
    subscribeBackpack,
    getBackpackSnapshot,
    getBackpackServerSnapshot
  );

  const customItems = useSyncExternalStore(
    subscribeCustomBackpack,
    getCustomBackpackSnapshot,
    getCustomBackpackServerSnapshot
  );  

  const backpackDetails = useSyncExternalStore(
    subscribeBackpackDetails,
    getBackpackDetailsSnapshot,
    getBackpackDetailsServerSnapshot
  );

  const allItems = useMemo(() => {
    return equipment.flatMap(category => [
        ...category.items,
        ...customItems.filter(item => item.categoryId === category.id)
    ]);
  }, [customItems]);

  const backpackStats = useMemo(() => {
    const totalWeight = allItems.reduce((total, item) => {
        const weight = Number(
        backpackDetails[item.id]?.weight ?? item.weight ?? 0
        );

        return total + weight;
    }, 0);

    const packedWeight = allItems.reduce((total, item) => {
        if (!checkedItems.includes(item.id)) {
        return total;
        }

        const weight = Number(
        backpackDetails[item.id]?.weight ?? item.weight ?? 0
        );

        return total + weight;
    }, 0);

    const totalPrice = allItems.reduce((total, item) => {
        if (checkedItems.includes(item.id)) {
            return total;
        }

        const price = Number(
            backpackDetails[item.id]?.price ?? item.price ?? 0
        );

        return total + price;
    }, 0);

    const progress = allItems.length > 0
        ? Math.round(checkedItems.length / allItems.length * 100)
        : 0;

    return {
        totalWeight,
        packedWeight,
        totalPrice,
        progress
    };
  }, [allItems, backpackDetails, checkedItems]);

  function handleToggleItem(itemId) {
    const updatedItems = checkedItems.includes(itemId)
      ? checkedItems.filter(id => id !== itemId)
      : [...checkedItems, itemId];

    saveBackpackItems(updatedItems);
  }

  function handleAddItem(event) {
    event.preventDefault();

    const trimmedName = newItemName.trim();

    if (!trimmedName) return;

    const newItem = {
        id: crypto.randomUUID(),
        categoryId: selectedCategory,
        name: trimmedName,
        weight: 0,
        price: 0
    };

    saveCustomBackpackItems([...customItems, newItem]);
    setNewItemName("");
  }

  function handleDeleteItem(itemId) {
    const updatedCustomItems = customItems.filter(
        item => item.id !== itemId
    );

    const updatedCheckedItems = checkedItems.filter(
        id => id !== itemId
    );

    saveCustomBackpackItems(updatedCustomItems);
    saveBackpackItems(updatedCheckedItems);
  }

    function handleCancelEdit() {
        setEditingItemId(null);
        setEditedName("");
    }

    function handleSaveEdit(item) {
        const trimmedName = editedName.trim();
        const weight = Number(editedWeight);
        const price = Number(editedPrice.replace(",", "."));

        if (
            !trimmedName ||
            editedWeight.trim() === "" ||
            editedPrice.trim() === "" ||
            !Number.isFinite(weight) ||
            !Number.isFinite(price) ||
            weight < 0 ||
            price < 0
        ) {
            return;
        }

        const updatedDetails = {
            ...backpackDetails,
            [item.id]: { weight, price }
        };

        saveBackpackDetails(updatedDetails);

        const customItem = customItems.find(
            currentItem => currentItem.id === item.id
        );

        if (customItem) {
            saveCustomBackpackItems(
            customItems.map(currentItem =>
                currentItem.id === item.id
                ? { ...currentItem, name: trimmedName }
                : currentItem
            )
            );
        }

        handleCancelEdit();
    }

    function handleStartEdit(item) {
        setEditingItemId(item.id);
        setEditedName(item.name);
        setEditedWeight(String(backpackDetails[item.id]?.weight ?? item.weight));
        setEditedPrice(String(backpackDetails[item.id]?.price ?? item.price));
    }

  const totalItems = equipment.reduce(
    (total, category) => total + category.items.length,
    0
  ) + customItems.length;

  const progress = checkedItems.length;

  const [newItemName, setNewItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("clothes");



  return (
    <section className={styles.backpack}>
        <h2>Чеклист рюкзака</h2>

        <div className={styles.stats}>
        <div className={styles.statCard}>
            <span>Общий вес</span>
            <strong>
            {(backpackStats.totalWeight / 1000).toFixed(2)} кг
            </strong>
        </div>

        <div className={styles.statCard}>
            <span>Уже собрано</span>
            <strong>
            {(backpackStats.packedWeight / 1000).toFixed(2)} кг
            </strong>
        </div>

        <div className={styles.statCard}>
            <span>Осталось потратить</span>
            <strong>
            {backpackStats.totalPrice.toFixed(2)} €
            </strong>
        </div>

        <div className={styles.statCard}>
            <span>Готовность</span>
            <strong>
            {progress} / {totalItems}
            </strong>
        </div>
        </div>

        <div className={styles.progressBar}>
        <div
            className={styles.progressFill}
            style={{ width: `${backpackStats.progress}%` }}
        />
        </div>

        <p>{backpackStats.progress}% снаряжения собрано</p>

      <form onSubmit={handleAddItem} className={styles.addForm}>
        <input
            type="text"
            value={newItemName}
            onChange={(event) => setNewItemName(event.target.value)}
            placeholder="Название предмета"
        />

        <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
        >
            {equipment.map(category => (
            <option key={category.id} value={category.id}>
                {category.category}
            </option>
            ))}
        </select>

        <button type="submit">Добавить</button>
      </form>

      {equipment.map(category => (
        <div key={category.id} className={styles.category}>
          <h3>{category.category}</h3>

          {[...category.items, ...customItems.filter(
            item => item.categoryId === category.id
            )].map(item => (

            <div key={item.id} className={styles.item}>
            <input
                type="checkbox"
                checked={checkedItems.includes(item.id)}
                onChange={() => handleToggleItem(item.id)}
            />

            {editingItemId === item.id ? (
                <>
                {customItems.some(customItem => customItem.id === item.id) ? (
                    <input
                    type="text"
                    value={editedName}
                    onChange={event => setEditedName(event.target.value)}
                    autoFocus
                    />
                ) : (
                    <span>{item.name}</span>
                )}

                <input
                    type="text"
                    inputMode="numeric"
                    value={editedWeight}
                    onChange={event => setEditedWeight(event.target.value)}
                    placeholder="Вес, г"
                    className={styles.editInput}
                />

                <input
                    type="text"
                    inputMode="decimal"
                    value={editedPrice}
                    onChange={event => setEditedPrice(event.target.value)}
                    placeholder="Цена, €"
                    className={styles.editInput}
                />

                <button
                    type="button"
                    onClick={() => handleSaveEdit(item)}
                >
                    Сохранить
                </button>

                <button
                    type="button"
                    onClick={handleCancelEdit}
                >
                    Отмена
                </button>
                </>
            ) : (
                <>
                <span className={
                    checkedItems.includes(item.id) ? styles.checked : ""
                }>
                    {item.name}
                </span>

                <span className={styles.itemDetails}>
                    {Number(backpackDetails[item.id]?.weight ?? item.weight ?? 0)} г ·{" "}
                    {Number(backpackDetails[item.id]?.price ?? item.price ?? 0).toFixed(2)} €
                </span>

                <button
                    type="button"
                    className={styles.editButton}
                    onClick={() => handleStartEdit(item)}
                    aria-label={`Редактировать ${item.name}`}
                >
                    ✎
                </button>

                {customItems.some(customItem => customItem.id === item.id) && (
                    <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleDeleteItem(item.id)}
                    aria-label={`Удалить ${item.name}`}
                    >
                    ×
                    </button>
                )}
                </>
            )}
            </div>


          ))}
        </div>
      ))}
    </section>
  );
}
