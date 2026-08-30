import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata = { title: "हमारे बारे में" };

export default function AboutPage({ searchParams }) {
  return (
    <PlaceholderPage
      searchParams={searchParams}
      titleHi="लोकल न्यूज़ के बारे में"
      bodyHi="लोकल न्यूज़ एक डेमो लोकल न्यूज़ पोर्टल है जिसे तेज़, द्विभाषी और आसानी से अपडेट होने वाली न्यूज़ वेबसाइट दिखाने के लिए बनाया गया है। इस साइट की सभी खबरें डेमो सामग्री हैं, वास्तविक रिपोर्टिंग नहीं।"
    />
  );
}
