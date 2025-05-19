// Detecta preferência de tema do sistema
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Inicializa tema baseado na preferência do usuário ou do navegador
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcons(true);
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        updateThemeIcons(false);
    }
}

// Atualiza os ícones com base no tema atual
function updateThemeIcons(isDark) {
    const headerThemeToggle = document.getElementById('theme-toggle');
    const floatThemeToggle = document.getElementById('theme-toggle-float');
    
    if (isDark) {
        headerThemeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        floatThemeToggle.innerHTML = '<span class="tooltip">Modo claro</span><i class="fas fa-sun"></i>';
    } else {
        headerThemeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        floatThemeToggle.innerHTML = '<span class="tooltip">Modo escuro</span><i class="fas fa-moon"></i>';
    }
}

// Alterna entre temas claro/escuro
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateThemeIcons(true);
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        updateThemeIcons(false);
    }
}

// Inicialização dos event listeners para o tema
function initThemeListeners() {
    const headerThemeToggle = document.getElementById('theme-toggle');
    const floatThemeToggle = document.getElementById('theme-toggle-float');
    
    headerThemeToggle.addEventListener('click', toggleTheme);
    floatThemeToggle.addEventListener('click', toggleTheme);
}

// Função para ordenar alimentos por quantidade de proteína
function sortFoodItemsByProtein() {
    // Seleciona todas as opções de conteúdo (cada opção A, B, C, etc de cada refeição)
    const optionContents = document.querySelectorAll('.option-content');
    
    optionContents.forEach(optionContent => {
        // Ignorar a seção de suplementação
        if (optionContent.id === 'supplements-content') return;
        
        // Seleciona os itens de comida nesta opção, excluindo o item de total
        const foodItemsContainer = optionContent;
        const totalElement = foodItemsContainer.querySelector('.option-total');
        let foodItems = Array.from(foodItemsContainer.querySelectorAll('.food-item:not(.option-total)'));
        
        if (foodItems.length <= 1) return; // Não precisa ordenar se tiver apenas um item
        
        // Extrair valor de proteína de cada item
        const itemsWithProtein = foodItems.map(item => {
            const proteinElement = item.querySelector('.macro-proteina');
            let proteinValue = 0;
            
            if (proteinElement) {
                // Extrair o valor numérico da proteína (ex: '25g Proteína' -> 25)
                const proteinText = proteinElement.textContent;
                const match = proteinText.match(/([\d.]+)g/);
                if (match && match[1]) {
                    proteinValue = parseFloat(match[1]);
                }
            }
            
            return { element: item, proteinValue };
        });
        
        // Ordenar por valor de proteína (maior para menor)
        itemsWithProtein.sort((a, b) => b.proteinValue - a.proteinValue);
        
        // Remover todos os itens do DOM
        foodItems.forEach(item => item.remove());
        
        // Reinserir na nova ordem
        if (totalElement) {
            // Se tiver um elemento de total, insere antes dele
            itemsWithProtein.forEach(item => {
                foodItemsContainer.insertBefore(item.element, totalElement);
            });
        } else {
            // Se não tiver um elemento de total, apenas adiciona no final
            itemsWithProtein.forEach(item => {
                foodItemsContainer.appendChild(item.element);
            });
        }
    });
}

// Inicializa tema e funcionalidades ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initThemeListeners();
    sortFoodItemsByProtein();
});

// Função para alternar entre as opções de cada refeição
function openOption(mealType, option) {
    // Esconde todas as opções dessa refeição
    const contents = document.querySelectorAll(`[id^="${mealType}-"]`);
    contents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove a classe ativa de TODOS os botões dessa refeição
    // Encontramos o contêiner das tabs pelo container da opção selecionada
    const tabsContainer = document.getElementById(`${mealType}-${option}`)
        .closest('.options-container')
        .querySelector('.options-tabs');
    
    // Agora removemos a classe 'active' de todos os botões nesse container
    const allTabs = tabsContainer.querySelectorAll('.option-tab');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostra a opção selecionada
    const selectedOption = document.getElementById(`${mealType}-${option}`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    // Adiciona a classe ativa apenas ao botão clicado
    const clickedButton = event.currentTarget;
    clickedButton.classList.add('active');
}

// Função para gerar o PDF
function generatePDF() {
    // Obter todas as abas ativas para restaurá-las depois
    const activeContents = document.querySelectorAll('.option-content.active');
    const activeTabs = document.querySelectorAll('.option-tab.active');
    const activeIds = Array.from(activeContents).map(content => content.id);
    
    // Esconder os botões flutuantes para o PDF
    const floatingButtons = document.querySelector('.floating-buttons');
    floatingButtons.style.display = 'none';
    
    // Verificar o tema atual e alternar para claro para PDF, se necessário
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const needThemeRestore = currentTheme === 'dark';
    if (needThemeRestore) {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Mostrar todas as opções para o PDF ter conteúdo completo
    const allContents = document.querySelectorAll('.option-content');
    allContents.forEach(content => {
        content.classList.add('active');
    });
    
    const element = document.body;
    
    // Opções para o PDF
    const options = {
        margin: [10, 10, 10, 10],
        filename: 'Minha-Dieta-Personalizada.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Gera o PDF
    html2pdf().set(options).from(element).save().then(() => {
        // Restaura as opções ativas originais
        allContents.forEach(content => {
            content.classList.remove('active');
        });
        activeIds.forEach(id => {
            document.getElementById(id).classList.add('active');
        });
        
        // Restaura o tema, se necessário
        if (needThemeRestore) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        
        // Mostra os botões flutuantes novamente
        floatingButtons.style.display = 'flex';
    }).catch(error => {
        console.error('Erro ao gerar PDF:', error);
        floatingButtons.style.display = 'flex';
        
        // Restaura as opções ativas e tema em caso de erro
        allContents.forEach(content => {
            content.classList.remove('active');
        });
        activeIds.forEach(id => {
            document.getElementById(id).classList.add('active');
        });
        
        if (needThemeRestore) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        
        alert('Houve um erro ao gerar o PDF. Por favor, tente novamente.');
    });
} 