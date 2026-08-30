import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata = { title: "उपयोग की शर्तें" };

export default function TermsPage({ searchParams }) {
  return (
    <PlaceholderPage
      searchParams={searchParams}
      titleHi="उपयोग की शर्तें"
      bodyHi="डेमो के लिए प्लेसहोल्डर उपयोग शर्तें। प्रोडक्शन संस्करण में इस साइट के उपयोग और सामग्री के पुनर्प्रकाशन के नियम दिए जाएंगे।"
    />
  );
}
