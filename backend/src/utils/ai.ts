import prisma from '../config/prisma';

export const getAiSuggestions = async (cartItems: { name: string }[]) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Trả về dữ liệu mock chất lượng cao nếu chưa cấu hình GEMINI_API_KEY
    return getMockSuggestions(cartItems);
  }

  try {
    // Lấy danh sách toàn bộ sản phẩm trong cửa hàng để Gemini gợi ý chính xác
    const storeProducts = await prisma.sanPham.findMany({
      select: { name: true },
      take: 50,
    });

    const cartNames = cartItems.map((item) => item.name).join(', ');
    const storeNames = storeProducts.map((p) => p.name).join(', ');

    const prompt = `Bạn là một trợ lý bán hàng AI thông minh tại siêu thị.
Giỏ hàng hiện tại của khách có các sản phẩm: [${cartNames}].
Các sản phẩm có sẵn trong siêu thị: [${storeNames}].

Nhiệm vụ: Hãy chọn ra tối đa 3 sản phẩm trong siêu thị có khả năng cao khách hàng sẽ muốn mua kèm để tối ưu doanh thu (ví dụ: mua mì ăn liền gợi ý nước ngọt/xúc xích, mua bàn chải gợi ý kem đánh răng).
Đối với mỗi gợi ý, hãy cung cấp lý do giải thích ngắn gọn, thuyết phục, hướng về lợi ích của khách hàng.

Hãy trả về kết quả định dạng JSON thuần túy (không chứa markdown, không có thẻ \`\`\`json):
{
  "suggestions": [
    {
      "name": "Tên sản phẩm được gợi ý",
      "reason": "Lý do gợi ý ngắn gọn, hấp dẫn bằng tiếng Việt"
    }
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (textContent) {
      return JSON.parse(textContent.trim());
    }

    return getMockSuggestions(cartItems);
  } catch (error) {
    console.error('Error fetching Gemini AI suggestions:', error);
    return getMockSuggestions(cartItems);
  }
};

// Hàm tạo gợi ý mua kèm giả lập khi không có API Key
const getMockSuggestions = (cartItems: { name: string }[]) => {
  const suggestions: { name: string; reason: string }[] = [];

  const cartStr = cartItems.map((i) => i.name.toLowerCase()).join(' ');

  if (cartStr.includes('mì') || cartStr.includes('omachi') || cartStr.includes('hảo hảo')) {
    suggestions.push(
      {
        name: 'Xúc xích Vissan 175g',
        reason: 'Xúc xích ăn liền là sự kết hợp hoàn hảo cùng mì nóng hổi, tiếp thêm năng lượng cho bữa ăn nhanh của bạn.',
      },
      {
        name: 'Coca-Cola lon 330ml',
        reason: 'Nước ngọt có ga mát lạnh giúp giải nhiệt và kích thích vị giác cực đã khi ăn đồ cay nóng.',
      }
    );
  } else if (cartStr.includes('bàn chải') || cartStr.includes('oral-b')) {
    suggestions.push({
      name: 'Kem đánh răng P/S 180g',
      reason: 'Kem đánh răng ngừa sâu răng là bộ đôi không thể thiếu cùng bàn chải đánh răng mới của bạn.',
    });
  } else if (cartStr.includes('coca') || cartStr.includes('pepsi') || cartStr.includes('bia')) {
    suggestions.push({
      name: 'Cơm cháy chà bông 200g',
      reason: 'Cơm cháy giòn rụm, mằn mặn cực kỳ thích hợp làm mồi nhắm cùng đồ uống lạnh.',
    });
  } else {
    // Mặc định gợi ý các mặt hàng bán chạy đa năng
    suggestions.push(
      {
        name: 'Nước suối Aquafina 500ml',
        reason: 'Nước tinh khiết giải khát nhanh chóng, thích hợp mang theo mọi lúc mọi nơi.',
      },
      {
        name: 'Giấy ướt Bobby 100 tờ',
        reason: 'Giấy ướt kháng khuẩn tiện lợi để vệ sinh tay trước và sau khi ăn uống.',
      }
    );
  }

  return { suggestions: suggestions.slice(0, 3) };
};
