import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { PcshopFormService } from 'src/app/services/pcshop-form.service';
import { PcShopValidators } from 'src/app/validators/pc-shop-validators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  creditCardMonths: number[] = [];
  creditCardYears: number[] = [];

  storage: Storage = sessionStorage;

// initialize Stripe API
  stripe = Stripe(environment.stripePublishableKey);
  
  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any ="";

  isDisabled: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private pcShopFormService: PcshopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router) { }

  ngOnInit(): void {

    //setup Stripe form 
    this.setupStripePaymentForm();

    this.reviewCartDetails();

    //read the user's email address from browser storage

    const theEmail = JSON.parse(this.storage.getItem('userEmail'));

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          PcShopValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          PcShopValidators.notOnlyWhiteSpace]),
        email: new FormControl(theEmail,
          [Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]) // matches valid email address format
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2),
                                    PcShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2),
                                  PcShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2),
                                      PcShopValidators.notOnlyWhiteSpace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2),
                                     PcShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2),
                                   PcShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2),
                                      PcShopValidators.notOnlyWhiteSpace])
      }),
      // creditCard: this.formBuilder.group({
      //   cardType: new FormControl('', [Validators.required]),
      //   nameOnCard: new FormControl('', [Validators.required,Validators.minLength(2),
      //                                    PcShopValidators.notOnlyWhiteSpace]),
      //   cardNumber: new FormControl('', [Validators.required,
      //                                   Validators.pattern('[0-9]{16}')]),
      //   securityCode: new FormControl('', [Validators.required,
      //                                      Validators.pattern('[0-9]{3}')]),
      //   expirationMonth: [''],
      //   expirationYear: ['']
      // })

    });
    //TODO add credit card months
    // const startMonth: number = new Date().getMonth() + 1;
    // console.log('Start month: ' + startMonth);
    // this.pcShopFormService.getCreditCardMonths(startMonth).subscribe(
    //   data => {
    //     console.log("Retrived credit card months" + JSON.stringify(data));
    //     this.creditCardMonths = data;

    //   })


    // //TODO add credit card years
    // this.pcShopFormService.getCreditCardYears().subscribe(data => {
    //   console.log("Retrived credit card years: " + JSON.stringify(data));
    //   this.creditCardYears = data;

    // })

    //TODO add countries
    this.pcShopFormService.getCountries().subscribe(data => {
      console.log("Retrieve countries: " + JSON.stringify(data))
      this.countries = data;
    })



  }
  setupStripePaymentForm() {
    
    // get a handle to stripe elements
    var elements = this.stripe.elements();


    // Create a card elements ...... and hide the zip-code field 
    this.cardElement = elements.create('card', {hidePostalCode: true});


    // Add an instance of card UI component into the 'card-element' div 
    this.cardElement.mount('#card-element')


    // Add event binding for the 'change' event on the card element 
    this.cardElement.on('change',(event) => {

      //get a handle to card-errors element 
      this.displayError = document.getElementById('card-errors');

      if(event.complete){
        this.displayError.textContent = "";
      }else if(event.error){

        // show validation error to the customer 
        this.displayError.textContent = event.error.message;
      }
    });
  }


  reviewCartDetails() {
    //TODO subscribe to cartSerive.totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity=> this.totalQuantity = totalQuantity)
    //TODO subsscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice=> this.totalPrice = totalPrice)
  }


  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }




  copyShippingAddressToBillingAddress(event) {

    if (event.target.checked) {
      this.checkoutFormGroup.controls.billingAddress
        .setValue(this.checkoutFormGroup.controls.shippingAddress.value);

      this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls.billingAddress.reset();
      this.billingAddressStates = [];
    }

  }

  onSubmit() {
    console.log("Handling the submit button");

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

//TODO set up order
let order = new Order();
order.totalPrice = this.totalPrice;
order.totalQuantity = this.totalQuantity;

//TODO get cart items
const cartItems = this.cartService.cartItems;

//TODO create orderItems from cartItems
let orderItems: OrderItem[] = [];
for(let i = 0; i<cartItems.length; i++){
  orderItems[i] = new OrderItem(cartItems[i]);
}
//TODO set up purchase
let purchase = new Purchase();
//TODO populate purchase - customer
purchase.customer = this.checkoutFormGroup.controls['customer'].value;

//TODO populate purchase - shipping address

purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country))
purchase.shippingAddress.state = shippingState.name;
purchase.shippingAddress.country = shippingCountry.name

//TODO populate purchase - billing address
purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country))
purchase.billingAddress.state = billingState.name;
purchase.billingAddress.country = billingCountry.name

//TODO populate purchase - order and orderItems
purchase.order = order;
purchase.orderItems = orderItems;

//TODO compute payment info
this.paymentInfo.amount = Math.round(this.totalPrice * 100); // rounds number before payment 
this.paymentInfo.currency = "EUR";
this.paymentInfo.receiptEmail = purchase.customer.email;

console.log(`this.paymentInfo.amount: ${this.paymentInfo.amount}`);

//TODO if valid form
//TODO create payment intent
//TODO confirm card payment
//TODO place order

if(!this.checkoutFormGroup.invalid && this.displayError.textContent === ""){

  this.isDisabled = true;

  this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
    (paymentIntentResponse) => {
      this.stripe.confirmCardPayment(paymentIntentResponse.client_secret, 
        {
          payment_method:{
            card: this.cardElement,
            billing_details: {
              email: purchase.customer.email,
              name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
              address: {
                line1: purchase.billingAddress.street,
                city: purchase.billingAddress.city,
                state: purchase.billingAddress.state,
                postal_code: purchase.billingAddress.zipCode,
                country: this.billingAddressCity.value.code
              }
            }
          }
        }, {handleActions: false})
        .then(function(result)
        {
          if(result.error){
            //inform the customer there was an error
            alert(`There was an error: ${result.error.message}`);
            this.isDisabled = false;
          }else{
            //call the REST API via the checkoutService 
            this.checkoutService.placeOrder(purchase).subscribe({
              next: response =>{
                alert(`Your order has been received.\nOrder tracking number ${response.orderTrackingNumber}`);
                
                //reset cart
                this.resetCart();
                this.isDisabled = false;
              },
              error: err => {
                alert(`There was an error: ${err.message}`);
                this.isDisabled = false;
              }
            })
          }
        }.bind(this));
    }
  )
}else{
    this.checkoutFormGroup.markAllAsTouched();
    return;
}

}

  
  resetCart() {
    //reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems(); // update storage with latest update of cart

    //reset the form
    this.checkoutFormGroup.reset();

    //navigate  to the product page
    this.router.navigateByUrl("/products");
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectYear: number = Number(creditCardFormGroup.value.expirationYear);

    let startMonth: number;

    if (currentYear === selectYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }
    this.pcShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card month" + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    )
  }
  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);
    this.pcShopFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }
        //TODO first value drop down 
        formGroup.get('state').setValue(data[0]);
      }
    )
  }

}
