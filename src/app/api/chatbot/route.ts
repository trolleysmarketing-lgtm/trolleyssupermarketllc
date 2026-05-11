import { NextRequest, NextResponse } from "next/server";

function contains(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase();
  return needles.some((n) => h.includes(n.toLowerCase()));
}

function handleIntent(message: string, lang: string) {
  const isAr = lang === "ar";

  // BRANCHES
  if (contains(message, ["branch", "branches", "store", "stores", "location", "locations", "فرع", "فروع", "موقع", "where", "أين"])) {
    return {
      reply: isAr ? "📍 الرجاء اختيار فرع:" : "📍 Please select a branch:",
      buttons: [
        { text: isAr ? "مردف (دبي)" : "Mirdif (Dubai)", action: "mirdif" },
        { text: isAr ? "النعيمية (عجمان)" : "Al Nuaimia (Ajman)", action: "ajman" },
        { text: isAr ? "الخان (الشارقة)" : "Al Khan (Sharjah)", action: "khan" },
        { text: isAr ? "التعاون (الشارقة)" : "Al Taawun (Sharjah)", action: "taawun" },
      ],
    };
  }

  // MIRDIF
  if (contains(message, ["mirdif", "مردف"])) {
    return {
      reply: isAr
        ? "📍 فرع مردف (دبي)\n🕒 ٧ص - ٢ص\n📞 واتساب: +971 50 498 6988"
        : "📍 Mirdif Branch (Dubai)\n🕒 7AM - 2AM\n📞 WhatsApp: +971 50 498 6988",
      buttons: [
        { text: isAr ? "🗺️ الاتجاهات" : "🗺️ Directions", action: "url", url: "https://maps.app.goo.gl/ZDRPLLBA3qRS1Z528" },
        { text: isAr ? "🏷️ العروض" : "🏷️ Offers", action: "offers" },
        { text: isAr ? "⭐ التقييمات" : "⭐ Reviews", action: "url", url: "https://g.page/r/Cellc2BoKwm4EAE/review" },
        { text: isAr ? "⬅️ رجوع" : "⬅️ Back", action: "branches" },
      ],
    };
  }

  // AJMAN
  if (contains(message, ["ajman", "nuaimia", "النعيمية", "عجمان"])) {
    return {
      reply: isAr
        ? "📍 فرع النعيمية (عجمان)\n🕒 ٧ص - ٢ص\n📞 واتساب: +971 56 329 1296"
        : "📍 Al Nuaimia Branch (Ajman)\n🕒 7AM - 2AM\n📞 WhatsApp: +971 56 329 1296",
      buttons: [
        { text: isAr ? "🗺️ الاتجاهات" : "🗺️ Directions", action: "url", url: "https://maps.app.goo.gl/RcU8TSrmrcw5StDx7" },
        { text: isAr ? "🏷️ العروض" : "🏷️ Offers", action: "offers" },
        { text: isAr ? "⭐ التقييمات" : "⭐ Reviews", action: "url", url: "https://g.page/r/CRDzKefT6p6REAE/review" },
        { text: isAr ? "⬅️ رجوع" : "⬅️ Back", action: "branches" },
      ],
    };
  }

  // AL KHAN
  if (contains(message, ["khan", "al khan", "الخان"])) {
    return {
      reply: isAr
        ? "📍 فرع الخان (الشارقة)\n🕒 ٧ص - ٢ص\n📞 واتساب: +971 54 769 5919"
        : "📍 Al Khan Branch (Sharjah)\n🕒 7AM - 2AM\n📞 WhatsApp: +971 54 769 5919",
      buttons: [
        { text: isAr ? "🗺️ الاتجاهات" : "🗺️ Directions", action: "url", url: "https://maps.app.goo.gl/hs5ARKi6KZf5iNb96" },
        { text: isAr ? "🏷️ العروض" : "🏷️ Offers", action: "offers" },
        { text: isAr ? "⭐ التقييمات" : "⭐ Reviews", action: "url", url: "https://g.page/r/CdgPn8V-9N4bEAE/review" },
        { text: isAr ? "⬅️ رجوع" : "⬅️ Back", action: "branches" },
      ],
    };
  }

  // AL TAAWUN
  if (contains(message, ["taawun", "al taawun", "التعاون"])) {
    return {
      reply: isAr
        ? "📍 فرع التعاون (الشارقة) ⭐\n🕒 ٧ص - ٣ص (ساعات ممتدة!)\n📞 واتساب: +971 50 405 9699"
        : "📍 Al Taawun Branch (Sharjah) ⭐\n🕒 7AM - 3AM (Extended Hours!)\n📞 WhatsApp: +971 50 405 9699",
      buttons: [
        { text: isAr ? "🗺️ الاتجاهات" : "🗺️ Directions", action: "url", url: "https://maps.app.goo.gl/Ln1tkpgCw3diWxLp8" },
        { text: isAr ? "🏷️ العروض" : "🏷️ Offers", action: "offers" },
        { text: isAr ? "⭐ التقييمات" : "⭐ Reviews", action: "url", url: "https://g.page/r/Cbni5TYW1X_-EAE/review" },
        { text: isAr ? "⬅️ رجوع" : "⬅️ Back", action: "branches" },
      ],
    };
  }

  // OFFERS
  if (contains(message, ["offer", "offers", "discount", "deal", "عرض", "عروض"])) {
    return {
      reply: isAr ? "🏷️ عرض عروضنا الأسبوعية:" : "🏷️ View our weekly offers:",
      buttons: [
        { text: isAr ? "📄 عرض العروض" : "📄 View Offers", action: "url", url: isAr ? "/ar/offers" : "/en/offers" },
        { text: isAr ? "⬅️ رجوع" : "⬅️ Back", action: "branches" },
      ],
    };
  }

  // DELIVERY
  if (contains(message, ["delivery", "talabat", "توصيل", "طلبات"])) {
    return {
      reply: isAr ? "🚚 طلب التوصيل عبر طلبات:" : "🚚 Order delivery via Talabat:",
      buttons: [
        { text: isAr ? "📱 طلب على طلبات" : "📱 Order on Talabat", action: "url", url: "https://www.talabat.com/uae/trolleys-supermarket" },
        { text: isAr ? "⬅️ رجوع" : "⬅️ Back", action: "branches" },
      ],
    };
  }

  // PAYMENT
  if (contains(message, ["payment", "pay", "card", "cash", "دفع"])) {
    return {
      reply: isAr
        ? "💳 نقبل: بطاقات الائتمان/الخصم والدفع نقداً. لا توجد رسوم إضافية."
        : "💳 We accept: Credit/Debit Cards & Cash. No extra fees.",
      buttons: [
        { text: isAr ? "📍 الفروع" : "📍 Branches", action: "branches" },
        { text: isAr ? "🏷️ العروض" : "🏷️ Offers", action: "offers" },
      ],
    };
  }

  // RETURN
  if (contains(message, ["return", "refund", "exchange", "استرجاع"])) {
    return {
      reply: isAr
        ? "🔄 الإرجاع مع الإيصال الأصلي خلال ١٤ يوماً. العناصر الطازجة: استبدال خلال ٢٤ ساعة."
        : "🔄 Return with original receipt within 14 days. Fresh items: exchange within 24 hours.",
      buttons: [
        { text: isAr ? "📍 الفروع" : "📍 Branches", action: "branches" },
        { text: isAr ? "📞 اتصل بنا" : "📞 Contact", action: "contact" },
      ],
    };
  }

  // CONTACT
  if (contains(message, ["contact", "اتصل", "phone"])) {
    return {
      reply: isAr ? "📞 اتصل بنا:" : "📞 Contact us:",
      buttons: [
        { text: isAr ? "📧 البريد الإلكتروني" : "📧 Email / Form", action: "url", url: isAr ? "/ar/contact" : "/en/contact" },
        { text: isAr ? "📍 الفروع" : "📍 Branches", action: "branches" },
      ],
    };
  }

  // HELP
  if (contains(message, ["help", "yardım", "مساعدة", "hi", "hello", "hey", "مرحبا", "السلام"])) {
    return {
      reply: isAr
        ? "مرحباً! 👋 كيف يمكنني مساعدتك؟"
        : "Hello! 👋 How can I help you today?",
      buttons: [
        { text: isAr ? "📍 الفروع" : "📍 Branches", action: "branches" },
        { text: isAr ? "🏷️ العروض" : "🏷️ Offers", action: "offers" },
        { text: isAr ? "🚚 التوصيل" : "🚚 Delivery", action: "delivery" },
        { text: isAr ? "💳 الدفع" : "💳 Payment", action: "payment" },
        { text: isAr ? "🔄 الإرجاع" : "🔄 Returns", action: "return" },
      ],
    };
  }

  // DEFAULT
  return {
    reply: isAr
      ? "لم أفهم ذلك. جرب كتابة 'مساعدة' لترى ما يمكنني فعله."
      : "I didn't understand that. Try typing 'help' to see what I can do.",
    buttons: [
      { text: isAr ? "❓ مساعدة" : "❓ Help", action: "help" },
      { text: isAr ? "📍 الفروع" : "📍 Branches", action: "branches" },
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const { message, lang } = await req.json();
    const result = handleIntent(message, lang || "en");
    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json({ success: false, reply: "Error occurred." }, { status: 500 });
  }
}