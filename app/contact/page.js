import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata = { title: "संपर्क करें" };

export default function ContactPage({ searchParams }) {
  return (
    <PlaceholderPage
      searchParams={searchParams}
      titleHi="संपर्क करें"
      bodyHi="यह डेमो के लिए एक प्लेसहोल्डर संपर्क पेज है। प्रोडक्शन में यहां वास्तविक संपादकीय और विज्ञापन संपर्क जानकारी जोड़ें।"
    />
  );
}
