import Link from 'next/link';
import { SiteHeader } from '@/shared/SiteHeader';

export const metadata = { title: 'Privacy · Games' };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="page-width privacy-page">
        <p className="eyebrow">Updated 2 November 2026</p>
        <h1 className="hero-title">Privacy, plainly.</h1>
        <p className="muted">Games is a private game-night app. Here is what gets saved and why.</p>
        <section>
          <h2>Your player and Google account</h2>
          <p>
            Guest play uses an anonymous account and browser session. Clearing that session can make
            an unlinked guest player inaccessible. Connecting Google lets you return to your saved
            player on another device.
          </p>
          <p>
            Google sign-in requests your basic account identity, email and profile information. It
            does not request permission to read Gmail, Drive or contacts. Supabase handles
            authentication and stores the connected identity.
          </p>
        </section>
        <section>
          <h2>Rooms and game history</h2>
          <p>
            Games saves your chosen name and avatar, room memberships, match state and results,
            chat, reactions and presence timestamps. These make private rooms, reconnects and saved
            history work. Room members receive the public table and the private information they are
            allowed to see; hidden hands and deck order remain on the server.
          </p>
        </section>
        <section>
          <h2>Tarot questions and readings</h2>
          <p>
            If you request a Tarot reading, your question and selected cards are sent to Google
            Gemini. The reading and question are saved so you can revisit them. When the free API
            tier is used, Google may use submitted content to improve its products; the reading form
            shows the active notice before you submit. Please keep questions free of information you
            would not want processed this way.
          </p>
        </section>
        <section>
          <h2>Optional astrology</h2>
          <p>
            Astrology is off unless you choose it. Your birth date, local birth time and selected
            birthplace are used to calculate a Western chart, a Vedic chart or both. Place searches
            send only the city or town you enter to Open-Meteo, using GeoNames location data.
          </p>
          <p>
            Games sends the calculated chart placements to Gemini for interpretation, together with
            your Tarot question and cards. Your birth date, time and birthplace are not sent to
            Gemini or saved with the reading. The calculated chart and interpretation are saved
            privately so you can return to them. A chart can remain saved after a failed reading so
            you can retry without entering birth details again. Turning astrology off excludes it
            from the next reading.
          </p>
        </section>
        <section>
          <h2>Services and browser storage</h2>
          <p>
            Games uses Supabase for authentication and data, Vercel for hosting, and Google for
            sign-in and requested AI readings. Browser cookies keep your session, and local storage
            remembers your chosen player name and avatar. Service providers process requests needed
            to run those features.
          </p>
        </section>
        <section>
          <h2>Saved data and requests</h2>
          <p>
            Player records, rooms, messages and results remain saved until removed. To request
            access, correction or deletion, contact{' '}
            <a href="mailto:raghavmulpuru@gmail.com">raghavmulpuru@gmail.com</a>. Ownership must be
            verified before private records can be changed or disclosed.
          </p>
        </section>
        <Link href="/" className="button button--secondary button--md">
          Back to the lounge
        </Link>
      </main>
    </>
  );
}
