import './style.css';
import { ApiService } from "../../services/apiService";

export { };

interface Category {
  id: string;
  name: string;
}

document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name") as HTMLInputElement | null;
  const priceInput = document.getElementById(
    "price",
  ) as HTMLInputElement | null;
  const categorySelect = document.getElementById(
    "category",
  ) as HTMLSelectElement | null;
  const btnSubmit = document.getElementById(
    "submitBtn",
  ) as HTMLButtonElement | null;

  // Back button
  const btnBack = document.querySelector(".icon-btn") as HTMLElement | null;
  if (btnBack) {
    btnBack.addEventListener(
      "click",
      () => (window.location.href = "products.html"),
    );
  }

  init();

  function init(): void {
    fetchCategories();
    setupEventListeners();
  }

  function setupEventListeners(): void {
    if (btnSubmit) {
      btnSubmit.addEventListener("click", handleCreateProduct);
    }
  }

  async function fetchCategories(): Promise<void> {
    try {
      const response = await ApiService.get<{ data: Category[] }>(
        "/categories",
      );

      if (response && response.data && categorySelect) {
        const categories = response.data;
        categories.forEach((cat) => {
          const option = document.createElement("option");
          option.value = cat.id;
          option.textContent = cat.name;
          categorySelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Erro ao carregar categorias.");
    }
  }

  async function handleCreateProduct(): Promise<void> {
    if (!nameInput || !priceInput || !categorySelect) return;

    const name = nameInput.value.trim();
    const priceInReais = parseFloat(priceInput.value);
    const price = Math.round(priceInReais * 100); // Converter para centavos
    const category_id = categorySelect.value;
    const description = "Descricao automatica"; // Placeholder

    if (!name || isNaN(price) || !category_id) {
      alert(
        "Por favor, preencha todos os campos obrigatórios (Nome, Preço, Categoria).",
      );
      return;
    }

    try {
      const payload = {
        name,
        price,
        category_id,
        description,
        image_path: "",
        is_active: true,
      };

      await ApiService.post("/products", payload);

      alert("Produto criado com sucesso!");
      window.location.href = "products.html";
    } catch (error: any) {
      console.error("Error creating product:", error);
      alert(error.message || "Erro ao criar produto");
    }
  }
});
