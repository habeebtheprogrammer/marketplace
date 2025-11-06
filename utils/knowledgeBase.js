/**
 * Knowledge Base for 360 Gadgets Africa AI Assistant
 * 
 * This file contains all the business information, policies, FAQs, and general knowledge
 * that the AI assistant should know about 360 Gadgets Africa.
 * 
 * Add your information in the sections below. The AI will use this information to answer
 * user questions accurately.
 */

const knowledgeBase = {
  // Company Information
  company: {
    name: "360GadgetsAfrica",
    website: "https://360gadgetsafrica.com",
    description: "A trusted, all in one Nigerian tech marketplace providing authentic gadgets, certified repairs, and instant airtime/data top-up services.",
    mission: "To solve counterfeit gadgets, overpriced devices, poor warranty support, and untrained technicians by providing a secure, single platform.",
    targetAudience: "Young professionals, students, and small business owners who need affordable, authentic gadgets with warranty and convenient connectivity.",
    idea: "360GadgetsAfrica is a one-stop platform where Africans can buy, repair, and finance tech gadgets—all in one place. We're solving the major issues people face with counterfeit products, overpriced gadgets, poor repair services, and the hassle of juggling multiple platforms for top-ups and services.",
    problemSolved: "With our platform, users can confidently shop for authentic gadgets, instantly top up airtime/data, get certified repair services, and soon, finance purchases through a BNPL (Buy Now Pay Later) system. We aim to bring trust, speed, and affordability into the African gadget ecosystem.",
    vision: "Our goal is to become Africa's largest and most trusted digital marketplace for gadgets and tech services. We're not just building an e-commerce site—we're building an ecosystem where people can buy, repair, top up, and finance all in one place. We're driving digital inclusion by making essential tech affordable and accessible through credit financing, affordable repairs, and VTU topup services.",
    team: {
      founders: [
        {
          name: "Habeeb Abdulrahman",
          role: "Co-Founder and CTO",
          background: "Full-stack engineer, previously a software engineer at NSR PETRO Mart. Built and scaled the 360GadgetsAfrica platform end-to-end.",
        },
        {
          name: "Sheriffdeen",
          role: "Co-Founder",
          background: "Leads growth marketing.",
        },
      ],
      expertise: "Our team includes experts in marketing, UI/UX, and product development.",
    },
    communityImpact: "360GadgetsAfrica empowers local communities by creating access to affordable tech, partnering with vendors and repairers to empower youth, promoting sustainability, and expanding financial access. We empower students, small businesses, and underserved communities with the tools they need for education, work, and growth while promoting financial inclusion through our gadget financing.",
    sustainability: {
      practices: [
        "Promoting device repairs to extend gadget lifespans and reduce eWaste",
        "Encouraging responsible consumption through trade-ins and refurbishing",
        "Partnering with local vendors to support circular economic growth",
        "Digital financing that reduces the need for wasteful, short-term purchases",
      ],
      description: "360GadgetsAfrica follows key sustainability practices to promote environmental responsibility and economic growth.",
    },
  },

  // Services
  services: [
    {
      name: "Gadget Sales",
      description: "Buy authentic gadgets including smartphones, laptops, tablets, accessories, and more at fair prices with warranty.",
      categories: ["Smartphones", "Laptops", "Tablets", "Accessories", "Gaming Devices", "Smart Watches"],
    },
    {
      name: "Repairs & Diagnostics",
      description: "Certified repair services for various gadgets. Our trained technicians provide professional repair and diagnostic services. We promote device repairs to extend gadget lifespans and reduce eWaste.",
      url: "/technicians",
    },
    {
      name: "Airtime & Data Top-up",
      description: "Instant airtime and data plan purchases for all Nigerian networks (MTN, GLO, Airtel, 9mobile).",
      networks: ["MTN", "GLO", "Airtel", "9mobile"],
      maxAirtime: "₦500 per transaction",
    },
    {
      name: "Gadget Financing (BNPL)",
      description: "Buy Now Pay Later (BNPL) system coming soon. Finance your gadget purchases and pay over time, making essential tech affordable and accessible.",
      status: "Coming Soon",
    },
    {
      name: "Trade-ins & Refurbishing",
      description: "Trade in your old devices and get value for them. We encourage responsible consumption through trade-ins and refurbishing.",
    },
  ],

  // Policies
  policies: {
    returnPolicy: {
      title: "Return Policy",
      url: "/return-policy",
      summary: "Products can be returned within a specified period if they are defective or not as described. Please contact support for return requests.",
      // Add detailed return policy information here
    },
    privacyPolicy: {
      title: "Privacy Policy",
      url: "/privacy",
      summary: "We respect your privacy and protect your personal information. Your data is secure and will not be shared with third parties without consent.",
      // Add detailed privacy policy information here
    },
    termsAndConditions: {
      title: "Terms and Conditions",
      url: "/terms",
      summary: "By using our services, you agree to our terms and conditions. Please read them carefully before making a purchase.",
      // Add detailed terms and conditions here
    },
    warranty: {
      title: "Warranty Information",
      summary: "All products come with 2weeks warranty. We also provide additional warranty support for eligible products. Warranty terms vary by product.",
      // Add detailed warranty information here
    },
  },

  // Shipping & Delivery
  shipping: {
    deliveryTime: "Delivery times vary by location. Standard delivery is same day delivery within Lagos, 1-2 days for other states.",
    deliveryFee: "Delivery fees are affordable and calculated based on location and product size. Free delivery available for orders above a certain amount.",
    tracking: "You will receive a tracking number once your order is shipped. Track your order status in your account dashboard.",
    // Add more shipping information here
  },

  // Payment & Wallet
  payment: {
    methods: ["Bank Transfer", "Card Payment", "Wallet Balance"],
    wallet: {
      description: "Fund your wallet using your virtual account details. Wallet balance can be used for all purchases including gadgets, airtime, and data.",
      funding: "Use the getFundingAccount tool to get your virtual account details for funding.",
      minimumBalance: "No minimum balance required. Fund your wallet with any amount.",
    },
  },

  // FAQs
  faqs: [
    {
      question: "How do I fund my wallet?",
      answer: "Use the getFundingAccount command to get your virtual account details. Transfer any amount to the provided account, and it will reflect in your wallet balance.",
    },
    {
      question: "What networks do you support for airtime and data?",
      answer: "We support all major Nigerian networks: MTN, GLO, Airtel, and 9mobile. Network is automatically detected from the phone number for airtime purchases.",
    },
    {
      question: "How do I return a product?",
      answer: "Contact our support team through the contact page or WhatsApp. Products must be returned within the specified return period and in original condition.",
    },
    {
      question: "Do you offer warranty on products?",
      answer: "Yes, all products come with 2weeks warranty. Additional warranty support is available for eligible products. Warranty terms vary by product.",
    },
    {
      question: "How long does delivery take?",
      answer: "Standard delivery is same day delivery within Lagos, 1-2 days for other states. Delivery times may vary based on location and product availability.",
    },
    // Add more FAQs here
  ],

  // Product Information
  products: {
    authenticity: "All products are 100% authentic and sourced directly from authorized distributors.",
    pricing: "We offer competitive prices on all products. Prices are updated regularly to reflect current market rates.",
    availability: "Product availability is shown in real-time. Out of stock items will be marked accordingly.",
    categories: "Browse products by category: Laptops & Ipads, Accessories, Iphone Case, IPhones, Google Pixel, Consoles, Samsung, Others and more.",
  },

  // Support & Contact
  support: {
    contact: {
      url: "/contact",
      methods: ["WhatsApp", "Email", "Phone"],
      phone: "0705 722 1476",
      whatsapp: "0705 722 1476",
      email: "support@360gadgetsafrica.com",
      hours: "Support is available mon-sun 8am-8pm. WhatsApp support may have extended hours.",
    },
    commonIssues: [
      "Transaction failed - Network issues contact support",
      "Product out of stock - Browse similar products or check back later",
      "Delivery delay - Contact support with your order number for tracking",
      "Product not received - Contact support with your order number for tracking",
      "Product damaged - Contact support with your order number for tracking",
      "Product not working - Contact support with your order number for tracking",
      "Product not as described - Contact support with your order number for tracking",
      "Trasaction succssful but not received - Contact support with your reference number for tracking",
    ],
  },

  // Additional Information
  additional: {
    // Add any other business information, promotions, special offers, etc.
    promotions: "Check our website regularly for special promotions and discounts.",
    referral: "Refer friends and earn rewards. Use your referral code to share with others.",
    loyalty: "Loyal customers enjoy special benefits and discounts.",
  },
}

