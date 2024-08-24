class TableManager {
    constructor(tableId, columns, data = [], filters = {}, selectedItems = [], contextMenuOptions = [], defaultSort = null, allowMultipleSelection = true, onItemClick = null) {
        this.tableId = tableId;
        this.columns = columns;
        this.data = data;
        this.filters = filters;
        this.selectedItems = selectedItems;
        this.contextMenuOptions = contextMenuOptions;
        this.defaultSort = defaultSort;
        this.allowMultipleSelection = allowMultipleSelection;
        this.onItemClick = onItemClick; // Función opcional a ejecutar al hacer clic en un ítem
        this.initTable();
        this.loadStoredFilters();

        if (this.defaultSort) {
            this.sortItems(this.defaultSort.columnId, this.defaultSort.order);
        }
    }

    // Inicializa la tabla
    initTable() {
        this.renderTable();
        this.applyFilters();
        this.attachEventListeners();
    }

    // Renderiza la tabla
    renderTable(filteredData = this.data) {
        const table = document.getElementById(this.tableId);
        table.innerHTML = '';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        this.columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.name;
            th.dataset.columnId = col.id;
            if (col.sortable) {
                th.classList.add('sortable');
                th.addEventListener('click', () => {
                    this.sortItems(col.id);
                });
            }
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        filteredData.forEach(item => {
            const row = document.createElement('tr');
            row.dataset.itemId = item.id;
            this.columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = item[col.id];
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        this.updateSelectedUI();
        this.updateSortUI(); // Ensure the sort UI is updated after rendering
    }

    

    // Aplica los filtros a los datos
    applyFilters() {
        const filteredData = this.data.filter(item => {
            return Object.keys(this.filters).every(key => {
                const filterValue = this.filters[key];
                if (!filterValue) return true;
                return item[key].toLowerCase().includes(filterValue.toLowerCase());
            });
        });
        this.renderTable(filteredData);
    }

    // Almacena la configuración de los filtros aplicados
    saveFilters() {
        localStorage.setItem(`${this.tableId}-filters`, JSON.stringify(this.filters));
    }

    // Carga la configuración de filtros almacenada
    loadStoredFilters() {
        const storedFilters = JSON.parse(localStorage.getItem(`${this.tableId}-filters`));
        if (storedFilters) {
            this.filters = storedFilters;
            this.applyFilters();
        }
    }

    // Actualiza la tabla con nuevos datos
    updateData(newData) {
        this.data = newData;
        this.applyFilters();
    }

    // Actualiza los filtros y vuelve a renderizar la tabla
    updateFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        this.saveFilters();
        this.applyFilters();
    }

    // Método para ordenar los ítems
    sortItems(columnId, order) {
        // Toggle the order if not specified
        if (!order) {
            order = this.currentSortColumn === columnId && this.currentSortOrder === 'asc' ? 'desc' : 'asc';
        }

        this.currentSortColumn = columnId;
        this.currentSortOrder = order;

        this.data.sort((a, b) => {
            const aValue = a[columnId];
            const bValue = b[columnId];

            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });

        this.renderTable();
        this.updateSortUI();
    }

    updateSortUI() {
        const headers = document.querySelectorAll(`#${this.tableId} th`);
        headers.forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.columnId === this.currentSortColumn) {
                th.classList.add(`sort-${this.currentSortOrder}`);
            }
        });
    }

    // Maneja la selección de un ítem
    selectItem(itemId) {
        const item = this.data.find(item => item.id === parseInt(itemId, 10));

        if (this.allowMultipleSelection) {
            const itemIndex = this.selectedItems.indexOf(item);
            if (itemIndex > -1) {
                this.selectedItems.splice(itemIndex, 1); // Deseleccionar el ítem si ya estaba seleccionado
            } else {
                this.selectedItems.push(item); // Seleccionar el ítem
            }
        } else {
            if (this.selectedItems.includes(item)) {
                this.selectedItems = []; // Deseleccionar el ítem si ya estaba seleccionado
            } else {
                this.selectedItems = [item]; // Seleccionar el ítem
            }
        }

        this.updateSelectedUI();
    }

    // Actualiza la UI de ítems seleccionados
    updateSelectedUI() {
        const rows = document.querySelectorAll(`#${this.tableId} tbody tr`);
        rows.forEach(row => {
            const itemId = parseInt(row.dataset.itemId, 10);
            if (this.selectedItems.some(item => item.id === itemId)) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }
        });
    }

    // Obtiene los ítems seleccionados
    getSelectedItems() {
        return this.selectedItems;
    }

    // Muestra el menú contextual
    showContextMenu(event, itemId) {
        event.preventDefault();

        // Eliminar cualquier menú contextual existente
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const contextMenu = document.createElement('div');
        contextMenu.classList.add('context-menu');

        this.contextMenuOptions.forEach(option => {
            const menuItem = document.createElement('div');
            menuItem.classList.add('context-menu-item');
            menuItem.textContent = option.label;
            menuItem.addEventListener('click', () => {
                option.action(itemId);
                contextMenu.remove(); // Eliminar el menú después de hacer clic en una opción
            });
            contextMenu.appendChild(menuItem);
        });

        document.body.appendChild(contextMenu);

        const { clientX: mouseX, clientY: mouseY } = event;
        const { clientWidth: menuWidth, clientHeight: menuHeight } = contextMenu;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Asegurar que el menú no salga de la ventana
        contextMenu.style.top = `${mouseY + menuHeight > windowHeight ? windowHeight - menuHeight : mouseY}px`;
        contextMenu.style.left = `${mouseX + menuWidth > windowWidth ? windowWidth - menuWidth : mouseX}px`;

        // Ocultar el menú al hacer clic en otro lugar
        document.addEventListener('click', () => {
            contextMenu.remove();
        }, { once: true });
    }
    // Añade o quita columnas de la tabla
    updateColumns(newColumns) {
        this.columns = newColumns;
        this.renderTable();
    }

    // Adjunta los event listeners necesarios
    attachEventListeners() {
        const table = document.getElementById(this.tableId);

        // Evento para manejar la selección de ítems
        table.addEventListener('click', event => {
            if (event.target.tagName === 'TD') {
                const row = event.target.parentElement;
                this.selectItem(row.dataset.itemId);
                if (this.onItemClick) {
                    this.onItemClick(row.dataset.itemId); // Ejecuta la función parametrizada
                }
            }
        });

        // Evento para manejar el menú contextual
        table.addEventListener('contextmenu', event => {
            if (this.contextMenuOptions.length > 0) {
                if (event.target.tagName === 'TD') {
                    const row = event.target.parentElement;
                    this.showContextMenu(event, row.dataset.itemId);
                }
            } else {
                event.preventDefault(); // Prevenir el menú contextual por defecto si no hay opciones definidas
            }
        });
    }

    clearSelection() {
        this.selectedItems = [];
        this.updateSelectedUI();
    }
}
