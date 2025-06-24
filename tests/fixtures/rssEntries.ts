// Realistic mock entries from https://rss.app/feeds/COiTZRnT26oDqrJf.xml

import { FeedEntry } from "@/services/rssService";

export const entryWithMediaContent: FeedEntry = {
  title:
    "[News] ทีมงาน R.E.P.O. ลั่น! ซื้อเกมแล้วก็เป็นเจ้าของ และจะไม่มีระบบเติมเงิน หรือ Battle Pass เข้ามาแน่นอน!",
  link: "https://www.facebook.com/sheapgamer/posts/pfbid0MJYS99ReGC9fSZJXiwARCXyUbwwKcXsMQUF6A8Yj7qN1gX5hfckZMhfvjzUtrAa2lb0e4ad55ef8bc350d04bf96e5141bc78",
  pubDate: "Tue, 24 Jun 2025 14:56:36 GMT",
  description: "[News] ทีมงาน R.E.P.O. ลั่น! ซื้อเกมแล้วก็เป็นเจ้าของ ...",
  media: {
    content: [
      {
        url: "https://static.xx.fbcdn.net/rsrc.php/yz/r/KFyVIAWzntM.ico",
        type: "image/png",
      },
    ],
  },
};

export const entryWithEnclosure: FeedEntry = {
  title:
    "[News] Rematch เกมฟุตบอลแบบ 5v5 ทำยอดขายรวมทะลุ 1 ล้านชุด ในช่วงสุดสัปดาห์แรกของการวางขาย",
  link: "https://www.facebook.com/sheapgamer/posts/pfbid0z834deEVvRVDX2v5QqxBHWQSvEYvMj4UVxfzLkRzGRz7NUjMLRQwpoU2zbzAwiSclab0730e58aef9e1968add523e4cf6dac",
  pubDate: "Mon, 23 Jun 2025 12:36:10 GMT",
  description: "[News] Rematch เกมฟุตบอลแบบ 5v5 ทำยอดขายรวมทะลุ 1 ล้านชุด ...",
  enclosure: {
    url: "https://static.xx.fbcdn.net/rsrc.php/yz/r/KFyVIAWzntM.ico",
    type: "image/png",
  },
};

export const entryWithoutImage: FeedEntry = {
  title:
    "ในตอนนี้คะแนนรอบสื่อของ Death Stranding 2: On the Beach ภาคต่อของเกมแอ็กชันผจญภัยส่งของในโลกล่มสลายที่ขับเคลื่อนด้วยเนื้อ...",
  link: "https://www.facebook.com/sheapgamer/posts/pfbid02ukLgud5stRqXXbVRdCRK1kJq59hcC8RJmoEENjXMQpMrcSrHNbELPY4FDaHLtRaSl2b6e9f50d11ff198c6b0664bc6710f59",
  pubDate: "Mon, 23 Jun 2025 12:04:58 GMT",
  description: "ในตอนนี้คะแนนรอบสื่อของ Death Stranding 2: On the Beach ...",
  // No media or enclosure
};
