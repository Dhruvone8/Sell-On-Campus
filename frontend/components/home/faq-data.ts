export interface FaqItem {
  question: string;
  answer: string;
}

export const CAMPUS_FAQS: FaqItem[] = [
  {
    question: "What is SellOnCampus and who is it built for?",
    answer:
      "SellOnCampus is a community marketplace dedicated exclusively to university students. It allows verified students to buy, sell, and trade course textbooks, electronics, dorm furniture, scientific calculators, and bicycles directly with peers on their own campus without platform markups.",
  },
  {
    question: "Are there any listing fees or transaction commissions?",
    answer:
      "No. SellOnCampus is 100% free for all university students. We do not charge fees to list items, take cuts from sales, or impose hidden processing commissions. Every dollar agreed upon stays directly between the student buyer and seller.",
  },
  {
    question: "How does student verification work?",
    answer:
      "SellOnCampus is publicly browsable so anyone can explore available gear across campus. To maintain community safety, prevent commercial spammers, and protect students, creating listings, editing items, and chatting with sellers requires an active university email address verified via a quick one-time passcode (OTP).",
  },
  {
    question: "How do payments and item handoffs work?",
    answer:
      "Because all members belong to the same campus, transactions happen through local in-person handoffs. Buyers and sellers coordinate securely through our real-time in-app messaging to inspect items and complete handoffs at convenient campus locations like the student union, library, or residence halls.",
  },
  {
    question: "What types of items can I list on the marketplace?",
    answer:
      "Students commonly list used textbooks, course syllabus notes, laptops, monitors, dorm mini-fridges, desk chairs, campus cycles, lab equipment, athletic gear, and student sublease openings. All items must comply with campus safety standards and community guidelines.",
  },
  {
    question: "How are safety and moderation handled?",
    answer:
      "Every listing and profile includes a one-click Report option. If a listing violates guidelines, misrepresents an item, or appears suspicious, our student moderation team reviews and resolves the flag promptly to keep the marketplace safe and trustworthy.",
  },
];

