export interface MotivationalQuote {
  text: string;
  author: string;
}

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  // ============================================
  // TÜRKÇE ÖZGÜN SÖZLER
  // ============================================
  {
    text: "Bugün attığın her adım, yarın olacağın kişiyi inşa eder.",
    author: "TaskFlow",
  },
  {
    text: "Disiplin, motivasyonun bittiği yerde başlar.",
    author: "TaskFlow",
  },
  {
    text: "Küçük adımlar, büyük yolculukların başlangıcıdır.",
    author: "TaskFlow",
  },
  {
    text: "Mükemmel an bekleme, şu anı mükemmel yap.",
    author: "TaskFlow",
  },
  {
    text: "Bir görevi bitirmek, onu düşünmekten daha kolaydır.",
    author: "TaskFlow",
  },

  // ============================================
  // ÜNLÜ SÖZLER
  // ============================================
  {
    text: "Gelecek, bugün ne yaptığına bağlıdır.",
    author: "Mahatma Gandhi",
  },
  {
    text: "Her şeyi yapamayabilirsin ama hiçbir şey yapmamayı seçme.",
    author: "Seneca",
  },
  {
    text: "Başarı, küçük çabaların her gün tekrarlanmasıdır.",
    author: "Robert Collier",
  },
  {
    text: "Yapman gereken tek şey başlamak.",
    author: "Mark Twain",
  },
  {
    text: "Zor zamanlar güçlü insanlar yaratır.",
    author: "Anonim",
  },
  {
    text: "Bugünün işini yarına bırakma.",
    author: "Benjamin Franklin",
  },
  {
    text: "Tek sınır, kendi aklına koyduğun sınırdır.",
    author: "Napoleon Hill",
  },
  {
    text: "Her uzman bir zamanlar amatördü.",
    author: "Helen Hayes",
  },
  {
    text: "Başarısızlık, başarının ön koşuludur.",
    author: "Thomas Edison",
  },
  {
    text: "Harekete geçmek, mükemmel bir plan yapmaktan iyidir.",
    author: "George Patton",
  },
  {
    text: "Bir şeyi istemen yetmez, ona layık olacak kadar çalışmalısın.",
    author: "Mustafa Kemal Atatürk",
  },
  {
    text: "Zamanı yönetemezsin ama kendini yönetebilirsin.",
    author: "Peter Drucker",
  },
  {
    text: "Düşünmeden çalışmak boşuna, çalışmadan düşünmek tehlikelidir.",
    author: "Konfüçyüs",
  },
  {
    text: "Büyük işler, küçük parçaların bir araya gelmesiyle oluşur.",
    author: "Henry Ford",
  },
  {
    text: "Yarını kazanmak için bugün savaşmalısın.",
    author: "Robert Kiyosaki",
  },
  {
    text: "Dünyanın en güçlü silahı azimle dolu insan ruhudur.",
    author: "Ferdinand Foch",
  },
  {
    text: "Odaklanmak, bin şeye hayır demek demektir.",
    author: "Steve Jobs",
  },
  {
    text: "Her sabah iki seçeneğin var: uyumaya devam et ve hayal kur, ya da kalk ve hayalini gerçekleştir.",
    author: "Anonim",
  },
  {
    text: "İmkansız kelimesi sadece tembellerin sözlüğünde bulunur.",
    author: "Napoleon Bonaparte",
  },
  {
    text: "Hayat cesaret gösterenlerin yanındadır.",
    author: "Virgil",
  },
  {
    text: "Başarı yolculuğunda en önemli adım bir sonraki adımdır.",
    author: "TaskFlow",
  },
  {
    text: "Planlamak, geleceği kontrol etmenin en güçlü yoludur.",
    author: "Alan Lakein",
  },
  {
    text: "Alışkanlıklar kaderdir. İyi alışkanlıklar edin.",
    author: "Aristoteles",
  },
  {
    text: "Hedefe odaklan, engellere değil.",
    author: "TaskFlow",
  },
  {
    text: "Bugün zor olanı yap ki yarın kolay olsun.",
    author: "Jim Rohn",
  },

  // ============================================
  // MOTİVASYON BOMBASI
  // ============================================
  {
    text: "Streak'ini kırma, kırarsan kendini kırarsın.",
    author: "TaskFlow",
  },
  {
    text: "Her tamamlanan görev, daha güçlü bir seni inşa eder.",
    author: "TaskFlow",
  },
  {
    text: "Listendeki o son görev de seni bekliyor. Bitir onu.",
    author: "TaskFlow",
  },
  {
    text: "Senden daha iyi olan tek kişi, dünkü senden daha çok çalışan bugünkü sensin.",
    author: "TaskFlow",
  },
  {
    text: "Bir yıl sonra bugün başlamış olmayı dileceksin.",
    author: "Karen Lamb",
  },
  {
    text: "Konsantrasyonun bozuldu mu? Derin bir nefes al ve tek bir göreve odaklan.",
    author: "TaskFlow",
  },
  {
    text: "Yapılacaklar listesi bir yük değil, bir yol haritasıdır.",
    author: "TaskFlow",
  },
  {
    text: "Kendine yatırım yap. Bu, alabileceğin en iyi yatırımdır.",
    author: "Warren Buffett",
  },
  {
    text: "Bugün ektiğin tohumlar, yarının meyveleridir.",
    author: "TaskFlow",
  },
  {
    text: "Vazgeçme! Başladığın yer, başkalarının hayal ettiği yerdir.",
    author: "TaskFlow",
  },
];

export const getRandomQuote = (): MotivationalQuote => {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
};

export const getDailyQuote = (): MotivationalQuote => {
  // Her gün aynı sözü göster (güne göre index)
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
};
