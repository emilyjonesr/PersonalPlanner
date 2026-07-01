import { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import Modal from '../components/common/Modal';
import GroceryList from '../components/meals/GroceryList';
import CustomList from '../components/meals/CustomList';
import useMeals from '../hooks/useMeals';
import useShoppingLists from '../hooks/useShoppingLists';
import { formatWeekLabel } from '../utils/dates';
import pageStyles from './Page.module.css';
import styles from './ShoppingPage.module.css';

const GROCERIES_ID = 'groceries';

export default function ShoppingPage() {
  const meals = useMeals();
  const lists = useShoppingLists();
  const [activeList, setActiveList] = useState(GROCERIES_ID);
  const [modalOpen, setModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleAddList = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    lists.addList(newListName.trim());
    setNewListName('');
    setModalOpen(false);
  };

  const activeCustom = lists.shoppingLists.find((l) => l.id === activeList);

  return (
    <>
      <TopBar title="Shopping" />
      <div className={styles.chips}>
        <button
          className={`${styles.chip}${activeList === GROCERIES_ID ? ` ${styles.chipActive}` : ''}`}
          onClick={() => setActiveList(GROCERIES_ID)}
        >
          Groceries
        </button>
        {lists.shoppingLists.map((l) => (
          <button
            key={l.id}
            className={`${styles.chip}${activeList === l.id ? ` ${styles.chipActive}` : ''}`}
            onClick={() => setActiveList(l.id)}
          >
            {l.name}
          </button>
        ))}
        <button className={styles.chipAdd} onClick={() => setModalOpen(true)}>+</button>
      </div>
      {activeList === GROCERIES_ID ? (
        <GroceryList
          groceryList={meals.groceryList}
          removeGroceryItem={meals.removeGroceryItem}
          addGroceryItem={meals.addGroceryItem}
        />
      ) : activeCustom ? (
        <CustomList
          list={activeCustom}
          onAddItem={lists.addItem}
          onRemoveItem={lists.removeItem}
          onRemoveList={(id) => {
            lists.removeList(id);
            setActiveList(GROCERIES_ID);
          }}
        />
      ) : null}
      {activeList === GROCERIES_ID && (
        <div className={styles.weekNav}>
          <button onClick={() => meals.navigateWeek(-1)}>‹</button>
          <span className={styles.weekLabel}>{formatWeekLabel(meals.currentWeek)}</span>
          <button onClick={() => meals.navigateWeek(1)}>›</button>
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New List">
        <form onSubmit={handleAddList} className={pageStyles.modalForm}>
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="e.g. Target, Costco..."
            className={pageStyles.modalInput}
            autoFocus
          />
          <button type="submit" className={pageStyles.modalSubmit}>Create List</button>
        </form>
      </Modal>
    </>
  );
}
