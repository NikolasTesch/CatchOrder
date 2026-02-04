import './style.css'; // Importa o CSS para o Webpack processar




const initNavbarScroll = (): void => {
    const navbar = document.querySelector('.navbar') as HTMLElement;

    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            // Vamos manipular o CSS via classe, mas aqui garantimos que
            // o estilo inline não atrapalhe se houver
            navbar.style.boxShadow = 'var(--shadow-md)';
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.boxShadow = 'none';
        }
    });
};

const initMobileMenu = (): void => {
    const menuToggle = document.getElementById('menuToggle') as HTMLButtonElement;
    const navLinks = document.getElementById('navLinks') as HTMLElement;

    if (!menuToggle || !navLinks) return;

    // Toggle menu quando clicar no botão
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Fechar menu quando clicar em um link
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Fechar menu ao clicar fora dele
    document.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!menuToggle.contains(target) && !navLinks.contains(target)) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
};

const initScrollAnimations = (): void => {
    const observerOptions: IntersectionObserverInit = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.15 // 15% do elemento visível dispara a animação
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target as HTMLElement;
                target.classList.add('visible'); // Adiciona a classe que tem opacity: 1
                target.classList.add('fade-in-up'); // Reaproveita sua animação CSS
                observer.unobserve(target); // Para de observar após animar
            }
        });
    }, observerOptions);

    // Seleciona todos os elementos que devem ser animados
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach(el => observer.observe(el));
};
const initSmoothScrollAnchor = (): void => {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e: Event) => {
            e.preventDefault();

            const targetId = (link as HTMLAnchorElement).getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId) as HTMLElement;
            if (targetElement) {
                const headerOffset = 80; // Altura aproximada da sua Navbar
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
};

const initContactModal = (): void => {
    const modal = document.getElementById('contact-modal') as HTMLElement;
    const btnStart = document.getElementById('btn-start-now');
    const btnClose = document.getElementById('modal-close');
    const form = document.getElementById('contact-form') as HTMLFormElement;

    if (!modal || !btnStart || !btnClose) return;

    // Open Modal
    btnStart.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('open');
    });

    // Close Modal (X button)
    btnClose.addEventListener('click', () => {
        modal.classList.remove('open');
    });

    // Close Modal (Click outside)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('open');
        }
    });

    // Handle Form Submit
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('name') as HTMLInputElement;
            const emailInput = document.getElementById('email') as HTMLInputElement;
            const phoneInput = document.getElementById('phone') as HTMLInputElement;

            const nameValue = nameInput.value.trim();
            const emailValue = emailInput.value.trim();
            const phoneValue = phoneInput.value.trim();

            // Validation Regex
            const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,}$/;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            // Phone: Allows (XX) XXXXX-XXXX, XX XXXXX-XXXX, XXXXXXXXXXX
            const phoneRegex = /^[\d\s\(\)-]{10,20}$/;

            // Validate Name
            if (!nameRegex.test(nameValue)) {
                alert('Por favor, insira um nome válido (apenas letras, mínimo 3 caracteres).');
                nameInput.focus();
                return;
            }

            // Validate Email
            if (!emailRegex.test(emailValue)) {
                alert('Por favor, insira um email válido.');
                emailInput.focus();
                return;
            }

            // Validate Phone
            if (!phoneRegex.test(phoneValue)) {
                alert('Por favor, insira um telefone válido.');
                phoneInput.focus();
                return;
            }

            console.log('📝 Novo Lead:', {
                name: nameValue,
                email: emailValue,
                phone: phoneValue
            });

            alert('Obrigado! Entraremos em contato em breve.');
            form.reset();
            modal.classList.remove('open');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initNavbarScroll();
    initMobileMenu();
    initScrollAnimations();
    initSmoothScrollAnchor();
    initContactModal();
    console.log('🚀 CatchOrder Landing Page Initialized');
});