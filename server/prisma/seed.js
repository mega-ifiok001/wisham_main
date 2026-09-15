// Seed script — creates the default WISHAM beats + the admin user.
// Run: npm run db:seed  (from server/)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

const SAMPLE_BEATS = [
  { title: 'Hyperdrive', artist: 'WISHAM', genre: 'Trap', bpm: 142, keySignature: 'C# Minor', description: 'Heavy 808s, dark bells, and rapid hi-hat rolls. Perfect for high-energy festival bangers.', duration: '3:12', coverGradient: 'from-red-500 to-red-700' },
  { title: 'Neon Shadows', artist: 'WISHAM', genre: 'Synthwave', bpm: 110, keySignature: 'A Minor', description: 'Analog arpeggios, gated reverb snares, and driving basslines straight from the 80s.', duration: '3:45', coverGradient: 'from-rose-500 to-red-600' },
  { title: 'Vintage Velvet', artist: 'WISHAM', genre: 'Boom Bap', bpm: 92, keySignature: 'F Major', description: 'Dusty Rhodes chords, unquantized MPC swing, and deep acoustic bass grooves.', duration: '2:58', coverGradient: 'from-red-600 to-rose-800' },
  { title: 'Titanium Edge', artist: 'WISHAM', genre: 'Drill', bpm: 144, keySignature: 'G Minor', description: 'Gliding sub bass, haunting pads, and syncopated snare rolls for lyrical aggression.', duration: '3:20', coverGradient: 'from-rose-600 to-red-900' },
  { title: 'Midnight Rain', artist: 'WISHAM', genre: 'R&B', bpm: 120, keySignature: 'D# Minor', description: 'Smooth keys, warm bass, and soulful pockets for R&B and melodic rap.', duration: '3:05', coverGradient: 'from-neutral-800 to-red-900' },
];

async function main() {
  // 1) Seed beats only if the table is empty
  const count = await prisma.beat.count();
  if (count === 0) {
    for (const beat of SAMPLE_BEATS) {
      await prisma.beat.create({ data: beat });
    }
    console.log(`Seeded ${SAMPLE_BEATS.length} sample beats.`);
  } else {
    console.log(`Beats table already has ${count} rows — skipping beat seed.`);
  }

  // 2) Seed / upsert the admin user
  const email = (process.env.ADMIN_EMAIL || 'ifiokaniebiet@gmail.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'wisham-admin-2026';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: 'WISHAM Owner' },
  });
  console.log(`Admin user ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());