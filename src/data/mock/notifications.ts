import { AppNotification } from "@/models/notification";

export const initialMockNotifications: AppNotification[] = [
  {
    id: "notif_1",
    title: "🌅 शुभ प्रभात - आज का दर्शन",
    message: "भगवान शिव के अलौकिक 4K वॉलपेपर और भजनों के साथ अपने दिन की पावन शुरुआत करें।",
    audience: "All Users",
    status: "sent",
    sentAt: "2026-08-15T06:00:00Z",
    metrics: {
      sentCount: 18421,
      deliveredCount: 15892,
      openedCount: 6482,
      openRate: 40.8,
    },
    createdAt: "2026-08-14T20:00:00Z",
  },
  {
    id: "notif_2",
    title: "🔱 सावन सोमवार विशेष - महामृत्युंजय जाप",
    message: "आज महामृत्युंजय मंत्र का १०८ बार पाठ करें और महाकाल का आशीर्वाद प्राप्त करें।",
    audience: "Mahadev Users",
    status: "sent",
    sentAt: "2026-08-12T07:30:00Z",
    metrics: {
      sentCount: 12400,
      deliveredCount: 11200,
      openedCount: 5800,
      openRate: 51.7,
    },
    createdAt: "2026-08-11T18:00:00Z",
  },
  {
    id: "notif_3",
    title: "🚩 मंगलवार हनुमान भक्ति सन्देश",
    message: "श्री हनुमान चालीसा का सम्पूर्ण पाठ सुनें और संकटों से मुक्ति पाएं।",
    audience: "Hanuman Users",
    status: "scheduled",
    scheduledAt: "2026-08-18T06:30:00Z",
    createdAt: "2026-08-15T10:00:00Z",
  },
];
