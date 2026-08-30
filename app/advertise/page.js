import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata = { title: "हमारे साथ विज्ञापन दें" };

export default function AdvertisePage({ searchParams }) {
  return (
    <PlaceholderPage
      searchParams={searchParams}
      titleHi="हमारे साथ विज्ञापन दें"
      bodyHi="डेमो के लिए प्लेसहोल्डर विज्ञापन जानकारी पेज। प्रोडक्शन संस्करण में विज्ञापन प्रारूप, दरें और विज्ञापनदाताओं के लिए संपर्क फॉर्म होगा।"
    />
  );
}
