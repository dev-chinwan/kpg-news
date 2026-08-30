import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata = { title: "संपादकीय नीति" };

export default function EditorialPolicyPage({ searchParams }) {
  return (
    <PlaceholderPage
      searchParams={searchParams}
      titleHi="संपादकीय नीति"
      bodyHi="डेमो के लिए प्लेसहोल्डर संपादकीय नीति। प्रोडक्शन संस्करण में स्रोत मानकों, सुधार नीति और खबरों के सत्यापन की प्रक्रिया का विवरण होगा।"
    />
  );
}
