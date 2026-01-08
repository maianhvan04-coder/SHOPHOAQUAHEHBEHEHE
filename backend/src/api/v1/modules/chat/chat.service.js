// backend/src/api/v1/modules/chat/chat.service.js

// ===== In-memory session memory (restart server sẽ mất) =====
const sessions = new Map();
const TTL_MS = 30 * 60 * 1000; // 30 phút

setInterval(() => {
  const now = Date.now();
  for (const [sid, s] of sessions.entries()) {
    if (!s?.updatedAt || now - s.updatedAt > TTL_MS) sessions.delete(sid);
  }
}, 5 * 60 * 1000).unref?.();

function getSession(sessionId) {
  const sid = String(sessionId || "guest");
  if (!sessions.has(sid)) {
    sessions.set(sid, {
      updatedAt: Date.now(),
      awaiting: null, // "shipping_location" | "price_product" | null
      lastTopic: null, // "shipping" | "price" | ...
      context: {},
    });
  }
  const s = sessions.get(sid);
  s.updatedAt = Date.now();
  return s;
}

// ===== Helpers =====
function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/\s+/g, " ");
}

function hasAny(t, arr) {
  return arr.some((k) => t.includes(k));
}

function extractKg(raw = "") {
  const s = String(raw).toLowerCase();
  const kg = s.match(/(\d+(?:[.,]\d+)?)\s*kg\b/);
  if (kg) return parseFloat(kg[1].replace(",", "."));
  const g = s.match(/(\d+(?:[.,]\d+)?)\s*g\b/);
  if (g) return parseFloat(g[1].replace(",", ".")) / 1000;
  return null;
}

