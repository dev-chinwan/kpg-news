import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata = { title: "Terms" };

export default function TermsPage({ searchParams }) {
  return (
    <PlaceholderPage
      searchParams={searchParams}
      titleEn="Terms of Use"
      titleHi="उपयोग की शर्तें"
      bodyEn="Placeholder terms of use for the demo. A production version would set out the rules for using this site and republishing its content."
      bodyHi="डेमो के लिए प्लेसहोल्डर उपयोग शर्तें। प्रोडक्शन संस्करण में इस साइट के उपयोग और सामग्री के पुनर्प्रकाशन के नियम दिए जाएंगे।"
    />
  );
}
