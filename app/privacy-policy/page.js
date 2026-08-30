import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata = { title: "गोपनीयता नीति" };

export default function PrivacyPolicyPage({ searchParams }) {
  return (
    <PlaceholderPage
      searchParams={searchParams}
      titleHi="गोपनीयता नीति"
      bodyHi="डेमो के लिए प्लेसहोल्डर गोपनीयता नीति। प्रोडक्शन संस्करण में यह बताया जाएगा कि कौन सा डेटा एकत्र किया जाता है और उसका उपयोग कैसे होता है।"
    />
  );
}
