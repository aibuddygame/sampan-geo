# SAMPAN.ai enterprise website

Local bilingual mockup of the Corporate AI Ambassador and Enterprise AI Knowledge Hub. The site is an independent Next.js App Router, React and Tailwind CSS application alongside the repository’s SEO/GEO applications.

## Preview on your computer

Use Node.js 20.9 or later. From the repository root:

```sh
cd apps/web
npm ci
npm run dev
```

Open [http://127.0.0.1:30101/](http://127.0.0.1:30101/). Stop with Control-C. The existing SEO/AEO application uses port 30100 and the Python scoring workspace uses port 8004. After installation this site uses local assets and sample data.

To validate a production build locally, run `npm test`, `npm run build`, then `npm start` on the same port.

## Refresh the offline preview

From `apps/web`, rebuild and export the reviewed pages:

```sh
npm run build
python3 scripts/export-review.py /tmp/sampan-review
```

Open `/tmp/sampan-review/index.html` for the Traditional Chinese homepage, `en.html` for English or `mobile.html` to compare narrow layouts. The export includes both languages, page links, FAQ disclosures and local assets.

To share the offline review, ZIP the complete export folder. Reviewers can unzip it and open `index.html` or `en.html` in a browser. Use the local app for visitor chat, admin and storyboard interactions.

## Pages

| Page | Traditional Chinese | English |
|---|---|---|
| Home | `/` | `/en` |
| Corporate AI Ambassador | `/ambassador` | `/en/ambassador` |
| Enterprise AI Knowledge Hub | `/knowledge-hub` | `/en/knowledge-hub` |
| Six Core Solutions | `/solutions` | `/en/solutions` |
| AI Video Studio | `/video-studio` | `/en/video-studio` |
| Interactive Demo | `/demo` | `/en/demo` |
| Customer Admin Portal | `/admin` | `/en/admin` |
| About | `/about` | `/en/about` |
| Contact and demo enquiry | `/contact` | `/en/contact` |

## Team review

1. Open the homepage and switch between Traditional Chinese and English. Open the same page on a narrow screen and try the menu.
2. In the interactive demo, choose a sample question, and ask a question outside the example knowledge. Read the sample source label and the staff handover.
3. From the demo, open **Knowledge & Training**. Edit an existing FAQ or add one. Save and preview the draft, submit it for review, approve it, then publish it. Use **Test in visitor demo** to check the published answer. Return to the same-language portal and roll back the publication.
4. Update the ambassador’s greeting or tone under **Behaviour**. Test it in the visitor demo. The **My Ambassador** panel changes the sample name and display style. **Test & Deploy** toggles the sample visitor demo.
5. In **Video Studio**, enter a topic, choose the aspect ratio and duration, and preview the templated storyboard. Copy the script if clipboard access is available. Video rendering is marked as planned.
6. Use **Book a demo** to check the prefilled email action. Your mail application opens a draft addressed to `barry.lau@vxreal.com`.

The admin and visitor experiences use a React state provider across same-language navigation. Refreshing the page or changing languages resets the sample workspace. The web copy and metadata are prerendered. Proxy-free local rewrites keep the Traditional Chinese paths unprefixed. All routes are marked noindex for internal review.

Sophie is a fictional ambassador rendered as an original AI-generated editorial portrait for this mockup. The site uses the locally stored WebP and original geometric brand mark and interface icons. See [progress and limitations](PROGRESS.md), the [PR reference snapshots](docs/README.md) and the [master product requirements](https://docs.google.com/document/d/1FFkBK0q4qrQr0mq6TBTU4YHZeo_eQpJpJDVrCPnQI8c/edit).
