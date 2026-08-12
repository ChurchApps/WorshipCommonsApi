// Public-domain Spanish hymn translations from the classic evangelical hymnals
// (Himnario Evangélico, El Nuevo Himnario Evangélico, Himnos Selectos) — all
// published pre-1931. Each links to its English parent via parent/rel.
// Translations with uncertain PD status or unstable texts (Tal como soy,
// En el monte Calvario, Grato es contar la historia) deliberately excluded.

import { h, HymnSeed } from "./hymns.js";

const es = (t: string, a: string, y: number, th: string, k: string, bpm: number, scr: string, cong: number, chordPro: string, parent: string, rel: string, opts: Partial<HymnSeed> = {}): HymnSeed =>
  h(t, a, y, th, k, bpm, scr, cong, chordPro, { ...opts, lang: "Spanish", parent, rel });

export const HYMNS_ES: HymnSeed[] = [
  es("Sublime Gracia", "John Newton · tr. anónimo", 1905, "Grace,Assurance", "G", 84, "Juan 9:25", 512, `Verse 1
[G]Sublime gracia [C]del Se[G]ñor,
que a un infeliz sal[D]vó;
[G]fui ciego mas [C]hoy veo [G]yo,
per[Em]dido y [D]él me ha[G]lló.`, "Amazing Grace", "Spanish translation · anonymous, early 20th c.", { ts: "3/4" }),

  es("Al Mundo Paz", "Isaac Watts · tr. anónimo", 1915, "Christmas,Praise", "D", 100, "Salmos 98:4", 398, `Verse 1
[D]¡Al mundo paz, na[G]ció Je[D]sús,
nació ya [A]nuestro [D]Rey!
El corazón [D]ya tiene luz,
y paz su santa grey,
y [A]paz su santa grey,
y [D]paz, y [G]paz su [D]santa grey.`, "Joy to the World", "Spanish translation · anonymous", { ts: "2/4" }),

  es("Venid, Fieles Todos", "John F. Wade · tr. Juan Bautista Cabrera", 1875, "Christmas,Adoration", "G", 92, "Lucas 2:15", 376, `Verse 1
[G]Venid, fieles [D]todos, [G]a Belén mar[D]chemos,
go[Em]zosos, triun[A]fantes y [D]llenos de amor;
[G]y al Rey de los cielos [C]contemplar po[D]dremos:

Chorus
Ve[G]nid, adoremos,
ve[D]nid, adore[G]mos,
ve[C]nid, adore[G]mos [D]a [G]Cristo el Señor.`, "O Come, All Ye Faithful", "Spanish translation · tr. Juan Bautista Cabrera"),

  es("¡Oh, Qué Amigo Nos Es Cristo!", "Joseph Scriven · tr. Leandro Garza Mora", 1904, "Comfort,Trust", "F", 80, "Filipenses 4:6", 487, `Verse 1
[F]¡Oh, qué amigo nos [Bb]es [F]Cristo! Él lle[Bb]vó nuestro [C]do[F]lor,
y nos manda que lle[Bb]ve[F]mos [Dm]todo a [Bb]Dios en [C]ora[F]ción.
[C]¿Vive el hombre des[F]pro[Bb]visto de [F]paz, [Dm]gozo y [C]santo a[F]mor?
Esto es [C]porque no lle[F]va[Bb]mos [F]todo a [Dm]Dios [Bb]en o[C]ra[F]ción.`, "What a Friend We Have in Jesus", "Spanish translation · tr. Leandro Garza Mora, 1904"),

  es("Cariñoso Salvador", "Charles Wesley · tr. Vicente Mendoza", 1904, "Comfort,Trust", "F", 76, "Salmos 61:4", 198, `Verse 1
[F]Cariñoso Salva[Bb]dor, [F]huyo de la [C]tempestad
[F]a tu seno protec[Bb]tor, [F]fián[C]dome de [F]tu bondad.
[C]Sálvame, Señor Je[F]sús, [Bb]de las [F]olas del [C]turbión;
[F]hasta el puerto de sa[Bb]lud [F]guía [C]tú mi embarca[F]ción.`, "Jesus, Lover of My Soul", "Spanish translation · tr. Vicente Mendoza"),

  es("Roca de la Eternidad", "Augustus Toplady · tr. Thomas M. Westrup", 1875, "Grace,Trust", "Bb", 76, "Salmos 94:22", 267, `Verse 1
[Bb]Roca de la eterni[F]dad, [Eb]fuiste a[Bb]bierta [F]para [Bb]mí;
sé mi escondedero [F]fiel, [Eb]sólo en[Bb]cuentro [F]paz en [Bb]ti;
[F]rico, limpio manan[Bb]tial, [Eb]en el [Bb]cual la[F]vado [Bb]fui.`, "Rock of Ages", "Spanish translation · tr. Thomas M. Westrup", { ts: "6/4" }),

  es("Cuán Firme Cimiento", "John Rippon's Selection · tr. Vicente Mendoza", 1908, "Assurance,Trust", "G", 88, "Isaías 41:10", 254, `Verse 1
¡Cuán [G]firme ci[C]miento se ha [G]dado a la [D]fe
de [G]Dios en su e[C]terna pa[G]labra de a[D]mor!
¿Qué [G]más él pu[C]diera en su [G]libro aña[D]dir,
si [G]todo a sus [C]hijos lo [G]ha dicho el Se[D]ñor?`, "How Firm a Foundation", "Spanish translation · tr. Vicente Mendoza", { ts: "2/2" }),

  es("A Solas al Huerto", "C. Austin Miles · tr. Vicente Mendoza", 1917, "Comfort", "A", 66, "Juan 20:15-16", 187, `Verse 1
A [A]solas al huerto yo voy
cuando [D]duerme aún la flo[A]resta,
y en quie[E]tud y paz con Je[A]sús es[D]toy
o[A]yendo ab[E]sorto su [A]voz.

Chorus
Él con[A]migo está, puedo o[E]ír su voz,
y que [B]suyo, dice, se[E]ré;
y el en[A]canto que hallo en [D]él a[A]llí
con [A]nadie te[E]ner po[A]dré.`, "In the Garden", "Spanish translation · tr. Vicente Mendoza, 1917"),

  es("Firmes y Adelante", "Sabine Baring-Gould · tr. Juan Bautista Cabrera", 1878, "Mission,Trust", "D", 100, "2 Timoteo 2:3", 243, `Verse 1
[D]¡Firmes y ade[G]lante, [D]huestes de la [A]fe,
[D]sin temor al[G]guno, [A]que Jesús nos [D]ve!
Jefe sobe[G]rano, [D]Cristo al frente [A]va,
[D]y la regia en[G]seña [A]tremolando es[D]tá.`, "Onward, Christian Soldiers", "Spanish translation · tr. Juan Bautista Cabrera"),

  es("Estad por Cristo Firmes", "George Duffield · tr. Juan Bautista Cabrera", 1878, "Mission,Trust", "G", 96, "Efesios 6:14", 132, `Verse 1
[G]¡Estad por [C]Cristo [G]firmes, sol[Em]dados [A]de la [D]cruz!
[G]Alzad hoy la [C]ban[G]dera en [C]nombre [G]de [D]Je[G]sús.`, "Stand Up, Stand Up for Jesus", "Spanish translation · tr. Juan Bautista Cabrera"),

  es("Alcancé Salvación", "Horatio Spafford · tr. Pedro Grado", 1905, "Comfort,Assurance", "C", 66, "Salmos 46:1", 289, `Verse 1
De [C]paz inun[F]dada mi [C]senda ya es[G]té,
o [C]cúbrala un [F]mar de aflic[G]ción,
mi [C]suerte cual[F]quiera que [C]sea, di[G]ré:
Alcan[C]cé, alcan[F]cé salva[C]ción.

Chorus
Alcan[G]cé salva[C]ción,
alcan[F]cé, alcan[G]cé salva[C]ción.`, "It Is Well with My Soul", "Spanish translation · tr. Pedro Grado"),

  es("Cristo Me Ama", "Anna Warner · tr. anónimo", 1880, "Assurance,Trust", "C", 84, "1 Juan 4:19", 445, `Verse 1
[C]Cristo me ama, bien lo sé, [F]su Pa[C]labra me hace ver
[F]que los niños [C]son de aquel, [F]quien es [C]nuestro a[G]migo [C]fiel.

Chorus
Cristo [F]me ama, [C]Cristo [G]me ama,
[C]Cristo [F]me ama, la [C]Biblia [G]dice a[C]sí.`, "Jesus Loves Me", "Spanish translation · anonymous"),

  es("Dulce Oración", "William Walford · tr. anónimo", 1900, "Trust,Comfort", "D", 76, "Mateo 6:6", 176, `Verse 1
[D]¡Dulce oración, dulce ora[G]ci[D]ón,
de toda influencia [A]mundanal
e[D]levas tú mi cora[G]zón[D]
al tierno Padre [A]celes[D]tial!`, "Sweet Hour of Prayer", "Spanish translation · anonymous"),

  es("La Cruz Excelsa", "Isaac Watts · tr. anónimo", 1905, "Grace,Confession", "Eb", 72, "Gálatas 6:14", 154, `Verse 1
La [Eb]cruz ex[Ab]celsa al [Eb]contem[Bb]plar,
do [Eb]Cristo a[Ab]llí por [Bb]mí mu[Eb]rió,
[Bb]nada se [Eb]puede [Ab]compa[Eb]rar
a [Ab]las ri[Eb]quezas [Bb]de su a[Eb]mor.`, "When I Survey the Wondrous Cross", "Spanish translation · anonymous")
];
