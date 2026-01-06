// Gestione dello stato dell'applicazione
class ListManager {
    constructor() {
        this.lists = [];
        this.currentListId = null;
        this.loadFromLocalStorage();
        this.initEventListeners();
        this.render();
    }

    // LocalStorage
    loadFromLocalStorage() {
        const savedLists = localStorage.getItem('elencoSpesaLists');
        if (savedLists) {
            this.lists = JSON.parse(savedLists);
        }
        const savedCurrentList = localStorage.getItem('elencoSpesaCurrentList');
        if (savedCurrentList) {
            this.currentListId = savedCurrentList;
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('elencoSpesaLists', JSON.stringify(this.lists));
        if (this.currentListId) {
            localStorage.setItem('elencoSpesaCurrentList', this.currentListId);
        }
    }

    // Inizializzazione event listeners
    initEventListeners() {
        // Pulsante nuova lista
        document.getElementById('newListBtn').addEventListener('click', () => {
            this.openNewListModal();
        });

        // Modal
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.closeNewListModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeNewListModal();
        });

        document.getElementById('createListBtn').addEventListener('click', () => {
            this.createList();
        });

        // Chiudi modal cliccando fuori
        document.getElementById('newListModal').addEventListener('click', (e) => {
            if (e.target.id === 'newListModal') {
                this.closeNewListModal();
            }
        });

        // Enter per creare lista
        document.getElementById('listNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.createList();
            }
        });

        // Aggiungi elemento
        document.getElementById('addItemBtn').addEventListener('click', () => {
            this.addItem();
        });

        document.getElementById('newItemInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addItem();
            }
        });

        // Elimina lista
        document.getElementById('deleteListBtn').addEventListener('click', () => {
            this.deleteCurrentList();
        });
    }

    // Gestione modal
    openNewListModal() {
        const modal = document.getElementById('newListModal');
        const input = document.getElementById('listNameInput');
        modal.classList.add('active');
        input.value = '';
        input.focus();
    }

    closeNewListModal() {
        const modal = document.getElementById('newListModal');
        modal.classList.remove('active');
    }

    // CRUD Liste
    createList() {
        const input = document.getElementById('listNameInput');
        const name = input.value.trim();

        if (!name) {
            alert('Inserisci un nome per la lista');
            return;
        }

        const newList = {
            id: Date.now().toString(),
            name: name,
            items: [],
            createdAt: new Date().toISOString()
        };

        this.lists.push(newList);
        this.currentListId = newList.id;
        this.saveToLocalStorage();
        this.closeNewListModal();
        this.render();
    }

    deleteCurrentList() {
        if (!this.currentListId) return;

        const listName = this.getCurrentList().name;
        if (confirm(`Sei sicuro di voler eliminare la lista "${listName}"?`)) {
            this.lists = this.lists.filter(list => list.id !== this.currentListId);
            this.currentListId = this.lists.length > 0 ? this.lists[0].id : null;
            this.saveToLocalStorage();
            this.render();
        }
    }

    selectList(listId) {
        this.currentListId = listId;
        this.saveToLocalStorage();
        this.render();
    }

    getCurrentList() {
        return this.lists.find(list => list.id === this.currentListId);
    }

    // CRUD Items
    addItem() {
        if (!this.currentListId) return;

        const input = document.getElementById('newItemInput');
        const text = input.value.trim();

        if (!text) return;

        const currentList = this.getCurrentList();
        const newItem = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        currentList.items.push(newItem);
        input.value = '';
        this.saveToLocalStorage();
        this.renderItems();
        this.renderLists();
    }

    toggleItem(itemId) {
        if (!this.currentListId) return;

        const currentList = this.getCurrentList();
        const item = currentList.items.find(item => item.id === itemId);
        if (item) {
            item.completed = !item.completed;
            this.saveToLocalStorage();
            this.renderItems();
        }
    }

    deleteItem(itemId) {
        if (!this.currentListId) return;

        const currentList = this.getCurrentList();
        currentList.items = currentList.items.filter(item => item.id !== itemId);
        this.saveToLocalStorage();
        this.renderItems();
        this.renderLists();
    }

    // Rendering
    render() {
        this.renderLists();
        this.renderMainContent();
    }

    renderLists() {
        const container = document.getElementById('listsContainer');
        container.innerHTML = '';

        if (this.lists.length === 0) {
            container.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-secondary); font-size: 14px;">Nessuna lista ancora.<br>Creane una!</div>';
            return;
        }

        this.lists.forEach(list => {
            const listElement = document.createElement('div');
            listElement.className = `list-item ${list.id === this.currentListId ? 'active' : ''}`;
            
            const itemCount = list.items.length;
            const completedCount = list.items.filter(item => item.completed).length;

            listElement.innerHTML = `
                <div class="list-item-content">
                    <span class="list-item-icon">📋</span>
                    <span>${this.escapeHtml(list.name)}</span>
                </div>
                <span class="list-item-count">${completedCount}/${itemCount}</span>
            `;

            listElement.addEventListener('click', () => {
                this.selectList(list.id);
            });

            container.appendChild(listElement);
        });
    }

    renderMainContent() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const listView = document.getElementById('listView');

        if (!this.currentListId || this.lists.length === 0) {
            welcomeMessage.style.display = 'flex';
            listView.style.display = 'none';
            return;
        }

        welcomeMessage.style.display = 'none';
        listView.style.display = 'block';

        const currentList = this.getCurrentList();
        document.getElementById('listTitle').textContent = currentList.name;
        
        this.renderItems();
    }

    renderItems() {
        const container = document.getElementById('itemsContainer');
        container.innerHTML = '';

        if (!this.currentListId) return;

        const currentList = this.getCurrentList();

        if (currentList.items.length === 0) {
            container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-secondary); font-size: 14px;">Nessun elemento. Aggiungi il primo elemento!</div>';
            return;
        }

        // Ordina: elementi non completati prima
        const sortedItems = [...currentList.items].sort((a, b) => {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1;
        });

        sortedItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = `item ${item.completed ? 'completed' : ''}`;

            itemElement.innerHTML = `
                <input 
                    type="checkbox" 
                    class="item-checkbox" 
                    ${item.completed ? 'checked' : ''}
                    data-item-id="${item.id}"
                >
                <span class="item-text">${this.escapeHtml(item.text)}</span>
                <button class="btn-delete-item" data-item-id="${item.id}" title="Elimina">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            `;

            // Event listener per checkbox
            const checkbox = itemElement.querySelector('.item-checkbox');
            checkbox.addEventListener('change', () => {
                this.toggleItem(item.id);
            });

            // Event listener per delete
            const deleteBtn = itemElement.querySelector('.btn-delete-item');
            deleteBtn.addEventListener('click', () => {
                this.deleteItem(item.id);
            });

            container.appendChild(itemElement);
        });
    }

    // Utility per prevenire XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inizializza l'applicazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    const app = new ListManager();
});
