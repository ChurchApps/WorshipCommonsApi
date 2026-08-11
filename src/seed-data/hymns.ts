// Public-domain hymn catalog for the demo seed. Words and music all published
// pre-1931 (US public domain) — later translations/settings deliberately excluded.

export interface HymnSeed {
  t: string;
  a: string;
  y: number;
  th: string;
  k: string;
  bpm: number;
  lang: string;
  scr: string;
  lic: string;
  cong: number;
  ts?: string;
  chordPro: string;
}

export const h = (t: string, a: string, y: number, th: string, k: string, bpm: number, scr: string, cong: number, chordPro: string, opts: Partial<HymnSeed> = {}): HymnSeed =>
  ({ t, a, y, th, k, bpm, lang: "English", scr, lic: "PD", cong, chordPro, ...opts });

export const HYMNS: HymnSeed[] = [
  // ---- Christmas & Advent ----
  h("Silent Night", "Joseph Mohr · tr. John F. Young", 1818, "Christmas,Comfort", "Bb", 60, "Luke 2:7", 1764, `Verse 1
[Bb]Silent night, holy night,
[F]all is calm, [Bb]all is bright
round yon [Eb]virgin [Bb]mother and child —
holy [Eb]infant so [Bb]tender and mild,
[F]sleep in heavenly [Bb]peace,
[Bb]sleep in [F]heavenly [Bb]peace.`, { ts: "3/4" }),
  h("Stille Nacht", "Joseph Mohr & Franz Gruber", 1818, "Christmas,Comfort", "Bb", 60, "Lukas 2:7", 388, `Verse 1
[Bb]Stille Nacht, heilige Nacht,
[F]alles schläft, [Bb]einsam wacht
nur das [Eb]traute hoch[Bb]heilige Paar,
holder [Eb]Knabe im [Bb]lockigen Haar,
[F]schlaf in himmlischer [Bb]Ruh,
[Bb]schlaf in [F]himmlischer [Bb]Ruh.`, { ts: "3/4", lang: "German" }),
  h("Joy to the World", "Isaac Watts & Lowell Mason", 1719, "Christmas,Praise", "D", 100, "Psalm 98:4", 1688, `Verse 1
[D]Joy to the world! the [G]Lord is [D]come:
let earth re[A]ceive her [D]King;
let every [D]heart prepare him room,
and heaven and nature sing,
and [A]heaven and nature sing,
and [D]heaven, and [G]heaven and [D]nature sing.`, { ts: "2/4" }),
  h("Hark! The Herald Angels Sing", "Charles Wesley & Felix Mendelssohn", 1739, "Christmas,Praise", "F", 96, "Luke 2:14", 1471, `Verse 1
[F]Hark! the herald [C]angels [F]sing,
"Glory [Bb]to the [C]newborn [F]King;
peace on earth and [C]mercy mild,
[G]God and sinners [C]reconciled!"
[F]Joyful, all ye [Bb]nations rise,
[F]join the triumph [Bb]of the skies;
with the an[Bb]gelic [G]host proclaim,
"[C]Christ is [F]born in [C]Bethle[F]hem!"`),
  h("O Come, All Ye Faithful", "John F. Wade · tr. Frederick Oakeley", 1841, "Christmas,Adoration", "G", 92, "Luke 2:15", 1502, `Verse 1
[G]O come, all ye [D]faithful, [G]joyful and tri[D]umphant,
o [Em]come ye, o [A]come ye to [D]Bethlehem;
[G]come and behold him, [C]born the King of [D]angels:

Chorus
O [G]come, let us adore him,
o [D]come, let us a[G]dore him,
o [C]come, let us a[G]dore [D]him,
[G]Christ [C]the [G]Lord.`),
  h("Adeste Fideles", "John F. Wade", 1751, "Christmas,Adoration", "G", 92, "Lucas 2:15", 342, `Verse 1
[G]Adeste fi[D]deles, [G]laeti trium[D]phantes,
ve[Em]nite, ve[A]nite in [D]Bethlehem;
[G]natum videte [C]regem ange[D]lorum:

Chorus
Ve[G]nite adoremus,
ve[D]nite adore[G]mus,
ve[C]nite adore[G]mus [D]Do[G]minum.`, { lang: "Latin" }),
  h("O Little Town of Bethlehem", "Phillips Brooks & Lewis Redner", 1868, "Christmas,Hope", "F", 84, "Micah 5:2", 1093, `Verse 1
[F]O little town of [Bb]Bethle[F]hem, how [Dm]still we [C]see thee [F]lie!
Above thy deep and [Bb]dreamless [F]sleep the [Dm]silent [C]stars go [F]by;
yet in thy dark streets [A]shineth the [Dm]everlasting [C]Light —
the [F]hopes and fears of [Bb]all the [F]years are [Dm]met in [C]thee to[F]night.`),
  h("Away in a Manger", "Anonymous & James R. Murray", 1885, "Christmas,Comfort", "F", 76, "Luke 2:7", 1178, `Verse 1
A[F]way in a manger, no [Bb]crib for a bed,
the [C]little Lord [F]Jesus laid [C]down his sweet [F]head;
the stars in the sky looked [Bb]down where he lay,
the [C]little Lord [F]Jesus, a[C]sleep on the [F]hay.`, { ts: "3/4" }),
  h("The First Noel", "Traditional English carol", 1833, "Christmas", "D", 88, "Luke 2:8-10", 1024, `Verse 1
The [D]first No[A]el the [Bm]angel did [A]say
was to [D]certain poor [G]shepherds in [A]fields as they [D]lay —
in [D]fields where [A]they lay [Bm]keeping their [A]sheep
on a [D]cold winter's [G]night that [A]was so [D]deep.

Chorus
No[D]el, No[A]el, No[Bm]el, No[G]el —
[D]born is the [G]King of [A]Isra[D]el.`, { ts: "3/4" }),
  h("Angels We Have Heard on High", "Traditional French carol · tr. James Chadwick", 1862, "Christmas,Praise", "F", 96, "Luke 2:13-14", 1112, `Verse 1
[F]Angels we have [C]heard on [F]high,
sweetly [Bb]singing [C]o'er the [F]plains,
and the mountains [C]in re[F]ply,
echo[Bb]ing their [C]joyous [F]strains.

Chorus
[F]Glo[Dm]ri[Bb]a [C]in ex[F]cel[Bb]sis [C]De[F]o,
[F]glo[Dm]ri[Bb]a [C]in ex[F]cel[Bb]sis [C]De[F]o.`),
  h("It Came Upon the Midnight Clear", "Edmund Sears & Richard Willis", 1849, "Christmas,Hope", "Eb", 80, "Luke 2:14", 703, `Verse 1
It [Eb]came upon the [Ab]midnight clear, that [C]glorious song of [Bb]old,
from [Eb]angels bending [Ab]near the earth to [Bb]touch their harps of [Eb]gold:
"Peace on the earth, good [Ab]will to men, from [C]heaven's all-gracious [Bb]King" —
the [Eb]world in solemn [Ab]stillness lay to [Bb]hear the angels [Eb]sing.`, { ts: "6/8" }),
  h("What Child Is This", "William C. Dix · Greensleeves", 1865, "Christmas,Adoration", "Em", 84, "Matthew 2:11", 934, `Verse 1
[Em]What child is this, who, [D]laid to rest,
on [C]Mary's lap is [B]sleeping?
[Em]Whom angels greet with [D]anthems sweet,
while [C]shepherds [B]watch are [Em]keeping?

Chorus
[G]This, this is [D]Christ the King,
whom [C]shepherds guard and [B]angels sing:
[G]haste, haste to [D]bring him laud,
the [C]babe, the [B]son of [Em]Mary.`, { ts: "3/4" }),
  h("God Rest You Merry, Gentlemen", "Traditional English carol", 1760, "Christmas,Hope", "Em", 96, "Luke 2:10-11", 651, `Verse 1
God [Em]rest you merry, gentlemen, let [C]nothing you dis[B]may,
re[Em]member Christ our Savior was [C]born on Christmas [B]Day
to [G]save us all from [Em]Satan's power when [Am]we were gone a[B]stray:

Chorus
O [G]tidings of [B]comfort and [Em]joy, comfort and [D]joy,
o [G]tidings of [B]comfort and [Em]joy.`),
  h("We Three Kings", "John Henry Hopkins Jr.", 1857, "Christmas", "Em", 80, "Matthew 2:1-2", 587, `Verse 1
[Em]We three kings of [B]Orient [Em]are,
bearing gifts we tra[B]verse a[Em]far —
field and [G]fountain, [Am]moor and [Em]mountain,
[Am]following [B]yonder [Em]star.

Chorus
[G]O star of wonder, [C]star of night,
[G]star with royal [C]beauty bright,
[Em]westward [D]leading, [C]still pro[B]ceeding,
[G]guide us to thy [C]perfect [G]light.`),
  h("O Come, O Come, Emmanuel", "Latin antiphons · tr. John Mason Neale", 1851, "Advent,Hope", "Em", 76, "Isaiah 7:14", 1145, `Verse 1
O [Em]come, o come, Em[D]manu[Em]el,
and [Am]ransom [Em]captive [D]Isra[Em]el
that [Em]mourns in lonely [D]exile [G]here
un[Am]til the [Em]Son of [D]God ap[Em]pear.

Chorus
Re[G]joice! Re[D]joice! Em[Em]manu[D]el
shall [Em]come to thee, O [D]Isra[Em]el.`),
  h("Come, Thou Long-Expected Jesus", "Charles Wesley", 1744, "Advent,Hope", "F", 84, "Haggai 2:7", 812, `Verse 1
[F]Come, thou long-ex[Bb]pected [F]Jesus,
[Dm]born to [Bb]set thy [C]people [F]free;
from our fears and [Bb]sins re[F]lease us,
[Dm]let us [Bb]find our [C]rest in [F]thee.
[Bb]Israel's [F]strength and [C]conso[F]lation,
[Bb]hope of [F]all the [C]earth thou [F]art —
dear de[Bb]sire of [F]every [C]nation,
[Dm]joy of [Bb]every [C]longing [F]heart.`, { ts: "2/4" }),
  h("Lo, How a Rose E'er Blooming", "German carol · tr. Theodore Baker", 1894, "Christmas,Hope", "F", 69, "Isaiah 11:1", 421, `Verse 1
[F]Lo, how a rose e'er [C]blooming from [Bb]tender [C]stem hath [F]sprung,
of Jesse's lineage [C]coming as [Bb]men of [C]old have [F]sung.
It [Dm]came, a floweret [C]bright,
a[F]mid the cold of [C]winter, when [Bb]half spent [C]was the [F]night.`),
  h("O Holy Night", "Adolphe Adam · tr. John S. Dwight", 1847, "Christmas,Adoration", "C", 60, "Luke 2:11", 1339, `Verse 1
[C]O holy night, the [F]stars are brightly [C]shining —
it is the night of the [G]dear Savior's [C]birth.
Long lay the world in [F]sin and error [C]pining,
till [Em]he appeared and the [B]soul felt its [Em]worth.
A [G]thrill of hope, the [C]weary world rejoices,
for [G]yonder breaks a [C]new and glorious morn.
[Am]Fall on your [Em]knees, o [F]hear the angel [C]voices!
O [C]night di[G]vine, o [C]night [F]when Christ was [C]born —
o [G]night di[C]vine, o [F]night, [G]o night di[C]vine!`),
  h("Go, Tell It on the Mountain", "African American spiritual", 1865, "Christmas,Mission", "F", 92, "Luke 2:17", 968, `Chorus
[F]Go, tell it on the [Bb]moun[F]tain,
over the hills and [C]every[F]where;
go, tell it on the [Bb]moun[F]tain
that [F]Jesus [C]Christ is [F]born.

Verse 1
While [F]shepherds kept their [Bb]watching o'er [F]silent flocks by [C]night,
be[F]hold, throughout the [Bb]heavens there [F]shone a [C]holy [F]light.`),

  // ---- Easter, cross & atonement ----
  h("Christ the Lord Is Risen Today", "Charles Wesley", 1739, "Easter,Praise", "C", 92, "1 Corinthians 15:20", 1436, `Verse 1
[C]Christ the Lord is [G]risen to[C]day, [F]Alle[C]lu[G]ia!
[C]Sons of men and [G]angels [C]say, [F]Alle[C]lu[G]ia!
[C]Raise your joys and [F]triumphs [C]high, [G]Alle[C]lu[G]ia!
[C]Sing, ye heavens, and [F]earth re[C]ply, [F]Alle[C]lu[G]ia!`),
  h("Low in the Grave He Lay", "Robert Lowry", 1874, "Easter,Praise", "Bb", 66, "Matthew 28:6", 897, `Verse 1
[Bb]Low in the grave he [F]lay, [Bb]Jesus my [F]Savior,
[Bb]waiting the coming [F]day, [Bb]Jesus my [F]Lord!

Chorus
[Bb]Up from the grave he arose,
with a [Eb]mighty triumph o'er his [Bb]foes;
he arose a victor from the [Eb]dark domain,
and he [Bb]lives forever with his [F]saints to reign.
He a[Bb]rose! He a[Eb]rose! Halle[F]lujah! Christ a[Bb]rose!`),
  h("Thine Be the Glory", "Edmond Budry · tr. Richard Hoyle", 1923, "Easter,Praise", "D", 96, "Matthew 28:5-6", 764, `Verse 1
[D]Thine be the glory, [G]risen, conquering [D]Son;
[D]endless is the victory [A]thou o'er death hast [D]won.
[D]Angels in bright raiment [G]rolled the stone a[D]way,
[D]kept the folded grave-clothes [A]where thy body [D]lay.

Chorus
[D]Thine be the glory, [G]risen, conquering [D]Son;
[D]endless is the vic[A]tory thou o'er [D]death hast won.`),
  h("Were You There", "African American spiritual", 1899, "Easter,Lament", "Eb", 63, "Luke 23:33", 812, `Verse 1
[Eb]Were you there when they [Ab]crucified my [Eb]Lord?
Were you there when they [Bb]crucified my Lord?
[Eb]Oh, [Ab]sometimes it causes me to [Eb]tremble, [Cm]tremble, [Bb]tremble —
[Eb]were you there when they [Ab]cruci[Bb]fied my [Eb]Lord?`),
  h("Crown Him with Many Crowns", "Matthew Bridges & George Elvey", 1851, "Easter,Adoration", "D", 92, "Revelation 19:12", 1187, `Verse 1
[D]Crown him with many [G]crowns, the [D]Lamb upon his [A]throne:
[D]hark how the heavenly [Em]anthem drowns all [A]music but its [D]own!
A[A]wake, my soul, and [D]sing of [G]him who [D]died for [A]thee,
and [D]hail him as thy [G]matchless King through [D]all e[A]terni[D]ty.`),
  h("All Hail the Power of Jesus' Name", "Edward Perronet", 1779, "Adoration,Praise", "G", 88, "Philippians 2:9-10", 1258, `Verse 1
[G]All hail the power of [D]Jesus' [G]name! Let [C]angels [D]prostrate [G]fall;
[G]bring forth the royal [C]dia[D]dem, and [G]crown [C]him [D]Lord of [G]all —
bring [Em]forth the [C]royal [G]dia[Em]dem, and [G]crown [C]him, [D]crown him,
[G]crown [C]him [D]Lord of [G]all.`),
  h("When I Survey the Wondrous Cross", "Isaac Watts", 1707, "Grace,Confession", "Eb", 72, "Galatians 6:14", 1201, `Verse 1
When [Eb]I sur[Ab]vey the [Eb]wondrous [Bb]cross
on [Eb]which the [Ab]Prince of [Bb]glory [Eb]died,
my [Bb]richest [Eb]gain I [Ab]count but [Eb]loss,
and [Ab]pour con[Eb]tempt on [Bb]all my [Eb]pride.`),
  h("O Sacred Head, Now Wounded", "Paul Gerhardt · tr. James W. Alexander", 1830, "Easter,Lament", "C", 66, "Isaiah 53:5", 654, `Verse 1
O [C]sacred head, now [G]wounded, with [Am]grief and shame weighed [G]down,
now [C]scornfully sur[F]rounded with [G]thorns, thine only [C]crown:
o sacred head, what [G]glory, what [Am]bliss till now was [G]thine!
Yet, [C]though despised and [F]gory, I [G]joy to call thee [C]mine.`),
  h("Alas! and Did My Savior Bleed", "Isaac Watts", 1707, "Grace,Lament", "E", 76, "Romans 5:8", 421, `Verse 1
A[E]las! and did my [A]Savior [E]bleed, and did my Sovereign [B]die?
Would [E]he devote that [A]sacred [E]head for [A]sinners [B]such as [E]I?`),
  h("Nothing but the Blood", "Robert Lowry", 1876, "Grace,Assurance", "G", 84, "Hebrews 9:22", 1176, `Verse 1
[G]What can wash away my sin? [D]Nothing but the blood of [G]Jesus.
What can make me whole again? [D]Nothing but the blood of [G]Jesus.

Chorus
[G]Oh, precious is the flow
[C]that makes me [G]white as snow;
no other fount I know —
[D]nothing but the blood of [G]Jesus.`),
  h("There Is a Fountain", "William Cowper", 1772, "Grace,Assurance", "C", 80, "Zechariah 13:1", 743, `Verse 1
There [C]is a fountain [F]filled with [C]blood drawn from Im[F]manuel's [G]veins,
and [C]sinners plunged be[F]neath that [C]flood lose [F]all their [G]guilty [C]stains:
lose [Am]all their guilty [G]stains, lose [C]all their guilty [G]stains —
and [C]sinners plunged be[F]neath that [C]flood lose [F]all their [G]guilty [C]stains.`),
  h("The Old Rugged Cross", "George Bennard", 1913, "Grace,Comfort", "Bb", 69, "Galatians 6:14", 1524, `Verse 1
On a [Bb]hill far away stood an [Eb]old rugged cross,
the emblem of [F]suffering and [Bb]shame;
and I love that old cross where the [Eb]dearest and best
for a world of lost [F]sinners was [Bb]slain.

Chorus
So I'll [F]cherish the old rugged [Bb]cross,
till my [Eb]trophies at last I lay [Bb]down;
I will cling to the old rugged [Eb]cross,
and ex[Bb]change it some [F]day for a [Bb]crown.`, { ts: "6/4" }),
  h("At Calvary", "William Newell & Daniel Towner", 1895, "Grace,Confession", "C", 88, "Romans 5:8", 587, `Verse 1
[C]Years I spent in vanity and pride,
[F]caring not my Lord was [C]crucified,
knowing not it was for [F]me he died
on [C]Cal[G]va[C]ry.

Chorus
[C]Mercy there was great, and grace was free;
[F]pardon there was multiplied to [C]me;
there my burdened soul found [F]liberty —
at [C]Cal[G]va[C]ry.`),
  h("There Is Power in the Blood", "Lewis E. Jones", 1899, "Grace,Praise", "A", 100, "Revelation 12:11", 692, `Verse 1
Would you [A]be free from the [D]burden of [A]sin?
There's power in the blood, [E]power in the blood;
would you [A]o'er evil a [D]victory [A]win?
There's wonderful [E]power in the [A]blood.

Chorus
There is [A]power, [D]power, wonder-working power
in the [A]blood of the [E]Lamb;
there is [A]power, [D]power, wonder-working power
in the [A]precious [E]blood of the [A]Lamb.`),
  h("Are You Washed in the Blood?", "Elisha Hoffman", 1878, "Grace,Confession", "A", 104, "Revelation 7:14", 456, `Verse 1
Have you [A]been to Jesus for the [D]cleansing power,
are you [A]washed in the blood of the [E]Lamb?
Are you [A]fully trusting in his [D]grace this hour,
are you [A]washed in the [E]blood of the [A]Lamb?

Chorus
Are you [A]washed in the [D]blood,
in the soul-cleansing [A]blood of the [E]Lamb?
Are your [A]garments spotless, are they [D]white as snow,
are you [A]washed in the [E]blood of the [A]Lamb?`),
  h("Jesus Paid It All", "Elvina Hall & John Grape", 1865, "Grace,Assurance", "Bb", 72, "Isaiah 1:18", 1108, `Verse 1
[Bb]I hear the Savior [Eb]say, "Thy [Bb]strength indeed is [F]small;
[Bb]child of weakness, [Eb]watch and pray, [Bb]find in [F]me thine [Bb]all in all."

Chorus
[Bb]Jesus [Eb]paid it [Bb]all, all [F]to him I [Bb]owe;
[Bb]sin had left a [Eb]crimson stain — he [Bb]washed it [F]white as [Bb]snow.`),

  // ---- Praise & adoration ----
  h("Praise to the Lord, the Almighty", "Joachim Neander · tr. Catherine Winkworth", 1863, "Praise,Trust", "G", 100, "Psalm 103:1", 1345, `Verse 1
[G]Praise to the Lord, the Al[Em]mighty, the [C]King of cre[D]ation!
[G]O my soul, praise him, for [Em]he is thy [C]health and sal[D]vation!
[G]All ye who hear, now to his [C]temple draw [G]near,
[C]join me in [G]glad ado[D]ra[G]tion!`, { ts: "3/4" }),
  h("Immortal, Invisible, God Only Wise", "Walter Chalmers Smith", 1867, "Adoration,Praise", "G", 108, "1 Timothy 1:17", 876, `Verse 1
Im[G]mortal, in[C]visible, [G]God only [D]wise,
in [G]light inac[C]cessible [G]hid [D]from our [G]eyes,
most blessed, most [C]glorious, the [G]Ancient of [D]Days,
al[G]mighty, vic[C]torious, thy [G]great [D]name we [G]praise.`, { ts: "3/4" }),
  h("Come, Thou Almighty King", "Anonymous & Felice de Giardini", 1757, "Adoration,Praise", "F", 92, "Psalm 95:6", 743, `Verse 1
[F]Come, thou almighty [C]King, [F]help us thy [Bb]name to [C]sing,
[F]help us to [C]praise:
[F]Father, all-glorious, [C]o'er all vic[F]torious,
[Bb]come and reign [F]over us, [C]Ancient of [F]Days.`, { ts: "3/4" }),
  h("O Worship the King", "Robert Grant", 1833, "Praise,Creation", "G", 96, "Psalm 104:1", 934, `Verse 1
O [G]worship the [D]King all [Em]glorious a[D]bove,
o [G]gratefully [C]sing his [D]power and his [G]love:
our shield and de[D]fender, the [Em]Ancient of [D]Days,
pa[G]vilioned in [C]splendor and [D]girded with [G]praise.`),
  h("Praise, My Soul, the King of Heaven", "Henry Lyte & John Goss", 1834, "Praise,Grace", "D", 92, "Psalm 103:1", 812, `Verse 1
[D]Praise, my soul, the [G]King of [D]heaven, [G]to his feet thy [A]tribute bring;
[D]ransomed, healed, re[G]stored, for[D]given, [Em]evermore his [A]praises [D]sing.
[A]Alleluia! [D]Alleluia! [G]Praise the ever[A]lasting [D]King.`, { ts: "2/4" }),
  h("O For a Thousand Tongues to Sing", "Charles Wesley", 1739, "Praise,Grace", "G", 96, "Psalm 35:28", 1123, `Verse 1
O [G]for a thousand [D]tongues to [G]sing my [C]great Re[G]deemer's [D]praise,
the [G]glories of my [C]God and [G]King, the [C]triumphs [G]of [D]his [G]grace!`, { ts: "3/2" }),
  h("Love Divine, All Loves Excelling", "Charles Wesley", 1747, "Adoration,Grace", "Bb", 84, "1 John 4:16", 987, `Verse 1
[Bb]Love divine, all [F]loves ex[Bb]celling, [Eb]joy of heaven, to [Bb]earth come [F]down,
[Bb]fix in us thy [F]humble [Bb]dwelling, [Eb]all thy faithful [Bb]mer[F]cies [Bb]crown.
[F]Jesus, thou art [Bb]all compassion, [F]pure, unbounded [Bb]love thou art;
[Bb]visit us with [F]thy sal[Bb]vation, [Eb]enter every [Bb]trem[F]bling [Bb]heart.`),
  h("And Can It Be", "Charles Wesley", 1738, "Grace,Assurance", "G", 100, "Romans 5:8", 1067, `Verse 1
[G]And can it be that [C]I should [G]gain an [Am]interest [D]in the [G]Savior's blood?
[G]Died he for me, who [C]caused his [G]pain? For [Am]me, who [D]him to [G]death pursued?
A[D]mazing love! How [G]can it be that [C]thou, my [G]God, shouldst [D]die for [G]me?

Chorus
A[D]mazing love! How [G]can it [C]be
that [G]thou, my [D]God, shouldst [G]die for me?`, { ts: "3/4" }),
  h("Fairest Lord Jesus", "German hymn · tr. anonymous", 1873, "Adoration", "Eb", 76, "Psalm 45:2", 765, `Verse 1
[Eb]Fairest Lord [Ab]Je[Bb]sus, [Cm]ruler of [G]all [Ab]nature,
[Bb]O thou of [Eb]God and [Bb]man the [Eb]Son:
[Bb]thee will I [Eb]cherish, [Bb]thee will I [Eb]honor,
[Ab]thou, my soul's [Eb]glory, [Bb]joy, and [Eb]crown.`),
  h("For the Beauty of the Earth", "Folliott Pierpoint", 1864, "Creation,Praise", "F", 92, "James 1:17", 856, `Verse 1
[F]For the beauty [C]of the earth, [F]for the glory [C]of the skies,
[F]for the love which [Bb]from our birth [F]over and a[C]round us lies:

Chorus
[F]Lord of all, to [Bb]thee we raise
[F]this our hymn of [C]grateful [F]praise.`),
  h("This Is My Father's World", "Maltbie Babcock", 1901, "Creation,Trust", "Eb", 88, "Psalm 24:1", 923, `Verse 1
[Eb]This is my Father's [Bb]world, and [Eb]to my listening [Bb]ears
all [Eb]nature [Ab]sings, and [Eb]round me [Bb]rings the [Eb]music [Bb]of the [Eb]spheres.
This is my Father's [Bb]world — I [Eb]rest me in the [Bb]thought
of [Eb]rocks and [Ab]trees, of [Eb]skies and [Bb]seas; his [Eb]hand the [Bb]wonders [Eb]wrought.`),
  h("All Things Bright and Beautiful", "Cecil Frances Alexander", 1848, "Creation,Praise", "G", 96, "Genesis 1:31", 634, `Chorus
[G]All things bright and [C]beauti[G]ful, [C]all creatures [G]great and [D]small,
[G]all things wise and [C]wonder[G]ful, the [C]Lord God [D]made them [G]all.

Verse 1
Each [G]little flower that [D]opens, each [G]little bird that [D]sings —
he [G]made their glowing [C]colors, [G]he made their [D]tiny [G]wings.`),
  h("Come, Christians, Join to Sing", "Christian Bateman", 1843, "Praise", "G", 104, "Psalm 95:1", 578, `Verse 1
[G]Come, Christians, [C]join to [G]sing: alle[C]luia! [D]A[G]men!
Loud praise to [C]Christ our [G]King: alle[C]luia! [D]A[G]men!
[D]Let all, with [G]heart and voice, be[D]fore his [G]throne rejoice;
[C]praise is his [G]gracious choice: alle[C]luia! [D]A[G]men!`),
  h("Rejoice, the Lord Is King", "Charles Wesley", 1744, "Praise,Hope", "D", 100, "Philippians 4:4", 645, `Verse 1
Re[D]joice, the Lord is [G]King! Your [D]Lord and King a[A]dore;
[D]mortals, give thanks and [G]sing, and [D]triumph ever[A]more:

Chorus
[D]Lift up your [G]heart, lift [D]up your [A]voice;
re[D]joice, a[G]gain I [A]say, re[D]joice!`),
  h("A Mighty Fortress Is Our God", "Martin Luther · tr. Frederick Hedge", 1852, "Trust,Assurance", "C", 92, "Psalm 46:1", 1378, `Verse 1
A [C]mighty fortress [G]is our [C]God, a [F]bulwark [C]never [G]fail[C]ing;
our helper he a[G]mid the [C]flood of [F]mortal [C]ills pre[G]vail[C]ing.
For [G]still our ancient [Am]foe doth [Em]seek to [F]work us [G]woe —
his [C]craft and power are [Am]great, and, [F]armed with cruel [C]hate,
on [F]earth is [C]not his [G]e[C]qual.`),
  h("To God Be the Glory", "Fanny Crosby & William Doane", 1875, "Praise,Grace", "G", 92, "John 3:16", 1289, `Verse 1
To [G]God be the glory, great [C]things he hath [G]done:
so loved he the world that he [D]gave us his Son,
who [G]yielded his life an a[C]tonement for [G]sin
and opened the life-gate that [D]all may go [G]in.

Chorus
[G]Praise the Lord, praise the Lord, let the [C]earth hear his [G]voice!
Praise the Lord, praise the Lord, let the [A]people re[D]joice!
O come to the [G]Father through [C]Jesus the [G]Son,
and give him the glory — great [D]things he hath [G]done!`, { ts: "3/4" }),
  h("Joyful, Joyful, We Adore Thee", "Henry van Dyke & Ludwig van Beethoven", 1907, "Praise,Creation", "G", 100, "Psalm 71:23", 1245, `Verse 1
[G]Joyful, joyful, [D]we adore thee, [G]God of glory, [D]Lord of [G]love;
hearts unfold like [D]flowers before thee, [G]opening to the [D]sun a[G]bove.
[D]Melt the clouds of [G]sin and [D]sadness, [G]drive the [D]dark of [A]doubt a[D]way;
[G]giver of im[D]mortal gladness, [G]fill us with the [D]light of [G]day.`),
  h("Holy God, We Praise Thy Name", "Ignaz Franz · tr. Clarence Walworth", 1858, "Adoration,Praise", "F", 88, "Revelation 4:8", 512, `Verse 1
[F]Holy God, we [Bb]praise thy [C]name; [F]Lord of [Bb]all, we [C]bow be[F]fore thee!
All on earth thy [Bb]scepter [C]claim, [F]all in [Bb]heaven a[C]bove a[F]dore thee;
[C]infinite thy [F]vast do[C]main, [F]ever[Bb]last[C]ing [F]is thy reign.`, { ts: "3/4" }),
  h("When Morning Gilds the Skies", "German hymn · tr. Edward Caswall", 1854, "Praise", "D", 88, "Psalm 5:3", 428, `Verse 1
When [D]morning gilds the [A]skies, my [D]heart a[G]waking [A]cries:
may [D]Jesus [A]Christ be [D]praised!
Alike at work and [A]prayer to [D]Jesus [G]I re[A]pair:
may [D]Jesus [A]Christ be [D]praised!`),
  h("My Faith Looks Up to Thee", "Ray Palmer & Lowell Mason", 1830, "Trust,Confession", "D", 72, "Hebrews 12:2", 534, `Verse 1
[D]My faith looks [G]up to [D]thee, thou [G]Lamb of [D]Calva[A]ry, [D]Savior di[A]vine:
[D]now hear me [G]while I [D]pray, [G]take all my [D]guilt a[A]way,
[D]O let me [A]from this [Bm]day [G]be [D]wholly [A]thine.`),

  // ---- Comfort, trust & assurance ----
  h("Abide with Me", "Henry Lyte & William Monk", 1847, "Comfort,Trust", "Eb", 66, "Luke 24:29", 987, `Verse 1
A[Eb]bide with [Bb]me: fast [Cm]falls the [Ab]even[Eb]tide;
the [Eb]darkness [Ab]deepens — [Eb]Lord, with [Bb]me a[Eb]bide.
When other helpers [Cm]fail and [Ab]comforts [Bb]flee,
[Eb]help of the [Ab]helpless, [Eb]O a[Bb]bide with [Eb]me.`),
  h("Be Still, My Soul", "Katharina von Schlegel · tr. Jane Borthwick", 1855, "Comfort,Trust", "F", 63, "Psalm 46:10", 1054, `Verse 1
Be [F]still, my soul: the [C]Lord is on thy [Dm]side;
[Bb]bear patiently the [C]cross of grief or [F]pain.
Leave to thy God to [C]order and pro[Dm]vide —
[Bb]in every change he [C]faithful will re[F]main.
Be [C]still, my soul: thy [F]best, thy heavenly [Bb]Friend
through [F]thorny [C]ways leads [Dm]to a [C]joyful [F]end.`),
  h("What a Friend We Have in Jesus", "Joseph Scriven & Charles Converse", 1855, "Comfort,Trust", "F", 80, "Philippians 4:6", 1467, `Verse 1
[F]What a friend we [Bb]have in [F]Jesus, all our [Bb]sins and [C]griefs to [F]bear!
What a privilege to [Bb]car[F]ry [Dm]every[Bb]thing to [C]God in [F]prayer!
[C]O what peace we [F]often [Bb]forfeit, [F]o what [Dm]needless [C]pain we [F]bear —
all be[C]cause we [F]do not [Bb]car[F]ry [Dm]every[Bb]thing to [C]God in [F]prayer.`),
  h("Leaning on the Everlasting Arms", "Elisha Hoffman & Anthony Showalter", 1887, "Trust,Assurance", "G", 88, "Deuteronomy 33:27", 1034, `Verse 1
[G]What a fellowship, what a [C]joy di[G]vine,
leaning on the ever[D]lasting arms;
[G]what a blessedness, what a [C]peace is [G]mine,
[D]leaning on the ever[G]lasting arms.

Chorus
[G]Lean[B]ing, [C]lean[G]ing, safe and secure from [D]all alarms;
[G]lean[B]ing, [C]lean[G]ing, [D]leaning on the ever[G]lasting arms.`),
  h("Rock of Ages", "Augustus Toplady & Thomas Hastings", 1776, "Grace,Trust", "Bb", 76, "Psalm 94:22", 1156, `Verse 1
[Bb]Rock of Ages, [F]cleft for [Bb]me, [Eb]let me [Bb]hide my[F]self in [Bb]thee;
let the water [F]and the [Bb]blood, [Eb]from thy [Bb]wounded [F]side which [Bb]flowed,
[F]be of sin the [Bb]double cure: [Eb]save from [Bb]wrath and [F]make me [Bb]pure.`, { ts: "6/4" }),
  h("Nearer, My God, to Thee", "Sarah Adams & Lowell Mason", 1841, "Trust,Comfort", "G", 76, "Genesis 28:12", 876, `Verse 1
[G]Nearer, my [D]God, to [G]thee, [C]nearer to [D]thee!
[G]E'en though it [D]be a [Em]cross that [C]raiseth [D]me,
[G]still all my [D]song shall [G]be: nearer, my [C]God, to thee —
[G]nearer, my [C]God, to [D]thee, [G]nearer to [D]thee!`, { ts: "6/4" }),
  h("Just as I Am", "Charlotte Elliott & William Bradbury", 1835, "Grace,Confession", "Eb", 69, "John 6:37", 1187, `Verse 1
[Eb]Just as I [Ab]am, with[Eb]out one [Bb]plea
but [Eb]that thy [Ab]blood was [Bb]shed for me,
and [Eb]that thou [Bb]bidst me [Ab]come to [Eb]thee,
O [Ab]Lamb of [Bb]God, I [Ab]come, I [Eb]come.`),
  h("Softly and Tenderly", "Will Thompson", 1880, "Grace,Comfort", "G", 69, "Matthew 11:28", 823, `Verse 1
[G]Softly and tenderly [C]Jesus is [G]calling, calling for [D]you and for me;
[G]see, on the portals he's [C]waiting and [G]watching, [D]watching for [G]you and for me.

Chorus
[G]Come home, [C]come [G]home — ye who are [A]weary, come [D]home;
[G]earnestly, tenderly, [C]Jesus is [G]calling, calling, O [D]sinner, come [G]home!`),
  h("I Need Thee Every Hour", "Annie Hawks & Robert Lowry", 1872, "Trust,Confession", "G", 76, "John 15:5", 745, `Verse 1
[G]I need thee every [C]hour, most [G]gracious [D]Lord;
[G]no tender voice like [C]thine can [G]peace [D]af[G]ford.

Chorus
I [G]need thee, O I [C]need thee — [G]every hour I [D]need thee!
O [G]bless me [C]now, my [G]Savior: [D]I come to [G]thee!`, { ts: "3/4" }),
  h("Sweet Hour of Prayer", "William Walford & William Bradbury", 1845, "Trust,Comfort", "D", 76, "Matthew 6:6", 687, `Verse 1
[D]Sweet hour of prayer, sweet [G]hour of [D]prayer,
that calls me from a [A]world of care
and [D]bids me at my [G]Father's [D]throne
make all my wants and [A]wishes [D]known:
in seasons of dis[G]tress and [D]grief
my [Bm]soul has often [A]found relief,
and [D]oft escaped the [G]tempter's [D]snare
by thy return, sweet [A]hour of [D]prayer.`),
  h("He Leadeth Me", "Joseph Gilmore & William Bradbury", 1862, "Trust,Provision", "D", 84, "Psalm 23:2", 812, `Verse 1
He [D]leadeth me! O [G]blessed [D]thought, O words with heavenly [A]comfort fraught;
what[D]e'er I do, wher[G]e'er I [D]be, still 'tis God's [A]hand that [D]leadeth me.

Chorus
He [D]leadeth me, he [A]leadeth me, by [D]his own hand he [A]leadeth me;
his [D]faithful follower [G]I would [D]be, for by his [A]hand he [D]leadeth me.`),
  h("Great Is Thy Faithfulness", "Thomas Chisholm & William Runyan", 1923, "Trust,Provision", "Eb", 72, "Lamentations 3:22-23", 1698, `Verse 1
[Eb]Great is thy [Ab]faithfulness, [Eb]O God my [Bb]Father —
[Eb]there is no [F]shadow of [Bb]turning with thee;
[Eb]thou changest [Ab]not, thy com[Eb]passions, they [Cm]fail not:
as [F]thou hast been thou for[Bb]ever wilt be.

Chorus
[Bb]Great is thy [Eb]faithfulness! [Bb]Great is thy [Eb]faithfulness!
[Ab]Morning by [Bb]morning new [Eb]mercies I [Cm]see;
[F]all I have needed thy [Bb]hand hath provided —
[Eb]great is thy [Ab]faithfulness, [Bb]Lord, unto [Eb]me!`),
  h("Turn Your Eyes upon Jesus", "Helen Lemmel", 1922, "Comfort,Hope", "F", 72, "Hebrews 12:2", 1345, `Chorus
Turn your [F]eyes upon [A]Jesus,
[Bb]look full in his [F]wonderful [G]face,
and the [C]things of earth will grow [F]strangely [Am]dim
in the [Bb]light of [C]his glory and [F]grace.

Verse 1
O [F]soul, are you weary and [C]troubled?
No [G]light in the darkness you [C]see?
There's [F]light for a look at the [C]Savior,
and [G]life more abundant and [C]free.`),
  h("In the Garden", "C. Austin Miles", 1912, "Comfort", "A", 66, "John 20:15-16", 934, `Verse 1
I [A]come to the garden alone,
while the [D]dew is still on the [A]roses,
and the [E]voice I hear falling [A]on my [D]ear,
the [A]Son of [E]God dis[A]closes.

Chorus
And [A]he walks with me, and he [E]talks with me,
and he [B]tells me I am his [E]own;
and the [A]joy we share as we [D]tarry [A]there
none [A]other has [E]ever [A]known.`),
  h("His Eye Is on the Sparrow", "Civilla Martin & Charles Gabriel", 1905, "Comfort,Provision", "C", 69, "Matthew 10:29-31", 1123, `Verse 1
[C]Why should I feel dis[F]couraged, [C]why should the shadows [G]come,
[C]why should my heart be [F]lonely and [C]long for [G]heaven and [C]home,
when [G]Jesus is my [C]portion? My [G]constant friend is [C]he:
his [C]eye is on the [F]sparrow, and [G]I know he watches [C]me.

Chorus
I [C]sing be[G]cause I'm [C]happy, [Am]I sing be[G]cause I'm free —
his [C]eye is on the [F]sparrow, and I [C]know he [G]watches [C]me.`),
  h("Blessed Assurance", "Fanny Crosby & Phoebe Knapp", 1873, "Assurance,Praise", "D", 92, "Hebrews 10:22", 1534, `Verse 1
[D]Blessed as[G]surance, [D]Jesus is [A]mine —
O what a [G]foretaste of [D]glory di[A]vine!
[D]Heir of sal[G]vation, [D]purchase of [Bm]God,
[D]born of his [A]Spirit, [G]washed in his [D]blood.

Chorus
[D]This is my [G]story, [D]this is my song:
praising my [E]Savior all the day [A]long.
[D]This is my [G]story, [D]this is my [Bm]song:
[D]praising my [A]Savior [G]all the day [D]long.`, { ts: "9/8" }),
  h("Like a River Glorious", "Frances Havergal", 1876, "Comfort,Assurance", "D", 88, "Isaiah 26:3", 456, `Verse 1
[D]Like a river [G]glorious is God's [A]perfect [D]peace,
over all vic[G]torious in its [A]bright in[D]crease:
[A]perfect, yet it [D]floweth [A]fuller [D]every [A]day;
[D]perfect, yet it [G]groweth [A]deeper [D]all the [A]way.

Chorus
[D]Stayed upon Je[G]hovah, hearts are [A]fully [D]blest —
finding, as he [G]promised, [A]perfect [D]peace and rest.`),
  h("Day by Day", "Carolina Sandell · tr. Andrew Skoog", 1865, "Trust,Provision", "Bb", 76, "Deuteronomy 33:25", 534, `Verse 1
[Bb]Day by day and [Eb]with each passing [Bb]moment,
strength I find to [C]meet my trials [F]here;
[Bb]trusting in my [Eb]Father's wise be[Bb]stowment,
I've no [Eb]cause for [Bb]worry [F]or for [Bb]fear.`),
  h("Children of the Heavenly Father", "Carolina Sandell · tr. Ernst Olson", 1925, "Trust,Assurance", "F", 84, "1 John 3:1", 478, `Verse 1
[F]Children of the [C]heavenly [Dm]Father
[Bb]safely in his [C]bosom [F]gather;
nestling bird nor [C]star in [Dm]heaven
[Bb]such a refuge [C]e'er was [F]given.`),
  h("Savior, Like a Shepherd Lead Us", "Attr. Dorothy Thrupp & William Bradbury", 1836, "Trust,Provision", "D", 84, "Psalm 23:1", 623, `Verse 1
[D]Savior, like a shepherd [G]lead [D]us: much we [G]need thy [D]tender [A]care;
[D]in thy pleasant pastures [G]feed [D]us, for our [G]use thy [D]folds [A]pre[D]pare.
[A]Blessed Jesus, [D]blessed Jesus, thou hast [G]bought us, [D]thine we [A]are;
[A]blessed Jesus, [D]blessed Jesus, thou hast [G]bought us, [D]thine [A]we [D]are.`),
  h("The King of Love My Shepherd Is", "Henry Baker", 1868, "Trust,Provision", "G", 84, "Psalm 23:1", 412, `Verse 1
The [G]King of love my [D]shepherd [Em]is, whose [C]goodness [D]faileth [G]never:
I nothing lack if [D]I am [Em]his, and [C]he is [D]mine for[G]ever.`),
  h("Jesus, Lover of My Soul", "Charles Wesley", 1740, "Comfort,Trust", "F", 76, "Psalm 61:4", 587, `Verse 1
[F]Jesus, lover of my [Bb]soul, [F]let me to thy [C]bosom fly,
[F]while the nearer waters [Bb]roll, [F]while the [C]tempest still is [F]high:
[C]hide me, O my [F]Savior, hide, [Bb]till the [F]storm of [C]life is past;
[F]safe into the [Bb]haven guide, [F]O re[C]ceive my [F]soul at last!`),
  h("O God, Our Help in Ages Past", "Isaac Watts & William Croft", 1719, "Trust,Assurance", "C", 88, "Psalm 90:1", 934, `Verse 1
O [C]God, our [Am]help in [G]ages [C]past, our [F]hope for [C]years to [G]come,
our [C]shelter [F]from the [C]stormy [Am]blast, and [C]our e[G]ternal [C]home.`),
  h("Guide Me, O Thou Great Jehovah", "William Williams & John Hughes", 1745, "Provision,Trust", "G", 84, "Exodus 13:21", 745, `Verse 1
[G]Guide me, O thou great Je[C]hovah, [G]pilgrim through this [D]barren land;
[G]I am weak, but thou art [C]mighty — [G]hold me with thy [D]powerful [G]hand.
[C]Bread of [G]heaven, [C]bread of [G]heaven,
feed me till I [D]want no more, feed me till I [D]want no [G]more.`),
  h("Wayfaring Stranger", "Traditional American folk hymn", 1858, "Hope,Lament", "Am", 72, "Hebrews 11:13", 645, `Verse 1
I [Am]am a poor way[Dm]faring [Am]stranger,
traveling through this [Dm]world of [Am]woe;
yet there's no sickness, [Dm]toil, nor [Am]danger
in that bright land to [E]which I [Am]go.
I'm [F]going there to [C]see my [Am]Father,
I'm [F]going there no [C]more to [E]roam —
I'm [Am]only going [Dm]over [Am]Jordan,
I'm only going [E]over [Am]home.`),
  h("Lead, Kindly Light", "John Henry Newman", 1833, "Trust,Comfort", "G", 66, "Psalm 119:105", 312, `Verse 1
[G]Lead, kindly [C]Light, amid the en[G]circling [D]gloom — [G]lead thou me [D]on!
The [G]night is [C]dark, and I am [G]far from [D]home — [G]lead thou [D]me [G]on!
Keep thou my [C]feet: I [G]do not [D]ask to [Em]see
the [G]distant [C]scene; one [G]step e[D]nough for [G]me.`),

  // ---- Gospel, invitation & consecration ----
  h("I Surrender All", "Judson Van DeVenter & Winfield Weeden", 1896, "Confession,Trust", "D", 69, "Romans 12:1", 1067, `Verse 1
[D]All to Jesus [G]I sur[D]render, all to him I [A]freely give;
[D]I will ever [G]love and [D]trust him, in his [A]presence [D]daily live.

Chorus
[D]I sur[G]render [D]all, [Bm]I sur[E]render [A]all;
[D]all to thee, my [G]blessed [D]Savior, I sur[A]render [D]all.`),
  h("Have Thine Own Way, Lord", "Adelaide Pollard & George Stebbins", 1907, "Confession,Trust", "Eb", 72, "Jeremiah 18:6", 745, `Verse 1
[Eb]Have thine own [Ab]way, [Eb]Lord, have thine own [Bb]way:
[Eb]thou art the [Ab]pot[Eb]ter, [F]I am the [Bb]clay.
[Eb]Mold me and [Ab]make [Eb]me [Cm]after thy [Eb]will,
while I am [Ab]wait[Eb]ing, [Bb]yielded and [Eb]still.`),
  h("Trust and Obey", "John Sammis & Daniel Towner", 1887, "Trust,Assurance", "F", 88, "1 John 1:7", 1198, `Verse 1
[F]When we walk with the [Bb]Lord in the [F]light of his word,
what a [C]glory he [G]sheds on our [C]way!
While we [F]do his good [C]will, he a[F]bides with us [Bb]still,
and with [F]all who will [C]trust and o[F]bey.

Chorus
Trust and o[C]bey, for there's [F]no other [Bb]way
to be [F]happy in [C]Jesus, but to [F]trust [C]and o[F]bey.`),
  h("Standing on the Promises", "Russell Carter", 1886, "Assurance,Praise", "Bb", 104, "2 Peter 1:4", 876, `Verse 1
[Bb]Standing on the promises of [Eb]Christ my [Bb]King,
through eternal ages let his [F]praises [Bb]ring;
glory in the highest I will [Eb]shout and [Bb]sing,
standing on the [F]promises of [Bb]God.

Chorus
[Bb]Stand[G]ing, [Eb]stand[Bb]ing,
standing on the promises of [F]God my [Bb]Savior;
[Bb]stand[G]ing, [Eb]stand[Bb]ing,
I'm standing on the [F]promises of [Bb]God.`),
  h("'Tis So Sweet to Trust in Jesus", "Louisa Stead & William Kirkpatrick", 1882, "Trust,Assurance", "G", 80, "Proverbs 3:5", 1034, `Verse 1
[G]'Tis so sweet to [C]trust in [G]Jesus, just to [C]take him [G]at his [D]word,
[G]just to rest up[C]on his [G]promise, just to [C]know, "Thus [G]saith [D]the [G]Lord."

Chorus
[G]Jesus, Jesus, [C]how I [G]trust him! How I've [C]proved him [G]o'er and [D]o'er!
[G]Jesus, Jesus, [C]precious [G]Jesus! O for [C]grace to [G]trust [D]him [G]more!`),
  h("Take My Life and Let It Be", "Frances Havergal", 1874, "Confession,Mission", "F", 84, "Romans 12:1", 923, `Verse 1
[F]Take my life and [C]let it [F]be [Bb]consecrated, [C]Lord, to [F]thee;
take my moments [C]and my [F]days, [Bb]let them flow in [C]ceaseless [F]praise.`, { ts: "3/4" }),
  h("Come, Ye Sinners, Poor and Needy", "Joseph Hart", 1759, "Grace,Confession", "G", 84, "Matthew 11:28", 534, `Verse 1
[G]Come, ye sinners, [C]poor and [G]needy, weak and wounded, [D]sick and sore;
[G]Jesus ready [C]stands to [G]save you, full of pity, [D]love, and [G]power.`),
  h("Pass Me Not, O Gentle Savior", "Fanny Crosby & William Doane", 1868, "Confession,Grace", "G", 76, "Luke 18:38", 687, `Verse 1
[G]Pass me not, O [C]gentle [G]Savior — hear my humble [D]cry;
[G]while on others [C]thou art [G]calling, [D]do not pass me [G]by.

Chorus
[G]Savior, [C]Savior, [G]hear my humble [D]cry;
[G]while on others [C]thou art [G]calling, [D]do not pass me [G]by.`),
  h("All the Way My Savior Leads Me", "Fanny Crosby & Robert Lowry", 1875, "Trust,Provision", "G", 84, "Deuteronomy 8:2", 578, `Verse 1
[G]All the way my [C]Savior [G]leads me — what have I to [A]ask be[D]side?
[G]Can I doubt his [C]tender [G]mercy, who through [D]life has [G]been my guide?
[D]Heavenly peace, di[G]vinest comfort, [D]here by faith in [G]him to [D]dwell —
for I [G]know whate'er be[C]fall [G]me, Jesus [D]doeth [G]all things well.`),
  h("I Am Thine, O Lord", "Fanny Crosby & William Doane", 1875, "Confession,Trust", "G", 80, "Hebrews 10:22", 645, `Verse 1
[G]I am thine, O [C]Lord — I have [G]heard thy voice, and it [D]told thy love to me;
[G]but I long to [C]rise in the [G]arms of faith and be [D]closer drawn to [G]thee.

Chorus
[D]Draw me [G]near[C]er, [G]nearer, blessed Lord, to the [A]cross where thou hast [D]died;
draw me [G]near[C]er, [G]nearer, nearer, blessed Lord, to thy [D]precious, bleeding [G]side.`),
  h("Near the Cross", "Fanny Crosby & William Doane", 1869, "Grace,Trust", "G", 76, "1 Corinthians 1:18", 534, `Verse 1
[G]Jesus, keep me [C]near the [G]cross: there a precious [D]fountain,
[G]free to all, a [C]healing [G]stream, flows from [D]Calvary's [G]mountain.

Chorus
[G]In the cross, [C]in the [G]cross be my glory [D]ever,
[G]till my raptured [C]soul shall [G]find [D]rest beyond the [G]river.`),
  h("Redeemed, How I Love to Proclaim It", "Fanny Crosby & William Kirkpatrick", 1882, "Praise,Grace", "A", 96, "Psalm 107:2", 489, `Verse 1
Re[A]deemed, how I [D]love to pro[A]claim it! Redeemed by the [B]blood of the [E]Lamb;
re[A]deemed through his [D]infinite [A]mercy — his [E]child, and for[A]ever, I am.

Chorus
Re[A]deemed, re[D]deemed, re[A]deemed by the [B]blood of the [E]Lamb;
re[A]deemed, re[D]deemed, his [A]child, and for[E]ever, I [A]am.`),
  h("Take Time to Be Holy", "William Longstaff & George Stebbins", 1882, "Confession,Trust", "G", 80, "1 Peter 1:16", 367, `Verse 1
[G]Take time to be [C]holy, speak [G]oft with thy [D]Lord;
a[G]bide in him [C]always, and [D]feed on his [G]word.
Make friends of God's [C]children, help [G]those who are [D]weak,
for[G]getting in [C]nothing his [D]blessing to [G]seek.`),
  h("Open My Eyes, That I May See", "Clara Scott", 1895, "Confession,Trust", "G", 76, "Psalm 119:18", 445, `Verse 1
[G]Open my eyes, that [C]I may [G]see glimpses of truth thou [D]hast for me;
[G]place in my hands the [C]wonderful [G]key that shall un[D]clasp and [G]set me free.
[D]Silently now I [G]wait for thee, [D]ready, my God, thy [G]will to see:
[G]open my eyes, il[C]lumine [G]me, [D]Spirit di[G]vine!`),

  // ---- Mission, service & justice ----
  h("Jesus Shall Reign", "Isaac Watts & John Hatton", 1719, "Mission,Praise", "D", 92, "Psalm 72:8", 634, `Verse 1
[D]Jesus shall [G]reign wher[D]e'er the [A]sun does [D]its suc[G]cessive [A]journeys [D]run,
his [D]kingdom [G]stretch from [D]shore to [Bm]shore, till [D]moons shall [A]wax and [D]wane no more.`, { ts: "2/2" }),
  h("I Love to Tell the Story", "Katherine Hankey & William Fischer", 1866, "Mission,Praise", "G", 84, "Psalm 66:16", 856, `Verse 1
I [G]love to tell the [C]story of [G]unseen things a[D]bove,
of [G]Jesus and his [C]glory, of [D]Jesus and his [G]love.
I love to tell the [Em]story be[C]cause I [G]know 'tis [D]true —
it [G]satisfies my [C]longings as [G]nothing [D]else can [G]do.

Chorus
I [D]love to tell the [G]story! 'Twill [C]be my theme in [G]glory
to tell the old, old [C]story of [G]Jesus [D]and his [G]love.`),
  h("Onward, Christian Soldiers", "Sabine Baring-Gould & Arthur Sullivan", 1871, "Mission,Trust", "D", 100, "2 Timothy 2:3", 745, `Verse 1
[D]Onward, Christian [G]soldiers, [D]marching as to [A]war,
[D]with the cross of [G]Jesus [A]going on be[D]fore:
Christ, the royal [G]Master, [D]leads against the [A]foe;
[D]forward into [G]battle [A]see his banners [D]go!`),
  h("Stand Up, Stand Up for Jesus", "George Duffield & George Webb", 1858, "Mission,Trust", "G", 96, "Ephesians 6:14", 523, `Verse 1
[G]Stand up, stand [C]up for [G]Jesus, ye [Em]soldiers [A]of the [D]cross!
[G]Lift high his [C]royal [G]banner — it [C]must not [G]suf[D]fer [G]loss.`),
  h("We've a Story to Tell to the Nations", "H. Ernest Nichol", 1896, "Mission,Hope", "C", 96, "Matthew 28:19", 434, `Verse 1
We've a [C]story to tell to the [F]nations that shall [C]turn their hearts to the [G]right —
a [C]story of truth and [F]mercy, a [C]story of [G]peace and [C]light.

Chorus
For the [C]darkness shall turn to [Em]dawning, and the [F]dawning to noonday [C]bright,
and Christ's great kingdom shall [F]come on earth, the [C]kingdom of [G]love and [C]light.`),
  h("Send the Light", "Charles Gabriel", 1890, "Mission,Hope", "G", 108, "Acts 16:9", 356, `Verse 1
There's a [G]call comes ringing o'er the restless [C]wave:
"Send the [G]light! Send the [D]light!"
There are [G]souls to rescue, there are souls to [C]save:
send the [G]light! [D]Send the [G]light!

Chorus
[G]Send the light, the blessed gospel [C]light —
let it [G]shine from shore to [D]shore!
[G]Send the light, and let its radiant [C]beams
light the [G]world for[D]ever[G]more.`),
  h("Rescue the Perishing", "Fanny Crosby & William Doane", 1869, "Justice,Mission", "Bb", 92, "Luke 14:23", 467, `Verse 1
[Bb]Rescue the perishing, [Eb]care for the [Bb]dying,
snatch them in pity from [C]sin and the [F]grave;
[Bb]weep o'er the erring one, [Eb]lift up the [Bb]fallen,
tell them of Jesus, the [F]mighty to [Bb]save.

Chorus
[Bb]Rescue the [F]perishing, [Eb]care for the [Bb]dying —
[Bb]Jesus is [Eb]merciful, [Bb]Jesus will [F]save.`),
  h("O Master, Let Me Walk with Thee", "Washington Gladden", 1879, "Justice,Mission", "F", 80, "Micah 6:8", 334, `Verse 1
O [F]Master, let me [Bb]walk with [F]thee in [Dm]lowly [C]paths of [F]service free;
tell [Bb]me thy [F]secret, [Bb]help me [F]bear the [Dm]strain of [C]toil, the [F]fret of care.`),
  h("Where Cross the Crowded Ways of Life", "Frank Mason North", 1903, "Justice,Mission", "C", 84, "Matthew 25:40", 289, `Verse 1
Where [C]cross the crowded [F]ways of [C]life, where [Am]sound the [D]cries of [G]race and clan,
a[C]bove the noise of [F]selfish [Am]strife, we [C]hear thy [G]voice, O [C]Son of man.`),
  h("In Christ There Is No East or West", "John Oxenham", 1908, "Justice,Mission", "D", 80, "Galatians 3:28", 378, `Verse 1
In [D]Christ there [G]is no [D]East or West, in [G]him no [D]South or [A]North,
but [D]one great [G]fellow[D]ship of [Bm]love through[D]out the [A]whole wide [D]earth.`),
  h("Battle Hymn of the Republic", "Julia Ward Howe", 1862, "Justice,Hope", "Bb", 96, "Revelation 19:15", 645, `Verse 1
Mine [Bb]eyes have seen the glory of the [Eb]coming of the [Bb]Lord;
he is trampling out the vintage where the grapes of wrath are [F]stored;
he hath [Bb]loosed the fateful lightning of his [Eb]terrible swift [Bb]sword —
his [Bb]truth is [F]marching [Bb]on.

Chorus
[Bb]Glory, glory, halle[Eb]lujah! [Bb]Glory, glory, halle[F]lujah!
[Bb]Glory, glory, halle[Eb]lujah! His [Bb]truth is [F]marching [Bb]on.`),
  h("Revive Us Again", "William Mackay", 1863, "Praise,Confession", "G", 96, "Psalm 85:6", 412, `Verse 1
We [G]praise thee, O God, for the [C]Son of thy [G]love —
for Jesus who died and is [D]now gone above.

Chorus
Halle[G]lujah! Thine the glory, halle[D]lujah! Amen!
Halle[G]lujah! Thine the glory — re[C]vive [D]us a[G]gain.`),

  // ---- Communion & the church ----
  h("Let Us Break Bread Together", "African American spiritual", 1925, "Communion,Grace", "Eb", 66, "1 Corinthians 10:16", 578, `Verse 1
[Eb]Let us break [Ab]bread to[Eb]gether [Cm]on our [F]knees,
[Bb]let us break [Ab]bread to[Eb]gether [Ab]on our [Bb]knees:

Chorus
[Eb]When I fall [Ab]on my [Eb]knees with my [Ab]face to the [Eb]rising [Cm]sun,
O [Eb]Lord, have [Bb]mercy [Ab]on [Eb]me.`),
  h("Here, O My Lord, I See Thee Face to Face", "Horatius Bonar", 1855, "Communion,Grace", "Eb", 69, "1 Corinthians 11:24", 267, `Verse 1
[Eb]Here, O my [Bb]Lord, I [Cm]see thee [Ab]face to [Eb]face —
here would I [Ab]touch and [Eb]handle [Bb]things un[Eb]seen,
here grasp with [Bb]firmer [Cm]hand e[Ab]ternal [Bb]grace,
and [Eb]all my [Ab]weariness up[Bb]on thee [Eb]lean.`),
  h("According to Thy Gracious Word", "James Montgomery", 1825, "Communion,Grace", "C", 72, "Luke 22:19", 234, `Verse 1
Ac[C]cording [F]to thy [C]gracious [Am]word, in [C]meek hu[G]mili[C]ty,
this will I [F]do, my [C]dying [Am]Lord: I [C]will re[G]member [C]thee.`),
  h("The Church's One Foundation", "Samuel Stone & Samuel Wesley", 1866, "Trust,Assurance", "D", 88, "1 Corinthians 3:11", 634, `Verse 1
The [D]church's one foun[G]dation is [D]Jesus Christ her [A]Lord:
she [D]is his new cre[G]ation by [D]water [A]and the [D]word.
From [A]heaven he came and [D]sought her to [Em]be his holy [A]bride;
with [D]his own blood he [G]bought her, and [D]for her [A]life he [D]died.`),
  h("Blest Be the Tie That Binds", "John Fawcett", 1782, "Comfort,Trust", "F", 76, "Colossians 3:14", 445, `Verse 1
[F]Blest be the [Bb]tie that [F]binds our [Bb]hearts in [C]Christian [F]love:
the fellowship of [Bb]kindred [F]minds is [Bb]like to [C]that a[F]bove.`, { ts: "3/4" }),
  h("Break Thou the Bread of Life", "Mary Lathbury & William Sherwin", 1877, "Communion,Provision", "D", 72, "John 6:35", 356, `Verse 1
[D]Break thou the [G]bread of [D]life, dear [Em]Lord, to [A]me,
as [D]thou didst [G]break the [D]loaves be[A]side the [D]sea;
be[A]yond the [D]sacred [G]page I [D]seek thee, [A]Lord —
my [D]spirit [G]pants for [D]thee, O [A]living [D]Word!`),

  // ---- Thanksgiving & harvest ----
  h("Come, Ye Thankful People, Come", "Henry Alford & George Elvey", 1844, "Provision,Praise", "F", 92, "Psalm 100:4", 534, `Verse 1
[F]Come, ye thankful people, [C]come, [F]raise the song of [C]harvest [F]home:
all is safely [Bb]gathered [F]in, [C]ere the winter [G]storms be[C]gin.
[F]God, our Maker, [Bb]doth pro[F]vide [Bb]for our [F]wants to [C]be sup[F]plied:
come to God's own [C]temple, [F]come — [Bb]raise the [F]song of [C]harvest [F]home.`),
  h("We Gather Together", "Dutch hymn · tr. Theodore Baker", 1894, "Provision,Trust", "F", 84, "Psalm 118:1", 623, `Verse 1
We [F]gather to[Bb]gether to [C]ask the Lord's [F]blessing —
he [Dm]chastens and [G]hastens his [C]will to make known;
the [F]wicked op[Bb]pressing now [C]cease from dis[Dm]tressing:
sing [F]praises to [C]his name, he for[F]gets not his [C]own.`, { ts: "3/4" }),
  h("Now Thank We All Our God", "Martin Rinkart · tr. Catherine Winkworth", 1858, "Praise,Provision", "F", 88, "1 Thessalonians 5:18", 712, `Verse 1
Now [F]thank we [C]all our [Dm]God with [Bb]heart and [C]hands and [F]voices,
who wondrous [C]things hath [Dm]done, in [Bb]whom his [C]world re[F]joices;
who [F]from our [Bb]mothers' [C]arms hath [Dm]blessed us [C]on our [F]way
with [Bb]countless [F]gifts of [C]love, and [Dm]still is [C]ours to[F]day.`),
  h("Count Your Blessings", "Johnson Oatman & Edwin Excell", 1897, "Provision,Praise", "Eb", 100, "Ephesians 1:3", 656, `Verse 1
When up[Eb]on life's billows you are [Ab]tempest-tossed,
when you [Eb]are discouraged, thinking [Bb]all is lost,
[Eb]count your many blessings, name them [Ab]one by one,
and it [Eb]will surprise you [Bb]what the [Eb]Lord hath done.

Chorus
[Eb]Count your blessings, [Ab]name them one by one;
[Eb]count your blessings, [F]see what God hath [Bb]done;
[Eb]count your blessings, [Ab]name them one by one —
[Eb]count your [Ab]many blessings, [Bb]see what [Eb]God hath done.`),
  h("Bringing in the Sheaves", "Knowles Shaw & George Minor", 1874, "Mission,Provision", "G", 100, "Psalm 126:6", 389, `Verse 1
[G]Sowing in the morning, sowing seeds of [C]kindness,
[G]sowing in the noontide and the [A]dewy [D]eve —
[G]waiting for the harvest and the time of [C]reaping,
[G]we shall come re[D]joicing, bringing in the [G]sheaves.

Chorus
[G]Bringing in the sheaves, [C]bringing in the sheaves,
[G]we shall come re[D]joicing, bringing in the [G]sheaves.`),

  // ---- Spirituals & hope of heaven ----
  h("Swing Low, Sweet Chariot", "African American spiritual", 1873, "Hope,Comfort", "D", 72, "2 Kings 2:11", 823, `Chorus
[D]Swing low, sweet [G]chari[D]ot, coming for to carry me [A]home;
[D]swing low, sweet [G]chari[D]ot, coming for to [A]carry me [D]home.

Verse 1
I [D]looked over Jordan, and [G]what did I [D]see, coming for to carry me [A]home?
A [D]band of angels [G]coming after [D]me, coming for to [A]carry me [D]home.`),
  h("Give Me Jesus", "African American spiritual", 1845, "Trust,Comfort", "F", 63, "Philippians 3:8", 534, `Verse 1
In the [F]morning [Dm]when I [Bb]rise, in the [F]morning when I [C]rise,
in the [F]morning [Dm]when I [Bb]rise, give me [C]Je[F]sus.

Chorus
Give me [F]Je[Bb]sus, [F]give me [C]Jesus;
you may [F]have all this [Bb]world — give me [C]Je[F]sus.`),
  h("Down to the River to Pray", "Traditional American", 1867, "Grace,Confession", "G", 84, "Acts 8:36", 456, `Verse 1
As [G]I went down to the river to pray,
studying about that [C]good old [G]way,
and who shall wear the starry crown —
good Lord, [D]show me the [G]way.

Chorus
O [G]sisters, let's go down, let's go down, come on down;
o sisters, let's go down, [D]down to the river to [G]pray.`),
  h("I Want Jesus to Walk with Me", "African American spiritual", 1924, "Lament,Comfort", "Dm", 63, "Psalm 23:4", 389, `Verse 1
[Dm]I want Jesus to [Gm]walk with [Dm]me;
I want Jesus to [Gm]walk with [A]me —
[Dm]all along my [F]pilgrim [C]journey,
[Dm]Lord, I want [A]Jesus to [Dm]walk with me.`),
  h("Steal Away", "African American spiritual", 1872, "Hope,Comfort", "F", 60, "Matthew 24:31", 334, `Chorus
[F]Steal away, [Bb]steal away, [F]steal away to [C]Je[F]sus;
steal away, [Bb]steal away [F]home — I ain't got [C]long to stay [F]here.

Verse 1
My [F]Lord, he calls me — he calls me by the [C]thunder;
the [F]trumpet sounds with[Bb]in my [F]soul: I ain't got [C]long to stay [F]here.`),
  h("Every Time I Feel the Spirit", "African American spiritual", 1909, "Praise,Hope", "F", 100, "Romans 8:16", 423, `Chorus
[F]Every time I feel the Spirit [Bb]moving [F]in my heart, I will [C]pray;
[F]every time I feel the Spirit [Bb]moving [F]in my heart, I [C]will [F]pray.

Verse 1
Up[F]on the mountain, [Bb]when my [F]Lord spoke, [Bb]out of his [F]mouth came [C]fire and smoke;
[F]looked all around me, it [Bb]looked so [F]fine, I asked my Lord if [C]all was [F]mine.`),
  h("My Hope Is Built on Nothing Less", "Edward Mote & William Bradbury", 1834, "Assurance,Trust", "G", 84, "Matthew 7:24", 1245, `Verse 1
My [G]hope is built on [C]nothing [G]less than Jesus' blood and [D]righteousness;
I [G]dare not trust the [C]sweetest [G]frame, but wholly lean on [D]Jesus' [G]name.

Chorus
On [G]Christ, the solid [C]rock, I [G]stand — all [C]other ground is [D]sinking sand,
all [G]other [C]ground is [D]sinking [G]sand.`),
  h("How Firm a Foundation", "John Rippon's Selection", 1787, "Assurance,Trust", "G", 88, "Isaiah 41:10", 745, `Verse 1
How [G]firm a foun[C]dation, ye [G]saints of the [D]Lord,
is [G]laid for your [C]faith in his [G]excellent [D]word!
What [G]more can he [C]say than to [G]you he hath [D]said —
to [G]you who for [C]refuge to [G]Jesus have [D]fled?`, { ts: "2/2" }),
  h("Sweet By and By", "Sanford Bennett & Joseph Webster", 1868, "Hope,Comfort", "G", 88, "Revelation 21:4", 578, `Verse 1
There's a [G]land that is [C]fairer than [G]day,
and by faith we can [D]see it afar,
for the [G]Father waits [C]over the [G]way
to prepare us a [D]dwelling place [G]there.

Chorus
In the [G]sweet [C]by and by,
we shall [G]meet on that [A]beautiful [D]shore;
in the [G]sweet [C]by and by,
we shall [G]meet on that [D]beautiful [G]shore.`),
  h("Shall We Gather at the River", "Robert Lowry", 1864, "Hope,Comfort", "D", 88, "Revelation 22:1", 512, `Verse 1
[D]Shall we gather at the river, where bright [G]angel feet have [D]trod,
with its crystal tide forever flowing [A]by the throne of [D]God?

Chorus
[D]Yes, we'll gather at the [G]river, the [D]beautiful, the beautiful [A]river —
[D]gather with the saints at the [G]river that [D]flows by the [A]throne of [D]God.`),
  h("When the Roll Is Called Up Yonder", "James Black", 1893, "Hope,Assurance", "D", 108, "1 Thessalonians 4:16", 489, `Verse 1
When the [D]trumpet of the Lord shall sound and [G]time shall be no [D]more,
and the morning breaks eternal, bright, and [A]fair —
when the [D]saved of earth shall gather over [G]on the other [D]shore,
and the [A]roll is called up [D]yonder, I'll be there.

Chorus
[D]When the roll is called up [G]yon[D]der,
when the roll is called up [A]yonder,
[D]when the roll is called up [G]yon[D]der —
when the [A]roll is called up [D]yonder, I'll be there.`),
  h("When We All Get to Heaven", "Eliza Hewitt & Emily Wilson", 1898, "Hope,Praise", "G", 100, "John 14:2-3", 634, `Verse 1
[G]Sing the wondrous love of [C]Jesus, [G]sing his mercy [D]and his grace;
[G]in the mansions bright and [C]blessed [G]he'll pre[D]pare for [G]us a place.

Chorus
[G]When we [D]all get to [G]heaven, what a [C]day of rejoicing [D]that will be!
[G]When we all [D]see [G]Jesus, we'll [C]sing and [G]shout the [D]victo[G]ry!`),
  h("Higher Ground", "Johnson Oatman & Charles Gabriel", 1898, "Hope,Trust", "G", 92, "Philippians 3:14", 445, `Verse 1
I'm [G]pressing on the [C]upward [G]way, new heights I'm gaining [D]every day —
still [G]praying as I [C]onward [G]bound, "Lord, [D]plant my feet on [G]higher ground."

Chorus
Lord, [D]lift me up and [G]let me stand by [C]faith on heaven's [G]tableland —
a [C]higher [G]plane than [Em]I have [A]found: Lord, [G]plant my [D]feet on [G]higher ground.`),
  h("Since Jesus Came into My Heart", "Rufus McDaniel & Charles Gabriel", 1914, "Praise,Assurance", "G", 108, "2 Corinthians 5:17", 512, `Verse 1
What a [G]wonderful change in my life has been wrought since [C]Jesus came into my [G]heart!
I have light in my soul for which long I had sought, since [A]Jesus came into my [D]heart!

Chorus
Since [G]Jesus came into my heart, since [C]Jesus came into my [G]heart —
floods of joy o'er my soul like the sea billows roll, since [D]Jesus came into my [G]heart.`),
  h("Love Lifted Me", "James Rowe & Howard Smith", 1912, "Grace,Praise", "Bb", 96, "Matthew 14:31", 567, `Verse 1
[Bb]I was sinking deep in sin, far from the peaceful [F]shore,
very deeply stained within, sinking to rise no [Bb]more;
but the Master of the sea [Eb]heard my despairing [Bb]cry —
from the waters lifted [F]me: now safe am [Bb]I.

Chorus
Love [Bb]lifted [Eb]me! Love [Bb]lifted [F]me!
When [Bb]nothing else could help, [F]love lifted [Bb]me.`),
  h("Praise Him! Praise Him!", "Fanny Crosby & Chester Allen", 1869, "Praise,Adoration", "G", 100, "Psalm 147:1", 534, `Verse 1
[G]Praise him! Praise him! [C]Jesus, our [G]blessed Redeemer!
[D]Sing, O earth, his [G]wonderful [D]love proclaim!
[G]Hail him! Hail him! [C]highest arch[G]angels in glory,
[D]strength and honor [G]give to his [D]holy [G]name!`),
  h("Wonderful Words of Life", "Philip Bliss", 1874, "Provision,Praise", "F", 88, "John 6:68", 456, `Verse 1
[F]Sing them over again to me, [Bb]wonderful words of [F]life;
let me more of their beauty see, [C]wonderful words of [F]life:
words of life and beauty, [Dm]teach me faith and [C]duty.

Chorus
[F]Beautiful words, [Bb]wonderful words, [C]wonderful words of [F]life;
beautiful words, [Bb]wonderful words, [C]wonderful words of [F]life.`),

  // ---- Beyond English ----
  h("Santo, Santo, Santo", "Reginald Heber · tr. Juan Bautista Cabrera", 1871, "Adoration,Praise", "D", 92, "Apocalipsis 4:8", 489, `Verse 1
[D]¡Santo, santo, [G]santo! Se[D]ñor omnipo[A]tente,
[D]siempre el labio [Bm]mío [E]loores te da[A]rá;
[D]santo, santo, [G]santo, te a[D]doro reve[A]rente,
[D]Dios en tres per[G]sonas, ben[D]dita Trini[A]dad.`, { lang: "Spanish" }),
  h("Castillo Fuerte", "Martín Lutero · tr. Juan Bautista Cabrera", 1885, "Trust,Assurance", "C", 92, "Salmo 46", 334, `Verse 1
Cas[C]tillo fuerte [G]es nuestro [C]Dios, de[F]fensa y [C]buen es[G]cu[C]do;
con su poder nos [G]librará en [F]este [C]trance a[G]gu[C]do.`, { lang: "Spanish" }),
  h("Noche de Paz", "Joseph Mohr · tr. Federico Fliedner", 1871, "Christmas,Comfort", "Bb", 60, "Lucas 2:7", 423, `Verse 1
[Bb]Noche de paz, noche de amor —
[F]todo duerme en [Bb]derredor;
entre los [Eb]astros que es[Bb]parcen su luz,
bella, anun[Eb]ciando al ni[Bb]ñito Jesús,
[F]brilla la estrella de [Bb]paz,
[Bb]brilla la es[F]trella de [Bb]paz.`, { ts: "3/4", lang: "Spanish" })
];