function titleCase(s) {
  return String(s)
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function guessLocation(t) {
  if (hasAny(t, ["ha noi", "hn"])) return { type: "hn", name: "Hà Nội" };
  if (hasAny(t, ["tp hcm", "tphcm", "hcm", "sai gon"])) return { type: "hcm", name: "TP.HCM" };

  // Nếu user trả lời ngắn (ví dụ: "Hải Phòng", "Bắc Ninh") => coi là tỉnh/thành
  if (t.length > 1 && t.length <= 28 && !t.includes("?")) {
    return { type: "tinh", name: titleCase(t) };
  }
  return null;
}

// ===== Giá mẫu (bạn sửa theo giá thật) =====
const PRICE_CATALOG = [
  {
    keys: ["tao", "tao fuji", "tao my", "tao envy", "tao rockit"],
    title: "Táo",
    range: "65k – 120k/kg",
    note: "tuỳ loại (Mỹ/NZ/nhập khẩu) & size",
  },
  {
    keys: ["nho", "nho xanh", "nho den", "nho my", "nho uc"],
    title: "Nho",
    range: "85k – 180k/kg",
    note: "tuỳ loại & mùa",
  },
  {
    keys: ["dau", "dau tay", "strawberry"],
    title: "Dâu tây",
    range: "55k – 150k/hộp",
    note: "tuỳ loại (Đà Lạt/nhập khẩu) & trọng lượng",
  },
  { keys: ["cam", "cam sanh", "cam my", "cam uc"], title: "Cam", range: "35k – 95k/kg", note: "tuỳ giống" },
  { keys: ["buoi", "buoi da xanh", "buoi nam roi"], title: "Bưởi", range: "35k – 85k/quả", note: "tuỳ size" },
  { keys: ["chuoi", "banana"], title: "Chuối", range: "18k – 45k/nải", note: "tuỳ loại" },
];

function findProduct(t) {
  for (const item of PRICE_CATALOG) {
    if (item.keys.some((k) => t.includes(normalize(k)))) return item;
  }
  return null;
}

function replyPrice(item, qtyKg) {
  const qtyTxt = qtyKg ? ` (bạn nhắc ~${qtyKg}kg)` : "";
  return (
    `💰 **${item.title}**: khoảng **${item.range}**${qtyTxt}\n` +
    `Ghi chú: ${item.note}.\n` +
    `Bạn muốn loại nào cụ thể (nguồn/size) để mình báo giá sát nhất nhé.`
  );
}

// ===== Ship estimate mẫu =====
function shippingEstimate(loc, qtyKg) {
  const qtyTxt = qtyKg ? ` (ước theo ~${qtyKg}kg)` : "";
  if (!loc) return "🚚 Bạn ở **tỉnh/thành** nào để mình báo **phí ship** và **thời gian giao** ạ?";

  if (loc.type === "hn") {
    return `🚚 ${loc.name} nội thành: **20k – 35k**${qtyTxt}. Giao **1–2 ngày**. Bạn cho mình quận/huyện để báo sát hơn nhé.`;
  }
  if (loc.type === "hcm") {
    return `🚚 ${loc.name}: **25k – 45k**${qtyTxt}. Giao **2–4 ngày**. Bạn cho mình quận/huyện để báo sát hơn nhé.`;
  }
  if (loc.type === "tinh") {
    return `🚚 ${loc.name}: **30k – 60k**${qtyTxt}. Giao **2–4 ngày**.\nBạn cho mình **quận/huyện** + **khoảng kg** để mình chốt phí sát nhất nha.`;
  }

  return "🚚 Bạn ở **tỉnh/thành** nào để mình báo phí ship ạ?";
}

// ===== Main botReply: có nhớ ngữ cảnh =====
function botReply(message = "", sessionId = "guest") {
  const raw = String(message || "").trim();
  const t = normalize(raw);
  const s = getSession(sessionId);

  if (!t) return "Bạn muốn hỏi về **Giao hàng/Phí ship • Đổi trả • Báo giá • Địa chỉ** nè? 😊";

  // 1) Ưu tiên xử lý câu trả lời theo ngữ cảnh
  if (s.awaiting === "shipping_location") {
    const loc = guessLocation(t);
    s.awaiting = null;
    s.lastTopic = "shipping";
    s.context.location = loc;
    const qtyKg = extractKg(raw);
    return shippingEstimate(loc, qtyKg);
  }

  if (s.awaiting === "price_product") {
    const item = findProduct(t);
    s.awaiting = null;
    s.lastTopic = "price";
    const qtyKg = extractKg(raw);
    if (item) return replyPrice(item, qtyKg);
    return "💰 Bạn nói giúp mình **tên trái cây** (táo/nho/dâu/cam/bưởi/chuối…) để mình báo giá nhé.";
  }

  // 2) Chào hỏi
  if (hasAny(t, ["xin chao", "chao", "hello", "hi", "hey"])) {
    return "Chào bạn 👋 Joygreen hỗ trợ **Giao hàng/Phí ship • Báo giá • Địa chỉ • Đổi trả**. Bạn cần mục nào ạ?";
  }
  if (hasAny(t, ["cam on", "thank", "tks"])) return "Dạ không có gì ạ 😊 Bạn cần thêm gì cứ nhắn Joygreen nhé.";

  // 3) Địa chỉ
  if (hasAny(t, ["dia chi", "o dau", "cua hang", "shop o dau", "chi nhanh", "ban do", "map"])) {
    s.lastTopic = "address";
    return (
      "📍 **Địa chỉ Joygreen**:\n" +
      "• 226 Lê Trọng Tấn, P. Định Công, Hà Nội\n" +
      "• 131 Chu Huy Mân, P. Phúc Đồng, Hà Nội\n\n" +
      "Bạn muốn đến chi nhánh nào để mình chỉ đường nhanh hơn ạ?"
    );
  }

  // 4) Giờ mở cửa
  if (hasAny(t, ["gio mo", "mo cua", "dong cua", "gio lam", "gio ban"])) {
    s.lastTopic = "hours";
    return "🕗 Joygreen mở cửa **8:00 – 22:00** mỗi ngày.";
  }

  // 5) Hotline
  if (hasAny(t, ["hotline", "sdt", "so dien thoai", "lien he", "call"])) {
    s.lastTopic = "contact";
    return "☎️ Hotline: **0123 456 789** (giờ hành chính).";
  }

  // 6) Giao hàng / phí ship
  if (hasAny(t, ["ship", "giao hang", "van chuyen", "phi ship", "cuoc"])) {
    s.lastTopic = "shipping";
    const loc = guessLocation(t);       // nếu câu đã có tỉnh/thành
    const qtyKg = extractKg(raw);

    if (loc) {
      s.context.location = loc;
      return shippingEstimate(loc, qtyKg);
    }

    // chưa có khu vực => hỏi & set awaiting
    s.awaiting = "shipping_location";
    return "🚚 Bạn ở **tỉnh/thành** nào để mình báo **phí ship** ạ? (VD: Hà Nội, Hải Phòng, TP.HCM...)";
  }

  // 7) Báo giá
  if (hasAny(t, ["gia", "bao nhieu", "bao gia", "price", "gia sao"])) {
    s.lastTopic = "price";
    const item = findProduct(t);
    const qtyKg = extractKg(raw);

    if (item) return replyPrice(item, qtyKg);

    s.awaiting = "price_product";
    return "💰 Bạn muốn hỏi giá **táo / nho / dâu / cam / bưởi / chuối**… loại nào ạ?";
  }

  // 8) Nếu user chỉ trả lời “Hải Phòng” sau đó (fallback theo lastTopic)
  const locLoose = guessLocation(t);
  if (locLoose && s.lastTopic === "shipping") {
    s.context.location = locLoose;
    const qtyKg = extractKg(raw);
    return shippingEstimate(locLoose, qtyKg);
  }

  // 9) Nếu user chỉ trả lời “táo 2kg” sau đó (fallback theo lastTopic)
  const itemLoose = findProduct(t);
  if (itemLoose && s.lastTopic === "price") {
    const qtyKg = extractKg(raw);
    return replyPrice(itemLoose, qtyKg);
  }

  // 10) Fallback
  return (
    "Mình chưa hiểu rõ ý bạn 😅\n" +
    "Bạn muốn hỏi về:\n" +
    "• 🚚 **Giao hàng / Phí ship**\n" +
    "• 💰 **Báo giá** (táo/nho/dâu…)\n" +
    "• 📍 **Địa chỉ**\n\n" +
    "Bạn nhắn 1 trong các mục trên giúp mình nhé."
  );
}

// ===== Service function (controller gọi cái này) =====
function replyChat({ message, sessionId }) {
  const reply = botReply(message, sessionId);
  return { reply };
}

module.exports = {
  botReply,
  replyChat,
};
