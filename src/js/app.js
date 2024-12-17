/* eslint-disable no-use-before-define */
let draggedCard = null;
let placeholder = null;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;

document.addEventListener('DOMContentLoaded', () => {
  loadStateFromStorage();

  const board = document.querySelector('.board');

  // Добавляем события для кнопок и перетаскивания
  board.addEventListener('click', onClick);
  board.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

function onClick(event) {
  if (event.target.classList.contains('add-card')) {
    const listId = event.target.closest('.list').id;
    showCardInput(listId);
  } else if (event.target.classList.contains('add-btn')) {
    const listId = event.target.closest('.list').id;
    addCard(listId);
  } else if (event.target.classList.contains('cancel-btn')) {
    cancelCardInput(event.target.closest('.new-card-form')); // Передаём форму
  } else if (event.target.classList.contains('card')) {
    const rect = event.target.getBoundingClientRect();
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Проверяем, попал ли клик в область крестика (20px от правого верхнего угла)
    // eslint-disable-next-line max-len
    if (mouseX > rect.right - 20 && mouseX < rect.right && mouseY > rect.top && mouseY < rect.top + 20) {
      event.target.remove(); // Удаляем карточку
      saveStateToStorage();
    }
  }
}

function cancelCardInput(form) {
  if (form) {
    form.remove(); // Удаляем форму из DOM
  }
}

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('card')) {
    const rect = event.target.getBoundingClientRect();
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // eslint-disable-next-line max-len
    if (mouseX > rect.right - 20 && mouseX < rect.right && mouseY > rect.top && mouseY < rect.top + 20) {
      event.target.remove();
      saveStateToStorage();
    }
  }
});

function showCardInput(listId) {
  const list = document.getElementById(listId);
  const cardsContainer = list.querySelector('.cards');

  if (list.querySelector('.new-card-form')) return;

  const form = document.createElement('div');
  form.className = 'new-card-form';
  form.innerHTML = `
    <textarea placeholder="Enter a title for this card..." class="new-card-input"></textarea>
    <div class="new-card-actions">
        <button class="add-btn">Add Card</button>
        <button class="cancel-btn">X</button>
    </div>`;
  cardsContainer.appendChild(form);
}

function addCard(listId) {
  const list = document.getElementById(listId);
  const input = list.querySelector('.new-card-input');
  const cardsContainer = list.querySelector('.cards');

  if (input && input.value.trim()) {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = input.value.trim();

    cardsContainer.appendChild(card);
    input.closest('.new-card-form').remove();
    saveStateToStorage();
  }
}

function onMouseDown(event) {
  const card = event.target.closest('.card');

  // Если карточка не найдена или клик был по крестику
  if (!card || isClickOnDeleteZone(event, card)) {
    return; // Прерываем выполнение (не начинаем перетаскивание)
  }

  event.preventDefault();

  isDragging = false;
  draggedCard = card;

  draggedCard.classList.add('dragging');

  const rect = draggedCard.getBoundingClientRect();
  draggedCard.style.width = `${rect.width}px`;
  draggedCard.style.height = `${rect.height}px`;

  offsetX = event.clientX - rect.left;
  offsetY = event.clientY - rect.top;

  placeholder = document.createElement('div');
  placeholder.className = 'placeholder';
  placeholder.style.height = `${rect.height}px`;

  draggedCard.after(placeholder);
  document.body.appendChild(draggedCard);

  draggedCard.style.position = 'absolute';
  draggedCard.style.zIndex = '1000';

  moveCard(event.pageX, event.pageY);

  const dragTimeout = setTimeout(() => {
    isDragging = true;
  }, 200);

  document.addEventListener('mouseup', () => {
    clearTimeout(dragTimeout);
    if (!isDragging) resetCardState();
  }, { once: true },);
}

// Функция для проверки клика по зоне крестика
function isClickOnDeleteZone(event, card) {
  const rect = card.getBoundingClientRect();
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  // Задаём область крестика: 20x20 пикселей в правом верхнем углу
  // eslint-disable-next-line max-len
  return (mouseX > rect.right - 25 && mouseX < rect.right && mouseY > rect.top && mouseY < rect.top + 25);
}

function deleteCard(deleteButton) {
  deleteButton.closest('.card').remove();
  saveStateToStorage();
}

function onMouseMove(event) {
  if (!draggedCard || !isDragging) return;

  moveCard(event.pageX, event.pageY);

  const elements = document.elementsFromPoint(event.clientX, event.clientY);
  const closestCard = elements.find((el) => el.classList.contains('card') && el !== draggedCard);
  const closestList = elements.find((el) => el.classList.contains('cards'));

  if (closestCard) {
    const rect = closestCard.getBoundingClientRect();
    if (event.clientY < rect.top + rect.height / 2) {
      closestCard.before(placeholder);
    } else {
      closestCard.after(placeholder);
    }
  } else if (closestList && !closestList.contains(placeholder)) {
    closestList.appendChild(placeholder);
  }
}

function onMouseUp() {
  if (!draggedCard) return;

  placeholder.replaceWith(draggedCard);

  // Сбрасываем стили карточки
  resetCardState();
  saveStateToStorage();
}

function moveCard(pageX, pageY) {
  if (!draggedCard) return;
  draggedCard.style.left = `${pageX - offsetX}px`;
  draggedCard.style.top = `${pageY - offsetY}px`;
}

/* LocalStorage Functions */
function saveStateToStorage() {
  const state = {};
  document.querySelectorAll('.list').forEach((list) => {
    const cards = Array.from(list.querySelectorAll('.card')).map((card) => card.textContent.trim());
    state[list.id] = cards;
  });
  localStorage.setItem('boardState', JSON.stringify(state));
}

function loadStateFromStorage() {
  const state = JSON.parse(localStorage.getItem('boardState')) || {};
  Object.entries(state).forEach(([listId, cards]) => {
    const cardsContainer = document.getElementById(listId).querySelector('.cards');
    cardsContainer.innerHTML = ''; // Очищаем старое содержимое
    cards.forEach((text) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.textContent = text;
      cardsContainer.appendChild(card);
    });
  });
}

function resetCardState() {
  if (!draggedCard) return;

  // Сбрасываем все стили и классы
  draggedCard.classList.remove('dragged', 'dragging');
  draggedCard.style.position = '';
  draggedCard.style.zIndex = '';
  draggedCard.style.width = '';
  draggedCard.style.height = '';
  draggedCard.style.left = '';
  draggedCard.style.top = '';

  draggedCard = null;
  placeholder = null;
  isDragging = false;
}
