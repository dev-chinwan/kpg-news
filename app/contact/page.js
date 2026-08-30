import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata = { title: "Contact" };

export default function ContactPage({ searchParams }) {
  return (
    <PlaceholderPage
      searchParams={searchParams}
      titleEn="Contact Us"
      titleHi="संपर्क करें"
      bodyEn="This is a placeholder contact page for the demo. In production, add a real editorial and advertising contact address here."
      bodyHi="यह डेमो के लिए एक प्लेसहोल्डर संपर्क पेज है। प्रोडक्शन में यहां वास्तविक संपादकीय और विज्ञापन संपर्क जानकारी जोड़ें।"
    />
  );
}
