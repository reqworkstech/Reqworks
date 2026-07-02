// Configuration for the Landing Page Offer Modal
export const offerConfig = {
  // Global switch to enable or disable the offer modal feature entirely
  enableModal: true,
  
  // List of active/inactive offers. 
  // If multiple offers have isActive: true, the modal will display them in a scrollable list.
  offers: [
    {
      id: "special-offer-1999",
      isActive: true,
      imageSrc: "/images/special_offer.png",
      imageAlt: "Special Offer starting from 1999 (First 5 Customers)",
      promoCode: "",
      instructionText: "Register and create a project. Special pricing starts from ₹1,999/- for our first 5 customers.",
      buttonText: "CLAIM OFFER & BOOK NOW",
      redirectPath: "/register"
    }
  ]
};
