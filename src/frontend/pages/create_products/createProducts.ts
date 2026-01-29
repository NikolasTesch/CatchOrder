import './style.css';

interface Category {
    id: string;
    name: string;
}

document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name') as HTMLInputElement | null;
    const priceInput = document.getElementById('price') as HTMLInputElement | null;
    const categorySelect = document.getElementById('category') as HTMLSelectElement | null;
    const btnSubmit = document.querySelector('.btn-submit') as HTMLButtonElement | null;

    // Back button
    const btnBack = document.querySelector('.icon-btn') as HTMLElement | null;
    if (btnBack) {
        btnBack.addEventListener('click', () => window.location.href = '../products.html');
    }

    init();

    function init(): void {
        fetchCategories();
        setupEventListeners();
    }

    function setupEventListeners(): void {
        if (btnSubmit) {
            btnSubmit.addEventListener('click', handleCreateProduct);
        }
    }

    async function fetchCategories(): Promise<void> {
        try {
            const response = await fetch('http://localhost:3000/categories');
            const data = await response.json();

            if (response.ok && categorySelect) {
                const categories: Category[] = data.data || [];
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.name;
                    categorySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    async function handleCreateProduct(): Promise<void> {
        if (!nameInput || !priceInput || !categorySelect) return;

        const name = nameInput.value.trim();
        const price = parseFloat(priceInput.value);
        const category_id = categorySelect.value;
        const description = "Descricao automatica"; // Placeholder for now as UI doesn't have it explicitly mapped yet

        if (!name || isNaN(price) || !category_id) {
            alert('Por favor, preencha todos os campos obrigatórios (Nome, Preço, Categoria).');
            return;
        }

        try {
            const payload = {
                name,
                price,
                category_id,
                description,
                // Assuming image_path is optional or backend handles it
                image_path: '',
                is_active: true
            };

            const response = await fetch('http://localhost:3000/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Produto criado com sucesso!');
                window.location.href = '../products.html';
            } else {
                const data = await response.json();
                alert('Erro ao criar produto: ' + (data.message || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Erro de conexão.');
        }
    }
});
