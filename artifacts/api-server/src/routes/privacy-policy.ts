import { Router } from "express";

const router = Router();

router.get("/privacy-policy", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Privacy Policy – VideoPlayer PRO</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f0f0f;
      color: #e0e0e0;
      margin: 0;
      padding: 40px 20px 80px;
      line-height: 1.7;
    }
    .wrap { max-width: 680px; margin: 0 auto; }
    h1 { font-size: 2rem; color: #fff; margin-bottom: 4px; }
    .meta { color: #888; font-size: 0.85rem; margin-bottom: 40px; }
    h2 { font-size: 1.05rem; color: #fff; margin: 32px 0 8px; }
    p { color: #b0b0b0; margin: 0 0 12px; }
    ul { padding-left: 20px; margin: 0 0 12px; }
    li { color: #b0b0b0; margin-bottom: 4px; }
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(76,175,80,0.1);
      border: 1px solid rgba(76,175,80,0.3);
      color: #4CAF50;
      border-radius: 999px;
      padding: 8px 18px;
      font-size: 0.8rem;
      margin-top: 40px;
    }
    a { color: #FF3C00; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Privacy Policy</h1>
    <p class="meta">Last updated: March 23, 2026 &nbsp;·&nbsp; VideoPlayer PRO by TB Techs</p>

    <h2>Overview</h2>
    <p>VideoPlayer PRO is a personal video library application. We are committed to protecting your privacy. This policy explains what information we handle, how it is stored, and your rights regarding that data.</p>
    <p><strong style="color:#fff">The short version: we collect nothing. All your data stays on your device.</strong></p>

    <h2>Information We Do NOT Collect</h2>
    <p>VideoPlayer PRO does not collect, transmit, or share any personal information. Specifically, we do not collect:</p>
    <ul>
      <li>Your name, email address, or any contact information</li>
      <li>Your location data</li>
      <li>Device identifiers or advertising IDs</li>
      <li>Usage analytics or crash reports</li>
      <li>The video URLs you add to your library</li>
      <li>Your watch history or playback preferences</li>
      <li>Any financial information</li>
    </ul>

    <h2>Data Stored Locally on Your Device</h2>
    <p>All data created while using VideoPlayer PRO is stored exclusively on your device using local storage. This includes:</p>
    <ul>
      <li>Your video library (titles and URLs you add)</li>
      <li>Watch progress and resume positions for each video</li>
      <li>Playback preferences (speed, volume, etc.)</li>
      <li>App settings and onboarding state</li>
    </ul>
    <p>This data is never transmitted to any server, third party, or cloud service. Uninstalling the app removes all locally stored data permanently.</p>

    <h2>Media Library Permission</h2>
    <p>VideoPlayer PRO may request access to your device's media library. This permission is used solely to enable features such as discovering local video files on your device. We do not read, scan, or transmit any content from your media library.</p>
    <p>You can deny this permission and continue using all core features of the app without restriction.</p>

    <h2>Video Playback</h2>
    <p>Videos are streamed directly from the URLs you provide. VideoPlayer PRO acts only as a player — it does not proxy, cache to external servers, or share your video URLs with any third party.</p>
    <p>Standard network activity logs (IP address, request time) may be created on the servers that host those video files, as is normal for any internet request. This is outside of VideoPlayer PRO's control.</p>

    <h2>Third-Party Services</h2>
    <p>VideoPlayer PRO does not integrate any third-party analytics, advertising, or tracking SDKs. There are no embedded social media buttons, trackers, or external scripts.</p>

    <h2>Children's Privacy</h2>
    <p>VideoPlayer PRO does not knowingly collect any information from users of any age, including children. Since no personal data is collected at all, this application is compliant with children's privacy standards.</p>

    <h2>Changes to This Policy</h2>
    <p>We may update this privacy policy from time to time. Any changes will be reflected in the "Last updated" date at the top of this page. Continued use of the app after changes constitutes acceptance of the updated policy.</p>

    <h2>Contact</h2>
    <p>If you have any questions about this privacy policy or your data, please contact us at <a href="mailto:himanshusmartwatch@gmail.com">himanshusmartwatch@gmail.com</a>.</p>

    <div class="badge">&#x2714;&nbsp; No data collected &nbsp;·&nbsp; Stored locally only &nbsp;·&nbsp; No tracking</div>
  </div>
</body>
</html>`);
});

export default router;
