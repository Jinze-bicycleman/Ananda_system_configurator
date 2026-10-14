/**
 * Content for the Ananda Ride app description panel (Step 5 -> IoT / Connectivity).
 * Set APP_UI_IMAGE_URL once the real asset is available; the image stays
 * hidden while its value is empty. OFFICIAL_APP_URL drives the "Learn more" link.
 */

// Path under /public (e.g. "/images/ananda-ride-app-ui.png") or an absolute URL.
export const APP_UI_IMAGE_URL = ""

export const APP_UI_IMAGE_ALT = "Ananda Ride app interface"

export const OFFICIAL_APP_URL = "https://ananda-drive.com/innovative-R&D/ananda-ride-app"

export const APP_LOGO_URL = "/images/ananda-ride-logo.png"

export const APP_INTRO = {
  headline: "Experience a whole new way of riding with the Ananda Ride app.",
  body: "Track your rides, fine-tune motor performance, and enjoy a smooth, powerful eBike experience – all from one smart, intuitive app. Ananda Ride gives you full control and lets you ride exactly the way you want.",
}

export const APP_FEATURES: { title: string; description: string }[] = [
  {
    title: "Effortless Bluetooth Connection",
    description:
      "Easily connect your Ananda eBike to the app via Bluetooth. Record your rides, adjust motor settings, set up security, locate your bike, and more – all in just a few taps.",
  },
  {
    title: "System Health Check",
    description:
      "Easily switch your lights on, monitor speed sensors, detect communication errors, and gain real-time insights into your motor and controller performance – including temperature readings.",
  },
  {
    title: "Motor Boost Adjustment",
    description:
      "Customize your ride by adjusting assist levels and maximum motor output. Whether you want more power or a more natural ride feel, you're in control.",
  },
  {
    title: "Security & Bike Finder",
    description:
      "Set a personalized passcode to protect your eBike. Use the app to locate your bike's last known position.",
  },
  {
    title: "Ride History",
    description:
      "Automatically save detailed ride data, including cycling time, distance, and more. Look back at your stats and see how far you've come.",
  },
  {
    title: "Live Ride Tracking",
    description:
      "Track your ride as it happens. View real-time metrics like current speed, average speed, and total distance.",
  },
]

export const APP_SUPPORT = {
  title: "Ananda Service & Support",
  items: [
    "Access a range of helpful features through the Ananda Ride app",
    "Check the condition and status of your eBike's electronic components",
    "Use our self-check manual to troubleshoot common issues",
    "Send feedback or report any technical concerns directly via the app",
  ],
}
