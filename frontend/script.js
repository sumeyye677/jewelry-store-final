class JewelryApp {
    constructor() {
        this.products = [];
        this.currentIndex = 0;
        this.cardsPerView = this.getCardsPerView();
        this.isLoading = false;
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProducts();

        window.addEventListener('resize', () => {
            this.cardsPerView = this.getCardsPerView();
            this.updateCarouselPosition();
        });
    }

    setupEventListeners() {
        document.getElementById('prevBtn').addEventListener('click', () => this.previousSlide());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSlide());
        document.getElementById('applyFilters').addEventListener('click', () => this.applyFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());

        const carousel = document.getElementById('carousel');
        carousel.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        carousel.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        carousel.addEventListener('touchmove', (e) => e.preventDefault());
    }

    getCardsPerView() {
        const width = window.innerWidth;
        if (width < 480) return 1;
        if (width < 768) return 2;
        if (width < 1024) return 3;
        return 4;
    }

    async loadProducts(filters = {}) {
        this.showLoading();

        try {
            const queryParams = new URLSearchParams(filters);
           /* const response = await fetch(`/api/products?${queryParams}`); */
           const response = await fetch('https://jewelry-store-final.onrender.com/api/products');



            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const result = await response.json();

            if (result.success) {
                this.products = result.data;
                this.renderProducts();
                this.updateCarouselButtons();
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError();
        } finally {
            this.hideLoading();
        }
    }

    renderProducts() {
        const carousel = document.getElementById('carousel');
        carousel.innerHTML = '';

        this.products.forEach((product, index) => {
            const productCard = this.createProductCard(product, index);
            carousel.appendChild(productCard);
        });

        this.currentIndex = 0;
        this.updateCarouselPosition();
    }

    createProductCard(product, index) {
        const card = document.createElement('div');
        card.className = 'product-card';

        const defaultColor = 'yellow';
        const currentImage = product.images[defaultColor];

        card.innerHTML = `
            <img src="${currentImage}" alt="${product.name}" class="product-image" id="product-image-${index}">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)} USD</p>

            <div class="color-options">
                <div class="color-option yellow active" data-color="yellow" data-index="${index}"></div>
                <div class="color-option white" data-color="white" data-index="${index}"></div>
                <div class="color-option rose" data-color="rose" data-index="${index}"></div>
            </div>
           

            <p class="product-color" id="product-color-${index}">Yellow Gold</p>

            <div class="rating">
                <div class="stars">${this.generateStars(product.starRating)}</div>
                <span class="rating-number">${product.starRating}/5</span>
            </div>

            <div class="popularity-score">Popularity: ${(product.popularityScore * 100).toFixed(0)}%</div>
        `;

        const colorOptions = card.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => this.changeProductColor(e));
        });

        return card;
    }

    changeProductColor(event) {
        const color = event.target.dataset.color;
        const index = event.target.dataset.index;
        const product = this.products[index];

        const colorNames = {
            'yellow': 'Yellow Gold',
            'white': 'White Gold',
            'rose': 'Rose Gold'
        };

        const image = document.getElementById(`product-image-${index}`);
        image.src = product.images[color];

        const colorElement = document.getElementById(`product-color-${index}`);
        colorElement.textContent = colorNames[color];

        const colorOptions = event.target.parentElement.querySelectorAll('.color-option');
        colorOptions.forEach(option => option.classList.remove('active'));
        event.target.classList.add('active');
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }

        if (hasHalfStar) {
            stars += '☆';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }

        return stars;
    }


    previousSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCarouselPosition();
        }
    }

nextSlide() {
    const totalProducts = this.products.length;
    const maxIndex = Math.max(0, totalProducts - this.cardsPerView);
    
    if (this.currentIndex < maxIndex) {
        this.currentIndex++;
        this.updateCarouselPosition();
    }
}

    updateCarouselPosition() {
        const carousel = document.getElementById('carousel');
        //const cardWidth = 300;

        const card = document.querySelector('.product-card');
        const cardWidth = card ? card.offsetWidth + 20 : 300;





        const translateX = -this.currentIndex * cardWidth;
        carousel.style.transform = `translateX(${translateX}px)`;

        this.updateCarouselButtons();
    }

updateCarouselButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Previous button logic
    prevBtn.style.display = this.currentIndex > 0 ? 'block' : 'none';
    const maxIndex = Math.max(0, this.products.length - this.cardsPerView);
    
    if (this.products.length <= this.cardsPerView) {
        nextBtn.style.display = 'none';
    } else {
        nextBtn.style.display = this.currentIndex < maxIndex ? 'block' : 'none';
    }
}

    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
    }

    handleTouchEnd(event) {
        this.touchEndX = event.changedTouches[0].clientX;
        this.handleSwipe();
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.previousSlide();
            }
        }
    }

    applyFilters() {
        const filters = {};

        const minPrice = document.getElementById('minPrice').value;
        const maxPrice = document.getElementById('maxPrice').value;
        const minPopularity = document.getElementById('minPopularity').value;
        const maxPopularity = document.getElementById('maxPopularity').value;

        if (minPrice) filters.minPrice = minPrice;
        if (maxPrice) filters.maxPrice = maxPrice;
        if (minPopularity) filters.minPopularity = minPopularity;
        if (maxPopularity) filters.maxPopularity = maxPopularity;

        this.loadProducts(filters);
    }

    clearFilters() {
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        document.getElementById('minPopularity').value = '';
        document.getElementById('maxPopularity').value = '';

        this.loadProducts();
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('error').style.display = 'none';
        document.querySelector('.products-container').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.querySelector('.products-container').style.display = 'block';
    }

    showError() {
        document.getElementById('error').style.display = 'block';
        document.getElementById('loading').style.display = 'none';
        document.querySelector('.products-container').style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new JewelryApp();
});