// Full texts for the public-domain hymns already present in the base seed list
export const HYMN_TEXTS: Record<string, string> = {
  "Be Thou My Vision": `Verse 1
[E]Be thou my [B]vision, O [C#m]Lord of my [A]heart —
[E]naught be all [A]else to me [B]save that thou art:
[C#m]thou my best [A]thought, by [E]day or by [B]night,
[E]waking or [A]sleeping, thy [B]presence my [E]light.`,
  "Holy, Holy, Holy": `Verse 1
[D]Holy, holy, [Bm]holy! [G]Lord God Al[D]mighty!
[G]Early in the [D]morning our [A]song shall rise to [D]thee.
Holy, holy, [Bm]holy! [G]Merciful and [D]mighty!
[G]God in three [D]persons, [A]blessed Trini[D]ty!`,
  "Come Thou Fount": `Verse 1
[D]Come, thou fount of [G]every [D]blessing, tune my [G]heart to [A]sing thy [D]grace;
streams of mercy, [G]never [D]ceasing, call for [G]songs of [A]loudest [D]praise.
[A]Teach me some me[D]lodious [G]sonnet, [D]sung by [G]flaming [A]tongues a[D]bove;
praise the mount — I'm [G]fixed up[D]on it — mount of [G]thy re[A]deeming [D]love.`,
  "Doxology": `Verse 1
[G]Praise God, from [D]whom all [Em]blessings [D]flow;
[G]praise him, all [C]creatures [D]here be[G]low;
praise [Em]him a[D]bove, ye [G]heavenly [D]host;
[G]praise Father, [Em]Son, and [D]Holy [G]Ghost. Amen.`,
  "It Is Well with My Soul": `Verse 1
When [C]peace like a [F]river at[C]tendeth my [G]way,
when [C]sorrows like [F]sea billows [G]roll —
what[C]ever my [F]lot, thou hast [C]taught me to [G]say,
"It is [C]well, it is [F]well with my [C]soul."

Chorus
It is [G]well with my [C]soul,
it is [F]well, it is [G]well with my [C]soul.`,
  "All Creatures of Our God and King": `Verse 1
[D]All creatures [G]of our [D]God and King,
[G]lift up your [D]voice and [A]with us sing:
alle[D]luia, [G]alle[A]luia!
[D]Thou burning [G]sun with [D]golden beam,
[G]thou silver [D]moon with [A]softer gleam:

Chorus
O [D]praise him, [G]O [A]praise him —
alle[D]luia, [Bm]alle[G]luia, [A]alle[D]luia!`,
  "Ein feste Burg ist unser Gott": `Verse 1
Ein [C]feste Burg ist [G]unser [C]Gott, ein [F]gute [C]Wehr und [G]Waf[C]fen;
er hilft uns frei aus [G]aller [C]Not, die [F]uns jetzt [C]hat be[G]trof[C]fen.
Der [G]alt böse [Am]Feind, mit [Em]Ernst er's jetzt [F]meint —
groß [C]Macht und viel [Am]List sein [F]grausam Rüstung [C]ist;
auf [F]Erd ist [C]nicht seins[G]glei[C]chen.`
};
