import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage({ searchParams }) {
  return (
    <PlaceholderPage
      searchParams={searchParams}
      titleEn="Privacy Policy"
      titleHi="गोपनीयता नीति"
      bodyEn="Placeholder privacy policy for the demo. A production version would describe what data is collected, how it is used, and how readers can exercise their privacy rights."
      bodyHi="डेमो के लिए प्लेसहोल्डर गोपनीयता नीति। प्रोडक्शन संस्करण में यह बताया जाएगा कि कौन सा डेटा एकत्र किया जाता है और उसका उपयोग कैसे होता है।"
    />
  );
}
