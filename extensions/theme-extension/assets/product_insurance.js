if (!customElements.get("product-insurance")) {
  const INSURANCE_VARIANT_IDS_BY_RATE = {
    "0.1": "123",
    "0.2": "234",
    "0.3": "345",
  };

  class ProductInsurance extends HTMLElement {
    connectedCallback() {
      this.contentTemplate = document.getElementById(
        "template-product-insurance",
      );

      this.init(JSON.parse(this.getAttribute("variant")));

      // listen for variant change event and re-initialize
      
      // pub/sub pattern
      // window.Shopify.EventBus.subscribe(window.Shopify.EventBus.definitions.PRODUCT_VARIANT_SELECTED, (data) => {
      //   this.renderSkeleton();
      //   this.init(data.variant);
      // });

      // event pattern
      window.Shopify.EventBus.addEventListener(
        window.Shopify.EventBus.definitions.PRODUCT_VARIANT_SELECTED,
        (data) => {
          this.renderSkeleton();
          this.init(data.variant);
        },
        this.closest('.shopify-section'),
      );
    }

    init(variant) {
      this.variant = variant;

      this.loadInsuranceRate(variant.id).then((insuranceRate) => {
        const newContent = this.contentTemplate.content.cloneNode(true);
        newContent.querySelector(".variantName").textContent =
          variant.public_title;
        newContent.querySelector(".price").textContent =
          `$${Math.round((variant.price / 100) * insuranceRate)}`;
        this.clear();
        this.appendChild(newContent);

        this.querySelector('input').addEventListener('change', (event) => {
          this.updatePrice(event.target.checked ? variant.price + Math.round(variant.price * insuranceRate) : variant.price);
          this.addInsuranceToProductForm(event.target.checked ? INSURANCE_VARIANT_IDS_BY_RATE[insuranceRate] : "");
        });
      });
    }

    updatePrice(price) {
      window.Shopify.Actions.call(window.Shopify.Actions.definitions.PRODUCT_UI_PRICE_UPDATE, {
        context: {sectionId: this.closest('.shopify-section').id},
        price,
      });
    }
    
    addInsuranceToProductForm(rate = undefined) {
      window.Shopify.Actions.call(window.Shopify.Actions.definitions.PRODUCT_FORM_SET_INPUTS, {
        context: {sectionId: this.closest('.shopify-section').id},
        inputs: [
          {
            input_name: "_product_insurance",
            value: rate,
          }
        ]
      });
    }

    // simulate an HTTP request to load the insurance rate for the associated product variant
    loadInsuranceRate(variantId) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(((variantId % 3) + 1) / 10), 1000);
      });
    }

    renderSkeleton() {
      this.clear();
      this.appendChild(
        document.getElementById("template-skeleton").content.cloneNode(true),
      );
    }

    clear() {
      this.innerHTML = "";
      
    }
  }

  customElements.define("product-insurance", ProductInsurance);
}
