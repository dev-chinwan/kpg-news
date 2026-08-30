import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata = { title: "Advertise With Us" };

export default function AdvertisePage({ searchParams }) {
  return (
    <PlaceholderPage
      searchParams={searchParams}
      titleEn="Advertise With Us"
      titleHi="हमारे साथ विज्ञापन दें"
      bodyEn="Placeholder advertising information page for the demo. A production version would list ad formats, rate cards, and a contact form for advertisers."
      bodyHi="डेमो के लिए प्लेसहोल्डर विज्ञापन जानकारी पेज। प्रोडक्शन संस्करण में विज्ञापन प्रारूप, दरें और विज्ञापनदाताओं के लिए संपर्क फॉर्म होगा।"
    />
  );
}