/**
 * Formats the knowledge base into a readable string for the AI system prompt
 */
function formatKnowledgeBase() {
  let kbText = "\n\n=== KNOWLEDGE BASE ===\n\n"
  
  // Company Information
  kbText += `COMPANY INFORMATION:\n`
  kbText += `- Name: ${knowledgeBase.company.name}\n`
  kbText += `- Website: ${knowledgeBase.company.website}\n`
  kbText += `- Description: ${knowledgeBase.company.description}\n`
  kbText += `- Mission: ${knowledgeBase.company.mission}\n`
  kbText += `- Target Audience: ${knowledgeBase.company.targetAudience}\n`
  kbText += `- Idea: ${knowledgeBase.company.idea}\n`
  kbText += `- Problem Solved: ${knowledgeBase.company.problemSolved}\n`
  kbText += `- Vision: ${knowledgeBase.company.vision}\n\n`
  
  // Team Information
  kbText += `TEAM:\n`
  knowledgeBase.company.team.founders.forEach(founder => {
    kbText += `- ${founder.name} (${founder.role}): ${founder.background}\n`
  })
  kbText += `- ${knowledgeBase.company.team.expertise}\n\n`
  
  // Community Impact
  kbText += `COMMUNITY IMPACT:\n`
  kbText += `${knowledgeBase.company.communityImpact}\n\n`
  
  // Sustainability
  kbText += `SUSTAINABILITY PRACTICES:\n`
  kbText += `${knowledgeBase.company.sustainability.description}\n`
  knowledgeBase.company.sustainability.practices.forEach((practice, index) => {
    kbText += `${index + 1}. ${practice}\n`
  })
  kbText += "\n"

  // Services
  kbText += `SERVICES:\n`
  knowledgeBase.services.forEach(service => {
    kbText += `- ${service.name}: ${service.description}\n`
    if (service.categories) {
      kbText += `  Categories: ${service.categories.join(", ")}\n`
    }
    if (service.networks) {
      kbText += `  Networks: ${service.networks.join(", ")}\n`
    }
    if (service.maxAirtime) {
      kbText += `  ${service.maxAirtime}\n`
    }
    if (service.url) {
      kbText += `  URL: ${knowledgeBase.company.website}${service.url}\n`
    }
  })
  kbText += "\n"

  // Policies
  kbText += `POLICIES:\n`
  Object.values(knowledgeBase.policies).forEach(policy => {
    kbText += `- ${policy.title}: ${policy.summary}\n`
    if (policy.url) {
      kbText += `  URL: ${knowledgeBase.company.website}${policy.url}\n`
    }
  })
  kbText += "\n"

  // Shipping
  kbText += `SHIPPING & DELIVERY:\n`
  kbText += `- Delivery Time: ${knowledgeBase.shipping.deliveryTime}\n`
  kbText += `- Delivery Fee: ${knowledgeBase.shipping.deliveryFee}\n`
  kbText += `- Tracking: ${knowledgeBase.shipping.tracking}\n\n`

  // Payment
  kbText += `PAYMENT & WALLET:\n`
  kbText += `- Payment Methods: ${knowledgeBase.payment.methods.join(", ")}\n`
  kbText += `- Wallet: ${knowledgeBase.payment.wallet.description}\n`
  kbText += `- Funding: ${knowledgeBase.payment.wallet.funding}\n\n`

  // FAQs
  kbText += `FREQUENTLY ASKED QUESTIONS:\n`
  knowledgeBase.faqs.forEach((faq, index) => {
    kbText += `${index + 1}. Q: ${faq.question}\n`
    kbText += `   A: ${faq.answer}\n\n`
  })

  // Products
  kbText += `PRODUCT INFORMATION:\n`
  kbText += `- Authenticity: ${knowledgeBase.products.authenticity}\n`
  kbText += `- Pricing: ${knowledgeBase.products.pricing}\n`
  kbText += `- Availability: ${knowledgeBase.products.availability}\n`
  kbText += `- Categories: ${knowledgeBase.products.categories}\n\n`

  // Support
  kbText += `SUPPORT & CONTACT:\n`
  kbText += `- Phone/WhatsApp: ${knowledgeBase.support.contact.phone}\n`
  kbText += `- Email: ${knowledgeBase.support.contact.email}\n`
  kbText += `- Contact Methods: ${knowledgeBase.support.contact.methods.join(", ")}\n`
  kbText += `- Contact URL: ${knowledgeBase.company.website}${knowledgeBase.support.contact.url}\n`
  kbText += `- Support Hours: ${knowledgeBase.support.contact.hours}\n\n`

  // Additional
  if (knowledgeBase.additional.promotions) {
    kbText += `ADDITIONAL INFORMATION:\n`
    kbText += `- Promotions: ${knowledgeBase.additional.promotions}\n`
    kbText += `- Referral: ${knowledgeBase.additional.referral}\n`
    kbText += `- Loyalty: ${knowledgeBase.additional.loyalty}\n\n`
  }

  kbText += "=== END KNOWLEDGE BASE ===\n\n"
  
  return kbText
}

module.exports = {
  knowledgeBase,
  formatKnowledgeBase,
}

