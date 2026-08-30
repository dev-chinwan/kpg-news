import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata = { title: "Editorial Policy" };

export default function EditorialPolicyPage({ searchParams }) {
  return (
    <PlaceholderPage
      searchParams={searchParams}
      titleEn="Editorial Policy"
      titleHi="संपादकीय नीति"
      bodyEn="Placeholder editorial policy for the demo. A production version would describe sourcing standards, correction policy, and verification process for published stories."
      bodyHi="डेमो के लिए प्लेसहोल्डर संपादकीय नीति। प्रोडक्शन संस्करण में स्रोत मानकों, सुधार नीति और खबरों के सत्यापन की प्रक्रिया का विवरण होगा।"
    />
  );
}
