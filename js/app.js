const productDOM = document.querySelector(".product__center");
const cartDOM = document.querySelector(".cart");
const cartContent = document.querySelector(".cart__centent");
const openCart = document.querySelector(".cart__icon");
const closeCart = document.querySelector(".close__cart");
const overlay = document.querySelector(".cart__overlay");
const cartTotal = document.querySelector(".cart__total");
const clearCartBtn = document.querySelector(".clear__cart");
const itemTotals = document.querySelector(".item__total");

let cart = [];

let buttonDOM = [];

class UI {
  displayProducts(products) {
    let results = "";
    products.forEach(({ productname, price, manufacturer, productno, }) => {
      results += `<!-- Single Product -->
      <div class="product">
        
      <div class="product__footer">
      <h1>Product Name: ${productname}</h1>
  
      <div class="bottom">
      <div style="price">Manufacturer: ${manufacturer}</div>

    <div class="price">₹${price}</div>
    <div class="btn__group">
    <button class="btn addToCart" data-productno= ${productno} >Add to Cart</button>
      </div>
  </div>
</div>
</div>
      <!-- End of Single Product -->`;
    });

    productDOM.innerHTML = results;
  }

  getButtons() {
    const buttons = [...document.querySelectorAll(".addToCart")];
    buttonDOM = buttons;
    buttons.forEach(button => {
      const productno = button.dataset.productno;
      const inCart = cart.find(item => item.productno === parseInt(productno, 10));

      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }

      button.addEventListener("click", e => {
        e.preventDefault();
        e.target.innerHTML = "In Cart";
        e.target.disabled = true;

        // Get product from products
        const cartItem = { ...Storage.getProduct(productno), amount: 1 };

        // Add product to cart
        cart = [...cart, cartItem];

        // save the cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setItemValues(cart);
        // display the cart item
        this.addCartItem(cartItem);
        // show the cart
      });
    });
  }

  setItemValues(cart) {
    let tempTotal = 0;
    let itemTotal = 0;

    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    itemTotals.innerText = itemTotal;
  }

  addCartItem({ manufacturer, price, productname, productno }) {
    const div = document.createElement("div");
    div.classList.add("cart__item");

    div.innerHTML = `
          <div>
            <h3>${productname}</h3>
            <h3 class="price">₹${price}</h3>
          </div>
          <div>
            <span class="increase" data-productno=${productno}>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-angle-up"></use>
              </svg>
            </span>
            <p class="item__amount">1</p>
            <span class="decrease" data-productno=${productno}>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-angle-down"></use>
              </svg>
            </span>
          </div>

            <span class="remove__item" data-productno=${productno}>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-trash"></use>
              </svg>
            </span>

        </div>`;
    cartContent.appendChild(div);
  }

  show() {
    cartDOM.classList.add("show");
    overlay.classList.add("show");
  }

  hproductnoe() {
    cartDOM.classList.remove("show");
    overlay.classList.remove("show");
  }

  setAPP() {
    cart = Storage.getCart();
    this.setItemValues(cart);
    this.populate(cart);

    openCart.addEventListener("click", this.show);
    closeCart.addEventListener("click", this.hproductnoe);
  }

  populate(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  cartLogic() {
    // Clear Cart
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
      this.hproductnoe();
    });

    // Cart Functionality
    cartContent.addEventListener("click", e => {
      const target = e.target.closest("span");
      const targetElement = target.classList.contains("remove__item");
      if (!target) return;

      if (targetElement) {
        const productno = parseInt(target.dataset.productno);
        this.removeItem(productno);
        cartContent.removeChild(target.parentElement);
      } else if (target.classList.contains("increase")) {
        const productno = parseInt(target.dataset.productno, 10);
        let tempItem = cart.find(item => item.productno === productno);
        tempItem.amount++;
        Storage.saveCart(cart);
        this.setItemValues(cart);
        target.nextElementSibling.innerText = tempItem.amount;
      } else if (target.classList.contains("decrease")) {
        const productno = parseInt(target.dataset.productno, 10);
        let tempItem = cart.find(item => item.productno === productno);
        tempItem.amount--;

        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setItemValues(cart);
          target.previousElementSibling.innerText = tempItem.amount;
        } else {
          this.removeItem(productno);
          cartContent.removeChild(target.parentElement.parentElement);
        }
      }
    });
  }

  clearCart() {
    const cartItems = cart.map(item => item.productno);
    cartItems.forEach(productno => this.removeItem(productno));

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }

  removeItem(productno) {
    cart = cart.filter(item => item.productno !== productno);
    this.setItemValues(cart);
    Storage.saveCart(cart);

    let button = this.singleButton(productno);
    button.disabled = false;
    button.innerText = "Add to Cart";
  }

  singleButton(productno) {
    return buttonDOM.find(button => parseInt(button.dataset.productno) === productno);
  }
}

class Products {
  async getProducts() {
    try {
      const result = await fetch("products.json");
      const data = await result.json();
      const products = data.items;
      return products;
    } catch (err) {
      console.log(err);
    }
  }
}

class Storage {
  static saveProduct(obj) {
    localStorage.setItem("products", JSON.stringify(obj));
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getProduct(productno) {
    const products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.productno === parseFloat(productno, 10));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const productList = new Products();
  const ui = new UI();

  ui.setAPP();

  const products = await productList.getProducts();
  ui.displayProducts(products);
  Storage.saveProduct(products);
  ui.getButtons();
  ui.cartLogic();
});
